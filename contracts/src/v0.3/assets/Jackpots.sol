pragma solidity ^0.6.0;

import "./LuckyMachines.sol";

contract Jackpots {
    using SafeMathChainlink for uint256;
    mapping(address => uint256) public balance;
    mapping(address => bool) public registered;
    address[] public jackpotMachines;

    receive() external payable {
        balance[msg.sender] = balance[msg.sender].add(msg.value);
    }

    function registerMachine() public {
        require(!registered[msg.sender], "Machine already registered");
        jackpotMachines.push(msg.sender);
        registered[msg.sender] = true;
    }

    function payoutJackpot(address payable recipient) external{
        recipient.transfer(balance[msg.sender]);
        balance[msg.sender] = 0;
    }

    function addToJackpot() external payable {
        balance[msg.sender] = balance[msg.sender].add(msg.value);
    }

    function getBalance() public view returns(uint256){
        return balance[msg.sender];
    }

    function getBalanceOf(address jackpotOwner) public view returns(uint256){
        return balance[jackpotOwner];
    }

    function getJackpotMachines() public view returns(address[] memory) {
        return jackpotMachines;
    }

    // DANGEROUS: This will associate this jackpot with another contract, may be unreversable
    function transferJackpot(address newJackpotOwner) public {
        balance[newJackpotOwner] = balance[newJackpotOwner].add(balance[msg.sender]);
        balance[msg.sender] = 0;
        registered[newJackpotOwner] = true;
    }
 }
