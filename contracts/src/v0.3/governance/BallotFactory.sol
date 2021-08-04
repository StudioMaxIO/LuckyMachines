// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Ballot.sol";

contract BallotFactory{
    address[] private _ballots;
    mapping(address => address[]) private _privateBallots; //privateBallots[creator]
    mapping(address => mapping(address => bool)) public access; //access[requestor][ballot owner]
    
    function ballotFromDelay(string memory ballotTitle, 
                             address votingTokenAddress, 
                             uint startDelay, 
                             uint voteDuration, 
                             uint defaultVotes) 
                             public returns(address){
        Ballot newBallot = new Ballot(ballotTitle, votingTokenAddress, msg.sender, (block.timestamp + startDelay), (block.timestamp + startDelay + voteDuration), defaultVotes);
        address newBallotAddress = address(newBallot);
        _ballots.push(newBallotAddress);
        return newBallotAddress;
    }
    
    function privateBallotFromDelay(string memory ballotTitle, 
                             address votingTokenAddress, 
                             uint startDelay, 
                             uint voteDuration, 
                             uint defaultVotes) 
                             public returns(address){
        Ballot newBallot = new Ballot(ballotTitle, votingTokenAddress, msg.sender, (block.timestamp + startDelay), (block.timestamp + startDelay + voteDuration), defaultVotes);
        address newBallotAddress = address(newBallot);
        _privateBallots[msg.sender].push(newBallotAddress);
        return newBallotAddress;
    }
    
    function grantAccess(address userAddress, address creatorAddress) public {
        require(msg.sender == creatorAddress, "Only creator can grant access");
        access[userAddress][creatorAddress] = true;
    }
    
    function revokeAccess(address userAddress, address creatorAddress) public {
        require(msg.sender == creatorAddress, "Only creator can revoke access");
        access[userAddress][creatorAddress] = false;
    }

    /**
     * @dev Returns a list of all ballots created from this factory.
     */
    function getBallots() public view returns (address[] memory) {
        return _ballots;
    }
    
    function getPrivateBallots(address creatorAddress) public view returns (address[] memory) {
        require(access[msg.sender][creatorAddress], "Not authorized to access private ballots");
        return _privateBallots[creatorAddress];
    }
}