// ─── IMPORTANT ──────────────────────────────────────────────────────────────
// After deploying with: npx hardhat run scripts/deploy.js --network mumbai
// Paste your deployed contract address below.
// Then copy the ABI from: artifacts/contracts/AbdulSupplyChain.sol/AbdulSupplyChain.json
// ─────────────────────────────────────────────────────────────────────────────

export const CONTRACT_ADDRESS = "0xd59bDD077C70BC423f4d71360a737402178c88b1";

export const CONTRACT_ABI = [
  "function admin() view returns (address)",
  "function assignRole(address account, uint8 role) external",
  "function getRole(address account) view returns (uint8)",
  "function registerProduct(string name, string description) external returns (uint256)",
  "function transferOwnership(uint256 productId, address to, string note) external",
  "function getProduct(uint256 productId) view returns (uint256 id, string name, string description, address currentOwner, uint8 status)",
  "function getProductHistory(uint256 productId) view returns (tuple(address from, address to, uint8 status, uint256 timestamp, string note)[])",
  "function getTotalProducts() view returns (uint256)",
  "event ProductRegistered(uint256 indexed productId, string name, address manufacturer)",
  "event OwnershipTransferred(uint256 indexed productId, address indexed from, address indexed to, uint8 newStatus)",
  "event RoleAssigned(address indexed account, uint8 role)"
];

export const ROLES = {
  0: "None",
  1: "Manufacturer",
  2: "Distributor",
  3: "Retailer",
  4: "Customer",
};

export const ROLE_COLORS = {
  0: "#64748b",
  1: "#f59e0b",
  2: "#3b82f6",
  3: "#10b981",
  4: "#8b5cf6",
};

export const STATUS_LABELS = {
  0: "Manufactured",
  1: "In Transit",
  2: "Delivered",
};

export const STATUS_COLORS = {
  0: "#f59e0b",
  1: "#3b82f6",
  2: "#10b981",
};

export const ROLE_NUMBERS = {
  None: 0,
  Manufacturer: 1,
  Distributor: 2,
  Retailer: 3,
  Customer: 4,
};

export function shortenAddress(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

export function formatTimestamp(ts) {
  const date = new Date(Number(ts) * 1000);
  return date.toLocaleString();
}