# HireScore AI Frontend

Frontend for HireScore AI.

This repo contains the current legacy static dashboard plus the React/Vite migration entrypoint.

## Main Production Entry

Use `index.html` as the main entry for hosting today.

Recommended static hosts:

- Vercel static project
- Netlify
- Cloudflare Pages
- Nginx static hosting

## Connect to Backend

Production defaults to:

```text
https://api.hirescoreai.com
```

For legacy HTML/JS pages, the central config is `config.js`. It uses:

- `https://api.hirescoreai.com` on production hosts such as Netlify
- `http://127.0.0.1:8000` on local/file development

Optional runtime override:

```js
window.API_BASE_URL = "https://api.hirescoreai.com";
window.__HIRESCORE_API_BASE__ = "https://api.hirescoreai.com";
```

For the Vite/React entrypoint, set this Netlify environment variable:

```env
VITE_API_BASE_URL=https://api.hirescoreai.com
```

WebSocket URLs are derived from the same API base. `https://api.hirescoreai.com` becomes `wss://api.hirescoreai.com`.

## Netlify Deployment

Use these settings:

```text
Build command: echo Static frontend deploy
Publish directory: .
Environment variable: VITE_API_BASE_URL=https://api.hirescoreai.com
```

Deploy `index.html` as the main production entry. The Netlify redirect sends unknown paths such as `/pipeline` back to `index.html`, so the React enterprise page is not the default production app.

## Important Pages

- `index.html` - recruiter dashboard
- `login.html` - recruiter login
- `Signup.html` - signup
- `pricing.html` - pricing
- `apply.html` - public candidate apply page
- `candidate-tracking.html` - candidate status tracking
- `ai_explanation.html` - AI candidate report

## Optional React Build

The React migration starts at `enterprise.html`.

```bash
npm install
npm run build
```

For today's hosting, deploy the static root directly unless you specifically want the React migration.

## GitHub Push

```bash
git init
git add .
git commit -m "Initial frontend repo"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hirescore-frontend.git
git push -u origin main
```
