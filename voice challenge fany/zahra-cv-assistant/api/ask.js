// Serverless function (runs on Vercel's server) — /api/ask
//
// ►►► OPTION SIMPLE : colle ta clé Anthropic entre les guillemets ci-dessous,
//     commit + redéploie, et c'est tout. (Garde le dépôt GitHub PRIVÉ.)
//     Clé : https://console.anthropic.com/settings/keys
//
//     OPTION PRO : laisse vide et définis la variable d'environnement
//     ANTHROPIC_API_KEY dans Vercel → Settings → Environment Variables.
const ANTHROPIC_API_KEY = "";

const MODEL = "claude-3-5-haiku-latest";

export default async function handler(req, res) {
  const key = ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || "";

  // Health check : ouvre /api/ask dans le navigateur pour vérifier la config.
  // Ne révèle JAMAIS la clé — indique seulement si elle est détectée.
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      service: "Zahra /api/ask",
      keyConfigured: !!key,
      message: key
        ? "Clé détectée ✅ — la fonction est prête."
        : "Aucune clé ❌ — colle ta clé dans api/ask.js OU définis ANTHROPIC_API_KEY dans Vercel, puis redéploie.",
    });
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!key) {
    return res.status(500).json({
      error: "Clé Anthropic manquante. Colle-la dans api/ask.js (ANTHROPIC_API_KEY) OU ajoute la variable d'environnement ANTHROPIC_API_KEY dans Vercel, puis redéploie.",
    });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    if (!body.prompt) return res.status(400).json({ error: "Missing prompt" });

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 1024, messages: [{ role: "user", content: body.prompt }] }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = (data.error && data.error.message) || ("Anthropic error " + r.status);
      // 401 = clé invalide ; 400 = souvent crédits/quota
      return res.status(r.status).json({ error: msg });
    }
    res.status(200).json({ text: (data.content && data.content[0] && data.content[0].text || "").trim() });
  } catch (e) {
    res.status(500).json({ error: String(e && e.message || e) });
  }
}
