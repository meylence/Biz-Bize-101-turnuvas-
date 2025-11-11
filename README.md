Eğlence amaçlı geliştirilmiştir.

# Deploy to Vercel

This app uses a Node/Express API with SQLite for persistence. Vercel doesn’t support long‑running Node servers or persistent local disks, so the recommended setup is:

- Host the backend (Express + SQLite) on a service like Render/Railway.
- Publish the static frontend (`public/`) on Vercel.
- Proxy API calls from Vercel to the backend using `vercel.json`.

## Steps

1. Push this repo to GitHub.
2. Create a new Vercel project:
   - Root Directory: keep as repository root (this project includes `vercel.json`).
   - Framework Preset: “Other”.
3. Edit `vercel.json` and replace `https://YOUR_API_HOST` with your backend base URL (e.g. `https://my-api.onrender.com`).
4. Deploy on Vercel.

`vercel.json` routes:

- `/admin` → `public/admin.html`
- `/api/*` → proxies to your backend (`https://YOUR_API_HOST/api/*`)
- Static files served from `public/`

### Backend Hosting

If you don’t have a backend yet, deploy `index.js` + `db.js` to Render/Railway:

- Install deps: `npm ci --only=production`
- Start command: `node index.js`
- Persist `data.db`

### Alternative: All on Vercel

If you want everything on Vercel only, migrate the DB to a cloud database (e.g., Vercel Postgres) and move the API into Serverless Functions under `api/`. This requires refactoring away from SQLite/local file persistence.