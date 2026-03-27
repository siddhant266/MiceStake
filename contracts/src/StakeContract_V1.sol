// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IToken {
    function mint(address to, uint256 amount) external;
}

contract StakeContract_V1 is Ownable {
    uint public totalStake;
    IToken public rewardTokenAdd;
    
    struct userInfo {
        uint256 stakedAmount;
        uint256 lastUpdateTime;
        uint256 reward;
    }
    mapping(address => userInfo) public users;
    
    // Proxy variable slot
    address private implementation;
    
    // Core features
    mapping(address => uint256) public depositTime;

    // We no longer initialize in constructor because this is a logic contract
    constructor() Ownable(msg.sender) {}

    function initialize(address _rewardTokenAdd) external onlyOwner {
        require(address(rewardTokenAdd) == address(0), "Already initialized");
        rewardTokenAdd = IToken(_rewardTokenAdd);
    }

    function stake(uint256 _amount) public payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(msg.value == _amount, "ETH amount mismatch");

        if (depositTime[msg.sender] == 0) {
            depositTime[msg.sender] = block.timestamp;
        }

        _updateRewards(msg.sender);

        users[msg.sender].stakedAmount += _amount;
        totalStake += _amount;
    }

    function unstake(uint256 _amount) public {
        require(users[msg.sender].stakedAmount >= _amount, "Not enough staked");

        _updateRewards(msg.sender);
        users[msg.sender].stakedAmount -= _amount;
        totalStake -= _amount;

        // Reset deposit time if completely unstaked
        if (users[msg.sender].stakedAmount == 0) {
            depositTime[msg.sender] = 0;
        }

        (bool success, ) = payable(msg.sender).call{value: _amount}("");
        require(success, "Failed to transfer ETH");
    }

    function claimRewards() public {
        require(block.timestamp >= depositTime[msg.sender] + 21 days, "Claiming allowed only after 21 days from first deposit");
        
        _updateRewards(msg.sender);
        uint256 reward = users[msg.sender].reward;

        require(reward > 0, "No rewards");
        require(address(rewardTokenAdd) != address(0), "Token not set");

        users[msg.sender].reward = 0;
        rewardTokenAdd.mint(msg.sender, reward);
    }

    function _updateRewards(address _userAdd) internal {
        if (users[_userAdd].lastUpdateTime == 0) {
            users[_userAdd].lastUpdateTime = block.timestamp;
            return;
        }

        uint256 timediff = block.timestamp - users[_userAdd].lastUpdateTime;
        if (timediff == 0) {
            return;
        }

        uint256 newReward = (users[_userAdd].stakedAmount * timediff * 2) /
            1296000;

        users[_userAdd].reward += newReward;
        users[_userAdd].lastUpdateTime = block.timestamp;
    }

    function getRewards() public view returns (uint256 reward) {
        uint256 timediff = block.timestamp - users[msg.sender].lastUpdateTime;
        if (timediff == 0) {
            return 0;
        }

        uint256 newReward = (users[msg.sender].stakedAmount * timediff * 2) /
            1296000;

        reward = users[msg.sender].reward + newReward;
    }
}
