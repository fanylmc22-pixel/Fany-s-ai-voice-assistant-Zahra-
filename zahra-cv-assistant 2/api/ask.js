// Fonction serverless (tourne sur le serveur Vercel) — POST /api/ask
//
// ►►► COLLE TA CLÉ ANTHROPIC ICI, puis déploie. ◄◄◄
//     Clé GRATUITE à créer sur https://console.anthropic.com/settings/keys
//     (crédits offerts à l'inscription). Garde le dépôt PRIVÉ.
const ANTHROPIC_API_KEY = "";

const MODEL = "claude-3-5-haiku-latest";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const key = ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: "Clé manquante : colle ta clé dans ANTHROPIC_API_KEY (api/ask.js), puis redéploie." });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    if (!body.prompt) return res.status(400).json({ error: "Missing prompt" });

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 1024, messages: [{ role: "user", content: body.prompt }] }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(r.status).json({ error: (data.error && data.error.message) || "Anthropic error " + r.status });
    res.status(200).json({ text: (data.content && data.content[0] && data.content[0].text || "").trim() });
  } catch (e) {
    res.status(500).json({ error: String(e && e.message || e) });
  }
}
