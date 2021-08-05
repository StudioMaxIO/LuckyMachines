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
    
    uint[] public lmipProposalsVoted;
    uint[] public maintenanceProposalsVoted;
    uint[] public pocProposalsVoted;
    uint[] public continuingProposalsVoted;
    
    mapping(uint=>uint) public lmipVotesCast; //lmipVotes[proposal id] shows total votes for proposal
    mapping(uint=>uint) public maintenanceVotesCast;
    mapping(uint=>uint) public pocVotesCast;
    mapping(uint=>uint) public continuingVotesCast;
    
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
    
    function registerToVote() public {
        
        uint voterBalance = VotingToken.balanceOf(msg.sender);
        uint allocatedTokens = VotingToken.allowance(msg.sender, address(this));
        require(voterBalance > 0 && allocatedTokens > 0, "No authorized tokens");
        uint votesAllowed = voterBalance < allocatedTokens ? voterBalance : allocatedTokens;
        
        // register with voters.sol
        Voters(voters).registerToVote(msg.sender, votesAllowed);
        
        //TODO: lock tokens in ballot
        VotingToken.transferFrom(msg.sender, address(this), votesAllowed);
        
        //TODO: set total votes to current balance or approval value, whichever is lower
        
    }
    
    // .                                1.          2.              3.      
    // votes in order of selection: [proposal 2(id), proposal 4(id), another proposal(id)]
    function submitVotes(uint[] memory lmipVotes, 
                         uint[] memory maintenanceVotes,
                         uint[] memory pocVotes,
                         uint[] memory continuingVotes) public {
        Voters v = Voters(voters);
        v.submitVotes(msg.sender, lmipVotes, maintenanceVotes, pocVotes, continuingVotes);
    }
    
    // votes passed as [[proposal, numVotes], [proposal, numvotes]]
    function storeCastVotes(uint[2][] memory lmipVotes, 
                            uint[2][] memory maintenanceVotes, 
                            uint[2][] memory pocVotes, 
                            uint[2][] memory continuingVotes) external {
        require(msg.sender == voters, "only callable from voters contract");                        
        for (uint i = 0; i < totalVotes[Proposals.ProposalType.LMIP]; i++) {
            if(lmipVotes[i][0] != 0) {
                if(lmipVotesCast[lmipVotes[i][0]] == 0) {
                    lmipProposalsVoted.push(lmipVotes[i][0]);
                }
                lmipVotesCast[lmipVotes[i][0]] += lmipVotes[i][1];
            }
        }
        
        for (uint i = 0; i < totalVotes[Proposals.ProposalType.Maintenance]; i++) {
            if(maintenanceVotes[i][0] != 0) {
                if(maintenanceVotesCast[lmipVotes[i][0]] == 0) {
                    maintenanceProposalsVoted.push(maintenanceVotes[i][0]);
                }
                maintenanceVotesCast[maintenanceVotes[i][0]] += maintenanceVotes[i][1];
            }
        }
        
        for (uint i = 0; i < totalVotes[Proposals.ProposalType.POC]; i++) {
            if(pocVotes[i][0] != 0) {
                if(pocVotesCast[lmipVotes[i][0]] == 0) {
                    pocProposalsVoted.push(pocVotes[i][0]);
                }
                pocVotesCast[pocVotes[i][0]] += pocVotes[i][1];
            }
        }
        
        for (uint i = 0; i < totalVotes[Proposals.ProposalType.Continuing]; i++) {
            if(continuingVotes[i][0] != 0) {
                if(continuingVotesCast[continuingVotes[i][0]] == 0) {
                    continuingProposalsVoted.push(continuingVotes[i][0]);
                }
                continuingVotesCast[continuingVotes[i][0]] += continuingVotes[i][1];
            }
        }
    }
}
