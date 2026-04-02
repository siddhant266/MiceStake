export const PROXY_ADDRESS = "0x84FDdBD7120D3e45C1D92585cf194e98dA61A1ac" as const;
export const TOKEN_ADDRESS = "0xa861597499fbF9fe9089e2A35a9c18e1aDdeFBa5" as const;

export const STAKING_ABI = [
  // ── Logic functions (delegatecalled through proxy) ──
  {
    "type": "function",
    "name": "stake",
    "inputs": [{ "name": "_amount", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "unstake",
    "inputs": [{ "name": "_amount", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "claimRewards",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getRewards",
    "inputs": [],
    "outputs": [{ "name": "reward", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "initialize",
    "inputs": [{ "name": "_rewardTokenAdd", "type": "address" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "rewardTokenAdd",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view"
  },
  // ── Proxy-level functions ──
  {
    "type": "function",
    "name": "updateImplementation",
    "inputs": [{ "name": "_newImplementation", "type": "address" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  // ── Shared (both contracts) ──
  {
    "type": "function",
    "name": "users",
    "inputs": [{ "name": "", "type": "address" }],
    "outputs": [
      { "name": "stakedAmount", "type": "uint256" },
      { "name": "lastUpdateTime", "type": "uint256" },
      { "name": "reward", "type": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "depositTime",
    "inputs": [{ "name": "", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "totalStake",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "rewardRate",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "timeFactor",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "rewardMultiplier",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "renounceOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [{ "name": "newOwner", "type": "address" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  // ── Events ──
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "inputs": [
      { "name": "previousOwner", "type": "address", "indexed": true },
      { "name": "newOwner", "type": "address", "indexed": true }
    ],
    "anonymous": false
  },
  // ── Errors ──
  {
    "type": "error",
    "name": "OwnableInvalidOwner",
    "inputs": [{ "name": "owner", "type": "address" }]
  },
  {
    "type": "error",
    "name": "OwnableUnauthorizedAccount",
    "inputs": [{ "name": "account", "type": "address" }]
  }
] as const;

export const TOKEN_ABI = [
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [{ "name": "account", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "decimals",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint8" }],
    "stateMutability": "view"
  }
] as const;