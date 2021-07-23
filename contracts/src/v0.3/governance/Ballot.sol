// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./Proposals.sol";

/** 
 * @title Ballot
 * @dev Implements voting process along with vote delegation
 */
 
interface TokenInterface {
  function allowance(address owner, address spender) external view returns (uint256 remaining);
  function approve(address spender, uint256 value) external returns (bool success);
  function balanceOf(address owner) external view returns (uint256 balance);
  function decimals() external view returns (uint8 decimalPlaces);
  function decreaseApproval(address spender, uint256 addedValue) external returns (bool success);
  function increaseApproval(address spender, uint256 subtractedValue) external;
  function name() external view returns (string memory tokenName);
  function symbol() external view returns (string memory tokenSymbol);
  function totalSupply() external view returns (uint256 totalTokensIssued);
  function transfer(address to, uint256 value) external returns (bool success);
  function transferAndCall(address to, uint256 value, bytes calldata data) external returns (bool success);
  function transferFrom(address from, address to, uint256 value) external returns (bool success);
}

contract Ballot is Proposals{
    
    struct Voter {
        uint lockedTokens;
        uint[4] allocatedVotes; // # votes allocated to voter, 0=LMIP, 1=Maintenance, 2=POC, 3=Continuing
        bool[4] voted;  // if true, that person already voted, 0=LMIP, 1=Maintenance, 2=POC, 3=Continuing
        address[4] delegate; // person delegated to, 0=LMIP, 1=Maintenance, 2=POC, 3=Continuing
        uint[] lmipVotes;   // indices of the selected proposals
        uint[] maintenanceVotes;
        uint[] pocVotes; 
        uint[] continuingVotes;
        uint registrationDate;
    }
    
    TokenInterface internal VotingToken;
    
    enum ProposalType { LMIP, Maintenance, POC, Continuing }

    mapping(address => Voter) public voters;
    mapping(address => bool) public registered;

    Proposal[] public lmipProposals;
    Proposal[] public maintenanceProposals;
    Proposal[] public pocProposals;
    Proposal[] public continuingProposals;
    
    constructor(address votingTokenAddress) public {
        VotingToken = TokenInterface(votingTokenAddress);
    }
    
    function addProposal(bytes32 name, 
                        uint256 fileHash, 
                        string memory fileURI, 
                        uint fundingRequest,
                        address payable recipient,
                        ProposalType proposalType) public {
        
    }
    
    function addLMIPProposal(Proposal memory proposal) internal {
        
    }
    
    function addMaintencanceProposal(Proposal memory proposal) internal {
        
    }
    
    function addPOCProposal(Proposal memory proposal) internal {
        
    }
    
    function addContinuingProposal(Proposal memory proposal) internal {
        
    }
    
    function getVotingTokenBalance() public view returns(uint){
        return VotingToken.balanceOf(msg.sender);
    }
    
    function getAllowance() public view returns (uint256 remaining)
    {
        return VotingToken.allowance(msg.sender, address(this));
    }
    
    // The Ballot will authorize the amount in the user's wallet at time of registration.
    // Ensure all funds to be used for voting are present in wallet before registering
    function registerToVote() public {
        require(registered[msg.sender] == false, "Already registered");
        registered[msg.sender] = true;
        Voter storage sender = voters[msg.sender];
        sender.registrationDate = block.timestamp;
        //TODO: set total votes to current balance or approval value, whichever is lower
    }
    
    function transfer() public {
        VotingToken.transferFrom(msg.sender, address(this), 100000000);
    }
    
    function withdraw() public {
        VotingToken.transferFrom(address(this), msg.sender, address(this).balance);
    }

    /**
     * @dev Delegate your vote to the voter 'to'.
     * @param to address to which vote is delegated
     */
    function delegateAll(address to) public {
        delegateLMIPVote(to);
        delegateMaintenanceVote(to);
        delegatePOCVote(to);
        delegateContinuingVote(to);
    }
    
    function delegateLMIPVote(address to) public {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted[0], "You already voted.");
        require(to != msg.sender, "Self-delegation is disallowed.");

        while (voters[to].delegate[0] != address(0)) {
            to = voters[to].delegate[0];
            // We found a loop in the delegation, not allowed.
            require(to != msg.sender, "Found loop in LMIP delegation.");
        }
        sender.voted[0] = true;
        sender.delegate[0] = to;
        Voter storage delegate_ = voters[to];
        if (delegate_.voted[0]) {
            //
            //TODO:
            //
            // If the delegate already voted,
            // directly add to the number of votes
        } else {
            // If the delegate did not vote yet,
            // add to her weight.
            delegate_.allocatedVotes[0] += sender.allocatedVotes[0];
        }
        sender.allocatedVotes[0] = 0;
    }
    
    function delegateMaintenanceVote(address to) public {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted[1], "You already voted.");
        require(to != msg.sender, "Self-delegation is disallowed.");

        while (voters[to].delegate[1] != address(0)) {
            to = voters[to].delegate[1];
            require(to != msg.sender, "Found loop in maintenance delegation.");
        }
        sender.voted[1] = true;
        sender.delegate[1] = to;
        Voter storage delegate_ = voters[to];
        if (delegate_.voted[1]) {
            //
            //TODO:
            //
            // If the delegate already voted,
            // directly add to the number of votes
        } else {
            delegate_.allocatedVotes[1] += sender.allocatedVotes[1];
        }
        sender.allocatedVotes[1] = 0;
    }
    
    function delegatePOCVote(address to) public {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted[2], "You already voted.");
        require(to != msg.sender, "Self-delegation is disallowed.");

        while (voters[to].delegate[2] != address(0)) {
            to = voters[to].delegate[2];
            require(to != msg.sender, "Found loop in POC delegation.");
        }
        sender.voted[2] = true;
        sender.delegate[2] = to;
        Voter storage delegate_ = voters[to];
        if (delegate_.voted[2]) {
            //
            //TODO:
            //
            // If the delegate already voted,
            // directly add to the number of votes
        } else {
            delegate_.allocatedVotes[2] += sender.allocatedVotes[2];
        }
        sender.allocatedVotes[2] = 0;
    }
    
    function delegateContinuingVote(address to) public {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted[3], "You already voted.");
        require(to != msg.sender, "Self-delegation is disallowed.");

        while (voters[to].delegate[3] != address(0)) {
            to = voters[to].delegate[3];
            require(to != msg.sender, "Found loop in POC delegation.");
        }
        sender.voted[3] = true;
        sender.delegate[3] = to;
        Voter storage delegate_ = voters[to];
        if (delegate_.voted[3]) {
            //
            //TODO:
            //
            // If the delegate already voted,
            // directly add to the number of votes
        } else {
            delegate_.allocatedVotes[3] += sender.allocatedVotes[3];
        }
        sender.allocatedVotes[3] = 0;
    }
    
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

    /** 
     * @dev Computes the winning proposal taking all previous votes into account.
     * @return winningProposal_ index of winning proposal in the proposals array
     */
    function winningProposal(ProposalType proposalType) public view
            returns (uint winningProposal_)
    {
        uint winningVoteCount = 0;
        if(proposalType == ProposalType.LMIP) {
            for (uint p = 0; p < lmipProposals.length; p++) {
                if (lmipProposals[p].voteCount > winningVoteCount) {
                    winningVoteCount = lmipProposals[p].voteCount;
                    winningProposal_ = p;
                }
            }
        }
    }

    /** 
     * @dev Calls winningProposal() function to get the index of the winner contained in the proposals array and then
     * @return winnerName_ the name of the winner
     */
    function winnerName(ProposalType proposalType) public view
            returns (bytes32 winnerName_)
    {
        if(proposalType == ProposalType.LMIP){
            winnerName_ = lmipProposals[winningProposal(proposalType)].name;
        }
    }
}
