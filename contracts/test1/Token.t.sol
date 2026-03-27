// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/Token.sol";

contract TokenTest is Test {
    Token token;

    address admin = address(1);
    address staking = address(2);
    address user = address(3);
    address attacker = address(4);

    function setUp() public {
        vm.startPrank(admin);
        token = new Token();
        vm.stopPrank();
    }

    // ✅ 1. Admin is set correctly
    function testAdminIsSet() public {
        assertEq(token.admin(), admin);
    }

    // ✅ 2. Owner can mint
    function testOwnerCanMint() public {
        vm.startPrank(admin); // admin is owner initially
        token.mint(user, 1000);
        vm.stopPrank();

        assertEq(token.balanceOf(user), 1000);
    }

    // ❌ 3. Non-owner cannot mint
    function testNonOwnerCannotMint() public {
        vm.startPrank(attacker);

        vm.expectRevert(); // onlyOwner revert
        token.mint(user, 1000);

        vm.stopPrank();
    }

    // ✅ 4. Admin can update owner
    function testAdminCanUpdateOwner() public {
        vm.startPrank(admin);
        token.updateOwner(staking);
        vm.stopPrank();

        assertEq(token.owner(), staking);
    }

    // ❌ 5. Non-admin cannot update owner
    function testNonAdminCannotUpdateOwner() public {
        vm.startPrank(attacker);

        vm.expectRevert("Only admin can call this function");
        token.updateOwner(staking);

        vm.stopPrank();
    }

    // ✅ 6. Old owner loses mint access
    function testOldOwnerCannotMintAfterTransfer() public {
        vm.startPrank(admin);
        token.updateOwner(staking);
        vm.stopPrank();

        vm.startPrank(admin);
        vm.expectRevert(); // no longer owner
        token.mint(user, 1000);
        vm.stopPrank();
    }

    // ✅ 7. New owner can mint
    function testNewOwnerCanMint() public {
        vm.startPrank(admin);
        token.updateOwner(staking);
        vm.stopPrank();

        vm.startPrank(staking);
        token.mint(user, 1000);
        vm.stopPrank();

        assertEq(token.balanceOf(user), 1000);
    }
}