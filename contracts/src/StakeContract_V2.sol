// // SPDX-License-Identifier: Unlicense
// pragma solidity ^0.8.13;

// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// interface IToken {
//     function mint(address to, uint256 amount) external;
// }

// contract StakeContract_V2 is Ownable, ReentrancyGuard {
//     uint public totalStake;
//     IToken public rewardTokenAdd;
//     struct userInfo {
//         uint256 stakedAmount;
//         uint256 lastUpdateTime;
//         uint256 reward;
//     }
//     mapping(address => userInfo) public users;

//     mapping(address => uint256) public depositTime;
//     uint256 public rewardRate;
//     uint256 public timeFactor;
//     uint256 public rewardMultiplier;

//     // We no longer initialize in constructor because this is a logic contract
//     constructor() Ownable(msg.sender) {}

//     function initialize(address _rewardTokenAdd) external onlyOwner {
//         require(address(rewardTokenAdd) == address(0), "Already initialized");
//         rewardTokenAdd = IToken(_rewardTokenAdd);
//         rewardRate = 15;
//         timeFactor = 10;
//         rewardMultiplier = 100;
//     }

//     function stake(uint256 _amount) public payable nonReentrant {
//         require(_amount > 0, "Invalid amount");
//         require(msg.value == _amount, "ETH mismatch");

//         if (depositTime[msg.sender] == 0) {
//             depositTime[msg.sender] = block.timestamp;
//         }

//         _updateRewards(msg.sender);

//         users[msg.sender].stakedAmount += _amount;
//         totalStake += _amount;
//     }

//     function unstake(uint256 _amount) public nonReentrant {
//         require(users[msg.sender].stakedAmount >= _amount, "Not enough staked");

//         _updateRewards(msg.sender);
//         users[msg.sender].stakedAmount -= _amount;
//         totalStake -= _amount;

//         (bool success, ) = payable(msg.sender).call{value: _amount}("");
//         require(success, "Failed to transfer ETH");
//     }

//     function claimRewards() public nonReentrant {
//         require(
//             block.timestamp >= depositTime[msg.sender] + 2 minutes,
//             "Claiming allowed only after 2 minutes from first deposit"
//         );

//         _updateRewards(msg.sender);
//         uint256 reward = users[msg.sender].reward;

//         require(reward > 0, "No rewards");
//         require(address(rewardTokenAdd) != address(0), "Token not set");

//         users[msg.sender].reward = 0;
//         rewardTokenAdd.mint(msg.sender, reward);
//     }

//     function _updateRewards(address _userAdd) internal {
//         if (users[_userAdd].lastUpdateTime == 0) {
//             users[_userAdd].lastUpdateTime = block.timestamp;
//             return;
//         }

//         uint256 timediff = block.timestamp - users[_userAdd].lastUpdateTime;
//         if (timediff == 0) {
//             return;
//         }

//         //  Speed up time for testing purposes
//         timediff = timediff * timeFactor;

//         uint256 baseReward = (users[_userAdd].stakedAmount *
//             timediff *
//             rewardRate) / (365 days * 100);

//         uint256 newReward = (baseReward * rewardMultiplier);

//         users[_userAdd].reward += newReward;
//         users[_userAdd].lastUpdateTime = block.timestamp;
//     }

//     function getRewards() public view returns (uint256 reward) {
//         uint256 timediff = block.timestamp - users[msg.sender].lastUpdateTime;
//         if (timediff == 0) {
//             return 0;
//         }
//         //  Speed up time for testing purposes
//         timediff = timediff * timeFactor;

//         uint256 baseReward = (users[msg.sender].stakedAmount *
//             timediff *
//             rewardRate) / (365 days * 100);

//         reward = users[msg.sender].reward + (baseReward * rewardMultiplier);
//     }
// }
