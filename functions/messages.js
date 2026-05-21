export async function onRequestGet(context) {
  try {
    const { env, request } = context;
    const clientToken = request.headers.get("Authorization");

    // Authenticate the incoming request against your secure cloud env configuration
    if (!clientToken || clientToken !== env.ADMIN_TOKEN) {
      return new Response("Unauthorized access request denied", { status: 401 });
    }

    // Pull form submittals sorted chronologically
    const { results } = await env.DB.prepare(
      "SELECT * FROM messages ORDER BY id DESC"
    ).all();

    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
