/**
 * Sync bot Mini App UI into dashboard_web/.bot_ui so `npm run build` works
 * when only the dashboard folder is deployed (no sibling bot_telegram_webapp).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveBotSrc } from './resolve-bot-ui.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const vendorRoot = path.resolve(root, '.bot_ui');
const vendorSrc = path.resolve(vendorRoot, 'src');
const siblingSrc = path.resolve(root, '../bot_telegram_webapp/src');
const debugLogPath = path.resolve(root, '../debug-1892a4.log');

function agentLog(message, data, hypothesisId = 'A') {
  // #region agent log
  try {
    fs.appendFileSync(
      debugLogPath,
      `${JSON.stringify({
        sessionId: '1892a4',
        hypothesisId,
        location: 'dashboard_web/scripts/sync-bot-ui.mjs',
        message,
        data,
        timestamp: Date.now(),
      })}\n`,
    );
  } catch {
    /* ignore */
  }
  // #endregion
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

const resolved = resolveBotSrc(root);
agentLog('resolveBotSrc before sync', {
  resolvedSource: resolved.source,
  botSrc: resolved.botSrc,
  siblingExists: fs.existsSync(siblingSrc),
  vendorExists: fs.existsSync(vendorSrc),
}, 'A');

if (!fs.existsSync(siblingSrc)) {
  if (fs.existsSync(vendorSrc)) {
    agentLog('using existing vendor; sibling missing', { vendorSrc }, 'A');
    console.log(`[sync-bot-ui] Sibling missing; keeping existing .bot_ui at ${vendorSrc}`);
    process.exit(0);
  }
  agentLog('FATAL no sibling and no vendor', { siblingSrc, vendorSrc }, 'A');
  console.error(
    `[sync-bot-ui] Missing bot UI.\n` +
      `  Expected sibling: ${siblingSrc}\n` +
      `  Or vendored:      ${vendorSrc}\n` +
      `Copy bot_telegram_webapp next to this folder, or run sync from the monorepo.`,
  );
  process.exit(1);
}

fs.rmSync(vendorRoot, { recursive: true, force: true });
copyDir(siblingSrc, vendorSrc);
fs.writeFileSync(
  path.join(vendorRoot, 'README.txt'),
  'Auto-synced from ../bot_telegram_webapp/src. Do not edit by hand. Run: npm run sync:bot-ui\n',
);

const fileCount = (dir) => {
  let n = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) n += fileCount(p);
    else n += 1;
  }
  return n;
};

agentLog('sync complete', { vendorSrc, files: fileCount(vendorSrc) }, 'A');
console.log(`[sync-bot-ui] Synced ${siblingSrc} → ${vendorSrc}`);
