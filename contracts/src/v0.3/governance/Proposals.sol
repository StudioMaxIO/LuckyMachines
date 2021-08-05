// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0;

import "./Ballot.sol";

contract Proposals {
    struct Proposal {
        uint id;
        address ballot;
        string name;
        string summary;
        uint voteCount; // number of accumulated votes
        uint256 fileHash;
        string fileURI;
        uint256 fundingRequest;
        address payable recipient;
        ProposalType proposalType;
        Approval ballotApproval;
        Approval result;
    }
    
    uint currentID;
    
    enum ProposalType { LMIP, Maintenance, POC, Continuing }
    enum Approval { Pending, Approved, Rejected }
    
    mapping(address => Proposal[]) public lmipProposals;
    mapping(address => Proposal[]) public maintenanceProposals;
    mapping(address => Proposal[]) public pocProposals;
    mapping(address => Proposal[]) public continuingProposals;
    
    mapping(address => mapping(uint => Proposal)) public proposals; //proposals[ballot][propID]
    
    constructor() {
        currentID = 0;
    }
    
    function addProposal(string memory name, 
                    string memory summary,
                    uint256 fileHash, 
                    string memory fileURI, 
                    uint fundingRequest,
                    address payable recipient,
                    ProposalType proposalType,
                    address ballot) public {
        currentID += 1;
        Proposal memory prop = Proposal({
                            id: currentID,
                            ballot: ballot,
                            name: name,
                            summary: summary,
                            fileHash: fileHash,
                            fileURI: fileURI,
                            fundingRequest: fundingRequest,
                            recipient: recipient,
                            proposalType: proposalType,
                            voteCount: 0,
                            ballotApproval: Approval.Pending,
                            result: Approval.Pending
        });
        
        proposals[ballot][currentID] = prop;
        
        if (proposalType == ProposalType.LMIP) {
            lmipProposals[ballot].push(prop);
        } else if (proposalType == ProposalType.POC) {
            pocProposals[ballot].push(prop);
        } else if (proposalType == ProposalType.Maintenance) {
            maintenanceProposals[ballot].push(prop);
        } else if (proposalType == ProposalType.Continuing) {
            continuingProposals[ballot].push(prop);
        }
    }
    
    function getProposals(address ballot) public view returns (Proposal[][4] memory){
        return [lmipProposals[ballot], maintenanceProposals[ballot], pocProposals[ballot], continuingProposals[ballot]];
    }
    
    function getLMIPProposals(address ballot) public view returns (Proposal[] memory){
        return lmipProposals[ballot];
    }
    
    function getMaintenanceProposals(address ballot) public view returns (Proposal[] memory){
        return maintenanceProposals[ballot];
    }
    function getPOCProposals(address ballot) public view returns (Proposal[] memory){
        return pocProposals[ballot];
    }
    function getContinuingProposals(address ballot) public view returns (Proposal[] memory){
        return continuingProposals[ballot];
    }
    
    function setApproval(Approval approval, address ballotAddress, uint proposalId, ProposalType proposalType) external {
        require(Ballot(ballotAddress).votingStart() > block.timestamp, "approvals not allowed after vote start");
        if (proposalType == ProposalType.LMIP) {
            require(msg.sender == lmipProposals[ballotAddress][proposalId].ballot, "Only callable from ballot");
            lmipProposals[ballotAddress][proposalId].ballotApproval = approval;
        } else if (proposalType == ProposalType.POC) {
            require(msg.sender == pocProposals[ballotAddress][proposalId].ballot, "Only callable from ballot");
            pocProposals[ballotAddress][proposalId].ballotApproval = approval;
        } else if (proposalType == ProposalType.Maintenance) {
            require(msg.sender == maintenanceProposals[ballotAddress][proposalId].ballot, "Only callable from ballot");
            maintenanceProposals[ballotAddress][proposalId].ballotApproval = approval;
        } else if (proposalType == ProposalType.Continuing) {
            require(msg.sender == continuingProposals[ballotAddress][proposalId].ballot, "Only callable from ballot");
            continuingProposals[ballotAddress][proposalId].ballotApproval = approval;
        }
    }
}
