export async function onRequestPost(context) {
  try {
    const { env, request } = context;
    
    // 1. Parse the incoming JSON body from script.js
    const body = await request.json();
    const { name, email, message } = body;

    // 2. Perform backend validation check
    if (!name || !email || !message) {
      return new Response("Missing required fields", { status: 400 });
    }

    // 3. Inject form inputs into your cloud D1 SQL instance securely 
    // Using bindings (?) prevents malicious SQL injection attacks
    await env.DB.prepare(
      "INSERT INTO messages (name, email, message) VALUES (?, ?, ?)"
    ).bind(name, email, message).run();

    // 4. Return success response to the client browser UI
    return new Response(JSON.stringify({ success: true, msg: "Message recorded successfully!" }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  } catch (err) {
    // Return standard error payload if operation hits database snags
    return new Response(JSON.stringify({ error: err.message }), { 
      headers: { "Content-Type": "application/json" },
      status: 500 
    });
  }
}