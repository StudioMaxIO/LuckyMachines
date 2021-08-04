// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Proposals.sol";
import "./Voters.sol";

/** 
 * @title Ballot
 * @dev Implements voting process along with vote delegation
 */
 
interface TokenInterface {
  function allowance(address owner, address spender) external view returns (uint256 remaining);
  function approve(address spender, uint256 value) external returns (bool success);
  function balanceOf(address owner) external view returns (uint256 balance);
  function decimals() external view returns (uint8 decimalPlaces);
  function name() external view returns (string memory tokenName);
  function symbol() external view returns (string memory tokenSymbol);
  function totalSupply() external view returns (uint256 totalTokensIssued);
  function transfer(address to, uint256 value) external returns (bool success);
  function transferFrom(address from, address to, uint256 value) external returns (bool success);
}

contract Ballot {
    
    address public proposals;
    address public voters;
    
    address public manager;
    
    string public title;
    
    uint public votingStart;
    uint public votingEnd;
    
    mapping(Proposals.ProposalType => uint) public totalVotes;
    
    TokenInterface internal VotingToken;
    
    modifier beforeVote() {
        require(block.timestamp < votingStart);
        _;
    }
    
    modifier afterVote() {
        require(block.timestamp > votingEnd);
        _;
    }

    modifier managerOnly() {
        require(msg.sender == manager, "Caller is not manager");
        _;
    }
    
    constructor(string memory ballotTitle, address votingTokenAddress, address ballotManager, uint voteStart, uint voteEnd, uint defaultVotes) {
        VotingToken = TokenInterface(votingTokenAddress);
        title = ballotTitle;
        manager = ballotManager;
        votingStart = voteStart;
        votingEnd = voteEnd;
        totalVotes[Proposals.ProposalType.LMIP] = defaultVotes;
        totalVotes[Proposals.ProposalType.Maintenance] = defaultVotes;
        totalVotes[Proposals.ProposalType.POC] = defaultVotes;
        totalVotes[Proposals.ProposalType.Continuing] = defaultVotes;
    }
    
    function changeManager(address newManager) public managerOnly {
        manager = newManager;
    }
    
    function setTotalVotes(uint numVotes, Proposals.ProposalType proposalType) public managerOnly beforeVote{
        totalVotes[proposalType] = numVotes;
    }
    
    function getVotingTokenBalance() public view returns(uint){
        return VotingToken.balanceOf(msg.sender);
    }
    
    function getAllowance() public view returns (uint256 remaining)
    {
        return VotingToken.allowance(msg.sender, address(this));
    }
    
    function transfer() public {
        VotingToken.transferFrom(msg.sender, address(this), 100000000);
    }
    
    function withdraw() public {
        VotingToken.transferFrom(address(this), msg.sender, address(this).balance);
    }
    
    function registerToVote(address ballotAddress) public {
        //TODO: lock tokens in ballot
        //TODO: register with voters.sol
        //TODO: set total votes to current balance or approval value, whichever is lower
    }
    
    /*
    function submitVotes(uint[] memory lmipVotes, 
                         uint[] memory maintenanceVotes,
                         uint[] memory pocVotes,
                         uint[] memory continuingVotes) public {
        Voter memory sender = voters[msg.sender];
        if(sender.allocatedVotes[0] != 0){
            voteLMIP(lmipVotes);
        }
        
        if(sender.allocatedVotes[1] != 0){
            voteMaintenance(maintenanceVotes);
        }
        
        if(sender.allocatedVotes[2] != 0){
            votePOC(pocVotes);
        }
        
        if(sender.allocatedVotes[3] != 0){
            voteContinuing(continuingVotes);
        }
    }
    
    function voteLMIP(uint[] memory lmipVotes) public {
        Voter storage sender = voters[msg.sender];
        require(sender.allocatedVotes[0] != 0, "Has no right to vote");
        require(!sender.voted[0], "Already voted.");
        sender.voted[0] = true;
        sender.lmipVotes = lmipVotes;
        //
        //
        //TODO: apply appropriate votes to each proposal selected
        //
        //
    }
    
    function voteMaintenance(uint[] memory maintenanceVotes) public {
        Voter storage sender = voters[msg.sender];
        require(sender.allocatedVotes[1] != 0, "Has no right to vote");
        require(!sender.voted[1], "Already voted.");
        sender.voted[1] = true;
        sender.maintenanceVotes = maintenanceVotes;
        //
        //
        //TODO: apply appropriate votes to each proposal selected
        //
        //
    }
    
    function votePOC(uint[] memory pocVotes) public {
        Voter storage sender = voters[msg.sender];
        require(sender.allocatedVotes[2] != 0, "Has no right to vote");
        require(!sender.voted[2], "Already voted.");
        sender.voted[2] = true;
        sender.pocVotes = pocVotes;
        //
        //
        //TODO: apply appropriate votes to each proposal selected
        //
        //
    }
    
    function voteContinuing(uint[] memory continuingVotes) public {
        Voter storage sender = voters[msg.sender];
        require(sender.allocatedVotes[3] != 0, "Has no right to vote");
        require(!sender.voted[3], "Already voted.");
        sender.voted[3] = true;
        sender.continuingVotes = continuingVotes;
        //
        //
        //TODO: apply appropriate votes to each proposal selected
        //
        //
    }
*/
}

// TODO
// 
// create factory to create ballot with start and
// end after delay from now instead of  absolute
// start and end time
//
//