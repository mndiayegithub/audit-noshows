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

    const data = await response.json();
    return Response.json(data);
  } catch (error: any) {
    console.error("Erreur API audit:", error);
    return Response.json(
      { success: false, error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
