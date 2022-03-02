const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('Integration Test - Testnet', function () {
  let lottery;

  let owner, user1, user2;
  this.beforeAll("Should return the new greeting once it's changed", async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const chainId = hre.network.config.chainId;

    const config = require('../scripts/config.json').chainId[chainId.toString()];
    const { Lottery: address } = config;

    const Lottery = await ethers.getContractFactory("Lottery");
    lottery = Lottery.attach(address);
  });

  it("Start lottery", async function () {
    expect(await lottery.owner()).to.equal(owner.address);

    expect(await lottery.lottery_state()).to.equal(1);

    const tx = await lottery.connect(owner).startLottery();
    await tx.wait();

    expect(await lottery.lottery_state()).to.equal(0);
  });

  it('Enter Lottery', async function () {
    expect(await lottery.lottery_state()).to.equal(0);
    const entranceFee = await lottery.getEntranceFee();
    const adjustFee = parseInt(entranceFee * 1.1).toString();

    const tx1 = await lottery.connect(user1)
      .enter({ value: adjustFee, gasLimit: 100000 });
    await tx1.wait();

    const tx2 = await lottery.connect(user2)
      .enter({ value: adjustFee, gasLimit: 100000 });
    await tx2.wait();
  });

  it('End Lottery', async function () {
    expect(await lottery.lottery_state()).to.equal(0);
    const tx = await lottery.connect(owner)
      .endLottery({ gasLimit: 100000 });
    await tx.wait();

    expect(await lottery.lottery_state()).to.equal(2);
  });
});
