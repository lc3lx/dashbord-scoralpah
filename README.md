# Scar Alpha Dashboard (website)

Standalone website under **`/dashboard/*`**. Independent of the Telegram Mini App (`bot_telegram_webapp`).

## Bot UI dependency (standalone deploy)

Dashboard reuses Mini App UI. On the server you must have **one** of:

1. Vendored copy inside this folder: `.bot_ui/src` (preferred for `/home/web/dashbord` alone)
2. Sibling repo: `../bot_telegram_webapp/src`

From the monorepo machine:

```powershell
cd dashboard_web
npm run sync:bot-ui
```

Then upload **the whole `dashboard_web` folder including `.bot_ui/`** to the server and run `npm i && npm run build`.

Or on the server keep this layout:

```text
/home/web/bot_telegram_webapp/   # sibling
/home/web/dashbord/              # this app
```

## PM2 (VPS — same pattern as Mini App front)

```bash
cd /home/web/dashbord
cp .env.production.example .env.production   # VITE_API_BASE_URL=https://www.scaralphaai.com
chmod +x start-dashboard-pm2.sh
./start-dashboard-pm2.sh          # sync/build + pm2 start scaralpha-dashboard
# ./start-dashboard-pm2.sh logs
# ./start-dashboard-pm2.sh restart
```

Default port: **4174** (`DASHBOARD_PORT`). App URL: `http://127.0.0.1:4174/dashboard/`  
Point nginx `location /dashboard/` → this process (or `alias` to `dist/` if you prefer static files only).

## Seed website admin (API host)

On the backend VPS (with `scaralpha.env` + Postgres):

```bash
cd /home/web/backend   # path to ScarAlpha backend
set -a && source ./scaralpha.env && set +a
chmod +x tools/seed-admin/seed-admin.sh
./tools/seed-admin/seed-admin.sh 'you@example.com' 'YourPassword'
# then in scaralpha.env:
#   ADMIN_EMAILS=you@example.com
./start-backend-pm2.sh restart
```

## Run locally

```powershell
# Terminal 1 — API
cd d:\work\flul_bot\backend
$env:JWT_SECRET = 'dev-only-change-me-please-use-32chars-min!!'
$env:JWT_ISSUER = 'ScarAlpha'
$env:JWT_AUDIENCE = 'ScarAlpha.App'
$env:BINOLLA_TOKEN_ENCRYPTION_KEY = 'dev-binolla-encryption-key-change-me-32'
$env:Cors__Origins = 'http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174'
dotnet run --project ScarAlpha.Api

# Terminal 2 — Dashboard
cd d:\work\flul_bot\dashboard_web
npm install
npm run dev
```

Open: **http://localhost:5174/dashboard/**  
Login: **http://localhost:5174/dashboard/login**  

API base (not localhost): `VITE_API_BASE_URL=https://www.scaralphaai.com` in `.env.development` — browser calls the live server directly.

## Production

```powershell
cd d:\work\flul_bot\dashboard_web
$env:VITE_API_BASE_URL = 'https://your-api-host'
npm run build
```

Serve `dist/` at the site path `/dashboard/` (SPA fallback required for deep links):

```nginx
location /dashboard/ {
  alias /var/www/scaralpha/dashboard/;
  try_files $uri $uri/ /dashboard/index.html;
}
```

Telegram Mini App continues from `bot_telegram_webapp` (no `/dashboard` prefix).

## Routes

| URL | Page |
|---|---|
| `/dashboard/` | Home |
| `/dashboard/login` | Login (email/password) |
| `/dashboard/signup` | Signup |
| `/dashboard/link-binolla` | Link Binolla |
| `/dashboard/bot` | AI Bot Engine |
| `/dashboard/trading` | Trading |
| `/dashboard/trading/:tradeId` | Trade detail |
| `/dashboard/history` | History |
| `/dashboard/notifications` | Notifications |
| `/dashboard/settings` | Settings |
| `/dashboard/settings/edit-profile` | Profile |
| `/dashboard/settings/change-password` | Change password |
| `/dashboard/settings/subscription` | Subscription |
| `/dashboard/settings/activation-history` | Activation history |
| `/dashboard/admin` | Admin console |
| `/dashboard/admin/users` | Users |
| `/dashboard/admin/users/:userId` | User detail |
| `/dashboard/admin/approvals` | Binolla approvals |
| `/dashboard/admin/marketing` | Marketing demos |
| `/dashboard/admin/notifications` | Admin notifications |
| `/dashboard/admin/audit` | Audit log |
| `/dashboard/admin/bots` | Bot runtime control (start/pause/stop) |
| `/dashboard/admin/trades` | All users’ trades |

## Admin acceptance checklist

1. Log in as admin on `/dashboard/login` (email in `ADMIN_EMAILS` or Telegram id in `ADMIN_TELEGRAM_USER_IDS` after link).
2. Open `/dashboard/admin` — sidebar: Users, Bots, Trades, Approvals, Marketing, Notifications, Audit.
3. Approvals: filter Pending, approve/reject; user receives notification.
4. Bots: start/pause/stop a user’s bot on the live API.
5. Trades: browse cross-user trades.
6. Marketing: create demo with Telegram user id + balance/profit/sample trades; open Mini App as that Telegram user → no Binolla gate; numbers match config.
7. Users: search, open detail, toggle demo / link Telegram.
8. Audit: events appear for approve/demo/notification/bot actions.
9. Notifications: send to one user id; appears in inbox.
10. Telegram Mini App settings does **not** show Admin menu.

`VITE_API_BASE_URL` must be the production host (e.g. `https://www.scaralphaai.com`), never `localhost`.

Admins are bootstrapped via env only (`ADMIN_EMAILS` / `ADMIN_TELEGRAM_USER_IDS`) — no in-app promote.
