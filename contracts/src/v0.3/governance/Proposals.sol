// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0;

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

    mapping(address => mapping(uint => Proposal)) public proposals;

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
            addLMIPProposal(prop, ballot);
        } else if (proposalType == ProposalType.POC) {
            addPOCProposal(prop, ballot);
        } else if (proposalType == ProposalType.Maintenance) {
            addMaintencanceProposal(prop, ballot);
        } else if (proposalType == ProposalType.Continuing) {
            addContinuingProposal(prop, ballot);
        }

    }

    function addLMIPProposal(Proposal memory proposal, address ballot) internal {
        lmipProposals[ballot].push(proposal);
    }

    function addMaintencanceProposal(Proposal memory proposal, address ballot) internal {
        maintenanceProposals[ballot].push(proposal);
    }

    function addPOCProposal(Proposal memory proposal, address ballot) internal {
        pocProposals[ballot].push(proposal);
    }

    function addContinuingProposal(Proposal memory proposal, address ballot) internal {
        continuingProposals[ballot].push(proposal);
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
}
