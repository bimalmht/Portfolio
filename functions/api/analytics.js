// functions/api/analytics.js

// 1. POST: Logs a new visit anonymised (fires on home page load)
export async function onRequestPost(context) {
  try {
    const db = context.env.DB;
    
    // Log the visit inside D1
    await db.prepare("INSERT INTO site_visits DEFAULT VALUES").run();
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// 2. GET: Fetches data organized by day for your line graph (fires on Admin Panel load)
export async function onRequestGet(context) {
  try {
    const { env, request } = context;
    const clientToken = request.headers.get("Authorization");

    // Security layer constraint matching your admin tokens
    if (!clientToken || clientToken !== env.ADMIN_TOKEN) {
      return new Response("Unauthorized", { status: 401 });
    }

    const db = env.DB;

    // Aggregate visits grouped by date for the last 14 days
    const { results } = await db.prepare(`
      SELECT visit_date as date, COUNT(id) as count 
      FROM site_visits 
      WHERE created_at >= DATE('now', '-14 days')
      GROUP BY visit_date 
      ORDER BY visit_date ASC
    `).all();

    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}