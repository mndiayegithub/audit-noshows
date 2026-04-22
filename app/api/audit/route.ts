export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const webhookUrl =
      process.env.N8N_WEBHOOK_URL ??
      "https://n8n.srv939707.hstgr.cloud/webhook/audit-flash";
    const response = await fetch(webhookUrl, {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(55000),
      }
    );

    if (!response.ok) {
      throw new Error(`n8n a répondu avec le statut : ${response.status}`);
    }

    const raw = await response.json();

    // n8n peut renvoyer plusieurs formats selon le mode d'exécution :
    // 1) Production (Respond to Webhook + JSON.stringify) :
    //    { output: { success, stats, rapport_texte }, email }
    // 2) Test webhook (n8n retourne un tableau) :
    //    [{ output: { success, stats, rapport_texte }, email }]
    // 3) Direct (ancienne version) :
    //    { success, stats, rapport_texte }
    let data = raw;

    if (Array.isArray(raw)) {
      // Format tableau : prendre le premier élément
      const first = raw[0];
      if (first?.output && typeof first.output === "object" && "success" in first.output) {
        data = first.output;
      } else {
        data = first;
      }
    } else if (
      raw &&
      typeof raw === "object" &&
      "output" in raw &&
      raw.output &&
      typeof raw.output === "object" &&
      "success" in raw.output
    ) {
      // Format objet avec wrapper { output: {...}, email }
      data = raw.output;
    }
    // Sinon : raw est directement { success, stats, rapport_texte }

    return Response.json(data);
  } catch (error: any) {
    console.error("Erreur API audit:", error);
    return Response.json(
      { success: false, error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
