// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

contract Voters {
    mapping(address => mapping(address => Voter)) public voter; //voters[ballot][voterAddress]
    //mapping(address => mapping(address => bool)) public registered; //registered[ballot][voter]
    struct Voter {
            uint lockedTokens;
            uint[4] allocatedVotes; // # votes allocated to voter, 0=LMIP, 1=Maintenance, 2=POC, 3=Continuing
            bool[4] voted;  // if true, that person already voted, 0=LMIP, 1=Maintenance, 2=POC, 3=Continuing
            address[4] delegate; // voter delegated to, 0=LMIP, 1=Maintenance, 2=POC, 3=Continuing
            uint[] lmipVotes;   // indices of the selected proposals (in order of choice)
            uint[] maintenanceVotes;
            uint[] pocVotes; 
            uint[] continuingVotes;
            uint registrationDate;
    }
    
    // The Ballot will authorize the amount in the user's wallet at time of registration.
    // Ensure all funds to be used for voting are present in wallet before registering
    
    // Ballot will hold LUCK on behalf of voter until vote is complete
    function registerToVote(address voterAddress, uint tokensHeld) external {
        address ballotAddress = msg.sender;
        require(voter[ballotAddress][voterAddress].registrationDate > 0, "Already registered");
        Voter storage v = voter[ballotAddress][voterAddress];
        v.registrationDate = block.timestamp;
        v.allocatedVotes[0] = tokensHeld; //LMIP Votes
        v.allocatedVotes[1] = tokensHeld; //Maintenance Votes
        v.allocatedVotes[2] = tokensHeld; //POC Votes
        v.allocatedVotes[3] = tokensHeld; //Continuing Votes
        v.delegate[0] = voterAddress;
        v.delegate[1] = voterAddress;
        v.delegate[2] = voterAddress;
        v.delegate[3] = voterAddress;
    }
    
    function getVoter(address voterAddress) external view returns(Voter memory){
        return voter[msg.sender][voterAddress];
    }
    
    /**
     * @dev Delegate your vote to the voter 'to'.
     * @param to address to which vote is delegated
     */
    function delegateAll(address to, address ballot) public {
        delegateLMIPVote(to, ballot);
        delegateMaintenanceVote(to, ballot);
        delegatePOCVote(to, ballot);
        delegateContinuingVote(to, ballot);
    }
    
    function delegateLMIPVote(address to, address ballot) public {
        
        // TODO: ensure vote has not ben cast by delegator
        // TODO: make sure voting deadline has not passed
        
        Voter storage sender = voter[ballot][msg.sender];
        require(!sender.voted[0], "You already voted.");
        require(to != msg.sender, "Self-delegation is disallowed.");

        while (voter[ballot][to].delegate[0] != address(0)) {
            to = voter[ballot][to].delegate[0];
            // We found a loop in the delegation, not allowed.
            require(to != msg.sender, "Found loop in LMIP delegation.");
        }
        sender.voted[0] = true;
        sender.delegate[0] = to;
        Voter storage delegate_ = voter[ballot][to];
        if (delegate_.voted[0]) {
            // 
        } else {
            delegate_.allocatedVotes[0] += sender.allocatedVotes[0];
        }
        sender.allocatedVotes[0] = 0;
    }
    
    function delegateMaintenanceVote(address to, address ballot) public {
        Voter storage sender = voter[ballot][msg.sender];
        require(!sender.voted[1], "You already voted.");
        require(to != msg.sender, "Self-delegation is disallowed.");

        while (voter[ballot][to].delegate[1] != address(0)) {
            to = voter[ballot][to].delegate[1];
            require(to != msg.sender, "Found loop in maintenance delegation.");
        }
        sender.voted[1] = true;
        sender.delegate[1] = to;
        Voter storage delegate_ = voter[ballot][to];
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
    
    function delegatePOCVote(address to, address ballot) public {
        Voter storage sender = voter[ballot][msg.sender];
        require(!sender.voted[2], "You already voted.");
        require(to != msg.sender, "Self-delegation is disallowed.");

        while (voter[ballot][to].delegate[2] != address(0)) {
            to = voter[ballot][to].delegate[2];
            require(to != msg.sender, "Found loop in POC delegation.");
        }
        sender.voted[2] = true;
        sender.delegate[2] = to;
        Voter storage delegate_ = voter[ballot][to];
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
    
    function delegateContinuingVote(address to, address ballot) public {
        Voter storage sender = voter[ballot][msg.sender];
        require(!sender.voted[3], "You already voted.");
        require(to != msg.sender, "Self-delegation is disallowed.");

        while (voter[ballot][to].delegate[3] != address(0)) {
            to = voter[ballot][to].delegate[3];
            require(to != msg.sender, "Found loop in POC delegation.");
        }
        sender.voted[3] = true;
        sender.delegate[3] = to;
        Voter storage delegate_ = voter[ballot][to];
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
    
    //Called from ballot
    function submitVotes(address voterAddress,
                         uint[] memory lmipVotes, 
                         uint[] memory maintenanceVotes,
                         uint[] memory pocVotes,
                         uint[] memory continuingVotes) external {
        
        Voter storage v = voter[msg.sender][voterAddress];
        require(v.voted[0] == false || v.voted[1] == false || v.voted[2] == false || v.voted[3] == false, "votes already cast.");
        if (v.voted[0] == false) {
            v.lmipVotes = lmipVotes;
            v.voted[0] = true;
        }
        
        if (v.voted[1] == false) {
            v.maintenanceVotes = maintenanceVotes;
            v.voted[1] = true;
        }
        
        if (v.voted[2] == false) {
            v.pocVotes = pocVotes;
            v.voted[2] = true;
        }
        
        if (v.voted[3] == false) {
            v.continuingVotes = continuingVotes;
            v.voted[3] = true;
        }
    }

}