# LayerZero OFT Safe Manager

A single-page UI for reading, diffing, and proposing LayerZero V2 OFT config
changes as **Gnosis Safe multisig transactions**. Use it to wire a fresh OFT or
to make ongoing edits (rotate DVNs, change confirmations, swap executors, update
peers, tweak enforced options) without hot private keys.

No build step, no bundler. Just `bun run serve.ts`.

## What it does

For a chosen (source chain → destination eid) pair, the UI reads the live
on-chain state for:

- **Send / Receive library** (`endpoint.getSendLibrary`, `getReceiveLibrary`)
- **UlnConfig** on send + receive libs (`endpoint.getConfig` type 2): DVN sets,
  confirmations, thresholds
- **ExecutorConfig** on the send lib (`endpoint.getConfig` type 1)
- **Peer** (`OFTCore.peers`)
- **Enforced options** for msgType 1 (Send) and 2 (SendAndCall)
- **Delegate** (`endpoint.delegates`) and **OFT owner**. The delegate is the
  address allowed to call `setConfig` / `setSendLibrary` / `setReceiveLibrary`

Each panel shows the current value, an editable copy, a live per-field diff,
and a "Queue change" button. `Queue all changes` sweeps every panel at once.

A sticky batch panel lists every queued call; `Propose to Safe` packages them
into a single `MultiSendCallOnly` delegatecall and submits it to the Safe
Transaction Service.

## Supported networks

Mainnet: **Ethereum**, **Base**, **BNB Chain**, **HyperEVM**.
Testnet: **Sepolia**, **Base Sepolia**.

All values live in [networks.js](networks.js). Add a chain by adding an entry
with its `eid`, `lzEndpoint`, `sendLib`, `receiveLib`, `chainId`, `rpcUrl`,
`safeTxServiceUrl`, `safeUiPrefix`, and `multiSendCallOnly`.

HyperEVM has no hosted Safe Transaction Service, so for that chain the UI
automatically falls back to exporting a **Safe Transaction Builder JSON** you
can upload via the Safe app's Transaction Builder.

## Requirements

- [Bun](https://bun.sh) (for the dev server only; the UI itself is vanilla JS)
- A [WalletConnect Cloud](https://cloud.walletconnect.com) project ID (free) if
  you want to connect via WalletConnect. Injected wallets (MetaMask, Rabby,
  Frame) work without it.
- Optional: an [Alchemy](https://www.alchemy.com) API key for higher-throughput
  RPC reads. Without it the UI uses public RPCs (`publicnode`, `blastapi`, etc.).

## Quick start

```bash
git clone https://github.com/Built-by-Sign/layerzero-oft-safe-manager
cd layerzero-oft-safe-manager
cp .env.example .env
# Edit .env (both vars are optional)
bun run serve.ts
# http://localhost:3002
```

Connect a wallet. The modal explains both modes:

- **Owner EOA** (MetaMask / hardware / normal WC wallet): signs an EIP-712
  `SafeTx` and posts one atomic MultiSend proposal to the Safe Transaction
  Service. You paste the Safe address in the header.
- **Safe{Wallet} via WalletConnect** (connect the Safe itself from
  app.safe.global → WalletConnect → "use as wallet"): each queued call is sent
  as its own `eth_sendTransaction`, producing one proposal per call (no atomic
  batching). The Safe address input is ignored.

## Typical flow

1. Paste your **OFT address** and **Safe address** in the context header.
2. Pick source + destination networks.
3. The UI auto-loads on-chain state for every panel.
4. Edit whatever needs changing; diffs highlight in yellow, added/removed DVN
   rows are tagged green/red, and a summary appears next to each panel.
5. Click `Queue all changes`.
6. `Propose to Safe`: EIP-712 signature → POST to the tx service → co-signers
   see the proposal in `app.safe.global`.

## Delegate prerequisite

`Endpoint.setConfig`, `setSendLibrary`, and `setReceiveLibrary` all require
`msg.sender == endpoint.delegates[oft]`. If your Safe is the OFT `owner()` but
not yet the delegate, every `setConfig` inside the MultiSend will revert (Safe
raises `GS013` during simulation).

The Delegate panel handles this. `Queue all changes` prepends
`OFT.setDelegate(<safe>)` so the Safe becomes the delegate inside the same
atomic multisend, before any `setConfig` runs.

## JSON import / export

Every panel's state can be saved to / loaded from a JSON file, so you can check
bridge configs into a git repo alongside your Solidity wiring scripts and
review them in PRs. The import path validates that the JSON's declared `src`
and `dst` match the UI selection; a mismatch logs an error instead of
silently changing the network.

### Example configs

[examples/bft-hybrid/](examples/bft-hybrid) contains a full mesh of example
import files for a four-chain OFT deployment (Ethereum ↔ Base ↔ BNB ↔
HyperEVM), using a `2 required + 2-of-3 optional` DVN policy: LayerZero
Labs and Nethermind as required, plus three third-party DVNs under a
threshold of 2.

`oft` and `peerOft` are blank; fill them in with your own OFT addresses
before importing, or paste them into the header and let the UI
cross-validate on import.

## License

MIT. See [LICENSE](LICENSE).
