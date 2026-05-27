// functions/api/public-analytics.js

export async function onRequestGet(context) {
  try {
    const db = context.env.DB;

    // Fetch traffic counts for the last 7 days (cleaner for a public homepage view)
    const { results } = await db.prepare(`
      SELECT visit_date as date, COUNT(id) as count 
      FROM site_visits 
      WHERE created_at >= DATE('now', '-7 days')
      GROUP BY visit_date 
      ORDER BY visit_date ASC
    `).all();

    return new Response(JSON.stringify(results), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60" // Cache edge results for 1 minute to protect database performance
      },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}