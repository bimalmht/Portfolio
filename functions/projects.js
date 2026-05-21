// Keep your existing GET handler intact
export async function onRequestGet(context) {
  try {
    const { env } = context;
    const { results } = await env.DB.prepare("SELECT * FROM projects ORDER BY id ASC").all();
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=10" },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// Add this new POST method to process new project additions safely
export async function onRequestPost(context) {
  try {
    const { env, request } = context;
    const clientToken = request.headers.get("Authorization");

    // Authenticate the publish request
    if (!clientToken || clientToken !== env.ADMIN_TOKEN) {
      return new Response("Unauthorized insertion request denied", { status: 401 });
    }

    const body = await request.json();
    const { modal_id, image_path, category, title } = body;

    if (!modal_id || !image_path || !category || !title) {
      return new Response("Missing parameters", { status: 400 });
    }

    // Insert the records cleanly into SQLite
    await env.DB.prepare(
      "INSERT INTO projects (modal_id, image_path, category, title) VALUES (?, ?, ?, ?)"
    ).bind(modal_id, image_path, category, title).run();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
