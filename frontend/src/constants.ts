export const PROXY_ADDRESS = "0x3411b24bB67D7295BA0A9654A2A9dBC963A7Dede" as const;
export const TOKEN_ADDRESS = "0xbdD7fa63A7492f43297C94c098242cfe9cA0a82E" as const;

export const STAKING_ABI = [
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
    "name": "depositTime",
    "inputs": [{ "name": "user", "type": "address" }],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "users",
    "inputs": [{ "name": "user", "type": "address" }],
    "outputs": [
      { "name": "stakedAmount", "type": "uint256" },
      { "name": "lastUpdateTime", "type": "uint256" },
      { "name": "reward", "type": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getRewards",
    "inputs": [],
    "outputs": [{ "name": "reward", "type": "uint256" }],
    "stateMutability": "view"
  }
] as const;
