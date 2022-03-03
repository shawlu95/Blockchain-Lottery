// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "./GovernanceInterface.sol";

interface LotteryInterface {
    function pickWinner(uint256) external;
}

contract Randomness is VRFConsumerBaseV2 {
    // Constants
    uint32 numWords = 1;
    uint16 requestConfirmations = 3;
    uint32 callbackGasLimit = 100000;

    // Set in constructor
    GovernanceInterface governance;
    VRFCoordinatorV2Interface coordinator;
    uint64 subscriptionId;
    bytes32 keyhash;

    uint256 public randomness;

    event RequestedRandomness(uint256 requestId);
    event FulfillRandomness(uint256 requestId);

    constructor(
        address _governance,
        address _vrfCoordinator,
        uint64 _subscriptionId,
        bytes32 _keyhash
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        governance = GovernanceInterface(_governance);
        coordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        subscriptionId = _subscriptionId;
        keyhash = _keyhash;
    }

    function requestRandomness() external {
        require(msg.sender == governance.lottery());
        uint256 requestId = coordinator.requestRandomWords(
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
        require(_randomness[0] > 0, "VRF failed!");
        randomness = _randomness[0];

        LotteryInterface(governance.lottery()).pickWinner(randomness);
        emit FulfillRandomness(_requestId);
    }
}
