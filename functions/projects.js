// 1. GET ROUTE: Fetches ALL project data to display on your homepage and modals
export async function onRequestGet(context) {
  try {
    const { env } = context;
    
    // CHANGED: Added desc, stack, and result to the SQL selection matrix
    const { results } = await env.DB.prepare(
      "SELECT id, modal_id, image_path, category, title, desc, stack, result FROM projects ORDER BY id ASC"
    ).all();

    return new Response(JSON.stringify(results), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=5" 
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

// 2. POST ROUTE: Adds new projects including deep case details from your admin panel
export async function onRequestPost(context) {
  try {
    const { env, request } = context;
    const clientToken = request.headers.get("Authorization");

    // Security check against your Cloudflare Secret Token
    if (!clientToken || clientToken !== env.ADMIN_TOKEN) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    let modal_id = body.modal_id;
    let image_path = body.image_path;
    let category = body.category;
    let title = body.title;
    
    // --- NEW MODAL PARAMETERS EXTRACTED HERE ---
    let desc = body.desc;
    let stack = body.stack;
    let result = body.result;

    if (!modal_id || !image_path || !category || !title) {
      return new Response("Missing basic parameters", { status: 400 });
    }

    // Auto-correct image path formats if typed with a relative dot by accident
    if (image_path.startsWith('./')) {
      image_path = image_path.substring(1);
    } else if (!image_path.startsWith('/')) {
      image_path = '/' + image_path;
    }

    // CHANGED: Extended structural SQL insertion logic to register the 3 missing items 
    await env.DB.prepare(
      "INSERT INTO projects (modal_id, image_path, category, title, desc, stack, result) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(modal_id, image_path, category, title, desc, stack, result).run();

    return new Response(JSON.stringify({ success: true }), { 
      headers: { "Content-Type": "application/json" },
      status: 200 
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      headers: { "Content-Type": "application/json" },
      status: 500 
    });
  }
}