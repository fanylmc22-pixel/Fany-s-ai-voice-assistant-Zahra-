// Vercel Serverless Function — POST /api/ask
// Keeps the Anthropic API key on the server so the site can be public/open:
// visitors never enter a key. Set ANTHROPIC_API_KEY in your Vercel project's
// Environment Variables (Settings → Environment Variables).

const ANTHROPIC_MODEL = "claude-3-5-haiku-latest";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server not configured: missing ANTHROPIC_API_KEY." });
    return;
  }

  try {
    // Body may arrive parsed (object) or as a raw string depending on runtime.
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const prompt = body.prompt;
    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Missing 'prompt'." });
      return;
    }

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      res.status(r.status).json({ error: (data && data.error && data.error.message) || "Anthropic API error" });
      return;
    }

    const text = (data && data.content && data.content[0] && data.content[0].text || "").trim();
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: String(e && e.message || e) });
  }
}
