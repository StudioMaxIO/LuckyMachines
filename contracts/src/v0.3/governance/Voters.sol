// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

contract Voters {
    mapping(address => mapping(address => Voter)) public voters; //voters[ballot][voter]
    mapping(address => mapping(address => bool)) public registered; //registered[ballot][voter]
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
    
    // The Ballot will authorize the amount in the user's wallet at time of registration.
    // Ensure all funds to be used for voting are present in wallet before registering
    function registerToVote(address voter) external {
        address ballotAddress = msg.sender;
        require(registered[ballotAddress][voter] == false, "Already registered");
        registered[ballotAddress][voter] = true;
        Voter storage v = voters[ballotAddress][voter];
        v.registrationDate = block.timestamp;
        //TODO: set total votes to current balance or approval value, whichever is lower
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
        Voter storage sender = voters[ballot][msg.sender];
        require(!sender.voted[0], "You already voted.");
        require(to != msg.sender, "Self-delegation is disallowed.");

        while (voters[ballot][to].delegate[0] != address(0)) {
            to = voters[ballot][to].delegate[0];
            // We found a loop in the delegation, not allowed.
            require(to != msg.sender, "Found loop in LMIP delegation.");
        }
        sender.voted[0] = true;
        sender.delegate[0] = to;
        Voter storage delegate_ = voters[ballot][to];
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
    
    function delegateMaintenanceVote(address to, address ballot) public {
        Voter storage sender = voters[ballot][msg.sender];
        require(!sender.voted[1], "You already voted.");
        require(to != msg.sender, "Self-delegation is disallowed.");

        while (voters[ballot][to].delegate[1] != address(0)) {
            to = voters[ballot][to].delegate[1];
            require(to != msg.sender, "Found loop in maintenance delegation.");
        }
        sender.voted[1] = true;
        sender.delegate[1] = to;
        Voter storage delegate_ = voters[ballot][to];
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
        Voter storage sender = voters[ballot][msg.sender];
        require(!sender.voted[2], "You already voted.");
        require(to != msg.sender, "Self-delegation is disallowed.");

        while (voters[ballot][to].delegate[2] != address(0)) {
            to = voters[ballot][to].delegate[2];
            require(to != msg.sender, "Found loop in POC delegation.");
        }
        sender.voted[2] = true;
        sender.delegate[2] = to;
        Voter storage delegate_ = voters[ballot][to];
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
        Voter storage sender = voters[ballot][msg.sender];
        require(!sender.voted[3], "You already voted.");
        require(to != msg.sender, "Self-delegation is disallowed.");

        while (voters[ballot][to].delegate[3] != address(0)) {
            to = voters[ballot][to].delegate[3];
            require(to != msg.sender, "Found loop in POC delegation.");
        }
        sender.voted[3] = true;
        sender.delegate[3] = to;
        Voter storage delegate_ = voters[ballot][to];
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
    
    function submitVotes(address ballot, 
                         uint[] memory lmipVotes, 
                         uint[] memory maintenanceVotes,
                         uint[] memory pocVotes,
                         uint[] memory continuingVotes) public {
        // should come directly from voter
        // check if voter already voted
        // lock in votes
    }

}