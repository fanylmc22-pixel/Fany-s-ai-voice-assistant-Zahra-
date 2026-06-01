# Zahra — Assistante CV de Fany

Application voix + chat qui répond aux questions sur le CV de Fany.

## Déployer (Vercel) — 3 étapes

1. Ouvre `api/ask.js` et **colle ta clé Anthropic** dans `const ANTHROPIC_API_KEY = ""`
   (clé : https://console.anthropic.com/settings/keys).
2. Pousse **le contenu de ce dossier à la racine** d'un dépôt GitHub (`index.html`
   et `api/` au premier niveau), garde le dépôt **privé**.
3. Sur Vercel : **Add New → Project** → importe le dépôt → **Deploy**.

→ En ligne sur `https://<projet>.vercel.app`, Zahra répond, sans clé à saisir pour les visiteurs.

Pour modifier le CV : édite `cv-data.js`.
