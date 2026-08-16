# Scar Alpha Dashboard (website)

Standalone website under **`/dashboard/*`**. Independent of the Telegram Mini App (`bot_telegram_webapp`).

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
