// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.6/vendor/SafeMathChainlink.sol";
import "@chainlink/contracts/src/v0.6/interfaces/LinkTokenInterface.sol";
import "@chainlink/contracts/src/v0.6/VRFRequestIDBase.sol";
import "./LuckyMachines.sol";

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

  //NOTE: this is set to immutable in original contract. Using this due to
  // temporary token used on Polygon/Matic. Will need to be updated eventually.
  LinkTokenInterface internal LINK;
  address immutable private vrfCoordinator;

  mapping(bytes32 /* keyHash */ => uint256 /* nonce */) private nonces;

  constructor(address _vrfCoordinator, address _link) public {
    vrfCoordinator = _vrfCoordinator;
    LINK = LinkTokenInterface(_link);
  }

  function rawFulfillRandomness(bytes32 requestId, uint256 randomness) external {
    require(msg.sender == vrfCoordinator, "Only VRFCoordinator can fulfill");
    fulfillRandomness(requestId, randomness);
  }
}


contract LuckyMachineCoordinator is VRFConsumerBase, Ownable {
    using SafeMathChainlink for uint256;

    bytes32 internal keyHash;
    uint256 internal fee;

    mapping(bytes32 => address payable) private _machineRequests;
    mapping(bytes32 => uint8) private _requestQuantities;
    uint8 public maxRandomNumbers;

    constructor(address _coordinator, address _linkToken, bytes32 _keyHash, uint256 _fee)
        VRFConsumerBase(
            _coordinator, // VRF Coordinator
            _linkToken  // LINK Token
        ) public {
            keyHash = _keyHash;
            fee = _fee;
            maxRandomNumbers = 78;
    }

    receive() external payable {

    }

    /**
     * @dev Shouldn't be updated unless set incorrectly to begin with.
     */
    function setKeyHash(bytes32 _keyHash) public onlyOwner {
        keyHash = _keyHash;
    }

    /**
     * @dev Can update fee if operator changes fee amount.
     */
    function setFee(uint256 _fee) public onlyOwner {
      fee = _fee;
    }

    /**
     * @dev Can update LINK address if necessary. Should not have to call this, but here
     * in case token address updated for any reason.
     */
    function setLINK(address _linkAddress) public onlyOwner {
        LINK = LinkTokenInterface(_linkAddress);
    }

    function getRandomNumbers(uint8 quantity) external returns(bytes32 requestID){
        require(quantity <= maxRandomNumbers && quantity > 0, "quantity outside of bounds");
        require(LINK.balanceOf(address(this)) >= fee || LINK.balanceOf(msg.sender) >= fee, "Not enough LINK");
        if (LINK.balanceOf(address(this)) < fee) {
            LINK.transferFrom(msg.sender, address(this), fee);
        }
        uint256 seed = uint256(blockhash(block.number - 1));
        bytes32 rid = requestRandomness(keyHash, fee, seed);
        _machineRequests[rid] = msg.sender;
        _requestQuantities[rid] = quantity;
        return rid;
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        LuckyMachine machine = LuckyMachine(_machineRequests[requestId]);
        if(_requestQuantities[requestId] > 1){
          uint256[] memory randomArray = sliceNumber(randomness, _requestQuantities[requestId]);
          // send array to machine
          machine.fulfillRandomness(requestId, randomArray);
        } else {
          uint256[] memory numberArray = new uint256[](1);
          numberArray[0] = randomness;
          machine.fulfillRandomness(requestId, numberArray);
        }
    }

    function sliceNumber(uint256 inputNumber, uint8 elements) internal returns (uint256[] memory){

        uint256[] memory numberArray = new uint256[](elements);
        uint digitsPerSection = 78 / elements;

        // get last digits
        uint lastDigits = lastN(inputNumber, digitsPerSection);

        // add to end of array
        numberArray[elements - 1] = lastDigits;

        // strip away digits added to the array
        uint newNumber = (inputNumber - lastDigits) / (10 ** digitsPerSection);

        for (uint i = (elements - 1); i > 0; i--) {
            lastDigits = lastN(newNumber, digitsPerSection);
            // add to end of array
            numberArray[i-1] = lastDigits;
            // strip away digits added to the array
            newNumber = (newNumber - lastDigits) / (10 ** digitsPerSection);
        }

        return numberArray;
    }

    function lastN(uint number, uint n) public pure returns (uint) {
        return number % 10 ** n;
    }

    function setMaxRandomQuantity(uint8 quantity) public onlyOwner {
      maxRandomNumbers = quantity;
    }

    function getLinkBalance() public view returns(uint){
        return LINK.balanceOf(address(this));
    }

    function withdrawLink() public onlyOwner {
        LINK.transfer(msg.sender, LINK.balanceOf(address(this)));
    }
}
