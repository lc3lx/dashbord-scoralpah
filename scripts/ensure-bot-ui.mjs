/** Fail fast before tsc/vite if bot UI aliases cannot resolve. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveBotSrc } from './resolve-bot-ui.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const debugLogPath = path.resolve(root, '../debug-1892a4.log');

function agentLog(message, data, hypothesisId = 'B') {
  // #region agent log
  try {
    fs.appendFileSync(
      debugLogPath,
      `${JSON.stringify({
        sessionId: '1892a4',
        hypothesisId,
        location: 'dashboard_web/scripts/ensure-bot-ui.mjs',
        message,
        data,
        timestamp: Date.now(),
        runId: process.env.DEBUG_RUN_ID || 'prebuild',
      })}\n`,
    );
  } catch {
    /* ignore */
  }
  // #endregion
}

const { botSrc, source, tried } = resolveBotSrc(root);
agentLog('ensure-bot-ui', { botSrc, source, tried }, 'B');

if (!botSrc) {
  console.error(
    '[ensure-bot-ui] Cannot resolve bot UI for @shared/@pages aliases.\n' +
      'Run `npm run sync:bot-ui` in the monorepo (needs ../bot_telegram_webapp),\n' +
      'or deploy `.bot_ui/src` inside this dashboard folder,\n' +
      'or place `bot_telegram_webapp` as a sibling of this folder.',
  );
  process.exit(1);
}

console.log(`[ensure-bot-ui] Using bot UI from ${source}: ${botSrc}`);
