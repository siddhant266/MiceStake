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
