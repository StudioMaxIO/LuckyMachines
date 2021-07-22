// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.6/vendor/SafeMathChainlink.sol";
import "@chainlink/contracts/src/v0.6/interfaces/LinkTokenInterface.sol";
import "./LuckyMachineCoordinator.sol";

contract LuckyMachine is Ownable {

    LinkTokenInterface internal LINK;

    using SafeMathChainlink for uint256;

    address payable public machineCoordinator;

    struct Game {
        uint id;
        address payable player;
        uint bet;
        uint pick;
        uint winner;
        bool played;
    }

    uint internal gas1;
    uint internal gas2;
    uint internal gas3;
    uint internal gas4;
    uint internal gas5;
    uint internal gas6;
    uint internal gas7;
    uint internal gas8;
    uint internal gas9;
    uint internal gas10;
    uint internal gas11;

    uint public maxPick;
    uint public maxBet;
    uint public minBet;
    uint internal _unplayedBets;
    uint internal _currentGame;
    address payable public payoutAddress;
    uint public payout; // Payout Ratio (payout : 1), e.g. 10 : 1 = payout (10) * bet (X)

    mapping(address => bool) public authorizedAddress;
    mapping(address => bool) public gasFreeBetAllowed;

    mapping(uint => Game) public games;
    mapping(bytes32 => uint) internal _gameRequests;
    mapping(address => uint) public lastGameCreated;

    event GamePlayed(address _player, uint256 _bet, uint256 _pick, uint256 _winner, uint256 _payout);

    constructor(address payable _machineCoordinator, address payable _payoutAddress,  address _linkToken, uint _maxBet, uint _minBet, uint _maxPick, uint _payout) public {
            machineCoordinator = _machineCoordinator;
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
            gas11 = 1;

            LINK = LinkTokenInterface(_linkToken);
            uint256 approvalAmount = 115792089237316195423570985008687907853269984665640564039457584007913129639935;
            LINK.approve(machineCoordinator, approvalAmount);
    }

    receive() external payable {

    }

    modifier onlyAuthorized() {
        require(owner() == msg.sender || authorizedAddress[msg.sender], "caller is not authorized");
        _;
    }

    function getLinkBalance() public view returns(uint){
        return LINK.balanceOf(address(this));
    }

    /**
     * @dev Returns whether bet is within range of minimum and maximum
     * allowable bets
     */
    function betInRange(uint bet) internal view returns(bool){
        if (bet >= minBet && bet <= maxBet) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @dev Returns whether a winning bet can by paid out by machine. Balance of
     * machine must be at least (value of bet * payout).
     */
    function betPayable(uint bet) virtual public view returns(bool){
        return (address(this).balance.sub(_unplayedBets) >= bet.mul(payout));
    }

    function canPayFee(uint _fee) public view returns(bool){
        LuckyMachineCoordinator coord = LuckyMachineCoordinator(machineCoordinator);
        uint256 coordBalance = coord.getLinkBalance();
        uint256 thisBalance = LINK.balanceOf(address(this));
        return (thisBalance >= _fee || coordBalance >= _fee);
    }

    /**
     * @dev Returns Game ID, which can be queried for status of game using games('gameID').
     * This will fail if machine conditions are not met.
     * Use safeBetFor() if all conditions have not been pre-verified.
     */
    function placeBetFor(address payable player, uint pick) virtual public payable{
        require(msg.value >= minBet, "minimum bet not met");
        if(gas1 == 1) {
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
            delete gas11;
        }

        _unplayedBets = _unplayedBets.add(msg.value);
        createGame(player, msg.value, pick);
        playGame(_currentGame);
        lastGameCreated[player] = _currentGame;
    }

    /**
     * @dev Returns Game ID, which can be queried for status of game using games('gameID').
     * Places bet after ensuring all conditions are met (bet within minimum - maximum
     * range, maximum pick not exceeded, winning bet is payable).
     */
    function safeBetFor(address payable player, uint pick) virtual public payable{
        require(betPayable(msg.value), "Contract has insufficint funds to payout possible win.");
        require(pick <= maxPick && pick > 0, "Outside of pickable bounds");
        require(betInRange(msg.value),"Outisde of bet range.");

        if(gas1 == 1) {
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
            delete gas11;
        }

        _unplayedBets = _unplayedBets.add(msg.value);
        createGame(player, msg.value, pick);
        playGame(_currentGame);
        lastGameCreated[player] = _currentGame;
    }

    /**
     * @dev Creates a Game record, which is updated as game is played.
     */
    function createGame(address payable _player, uint _bet, uint _pick) virtual internal {

        _currentGame = _currentGame.add(1);
        Game memory newGame = Game ({
            id: _currentGame,
            player: _player,
            bet: _bet,
            pick: _pick,
            winner: 0,
            played: false
        });
        games[newGame.id] = newGame;
    }

    /**
     * @dev If game is ready to be played, but random number not yet generated,
     * this function may be called. Limited to only when bet is placed to avoid
     * over-calling / over-spending Link since random number is generated with
     * each call of this. replayGame() may be called by owner in cases of "stuck"
     * or unplayed games.
     */
    function playGame(uint gameID) virtual internal {
        require(games[gameID].played == false, "game already played");
        bytes32 reqID = getRandomNumber();
        _gameRequests[reqID] = gameID;
    }

    /**
     * @dev Requests a random number, which will be returned through the
     * fulfillRandomness() function.
     */
    function getRandomNumber() internal returns (bytes32 requestId) {
        LuckyMachineCoordinator mc = LuckyMachineCoordinator(machineCoordinator);
        return mc.getRandomNumbers(1);
    }

    /**
     * @dev Called by Machine Coordinator only once number is generated. Gas reserves are
     * refilled here so they can be cleared for gas savings when next bet is placed.
     */
    function fulfillRandomness(bytes32 requestId, uint256[] memory randomness) virtual external {
        // ONLY CALLABLE BY MACHINE COORDINATOR
        require(msg.sender == machineCoordinator);
        Game storage g = games[_gameRequests[requestId]];
        if(g.id > 0 && g.played == false){
            if(g.bet > maxBet) {
                g.bet = maxBet;
            }
            uint totalPayout = g.bet.mul(payout).add(g.bet);
            require(address(this).balance >= totalPayout, "Contract balance too low to play");

            g.winner = randomness[0].mod(maxPick).add(1);

            g.played = true;

            if(_unplayedBets >= g.bet) {
                _unplayedBets -= g.bet;
            } else {
                _unplayedBets = 0;
            }

            if (g.pick == g.winner) {
                g.player.transfer(totalPayout);
            } else {
                totalPayout = 0;
            }

            emit GamePlayed(g.player, g.bet, g.pick, g.winner, totalPayout);
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
        gas11 = 1;
    }

    /**
     * @dev Returns summary of machine requirements for play and payout multiplier.
     */
    function getSummary() public view returns(uint, uint, uint, uint) {
        //minBet, maxBet, payout, maxPick
        return(minBet, maxBet, payout, maxPick);
    }

    // Authorized Functions
    /**
     * @dev Request a refund for an unplayed game. If game is created, but
     * machine conditions are not appropriate to allow play, no number will
     * be generated and player or authorized address can request refund.
     * Regardless of who requests refund, payout will always be to player
     * listed in game.
     */
    function requestRefund(uint gameID) virtual public{
        Game storage g = games[gameID];
        require(authorizedAddress[msg.sender] || owner() == msg.sender || g.player == msg.sender, "Not authorized to request refund");
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

    /**
     * @dev Withdraw specified amount of ETH from machine. Amount must be less than
     * any unplayed bets in machine to allow for refunds.
     */
    function withdrawEth(uint amount) public onlyAuthorized {
        require ((address(this).balance - amount) >= _unplayedBets, "Can't withdraw unplayed bets");
        payoutAddress.transfer(amount);
    }

    /**
     * @dev Withdraw specified amount of LINK from machine.
     */
    function withdrawLink(uint amount) public onlyAuthorized {
        LINK.transfer(payoutAddress, amount);
    }

    // Owner Functions
    /**
     * @dev Add any address as authorized user. Can be used to whitelist other contracts
     * that may want to interact with authorized functions.
     */
    function setAuthorizedUser(address userAddress, bool authorized) public onlyOwner {
        authorizedAddress[userAddress] = authorized;
    }

    /**
     * @dev Updates the address to which all withdrawals of ETH & LINK will be sent. If
     * machine is closed (all funds withdrawn), this address receives all available funds.
     */
    function setPayoutAddress(address payable _payoutAddress) public onlyOwner {
        payoutAddress = _payoutAddress;
    }

    /**
     * @dev Withdraws all available funds from the machine, leaving behind only
     * _unplayedBets, which must remain for any refund requests. This does not
     * do anything to halt operations other than removing funding, which
     * automatically disallows play. If machine is re-funded, play may continue.
     */
    function closeMachine() public onlyOwner {
        uint availableContractBalance = address(this).balance.sub(_unplayedBets);
        payoutAddress.transfer(availableContractBalance);

        if (LINK.balanceOf(address(this)) > 0) {
            LINK.transfer(payoutAddress, LINK.balanceOf(address(this)));
        }
    }

    /**
     * @dev Can update LINK address if necessary. Should not have to call this,
     * but herein case token address is updated for any reason. Can also be set to any
     * ERC-20 token in case of other tokens inadvertently sent to contract.
     */
    function setLINK(address _linkAddress) public onlyOwner {
        LINK = LinkTokenInterface(_linkAddress);
    }

    /**
     * @dev Option to replay any games that may have been created, but unable to complete initial
     * play for some reason. Unplayed games may be refunded or replayed until the number has been
     * generated and game is marked as played.
     */
    function replayGame(uint gameID) virtual public onlyOwner {
        playGame(gameID);
    }

}

contract LuckyMachineFactory{
    address[] public machines;
    mapping(address => address[]) internal ownedMachines;

    /**
     * @dev Used to create a LuckyMachine that can be verified and included in the
     * factory list.
     */
    function createMachine(address payable machineCoordinator, address linkToken, uint maxBet, uint minBet, uint maxPick, uint payout) public returns(address){
        LuckyMachine newMachine = new LuckyMachine(machineCoordinator, msg.sender, linkToken, maxBet, minBet, maxPick, payout);
        newMachine.transferOwnership(msg.sender);
        address newMachineAddress = address(newMachine);
        machines.push(newMachineAddress);
        ownedMachines[msg.sender].push(newMachineAddress);
        return newMachineAddress;
    }

    /**
     * @dev Returns a list of all machines created from this factory. Useful to verify
     * a machine was setup appropriately and is a "legitimate" LuckyMachine.
     */
    function getMachines() public view returns (address[] memory) {
        return machines;
    }

    /**
     * @dev Returns a list of all machines created by the sender.
     */
    function getOwnedMachines() public view returns (address[] memory) {
        return ownedMachines[msg.sender];
    }
}
