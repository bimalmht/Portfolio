// Overwrite your existing onRequestPost inside functions/projects.js to sanitize typos automatically
export async function onRequestPost(context) {
  try {
    const { env, request } = context;
    const clientToken = request.headers.get("Authorization");

    if (!clientToken || clientToken !== env.ADMIN_TOKEN) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    let { modal_id, image_path, category, title } = body;

    if (!modal_id || !image_path || !category || !title) {
      return new Response("Missing parameters", { status: 400 });
    }

    // TYPO SAFEGUARD: Automatically strips leading dots if typed by accident
    if (image_path.startsWith('./')) {
      image_path = image_path.substring(1); // Converts './images/...' to '/images/...'
    } else if (!image_path.startsWith('/')) {
      image_path = '/' + image_path;        // Ensures it always starts with an absolute root slash
    }

    // Execute the database insert securely
    await env.DB.prepare(
      "INSERT INTO projects (modal_id, image_path, category, title) VALUES (?, ?, ?, ?)"
    ).bind(modal_id, image_path, category, title).run();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
