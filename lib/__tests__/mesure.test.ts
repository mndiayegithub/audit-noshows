/**
 * Tests du transport de mesure.
 *
 * Le projet tourne en environnement `node` (vitest.config.ts) : plutôt que
 * d'ajouter jsdom pour trois objets, on simule `window`, `sessionStorage` et
 * `navigator` à la main. C'est suffisant — le module ne touche à rien d'autre.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { envoyer, idVisite } from "@/lib/mesure";

/** sessionStorage minimal, en mémoire. */
function faireStockage(): Storage & { _map: Map<string, string> } {
  const map = new Map<string, string>();
  return {
    _map: map,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    get length() {
      return map.size;
    },
  } as Storage & { _map: Map<string, string> };
}

let stockage: ReturnType<typeof faireStockage>;

/** Corps réellement transmis, quel que soit le transport utilisé. */
async function corpsEnvoye(arg: unknown): Promise<Record<string, unknown>> {
  const texte = arg instanceof Blob ? await arg.text() : String(arg);
  return JSON.parse(texte) as Record<string, unknown>;
}

/** Installe un navigateur simulé, avec le sendBeacon fourni. */
function simulerNavigateur(sendBeacon: unknown) {
  vi.stubGlobal("window", { location: { pathname: "/audit" } });
  vi.stubGlobal("sessionStorage", stockage);
  vi.stubGlobal("navigator", { sendBeacon });
}

beforeEach(() => {
  stockage = faireStockage();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("idVisite", () => {
  it("creates an identifier on first call and reuses it afterwards", () => {
    simulerNavigateur(vi.fn().mockReturnValue(true));
    const premier = idVisite();
    expect(premier).toBeTruthy();
    expect(idVisite()).toBe(premier);
  });

  it("stores it under a sessionStorage key — never localStorage", () => {
    // localStorage survivrait à la fermeture de l'onglet et ferait basculer la
    // mesure hors de la dispense de consentement.
    simulerNavigateur(vi.fn().mockReturnValue(true));
    const id = idVisite();
    expect(stockage.getItem("pia_audit_sid")).toBe(id);
  });

  it("returns undefined rather than throwing when storage is denied", () => {
    simulerNavigateur(vi.fn().mockReturnValue(true));
    vi.stubGlobal("sessionStorage", {
      ...stockage,
      getItem: () => {
        throw new Error("SecurityError: storage disabled");
      },
    });
    expect(() => idVisite()).not.toThrow();
    expect(idVisite()).toBeUndefined();
  });

  it("returns undefined server-side, where there is no window", () => {
    expect(idVisite()).toBeUndefined();
  });
});

describe("envoyer", () => {
  it("prefers sendBeacon and posts to /api/mesure", () => {
    const beacon = vi.fn().mockReturnValue(true);
    simulerNavigateur(beacon);
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    envoyer("audit_view");

    expect(beacon).toHaveBeenCalledTimes(1);
    expect(beacon.mock.calls[0][0]).toBe("/api/mesure");
    // Un seul envoi : le beacon accepté ne doit pas doubler avec un fetch.
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("sends text/plain — an application/json blob would need a CORS preflight", () => {
    const beacon = vi.fn().mockReturnValue(true);
    simulerNavigateur(beacon);

    envoyer("audit_view");

    expect((beacon.mock.calls[0][1] as Blob).type).toContain("text/plain");
  });

  it("includes event_type, page, session_id and properties", async () => {
    const beacon = vi.fn().mockReturnValue(true);
    simulerNavigateur(beacon);

    envoyer("audit_success", { score: 72, taux_noshow: 18.5 });

    const corps = await corpsEnvoye(beacon.mock.calls[0][1]);
    expect(corps.event_type).toBe("audit_success");
    expect(corps.page).toBe("/audit");
    expect(corps.session_id).toBe(stockage.getItem("pia_audit_sid"));
    expect(corps.properties).toEqual({ score: 72, taux_noshow: 18.5 });
  });

  it("reuses one identifier across several events of the same visit", async () => {
    const beacon = vi.fn().mockReturnValue(true);
    simulerNavigateur(beacon);

    envoyer("audit_view");
    envoyer("audit_submitted", { degraded: false });

    const a = await corpsEnvoye(beacon.mock.calls[0][1]);
    const b = await corpsEnvoye(beacon.mock.calls[1][1]);
    expect(a.session_id).toBeTruthy();
    expect(a.session_id).toBe(b.session_id);
  });

  it("sends null properties when none are provided", async () => {
    const beacon = vi.fn().mockReturnValue(true);
    simulerNavigateur(beacon);

    envoyer("audit_view");

    expect((await corpsEnvoye(beacon.mock.calls[0][1])).properties).toBeNull();
  });

  it("still emits without an identifier when storage is denied", async () => {
    const beacon = vi.fn().mockReturnValue(true);
    simulerNavigateur(beacon);
    vi.stubGlobal("sessionStorage", {
      ...stockage,
      getItem: () => {
        throw new Error("denied");
      },
    });

    envoyer("audit_view");

    // Mieux vaut un événement anonyme que pas d'événement.
    expect(beacon).toHaveBeenCalledTimes(1);
    expect((await corpsEnvoye(beacon.mock.calls[0][1])).session_id).toBeNull();
  });

  it("falls back to keepalive fetch when the beacon queue is full", () => {
    simulerNavigateur(vi.fn().mockReturnValue(false));
    const fetchSpy = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("fetch", fetchSpy);

    envoyer("audit_view");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe("/api/mesure");
    expect(fetchSpy.mock.calls[0][1]).toMatchObject({ method: "POST", keepalive: true });
  });

  it("falls back to fetch when sendBeacon does not exist at all", () => {
    simulerNavigateur(undefined);
    const fetchSpy = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("fetch", fetchSpy);

    envoyer("audit_view");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("does nothing server-side, where there is no window", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    expect(() => envoyer("audit_view")).not.toThrow();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("never throws when the transport itself fails — the funnel must not break", () => {
    simulerNavigateur(
      vi.fn(() => {
        throw new Error("beacon exploded");
      }),
    );
    expect(() => envoyer("audit_view")).not.toThrow();
  });

  it("swallows a rejected fetch instead of surfacing an unhandled rejection", () => {
    simulerNavigateur(undefined);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect(() => envoyer("audit_view")).not.toThrow();
  });
});
