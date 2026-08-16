import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dashboardRoot = path.resolve(__dirname, '..');

/** Prefer vendored copy (standalone server deploy), then monorepo sibling. */
export function resolveBotSrc(root = dashboardRoot) {
  const candidates = [
    path.resolve(root, '.bot_ui/src'),
    path.resolve(root, '../bot_telegram_webapp/src'),
    process.env.BOT_UI_SRC ? path.resolve(process.env.BOT_UI_SRC) : null,
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return { botSrc: candidate, source: candidate.includes(`${path.sep}.bot_ui${path.sep}`) ? 'vendored' : 'sibling' };
    }
  }

  return { botSrc: null, source: null, tried: candidates };
}
