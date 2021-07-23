// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface Proposals {
    struct Proposal {
        bytes32 name;   // short name (up to 32 bytes)
        uint voteCount; // number of accumulated votes
        uint256 fileHash;
        string fileURI;
        uint256 fundingRequest;
        address payable recipient;
    }
}