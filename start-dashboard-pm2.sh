#!/usr/bin/env bash
# Scar Alpha Dashboard — sync bot UI + build + run with PM2
#
# On VPS (example):
#   cd /home/web/dashbord
#   cp .env.production.example .env.production   # VITE_API_BASE_URL=https://www.scaralphaai.com
#   chmod +x start-dashboard-pm2.sh
#   ./start-dashboard-pm2.sh
#
# Commands:
#   ./start-dashboard-pm2.sh           # ensure UI + build + start/restart
#   ./start-dashboard-pm2.sh restart   # restart only (no rebuild)
#   ./start-dashboard-pm2.sh stop
#   ./start-dashboard-pm2.sh delete
#   ./start-dashboard-pm2.sh logs
#   ./start-dashboard-pm2.sh status
#   ./start-dashboard-pm2.sh build

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

APP_NAME="scaralpha-dashboard"
LOG_DIR="$ROOT/logs"
DASHBOARD_PORT="${DASHBOARD_PORT:-4174}"

die() { echo "ERROR: $*" >&2; exit 1; }
info() { echo "==> $*"; }
ok() { echo "OK: $*"; }
need() { command -v "$1" >/dev/null 2>&1; }

ensure_node() {
  need node || die "node missing — install Node 20 first"
  need npm || die "npm missing — install Node 20 first"
}

ensure_pm2() {
  if need pm2; then
    return 0
  fi
  info "Installing PM2 globally..."
  npm install -g pm2
  need pm2 || die "pm2 install failed"
}

load_api_base() {
  if [[ -f "$ROOT/.env.production" ]]; then
    info "Using $ROOT/.env.production for build"
    set -a
    # shellcheck disable=SC1091
    source "$ROOT/.env.production"
    set +a
  elif [[ -f "$ROOT/.env" ]]; then
    info "Using $ROOT/.env for build"
    set -a
    # shellcheck disable=SC1091
    source "$ROOT/.env"
    set +a
  fi

  if [[ -z "${VITE_API_BASE_URL:-}" ]]; then
    echo "WARN: VITE_API_BASE_URL empty — set in .env.production e.g. https://www.scaralphaai.com"
  else
    ok "VITE_API_BASE_URL=${VITE_API_BASE_URL}"
  fi

  export DASHBOARD_PORT
}

ensure_bot_ui() {
  if [[ -d "$ROOT/.bot_ui/src" ]]; then
    ok "Vendored bot UI present (.bot_ui/src)"
    return 0
  fi
  if [[ -d "$ROOT/../bot_telegram_webapp/src" ]]; then
    info "Syncing bot UI from sibling..."
    npm run sync:bot-ui
    return 0
  fi
  die "Missing .bot_ui/src — run npm run sync:bot-ui in the monorepo and upload .bot_ui, or place bot_telegram_webapp as sibling"
}

install_deps() {
  info "npm install..."
  npm install
}

build_dash() {
  ensure_node
  mkdir -p "$LOG_DIR"
  install_deps
  ensure_bot_ui
  info "Building dashboard (tsc + vite)..."
  npm run build
  [[ -d "$ROOT/dist" ]] || die "dist/ missing after build"
  ok "Build done → $ROOT/dist"
}

pm2_start_or_restart() {
  ensure_pm2
  mkdir -p "$LOG_DIR"
  export DASHBOARD_PORT

  if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
    info "Recreating PM2 app: $APP_NAME"
    pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
  fi

  info "Starting PM2 app: $APP_NAME on 0.0.0.0:${DASHBOARD_PORT}"
  pm2 start "$ROOT/ecosystem.config.cjs" --update-env
  pm2 save
  ok "Dashboard PM2 running"
  sleep 1
  if curl -fsS "http://127.0.0.1:${DASHBOARD_PORT}/dashboard/" >/dev/null 2>&1; then
    ok "Dashboard OK → http://127.0.0.1:${DASHBOARD_PORT}/dashboard/"
  else
    echo "WARN: dashboard not responding yet — check: pm2 logs $APP_NAME"
  fi
}

main() {
  local cmd="${1:-start}"
  load_api_base

  case "$cmd" in
    start|"")
      build_dash
      pm2_start_or_restart
      echo ""
      echo "Dashboard: http://0.0.0.0:${DASHBOARD_PORT}/dashboard/"
      echo "Admin:     http://0.0.0.0:${DASHBOARD_PORT}/dashboard/admin"
      echo "API base:  ${VITE_API_BASE_URL:-'(empty)'}"
      echo "Logs:      pm2 logs $APP_NAME"
      ;;
    restart)
      ensure_pm2
      export DASHBOARD_PORT
      # Full recreate so vite.config.ts (allowedHosts, etc.) is reloaded
      if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
        pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
      fi
      pm2 start "$ROOT/ecosystem.config.cjs" --update-env
      pm2 save
      ok "Dashboard recreated"
      sleep 1
      curl -fsSI "http://127.0.0.1:${DASHBOARD_PORT}/dashboard/" | head -n 5 || echo "WARN: check pm2 logs $APP_NAME"
      ;;
    stop)
      ensure_pm2
      pm2 stop "$APP_NAME" || true
      ;;
    delete|rm)
      ensure_pm2
      pm2 delete "$APP_NAME" || true
      pm2 save || true
      ;;
    logs)
      ensure_pm2
      pm2 logs "$APP_NAME"
      ;;
    status|list)
      ensure_pm2
      pm2 status
      curl -fsSI "http://127.0.0.1:${DASHBOARD_PORT}/dashboard/" | head -n 5 || echo "dashboard: down"
      ;;
    build)
      build_dash
      ;;
    help|-h|--help)
      sed -n '1,20p' "$0"
      ;;
    *)
      die "Unknown command: $cmd (start|restart|stop|logs|status|build)"
      ;;
  esac
}

main "${1:-start}"
