export async function onRequestPost(context) {
  try {
    const { env, request } = context;
    
    // 1. Extract the raw submission payload
    const body = await request.json();
    
    // 2. Fallback normalization to catch both lowercase and uppercase object keys safely
    const name = body.name || body.Name || body.NAME;
    const email = body.email || body.Email || body.EMAIL;
    const message = body.message || body.Message || body.MESSAGE;

    // 3. Validation safeguard check
    if (!name || !email || !message) {
      return new Response("Validation Failure: Empty properties received.", { status: 400 });
    }

    // 4. Secure parameterized insertion directly into SQLite matrix
    await env.DB.prepare(
      "INSERT INTO messages (name, email, message) VALUES (?, ?, ?)"
    ).bind(name, email, message).run();

    return new Response(JSON.stringify({ success: true, msg: "Transaction recorded." }), {
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
