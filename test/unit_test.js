const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseEther } = require('ethers/lib/utils');
const util = require('../scripts/util');

describe.only('Integration Test - Testnet', function () {
  let lottery, randomness;
  let subId;
  let owner, user1, user2;
  let mockV3Aggregator, vrfCoordinatorV2Mock;
  const baseFee = parseEther("0.1");

  this.beforeEach("Should return the new greeting once it's changed", async function () {
    // Only run unit test if --network is local
    const chainId = hre.network.config.chainId;
    if (!util.isLocal(chainId)) {
      this.skip();
    }

    [owner, user1, user2] = await ethers.getSigners();

    const MockV3Aggregator = await ethers.getContractFactory('MockV3Aggregator');
    const decimal = 8;
    const initialAnswer = '200000000000'; // 2000 USD, plus 8 decimals
    mockV3Aggregator = await MockV3Aggregator.deploy(decimal, initialAnswer);

    const VRFCoordinatorV2Mock = await ethers.getContractFactory('VRFCoordinatorV2Mock');
    vrfCoordinatorV2Mock = await VRFCoordinatorV2Mock.deploy(baseFee, 0);

    const tx = await vrfCoordinatorV2Mock.createSubscription();
    const receipt = await tx.wait();
    subId = parseInt(receipt.events[0].topics[1]);

    const fund = parseEther('1.0');
    await vrfCoordinatorV2Mock.fundSubscription(subId, fund);

    const Governance = await ethers.getContractFactory('Governance');
    const governance = await Governance.deploy();

    const Lottery = await ethers.getContractFactory("Lottery");
    lottery = await Lottery.deploy(governance.address, mockV3Aggregator.address);

    const keyHash = util.toBytes32('');
    const Randomness = await ethers.getContractFactory('Randomness');
    randomness = await Randomness.deploy(
      governance.address, vrfCoordinatorV2Mock.address, subId, keyHash);

    await governance.init(lottery.address, randomness.address);
  });

  it('Can get entrace fee', async function () {
    // At price $2000/ETH, $50 entrance fee is worth 0.025 ETH
    expect(await lottery.getEntranceFee()).to.equal(parseEther('0.025'));
  })

  it("Cannot enter before start", async function () {
    // State: CLOSED
    expect(await lottery.lottery_state()).to.equal(1);
    await expect(lottery.connect(user1).enter({ value: parseEther('0.1') })).to.be.reverted;
  });

  it('Cannot enter with insufficient fee', async function () {
    await lottery.connect(owner).startLottery();

    const entranceFee = await lottery.getEntranceFee();
    const adjustFee = entranceFee.div(2);

    await expect(lottery.connect(user1).enter({ value: adjustFee })).to.be.reverted;
    expect(await lottery.getPlayersCount()).to.equal(0);
  });

  it('Can enter after start', async function () {
    await lottery.connect(owner).startLottery();

    // State: OPEN
    expect(await lottery.lottery_state()).to.equal(0);
    await lottery.connect(user1).enter({ value: parseEther('0.1') });
    expect(await lottery.getPlayersCount()).to.equal(1);

    await lottery.connect(user2).enter({ value: parseEther('0.2') });
    expect(await lottery.getPlayersCount()).to.equal(2);
  });

  it('Can end lottery', async function () {
    await lottery.connect(owner).startLottery();
    await lottery.connect(user1).enter({ value: parseEther('0.1') });
    await lottery.connect(user2).enter({ value: parseEther('0.2') });
    expect(await waffle.provider.getBalance(lottery.address)).to.equal(parseEther('0.3'));

    await lottery.connect(owner).endLottery();

    // State: CALCULATING_WINNER
    expect(await lottery.lottery_state()).to.equal(2);

    // Fulfill randomness
    const subBefore = await vrfCoordinatorV2Mock.getSubscription(subId);
    const tx = await vrfCoordinatorV2Mock.fulfillRandomWords(subId, randomness.address);
    const subAfter = await vrfCoordinatorV2Mock.getSubscription(subId);
    await tx.wait();

    // State: CLOSED
    expect(await lottery.lottery_state()).to.equal(1);

    // Check winner
    const rand = await randomness.randomness();
    const index = rand.mod(2); // We have two users
    const winner = await lottery.recentWinner();
    expect(winner).to.equal([user1.address, user2.address][index]);

    // Check reset
    expect(await waffle.provider.getBalance(lottery.address)).to.equal(0);
    expect(await lottery.getPlayersCount()).to.equal(0);

    // Check Link token is spent
    expect(subAfter.balance).to.equal(subBefore.balance.sub(baseFee));
  })
});
