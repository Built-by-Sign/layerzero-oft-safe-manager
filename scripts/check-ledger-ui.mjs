import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

const requiredSnippets = [
  'id="ledgerPath"',
  "Connect Ledger",
  "window._LedgerTransportWebHID",
  "window._LedgerEth",
  "ledger-sdk-ready",
  "async function connectLedger()",
  "function updateLedgerConnectState",
  "function createLedgerSigner",
  "function buildLedgerTypedData",
  "signEIP712Message",
  "signEIP712HashedMessage",
  "@ledgerhq/hw-app-eth@6.29.3?bundle",
  'walletType === "ledger"',
  "localStorage.setItem(\"lz-ledger-path\"",
  "window.connectLedger = connectLedger",
];

const missing = requiredSnippets.filter((snippet) => !html.includes(snippet));
if (missing.length) {
  console.error("Missing Ledger UI/signing snippets:");
  for (const snippet of missing) console.error(`- ${snippet}`);
  process.exit(1);
}

if (html.includes("@ledgerhq/hw-app-eth@6.45.17?bundle")) {
  console.error("Broken Ledger app-eth esm.sh bundle is still referenced.");
  process.exit(1);
}

const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
  .filter((match) => match[2].trim());
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

for (const [, attrs, script] of scripts) {
  if (attrs.includes('type="module"')) {
    new AsyncFunction(script);
  } else {
    new Function(script);
  }
}

console.log(`Ledger UI checks passed; parsed ${scripts.length} inline scripts.`);
