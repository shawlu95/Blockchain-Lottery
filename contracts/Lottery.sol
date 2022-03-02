// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Lottery is VRFConsumerBaseV2, Ownable {
    enum LOTTERY_STATE {
        OPEN,
        CLOSED,
        CALCULATING_WINNER
    }
    LOTTERY_STATE public lottery_state;

    // Constants
    uint32 numWords = 1;
    uint16 requestConfirmations = 3;
    uint32 callbackGasLimit = 100000;

    // Set in constructor
    uint64 subscriptionId;
    AggregatorV3Interface ethUsdPriceFeed;
    VRFCoordinatorV2Interface COORDINATOR;
    address link;
    bytes32 keyhash;

    address payable[] public players;
    address payable public recentWinner;
    uint256[] public randomness;
    uint256 public usdEntryFee;

    event RequestedRandomness(uint256 requestId);
    event FulfillRandomness(uint256 requestId);

    constructor(
        uint64 _subscriptionId,
        address _priceFeedAddress,
        address _vrfCoordinator,
        address _link,
        bytes32 _keyhash
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        usdEntryFee = 50 * (10**18);
        subscriptionId = _subscriptionId;
        ethUsdPriceFeed = AggregatorV3Interface(_priceFeedAddress);
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        link = _link;
        lottery_state = LOTTERY_STATE.CLOSED;
        keyhash = _keyhash;
    }

    function enter() public payable {
        require(lottery_state == LOTTERY_STATE.OPEN);
        require(msg.value >= getEntranceFee(), "Not enough ETH!");
        players.push(payable(msg.sender));
    }

    function getPriceFeed() public view returns (uint256) {
        return _getPriceFeed();
    }

    function _getPriceFeed() internal view returns (uint256) {
        (, int256 price, , , ) = ethUsdPriceFeed.latestRoundData();
        return uint256(price) * 10**10; // 18 decimals
    }

    function getEntranceFee() public view returns (uint256) {
        uint256 price = _getPriceFeed();
        uint256 costToEnter = (usdEntryFee * 10**18) / price;
        return costToEnter;
    }

    function startLottery() public onlyOwner {
        require(lottery_state == LOTTERY_STATE.CLOSED, "Closed!");
        lottery_state = LOTTERY_STATE.OPEN;
    }

    function endLottery() public onlyOwner {
        lottery_state = LOTTERY_STATE.CALCULATING_WINNER;
        uint256 requestId = COORDINATOR.requestRandomWords(
            keyhash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        emit RequestedRandomness(requestId);
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomness
    ) internal override {
        require(lottery_state == LOTTERY_STATE.CALCULATING_WINNER);
        uint256 rand = _randomness[0];
        require(rand > 0, "RNG failed!");
        uint256 indexOfWinner = rand % players.length;
        recentWinner = players[indexOfWinner];
        recentWinner.transfer(address(this).balance);

        // Reset
        players = new address payable[](0);
        lottery_state = LOTTERY_STATE.CLOSED;
        randomness = _randomness;
        emit FulfillRandomness(_requestId);
    }
}
