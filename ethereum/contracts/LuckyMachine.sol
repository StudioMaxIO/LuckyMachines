pragma solidity ^0.6.0;

// SPDX-License-Identifier: MIT
import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LuckyMachine is VRFConsumerBase, Ownable {

    using SafeMathChainlink for uint256;

    bytes32 internal keyHash;
    uint256 internal fee;

    struct Game {
        uint id;
        address payable player;
        uint bet;
        uint pick;
        uint winner;
        bool played;
    }

    uint private gas1;
    uint private gas2;
    uint private gas3;
    uint private gas4;
    uint private gas5;
    uint private gas6;
    uint private gas7;
    uint private gas8;
    uint private gas9;
    uint private gas10;

    uint public maxPick;
    uint public maxBet;
    uint public minBet;
    uint public _unplayedBets;
    uint public _currentGame;
    address payable public payoutAddress;
    uint public payout; // Multiplier, e.g. 10X: payout (10) * bet (X)

    mapping(uint => Game) public games;
    mapping(bytes32 => uint) public _gameRequests;

    constructor(address payable _payoutAddress, uint _maxBet, uint _minBet, uint _maxPick, uint _payout)
        //KOVAN ADDRESSES, can be updated by owner once contract created
        VRFConsumerBase(
            0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9, // VRF Coordinator
            0xa36085F69e2889c224210F603D836748e7dC0088  // LINK Token
        ) public {
            keyHash = 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;
            fee = 0.1 * 10 ** 18; // 0.1 LINK

            _currentGame = 1;
            _unplayedBets = 0;
            payoutAddress = _payoutAddress;
            minBet = _minBet;
            maxBet = _maxBet;
            maxPick = _maxPick;
            payout = _payout;

            gas1 = 1;
            gas2 = 1;
            gas3 = 1;
            gas4 = 1;
            gas5 = 1;
            gas6 = 1;
            gas7 = 1;
            gas8 = 1;
            gas9 = 1;
            gas10 = 1;
    }

    receive() external payable {

    }

    function getLinkBalance() public view returns(uint){
        return LINK.balanceOf(address(this));
    }

    function betInRange(uint bet) public view returns(bool){
        if (bet >= minBet && bet <= maxBet) {
            // At a minimum this contract should have enough to cover any potential winnings plus refund unplayed bets
            // preferable to complte all games, but in case oracle becomes unreachable or other catastrophic incident occurs,
            // bets should be refunded.
            return true;
        } else {
            return false;
        }
    }

    function betPayable(uint bet) public view returns(bool){
        return (address(this).balance.sub(_unplayedBets) >= bet.mul(payout).add(bet));
    }

    function placeBet(uint pick) public payable{
        // check that game can be played
        delete gas1;
        delete gas2;
        delete gas3;
        delete gas4;
        delete gas5;
        delete gas6;
        delete gas7;
        delete gas8;
        delete gas9;
        delete gas10;
        placeBetFor(msg.sender, pick);
    }

    function placeBetFor(address payable player, uint pick) public payable {
      require(betPayable(msg.value), "Contract has insufficint funds to payout possible win.");
      require(pick <= maxPick, "Pick is too high. Choose a lower number.");
      require(betInRange(msg.value),"Outisde of bet range.");

      _unplayedBets = _unplayedBets.add(msg.value);
      createGame(player, msg.value, pick);
      playGame(_currentGame);
    }

    function createGame(address payable _player, uint _bet, uint _pick) internal {

        _currentGame = _currentGame.add(1);
        Game memory newGame = Game ({
            id: _currentGame,
            player: _player,
            bet: _bet,
            pick: _pick,
            winner: maxPick.add(10), //TODO: use 0, don't allow 0 as pickable value
            played: false
        });
        games[newGame.id] = newGame;
    }

    function getSeed() public view returns(uint256) {
        return 12345;
    }

    function playGame(uint gameID) public {
        require(games[gameID].played == false, "game already played");
        // get random number
        uint seed = 12345;
        bytes32 reqID = getRandomNumber(seed);
        _gameRequests[reqID] = gameID;
    }

    function getRandomNumber(uint256 seed) public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) > fee, "Not enough LINK");
        return requestRandomness(keyHash, fee, seed);
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        //randomResult = randomness;
        Game storage g = games[_gameRequests[requestId]];
        if(g.id > 0){
            uint totalPayout = g.bet.mul(payout) + g.bet;
            require(address(this).balance >= totalPayout, "Unable to pay. Please play again or request refund.");

            // update game with chosen number
            g.winner = randomness.mod(maxPick.add(1));

            // set game to played
            g.played = true;

            // remove from unplayed bets
            if(_unplayedBets >= g.bet) {
                _unplayedBets -= g.bet;
            } else {
                _unplayedBets = 0;
            }

            // payout if winner (initial bet plus winnings)
            if (g.pick == g.winner) {
                g.player.transfer(totalPayout);
            }

            // emit gamePlayed event
        }
        gas1 = 1;
        gas2 = 1;
        gas3 = 1;
        gas4 = 1;
        gas5 = 1;
        gas6 = 1;
        gas7 = 1;
        gas8 = 1;
        gas9 = 1;
        gas10 = 1;
    }

    function requestRefund(uint gameID) public{
        Game storage g = games[gameID];
        require(g.played == false, "Game already complete. No refund possible.");
        require(address(this).balance >= g.bet, "Contract balance too low. Please try again later.");
        g.played = true;
        if(_unplayedBets >= g.bet) {
            _unplayedBets -= g.bet;
        } else {
            _unplayedBets = 0;
        }
        g.player.transfer(g.bet);
    }

    function getSummary() public view returns(uint, uint, uint, uint) {
        //minBet, maxBet, payout, maxPick
        return(minBet, maxBet, payout, maxPick);
    }

    // Owner Functions

    function fundMachine() public payable {

    }

    function setVRFCoordinator(address _vrfCoordinator) public onlyOwner {
        vrfCoordinator = _vrfCoordinator;
    }

    function setKeyHash(bytes32 _keyHash) public onlyOwner {
        keyHash = _keyHash;
    }

    function setLINK(address _linkAddress) public onlyOwner {
        LINK = LinkTokenInterface(_linkAddress);
    }

    function setMaxBet(uint _maxBet) public onlyOwner {
        maxBet = _maxBet;
    }

    function setMinBet(uint _minBet) public onlyOwner {
        minBet = _minBet;
    }

    function setPayout(uint _payout) public onlyOwner {
        payout = _payout;
    }

    function setPayoutAddress(address payable _payoutAddress) public onlyOwner {
        payoutAddress = _payoutAddress;
    }

    function withdrawEth(uint amount) public onlyOwner {
        require ((address(this).balance - amount) >= _unplayedBets, "Can't withdraw unplayed bets");
        payoutAddress.transfer(amount);
    }

    function withdrawLink(uint amount) public onlyOwner {
        LINK.transfer(payoutAddress, amount);
    }

    function closeMachine() public onlyOwner {
        uint availableContractBalance = address(this).balance.sub(_unplayedBets);
        payoutAddress.transfer(availableContractBalance);

        if (LINK.balanceOf(address(this)) > 0) {
            LINK.transfer(payoutAddress, LINK.balanceOf(address(this)));
        }

    }

    // TEST FUNCTIONS
    // DO NOT COMPILE FINAL CONTRACT WITH THESE, FOR TESTING ONLY!!!
    function testCreateGame(address payable _player, uint _bet, uint _pick, bool _played, uint _gameID) public {
        Game memory newGame = Game ({
            id: _gameID,
            player: _player,
            bet: _bet,
            pick: _pick,
            winner: maxPick.add(10), //TODO: use 0, don't allow 0 as pickable value
            played: _played
        });
        games[newGame.id] = newGame;
    }

    function testPlaceBetFor(address payable player, uint pick, uint256 testRandomNumber) public payable {
      require(betPayable(msg.value), "Contract has insufficint funds to payout possible win.");
      require(pick <= maxPick, "Pick is too high. Choose a lower number.");
      require(betInRange(msg.value),"Outisde of bet range.");

      _unplayedBets = _unplayedBets.add(msg.value);
      createGame(player, msg.value, pick);
      testPlayGame(_currentGame, testRandomNumber);
    }

    function testPlayGame(uint gameID, uint256 testRandomNumber) public {
        require(games[gameID].played == false, "game already played");
        bytes32 reqID = keccak256(abi.encodePacked(now, block.difficulty, msg.sender));
        _gameRequests[reqID] = gameID;
        testFulfillRandomness(reqID, testRandomNumber);
    }

    function testFulfillRandomness(bytes32 requestId, uint256 randomness) internal {
        Game storage g = games[_gameRequests[requestId]];
        if(g.id > 0){
            uint totalPayout = g.bet.mul(payout) + g.bet;
            require(address(this).balance >= totalPayout, "Unable to pay. Please play again or request refund.");

            g.winner = randomness;
            g.played = true;

            if(_unplayedBets >= g.bet) {
                _unplayedBets -= g.bet;
            } else {
                _unplayedBets = 0;
            }

            if (g.pick == g.winner) {
                g.player.transfer(totalPayout);
            }
            // emit gamePlayed event
        }
    }

    function testCloseMachine() public onlyOwner {
        require (address(this).balance > _unplayedBets);
        uint availableContractBalance = address(this).balance.sub(_unplayedBets);
        payoutAddress.transfer(availableContractBalance);
    }
}

contract LuckyMachineFactory{
    address[] public machines;

    function createMachine(uint maxBet, uint minBet, uint maxPick, uint payout) public returns(address){
        //address payable _owner, uint _maxBet, uint _minBet, uint _maxPick, uint _payout
        LuckyMachine newMachine = new LuckyMachine(msg.sender, maxBet, minBet, maxPick, payout);
        newMachine.transferOwnership(msg.sender);
        address newMachineAddress = address(newMachine);
        machines.push(newMachineAddress);
        return newMachineAddress;
    }

    function getMachines() public view returns (address[] memory) {
        return machines;
    }
}
