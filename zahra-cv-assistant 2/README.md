# Zahra — Assistante CV de Fany

Application voix + chat qui répond aux questions sur le CV de Fany.

## Obtenir une clé GRATUITE
Crée un compte sur https://console.anthropic.com → **Settings → API Keys** →
*Create Key*. L'inscription inclut des **crédits gratuits** (suffisants pour un CV).
Copie la clé (`sk-ant-…`).

## Déployer (Vercel) — 3 étapes
1. Ouvre `api/ask.js` et **colle ta clé** dans `const ANTHROPIC_API_KEY = ""`.
2. Pousse **le contenu de ce dossier à la racine** d'un dépôt GitHub (`index.html`
   et `api/` au premier niveau) — garde le dépôt **privé**.
3. Sur Vercel : **Add New → Project** → importe le dépôt → Framework **Other** → **Deploy**.

→ En ligne sur `https://<projet>.vercel.app`. Zahra répond, et tes visiteurs n'ont
**rien à saisir** (pas de clé, pas de connexion).

> Si Zahra affiche une erreur, le message entre parenthèses indique la cause
> (clé manquante, fonction 404 = dossier `api/` pas à la racine, etc.).

## Fichiers
- `index.html` · `styles.css` · `app.jsx` — l'application
- `cv-data.js` — le CV de Fany (édite-le pour le mettre à jour)
- `fany-avatar.png` — portrait de Zahra
- `api/ask.js` — fonction serveur qui appelle Anthropic avec ta clé
