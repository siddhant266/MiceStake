// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/StakeContract_V2.sol";
import "../src/StakeContractProxy.sol";

contract UpgradeScript is Script {
    // ── Deployed addresses from V1 deployment ──
    address constant PROXY_ADDRESS = 0x84FDdBD7120D3e45C1D92585cf194e98dA61A1ac;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy the new V2 logic contract
        //    rewardRate, timeFactor, rewardMultiplier are set as defaults in V2 — no init call needed
        StakeContract_V2 logicV2 = new StakeContract_V2();
        console.log("StakeContract Logic (V2) Deployed at:", address(logicV2));

        // 2. Point the proxy to V2 — all existing user state is preserved
        StakeContractProxy proxy = StakeContractProxy(payable(PROXY_ADDRESS));
        proxy.updateImplementation(address(logicV2));
        console.log("Proxy updated to point to V2");

        vm.stopBroadcast();

        console.log("--- Upgrade Complete ---");
        console.log("Proxy:    ", PROXY_ADDRESS);
        console.log("V2 Logic: ", address(logicV2));
    }
}


// ── How to run ──
//
// source .env
//
// forge script script/Upgrade.s.sol \
//   --rpc-url $SEPOLIA_RPC_URL \
//   --private-key $PRIVATE_KEY \
//   --broadcast 


// ────── OUTPUT ──────
//   StakeContract Logic (V2) Deployed at: 0xa4aD8343A3bf76b3625A5a2A7c0E188Aec90F8f3
//   Proxy updated to point to V2
//   --- Upgrade Complete ---
//   Proxy:     0x84FDdBD7120D3e45C1D92585cf194e98dA61A1ac
//   V2 Logic:  0xa4aD8343A3bf76b3625A5a2A7c0E188Aec90F8f3
