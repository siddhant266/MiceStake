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
    bytes32 private constant IMPLEMENTATION_SLOT =
        bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1);
    mapping(address => uint256) public depositTime;

    constructor(address _impl, address _rewardTokenAdd) Ownable(msg.sender) {
        _setImplementation(_impl);
        // Let the proxy initialize its own variable immediately to avoid external call
        rewardTokenAdd = IToken(_rewardTokenAdd);
    }

    function _setImplementation(address _impl) internal {
    bytes32 slot = IMPLEMENTATION_SLOT;
    assembly {
        sstore(slot, _impl)
    }
}

function _getImplementation() internal view returns (address impl) {
    bytes32 slot = IMPLEMENTATION_SLOT;
    assembly {
        impl := sload(slot)
    }
}

    function updateImplementation(address _newImplementation) public onlyOwner {
        _setImplementation(_newImplementation);
    }

    function getRewards() public returns (uint256 reward) {
        bytes memory data = abi.encodeWithSignature("getRewards()");
        (bool success, bytes memory returnData) = _getImplementation().delegatecall(
            data
        );
        require(success, "Delegatecall failed");
        reward = abi.decode(returnData, (uint256));
    }

    function _implementation() internal view override returns (address) {
       return _getImplementation();
    }

    receive() external payable {}
}
