// functions/api/public-analytics.js

export async function onRequestGet(context) {
  try {
    const db = context.env.DB;

    // Grab the last 7 distinct tracking days that contain actual recorded visits
    const { results } = await db.prepare(`
      SELECT visit_date as date, COUNT(id) as count 
      FROM site_visits 
      GROUP BY visit_date 
      ORDER BY visit_date DESC 
      LIMIT 7
    `).all();

    // Reverse the array so it reads chronologically left-to-right on your graph grid (oldest to newest)
    const chronologicalResults = results.reverse();

    return new Response(JSON.stringify(chronologicalResults), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=5" // Dropped cache age to 5s for easier testing
      },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}