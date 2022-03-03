// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./GovernanceInterface.sol";

interface RandomnessInterface {
    function requestRandomness() external;
}

contract Lottery is Ownable {
    enum LOTTERY_STATE {
        OPEN,
        CLOSED,
        CALCULATING_WINNER
    }
    LOTTERY_STATE public state;

    AggregatorV3Interface ethUsdPriceFeed;
    GovernanceInterface governance;

    address payable[] public players;
    address payable public recentWinner;
    uint256 public usdEntryFee;

    constructor(address _governance, address _priceFeedAddress) {
        usdEntryFee = 50 * (10**18);
        state = LOTTERY_STATE.CLOSED;
        governance = GovernanceInterface(_governance);
        ethUsdPriceFeed = AggregatorV3Interface(_priceFeedAddress);
    }

    function enter() public payable {
        require(state == LOTTERY_STATE.OPEN);
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
        require(state == LOTTERY_STATE.CLOSED, "Closed!");
        state = LOTTERY_STATE.OPEN;
    }

    function endLottery() public onlyOwner {
        state = LOTTERY_STATE.CALCULATING_WINNER;
        RandomnessInterface(governance.randomness()).requestRandomness();
    }

    function getPlayersCount() public view returns (uint256 count) {
        return players.length;
    }

    function pickWinner(uint256 rand) external {
        require(_msgSender() == governance.randomness());
        uint256 indexOfWinner = rand % players.length;
        recentWinner = players[indexOfWinner];
        recentWinner.transfer(address(this).balance);

        players = new address payable[](0);
        state = LOTTERY_STATE.CLOSED;
    }
}
