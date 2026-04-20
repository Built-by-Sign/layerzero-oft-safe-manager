#!/usr/bin/env bun
/**
 * Local dev server for the LayerZero OFT Safe Manager UI.
 * Usage: bun run serve.ts
 * Opens at http://localhost:3002
 */

import { join } from "path";

const PORT = Number(process.env.PORT) || 3002;
const dir = import.meta.dir;

// Load .env from this script's directory so the server works regardless of CWD.
await loadDotenv(join(dir, ".env"));

async function loadDotenv(path: string) {
  const f = Bun.file(path);
  if (!(await f.exists())) return;
  const text = await f.text();
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    if (process.env[key] !== undefined) continue;
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname === "/" ? "/index.html" : url.pathname;

    try {
      const file = Bun.file(join(dir, path));
      if (path === "/index.html") {
        let html = await file.text();
        const sanitize = (v: string) => v.replace(/[<>"'&\\]/g, "");
        const wcId = sanitize(Bun.env.WALLETCONNECT_PROJECT_ID || "");
        const alchemyKey = sanitize(Bun.env.ALCHEMY_API_KEY || "");
        html = html.replace(
          "<!--ENV_INJECT-->",
          `<script>window.__WC_PROJECT_ID__="${wcId}";window.__ALCHEMY_API_KEY__="${alchemyKey}";</script>`,
        );
        return new Response(html, { headers: { "Content-Type": "text/html" } });
      }
      return new Response(file);
    } catch {
      return new Response("Not found", { status: 404 });
    }
  },
});

console.log(`\n  LayerZero OFT Safe Manager running at http://localhost:${PORT}`);
if (Bun.env.WALLETCONNECT_PROJECT_ID) {
  console.log(`  WALLETCONNECT_PROJECT_ID: set ✓`);
} else {
  console.log(`  WALLETCONNECT_PROJECT_ID: not set (injected wallet only)`);
}
if (Bun.env.ALCHEMY_API_KEY) {
  console.log(`  ALCHEMY_API_KEY: set ✓`);
} else {
  console.log(`  ALCHEMY_API_KEY: not set (falling back to public RPCs)`);
}
console.log();
