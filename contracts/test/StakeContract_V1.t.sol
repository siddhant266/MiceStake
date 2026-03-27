// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/StakeContract_V1.sol";

// 🔥 Mock Token (for testing mint)
contract MockToken {
    mapping(address => uint256) public balance;

    function mint(address to, uint256 amount) external {
        balance[to] += amount;
    }
}

contract StakeContract_V1Test is Test {
    StakeContract_V1 stake;
    MockToken token;

    address user = address(1);

    function setUp() public {
        token = new MockToken();
        stake = new StakeContract_V1();
        stake.initialize(address(token));

        vm.deal(user, 10 ether); // give user ETH
    }

    function testClaimRewards() public {
        vm.startPrank(user);

        // 1️⃣ Stake ETH
        stake.stake{value: 1 ether}(1 ether);

        // 2️⃣ Move time forward (> 21 days to bypass lock)
        vm.warp(block.timestamp + 22 days);

        // 3️⃣ Check rewards before claim
        uint256 expectedReward = stake.getRewards();
        assertGt(expectedReward, 0);

        // 4️⃣ Claim rewards
        stake.claimRewards();

        // 5️⃣ Check token balance
        uint256 tokenBalance = token.balance(user);
        assertEq(tokenBalance, expectedReward);

        // 6️⃣ Check reward reset
        (, , uint256 rewardAfter) = stake.users(user);
        assertEq(rewardAfter, 0);

        vm.stopPrank();
    }
}