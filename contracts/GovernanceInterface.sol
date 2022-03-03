// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface GovernanceInterface {
    function lottery() external view returns (address);

    function randomness() external view returns (address);
}
