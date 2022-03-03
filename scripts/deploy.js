const { ethers } = require('hardhat');
const hre = require('hardhat');

async function main() {
  await hre.run('compile');
  const chainId = hre.network.config.chainId;

  const config = require('./config.json').chainId[chainId.toString()];
  const { subscriptionId, priceFeedAddress, vrfCoordinator, keyHash } = config;

  // Deploy governance contract
  const Governance = await ethers.getContractFactory('Governance');
  const governance = await Governance.deploy();

  // Deploy lottery contract
  const Lottery = await ethers.getContractFactory('Lottery');
  const lottery = await Lottery.deploy(
    governance.address, priceFeedAddress);
  await lottery.deployed();
  console.log('Lottery deployed:', lottery.address);

  // Deploy randomness contract
  const Randomness = await ethers.getContractFactory('Randomness');
  const randomness = await Randomness.deploy(
    governance.address, vrfCoordinator, subscriptionId, keyHash);
  await lottery.deployed();
  console.log('Randomness deployed:', randomness.address);

  // Link governance and randomness contract
  await governance.init(lottery.address, randomness.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
