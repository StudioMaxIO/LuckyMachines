pragma solidity ^0.6.0;

//import "https://raw.githubusercontent.com/smartcontractkit/chainlink/master/evm-contracts/src/v0.6/VRFConsumerBase.sol";

//import "./SafeMathChainlink.sol";
//import "LinkTokenInterface.sol";
//import "VRFRequestIDBase.sol";
//import "VRFConsumerBase.sol";

library SafeMathChainlink {

  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    require(c >= a, "SafeMath: addition overflow");

    return c;
  }

  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    require(b <= a, "SafeMath: subtraction overflow");
    uint256 c = a - b;

    return c;
  }

  function mul(uint256 a, uint256 b) internal pure returns (uint256) {

    if (a == 0) {
      return 0;
    }

    uint256 c = a * b;
    require(c / a == b, "SafeMath: multiplication overflow");

    return c;
  }

  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // Solidity only automatically asserts when dividing by 0
    require(b > 0, "SafeMath: division by zero");
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold

    return c;
  }

  function mod(uint256 a, uint256 b) internal pure returns (uint256) {
    require(b != 0, "SafeMath: modulo by zero");
    return a % b;
  }
}

contract VRFRequestIDBase {

  function makeVRFInputSeed(bytes32 _keyHash, uint256 _userSeed,
    address _requester, uint256 _nonce)
    internal pure returns (uint256)
  {
    return  uint256(keccak256(abi.encode(_keyHash, _userSeed, _requester, _nonce)));
  }

  function makeRequestId(
    bytes32 _keyHash, uint256 _vRFInputSeed) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(_keyHash, _vRFInputSeed));
  }
}

interface LinkTokenInterface {
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

abstract contract VRFConsumerBase is VRFRequestIDBase {

  using SafeMathChainlink for uint256;

  function fulfillRandomness(bytes32 requestId, uint256 randomness)
    internal virtual;

  function requestRandomness(bytes32 _keyHash, uint256 _fee, uint256 _seed)
    internal returns (bytes32 requestId)
  {
    LINK.transferAndCall(vrfCoordinator, _fee, abi.encode(_keyHash, _seed));

    uint256 vRFSeed  = makeVRFInputSeed(_keyHash, _seed, address(this), nonces[_keyHash]);

    nonces[_keyHash] = nonces[_keyHash].add(1);
    return makeRequestId(_keyHash, vRFSeed);
  }

  LinkTokenInterface internal LINK;
  address private vrfCoordinator;

  mapping(bytes32 /* keyHash */ => uint256 /* nonce */) public nonces;
  constructor(address _vrfCoordinator, address _link) public {
    vrfCoordinator = _vrfCoordinator;
    LINK = LinkTokenInterface(_link);
  }

  function rawFulfillRandomness(bytes32 requestId, uint256 randomness) external {
    require(msg.sender == vrfCoordinator, "Only VRFCoordinator can fulfill");
    fulfillRandomness(requestId, randomness);
  }
}

contract LuckyMachine is VRFConsumerBase {
    //RULES:
    // - balance of contract must be enough to payout winnings with 1 entrant before start of game
    // - prize pool can increase, but only up to current balance of contract, prize must be
    //   guaranteed payable.

    using SafeMathChainlink for uint256;

    address payable public owner;

    bytes32 internal keyHash;
    uint256 internal fee;

    struct Game {
        uint id;
        address payable player;
        uint bet;
        uint pick;
        uint winner; // set to number higher than possible before number is chosen
        bool played;
    }

    uint maxPick;
    uint public maxBet;
    uint public minBet;
    uint public _unplayedBets;
    uint public _currentGame;
    uint public payout; // Multiplier, e.g. 10X: payout (10) * bet (X)

    mapping(uint => Game) public games;
    mapping(bytes32 => uint) public _gameRequsts;

    constructor(address payable _owner, uint _maxBet, uint _minBet, uint _maxPick, uint _payout)
        VRFConsumerBase(
            0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9, // VRF Coordinator
            0xa36085F69e2889c224210F603D836748e7dC0088  // LINK Token
        ) public {
            keyHash = 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;
            fee = 0.1 * 10 ** 18; // 0.1 LINK

            _currentGame = 0;
            _unplayedBets = 0;
            owner = _owner;
            minBet = _minBet;
            maxBet = _maxBet;
            maxPick = _maxPick;
            payout = _payout;
    }

    function canPlayGame(uint bet) public view returns(bool){
        if (bet >= minBet && bet <= maxBet && (address(this).balance - _unplayedBets) >= ((bet * payout)+bet)) {
            // At a minimum this contract should have enough to cover any potential winnings plus refund unplayed bets
            // preferable to complte all games, but in case oracle becomes unreachable or other catastrophic incident occurs,
            // bets should be refunded.
            return true;
        } else {
            return false;
        }
    }

    function placeBet(uint pick) public payable{
        // check that game can be played
        placeBetFor(msg.sender, pick);
    }

    function placeBetFor(address payable player, uint pick) public payable {
      require(pick <= maxPick, "Pick is too high. Choose a lower number.");
      require(canPlayGame(msg.value),"Not enough funds for payout or max bet exceeded.");

      _unplayedBets = _unplayedBets.add(msg.value);
      createGame(player, msg.value, pick);
      playGame(_currentGame);
    }

    function createGame(address payable _player, uint _bet, uint _pick) internal {
        _currentGame.add(1);
        Game memory newGame = Game ({
            id: _currentGame,
            player: _player,
            bet: _bet,
            pick: _pick,
            winner: maxPick.add(10), //TODO: use safe math
            played: false
        });
        games[newGame.id] = newGame;
    }

    function getSeed() public view returns(uint256) {
        return 12345;
    }

    function playGame(uint gameID) public {
        // make sure game hasn't been played already
        // get random number
        uint seed = 12345;
        bytes32 reqID = getRandomNumber(seed);
        _gameRequsts[reqID] = gameID;
    }

    function getRandomNumber(uint256 seed) public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) > fee, "Not enough LINK");
        return requestRandomness(keyHash, fee, seed);
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        //randomResult = randomness;
        Game storage g = games[_gameRequsts[requestId]];
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

    // Owner Functions

    function fundMachine() public payable {

    }

    function setMaxBet(uint _maxBet) public {
        // must be owner to set this value
        maxBet = _maxBet;
    }

    function setMinBet(uint _minBet) public {
        // must be owner to set this value
        minBet = _minBet;
    }

    function closeMachine() public {
        // must be owner to shut down machine

        require (address(this).balance > _unplayedBets);

        // Contract must retain any unplayed bets. If contract is unable to cover winnings or
        // other catastrophic failure occurs, contract must be able to refund unplayed bets to players.

        uint availableContractBalance = address(this).balance - _unplayedBets;
        owner.transfer(availableContractBalance);

        if (LINK.balanceOf(address(this)) > 0) {
            LINK.transfer(owner, LINK.balanceOf(address(this)));
        }

    }
}
