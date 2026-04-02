// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/Token.sol";
import "../src/StakeContract_V1.sol";
import "../src/StakeContractProxy.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Token
        Token rewardToken = new Token();

        // 2. Deploy Logic Contract (V1)
        StakeContract_V1 logicV1 = new StakeContract_V1();

        // 3. Deploy Proxy, point to V1, pass reward token addr for proxy init
        StakeContractProxy proxy = new StakeContractProxy(address(logicV1));

        // 4. Initialize Logic Contract (just in case)
        StakeContract_V1(address(proxy)).initialize(address(rewardToken));
     
        // 5. Update Token Admin to point to the Proxy
        rewardToken.updateOwner(address(proxy));

        vm.stopBroadcast();

        console.log("Token Deployed at:", address(rewardToken));
        console.log("StakeContract Logic (V1) Deployed at:", address(logicV1));
        console.log("StakeContract Proxy Deployed at:", address(proxy));
    }
}









// source .env

// forge script script/Deploy.s.sol \
//   --rpc-url $SEPOLIA_RPC_URL \
//   --private-key $PRIVATE_KEY \
//   --broadcast

//   Token Deployed at: 0xa861597499fbF9fe9089e2A35a9c18e1aDdeFBa5
//   StakeContract Logic (V1) Deployed at: 0x8B6bF8b7103827E9321D4A822Ae46A7442b4e8DE
//   StakeContract Proxy Deployed at: 0x84FDdBD7120D3e45C1D92585cf194e98dA61A1ac