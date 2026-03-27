// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Proxy.sol";

import {IToken} from "./StakeContract_V1.sol";

contract StakeContractProxy is Proxy, Ownable {
    uint public totalStake;
    IToken public rewardTokenAdd;

    struct userInfo {
        uint256 stakedAmount;
        uint256 lastUpdateTime;
        uint256 reward;
    }
    mapping(address => userInfo) public users;
    address private implementation;
    mapping(address => uint256) public depositTime;

    constructor(address _impl, address _rewardTokenAdd) Ownable(msg.sender) {
        implementation = _impl;
        // Let the proxy initialize its own variable immediately to avoid external call
        rewardTokenAdd = IToken(_rewardTokenAdd);
    }

    function updateImplementation(address _newImplementation) public onlyOwner {
        implementation = _newImplementation;
    }

    function getRewards() public returns (uint256 reward) {
        bytes memory data = abi.encodeWithSignature("getRewards()");
        (bool success, bytes memory returnData) = implementation.delegatecall(
            data
        );
        require(success, "Delegatecall failed");
        reward = abi.decode(returnData, (uint256));
    }

    function _implementation() internal view override returns (address) {
        return implementation;
    }

    receive() external payable {}
}
