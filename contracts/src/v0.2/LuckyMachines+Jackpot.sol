pragma solidity ^0.6.0;

import "./LuckyMachines.sol";
import "./Jackpots.sol";

contract LuckyMachineJackpot is LuckyMachine {

    address payable public jackpotAddress;

    mapping(uint8 => uint256) internal _payouts; //(number of matches => amount paid out)
    uint8 public totalPicks;
    uint8[] internal winTiers;

    struct JackpotGame {
        uint id;
        address payable player;
        uint bet;
        uint[] picks;
        uint[] winners;
        uint payout;
        bool played;
    }

    mapping(uint => JackpotGame) public jackpotGames;

    event JackpotGamePlayed(address _player, uint256 _bet, uint256[] _picks, uint256[] _winners, uint256 _payout);

    // SAFE LIMITS
    uint8 internal numPicksLimit = 25; //note: too many picks will return too small of numbers
    uint8 internal singlePickLimit = 100; // highest single pick, if too high some numbers will never get picked

    constructor(address payable _jackpotAddress, address payable _machineCoordinator, address payable _payoutAddress,  address _linkToken, uint _entryFee, uint _maxPick, uint8 _totalPicks, uint8[] memory _winningMatchQuantities, uint[] memory _winningMatchPayouts)
            LuckyMachine(
                _machineCoordinator,
                _payoutAddress,
                _linkToken,
                _entryFee,
                _entryFee,
                _maxPick,
                0 //payout - this contract uses other methods for payout structure
            ) public {
                require(_maxPick <= singlePickLimit, "Single pick limit exceeded");
                require(_winningMatchQuantities.length == _winningMatchPayouts.length, "Match Qty & Win Payouts must be same length");
                require(_winningMatchQuantities.length <= numPicksLimit);
                totalPicks = _totalPicks;
                for (uint8 i = 0; i < _winningMatchQuantities.length; i++) {
                    _payouts[_winningMatchQuantities[i]] = _winningMatchPayouts[i];
                }
                winTiers = _winningMatchQuantities;
                jackpotAddress = _jackpotAddress;
                Jackpots jackpots = Jackpots(jackpotAddress);
                jackpots.registerMachine();
    }

    function compare(uint[] memory arr1, uint[] memory arr2) public pure returns(uint[] memory) {
        require(arr1.length == arr2.length, "arrays must be same length");
        uint elements = arr1.length;
        uint[] memory matches = new uint256[](elements);
        for (uint i = 0; i < elements; i++) {
            for(uint j = 0; j < elements; j++) {
                if(arr1[i] == arr2[j]) {
                    matches[i] = arr1[i];
                    arr2[j] = 0;
                    break;
                }
            }
        }
        return matches;
    }

    function countMatches(uint[] memory matches) public pure returns(uint8) {
        uint8 matchCount = 0;
        for(uint i = 0; i < matches.length; i++) {
            if(matches[i] != 0) {
                matchCount++;
            }
        }
        return matchCount;
    }

    function checkPicks(uint[] memory userPicks, uint[] memory winningNumbers) public pure returns(uint8) {
        return countMatches(compare(userPicks, winningNumbers));
    }

    // Returns [number of matches], [associated payout] e.g. [1,2,3], [100000...,200000...,300000...]
    // These are independent of jackpot payout
    function getPayouts() public view returns(uint8[] memory, uint256[] memory) {
        uint[] memory tierPayouts = new uint[](winTiers.length);
        for (uint i = 0; i < winTiers.length; i++) {
            tierPayouts[i] = _payouts[winTiers[i]];
        }
        return (winTiers, tierPayouts);
    }

    function createJackpotGame(address payable _player, uint _bet, uint[] memory _picks) internal {
        _currentGame = _currentGame.add(1);
        JackpotGame memory newGame = JackpotGame ({
            id: _currentGame,
            player: _player,
            bet: _bet,
            picks: _picks,
            winners: new uint[](totalPicks),
            payout: 0,
            played: false
        });
        jackpotGames[newGame.id] = newGame;
    }

    function safeJackpotBetFor(address payable player, uint[] memory picks) public payable{
        require(picks.length == totalPicks, "Incorrect number of picks");
        require(betPayable(msg.value), "Contract has insufficint funds to payout possible win.");
        for(uint8 i = 0; i < totalPicks; i++){
            require(picks[i] <= maxPick && picks[i] > 0, "Outside of pickable bounds");
        }
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
        createJackpotGame(player, msg.value, picks);
        playGame(_currentGame);
        lastGameCreated[player] = _currentGame;
    }

    function placeJackpotBetFor(address payable player, uint[] memory picks) public payable{
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
        createJackpotGame(player, msg.value, picks);
        playGame(_currentGame);
        lastGameCreated[player] = _currentGame;
    }

    function getRandomNumbers(uint8 quantity) internal returns (bytes32 requestId) {
        LuckyMachineCoordinator mc = LuckyMachineCoordinator(machineCoordinator);
        return mc.getRandomNumbers(quantity);
    }

    function getJackpotMachineSummary() public view returns(uint, uint8[] memory, uint[] memory, uint, uint8, uint) {
        //entryFee, payoutTiers, payouts, maxPick, totalPicks, currentJackpot
        Jackpots jackpots = Jackpots(jackpotAddress);
        uint jackpotBal = jackpots.getBalance();
        uint[] memory tierPayouts = new uint[](winTiers.length);
        for (uint i = 0; i < winTiers.length; i++) {
            tierPayouts[i] = _payouts[winTiers[i]];
        }
        return(minBet, winTiers, tierPayouts, maxPick, totalPicks, jackpotBal);
    }

    // Lucky Machine functions to override:
    function betPayable(uint bet) override public view returns(bool){
        return (address(this).balance.sub(_unplayedBets) >= _payouts[winTiers[winTiers.length.sub(1)]]);
    }

    function playGame(uint gameID) override internal {
        require(jackpotGames[gameID].played == false, "game already played");
        bytes32 reqID = getRandomNumbers(totalPicks);
        _gameRequests[reqID] = gameID;
    }

    function fulfillRandomness(bytes32 requestId, uint256[] memory randomness) override external {
        // ONLY CALLABLE BY MACHINE COORDINATOR
        require(msg.sender == machineCoordinator);
        JackpotGame storage g = jackpotGames[_gameRequests[requestId]];
        if(g.id > 0 && g.played == false){
            if(g.bet > maxBet) {
                g.bet = maxBet;
            }
            require(betPayable(1));

            // store winning numbers
            for (uint8 i = 0; i < totalPicks; i++) {
                g.winners[i] = randomness[i].mod(maxPick).add(1);
            }

            g.played = true;

            if(_unplayedBets >= g.bet) {
                _unplayedBets -= g.bet;
            } else {
                _unplayedBets = 0;
            }

            // Check for winning numbers
            uint8 winningPicks = checkPicks(g.picks, g.winners);
            uint totalPayout = 0;

            // Payout if winner
            if(winningPicks > 0) {
                if (winningPicks == totalPicks) {
                    // Trigger jackpot payout
                    Jackpots jackpots = Jackpots(jackpotAddress);
                    totalPayout = jackpots.getBalance();
                    jackpots.payoutJackpot(g.player);
                } else {
                    totalPayout = _payouts[winningPicks];
                    g.player.transfer(totalPayout);
                }
            }
            g.payout = totalPayout;
            emit JackpotGamePlayed(g.player, g.bet, g.picks, g.winners, totalPayout);
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

    function requestRefund(uint gameID) override public{
        JackpotGame storage g = jackpotGames[gameID];
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

    function fundJackpot() public payable{
        // WARNING: Funds deposited here cannot be refunded, only won from jackpot
        Jackpots jackpots = Jackpots(jackpotAddress);
        jackpots.addToJackpot{value:msg.value}();
    }

    // disable unused functions
    function placeBetFor(address payable player, uint pick) override public payable{
        require(false, "Function not used in this contract. Use placeJackpotBetFor");
    }

    function createGame(address payable _player, uint _bet, uint _pick) override internal {
        require(false, "Function not used in this contract. Use createJackpotGame");
    }

    function safeBetFor(address payable player, uint pick) override public payable{
        require(false, "Function not used in this contract. Use safeJackpotBetFor");
    }

    // Create Factory specific to these types of machines

}

contract LuckyMachineJackpotFactory{
    address[] public machines;
    mapping(address => address[]) internal ownedMachines;

    /**
     * @dev Used to create a LuckyMachine that can be verified and included in the
     * factory list.
     */

    function createMachine(
                address payable jackpotAddress,
                address payable machineCoordinator,
                address linkToken,
                uint entryFee,
                uint maxPick,
                uint8 totalPicks,
                uint8[] memory winningMatchQuantities,
                uint[] memory winningMatchPayouts
            ) public returns(address){
                LuckyMachineJackpot newMachine = new LuckyMachineJackpot(
                                                        jackpotAddress,
                                                        machineCoordinator,
                                                        msg.sender,
                                                        linkToken,
                                                        entryFee,
                                                        maxPick,
                                                        totalPicks,
                                                        winningMatchQuantities,
                                                        winningMatchPayouts
                                                    );
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
