const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseEther } = require('ethers/lib/utils');

describe.only('Integration Test - Testnet', function () {
  let lottery;

  let owner, user1, user2;
  let mockV3Aggregator;

  this.beforeAll("Should return the new greeting once it's changed", async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const chainId = hre.network.config.chainId;

    const MockV3Aggregator = await ethers.getContractFactory('MockV3Aggregator');
    const decimal = 8;
    const initialAnswer = '2958220000000000000000';
    mockV3Aggregator = await MockV3Aggregator.deploy(decimal, initialAnswer);

    let priceFeedAddress = mockV3Aggregator.address;
    console.log(await mockV3Aggregator.latestRoundData());

    const Link = await ethers.getContractFactory('Link');
    let link = await Link.deploy();
    let linkAddress = link.address;

    const VRFCoordinatorV2Mock = await ethers.getContractFactory('VRFCoordinatorV2Mock');
    const baseFee = parseEther("0.1");
    const gasFee = parseEther("0.1");
    const vrfCoordinatorV2Mock = await VRFCoordinatorV2Mock.deploy(baseFee, gasFee);
    let vrfCoordinator = vrfCoordinatorV2Mock.address;

    const tx = await vrfCoordinatorV2Mock.createSubscription();
    const receipt = await tx.wait();
    const subId = receipt.events[0].topics[1];
    console.log(subId)
    // const config = require('../scripts/config.json').chainId[chainId.toString()];
    // const { Lottery: address } = config;

    // const Lottery = await ethers.getContractFactory("Lottery");
    // lottery = Lottery.attach(address);
  });

  it("FOO", async function () {

  });
});
