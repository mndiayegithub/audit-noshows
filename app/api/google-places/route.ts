export const maxDuration = 15;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input");

  if (!input || !input.trim()) {
    return Response.json({ error: "Paramètre 'input' manquant" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Clé API Google non configurée" }, { status: 500 });
  }

  try {
    const url = new URL(
      "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
    );
    url.searchParams.set("input", input.trim());
    url.searchParams.set("inputtype", "textquery");
    url.searchParams.set("fields", "name,rating,user_ratings_total,formatted_address");
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Google Places a répondu avec le statut : ${response.status}`);
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      return Response.json({ found: false });
    }

    const place = data.candidates[0];
    return Response.json({
      found: true,
      name: place.name ?? input,
      rating: place.rating ?? null,
      user_ratings_total: place.user_ratings_total ?? 0,
      formatted_address: place.formatted_address ?? null,
    });
  } catch (error: any) {
    console.error("Erreur Google Places API:", error);
    return Response.json(
      { error: error.message || "Erreur lors de la recherche Google" },
      { status: 500 }
    );
  }
}
