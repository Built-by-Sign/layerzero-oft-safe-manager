// LayerZero V2 network registry for the OFT Safe Manager UI.
//
// This file is the protocol-plumbing map only: eid, endpoint, libs,
// chainId, RPC, Safe Transaction Service URL, and MultiSendCallOnly. It
// deliberately does NOT contain DVN addresses — DVN sets are per-lane
// desired state and belong in config JSONs (see examples/bft-hybrid/)
// that the UI imports. Keeping them out of the registry avoids
// hardcoding opinions about which providers a given deployment should
// trust.
//
// - eid / lzEndpoint / sendLib / receiveLib match the canonical
//   LayerZero V2 deployments and are the source of truth the UI reads
//   and writes against. They also pre-fill the Endpoint / library inputs
//   before any config JSON is imported.
// - chainId / rpcUrl / safeTxServiceUrl / safeUiPrefix / multiSendCallOnly
//   are UI-layer glue used for wallet chain-switching, on-chain reads,
//   and Safe Transaction Service integration.
// - `safeTxServiceUrl: null` forces the Safe Transaction Builder JSON
//   fallback (used for chains without a hosted Safe Transaction Service,
//   e.g. HyperEVM).
// - The OFT address is user-supplied via the header input; it is not
//   stored here so one instance of the UI can wire any deployment.

window.NETWORKS = {
  ethereum: {
    label: "Ethereum",
    chainId: 1,
    eid: 30101,
    rpcUrl: "https://ethereum-rpc.publicnode.com",
    lzEndpoint: "0x1a44076050125825900e736c501f859c50fE728c",
    sendLib: "0xbB2Ea70C9E858123480642Cf96acbcCE1372dCe1",
    receiveLib: "0xc02Ab410f0734EFa3F14628780e6e695156024C2",
    safeTxServiceUrl: "https://safe-transaction-mainnet.safe.global",
    safeUiPrefix: "eth",
    multiSendCallOnly: "0x40A2aCCbd92BCA938b02010E17A5b8929b49130D",
  },
  base: {
    label: "Base",
    chainId: 8453,
    eid: 30184,
    rpcUrl: "https://base-rpc.publicnode.com",
    lzEndpoint: "0x1a44076050125825900e736c501f859c50fE728c",
    sendLib: "0xB5320B0B3a13cC860893E2Bd79FCd7e13484Dda2",
    receiveLib: "0xc70AB6f32772f59fBfc23889Caf4Ba3376C84bAf",
    safeTxServiceUrl: "https://safe-transaction-base.safe.global",
    safeUiPrefix: "base",
    multiSendCallOnly: "0x40A2aCCbd92BCA938b02010E17A5b8929b49130D",
  },
  bnb: {
    label: "BNB Chain",
    chainId: 56,
    eid: 30102,
    rpcUrl: "https://bsc-rpc.publicnode.com",
    lzEndpoint: "0x1a44076050125825900e736c501f859c50fE728c",
    sendLib: "0x9F8C645f2D0b2159767Bd6E0839DE4BE49e823DE",
    receiveLib: "0xB217266c3A98C8B2709Ee26836C98cf12f6cCEC1",
    safeTxServiceUrl: "https://safe-transaction-bsc.safe.global",
    safeUiPrefix: "bnb",
    multiSendCallOnly: "0x40A2aCCbd92BCA938b02010E17A5b8929b49130D",
  },
  hyper: {
    label: "HyperEVM",
    chainId: 999,
    eid: 30367,
    rpcUrl: "https://rpc.hyperliquid.xyz/evm",
    lzEndpoint: "0x3A73033C0b1407574C76BdBAc67f126f6b4a9AA9",
    sendLib: "0xfd76d9CB0Bac839725aB79127E7411fe71b1e3CA",
    receiveLib: "0x7cacBe439EaD55fa1c22790330b12835c6884a91",
    // HyperEVM has no hosted Safe Transaction Service — the UI degrades to the
    // Transaction Builder JSON export path automatically.
    safeTxServiceUrl: null,
    safeUiPrefix: null,
    multiSendCallOnly: "0x40A2aCCbd92BCA938b02010E17A5b8929b49130D",
  },
  sepolia: {
    label: "Sepolia (ETH testnet)",
    chainId: 11155111,
    eid: 40161,
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    lzEndpoint: "0x6EDCE65403992e310A62460808c4b910D972f10f",
    sendLib: "0xcc1ae8Cf5D3904Cef3360A9532B477529b177cCE",
    receiveLib: "0xdAf00F5eE2158dD58E0d3857851c432E34A3A851",
    safeTxServiceUrl: "https://safe-transaction-sepolia.safe.global",
    safeUiPrefix: "sep",
    multiSendCallOnly: "0x40A2aCCbd92BCA938b02010E17A5b8929b49130D",
  },
  baseSepolia: {
    label: "Base Sepolia",
    chainId: 84532,
    eid: 40245,
    rpcUrl: "https://base-sepolia.public.blastapi.io",
    lzEndpoint: "0x6EDCE65403992e310A62460808c4b910D972f10f",
    sendLib: "0xC1868e054425D378095A003EcbA3823a5D0135C9",
    receiveLib: "0x12523de19dc41c91F7d2093E0CFbB76b17012C8d",
    safeTxServiceUrl: "https://safe-transaction-base-sepolia.safe.global",
    safeUiPrefix: "basesep",
    multiSendCallOnly: "0x40A2aCCbd92BCA938b02010E17A5b8929b49130D",
  },
};

// Override public RPCs with Alchemy endpoints when ALCHEMY_API_KEY is injected.
// HyperEVM is not supported by Alchemy and always uses the official endpoint.
(function applyAlchemyOverrides() {
  const key = window.__ALCHEMY_API_KEY__;
  if (!key) return;
  const alchemyHosts = {
    ethereum: "eth-mainnet.g.alchemy.com",
    base: "base-mainnet.g.alchemy.com",
    bnb: "bnb-mainnet.g.alchemy.com",
    sepolia: "eth-sepolia.g.alchemy.com",
    baseSepolia: "base-sepolia.g.alchemy.com",
  };
  for (const [netKey, host] of Object.entries(alchemyHosts)) {
    const net = window.NETWORKS[netKey];
    if (net) net.rpcUrl = `https://${host}/v2/${key}`;
  }
})();

window.NETWORK_KEYS = Object.keys(window.NETWORKS);
