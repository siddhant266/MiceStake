// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20,Ownable {

    address public admin;
    
    
    constructor() ERC20("Mice Token", "MICE") Ownable(msg.sender) {
        admin = msg.sender;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;  
    }

    function updateOwner(address _stakingContract) public onlyAdmin() {
        transferOwnership(_stakingContract);
    }
}