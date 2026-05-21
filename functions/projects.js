export async function onRequestGet(context) {
  try {
    const { env } = context;

    // 1. Run query to fetch all portfolio items out of your D1 tables
    const { results } = await env.DB.prepare(
      "SELECT * FROM projects ORDER BY id ASC"
    ).all();

    // 2. Send structured array data directly to your loadDynamicProjects() front-end handler
    return new Response(JSON.stringify(results), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60" // Caches data for 60 seconds at edge for fast load speeds
      },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      headers: { "Content-Type": "application/json" },
      status: 500 
    });
  }
}
