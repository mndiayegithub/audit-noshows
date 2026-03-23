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

    // n8n peut retourner un tableau [ { output: {...}, email: ... } ]
    // ou directement l'objet { success, stats, rapport_texte }
    let data = raw;
    if (Array.isArray(raw)) {
      const first = raw[0];
      // Format : [{ output: { success, stats, rapport_texte }, email }]
      if (first?.output) {
        data = first.output;
      } else {
        data = first;
      }
    }

    return Response.json(data);
  } catch (error: any) {
    console.error("Erreur API audit:", error);
    return Response.json(
      { success: false, error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
