## Basic Lottery
Use VRF to generate random number which determines lottery winner. Prerequisite: create a [VRF subscription](https://vrf.chain.link/) and fund with LINK token. 
* A minimum entrance fee is imposed (USD denominated). The amount is converted to Ether (native token of the chain) using Chainlink price feed oracle.
* Admin manually controls when to start and end the lottery.
* After lottery ends, all deposit is sent to the winner.

```bash
npm install

# deploy all contracts
run scripts/deploy.js --network rinkeby

# Verify Governance.sol
# https://rinkeby.etherscan.io/address/0xE90FFb555571a8C796A6319A53c1D39E83987666#code
hh verify --network rinkeby \
  0xE90FFb555571a8C796A6319A53c1D39E83987666

# Verify Lottery.sol
# https://rinkeby.etherscan.io/address/0x5E14AA543248e5C6449e30Bf3834aD918Ce3503F#code
hh verify --network rinkeby \
  --constructor-args ./scripts/args/rinkeby/lottery.js \
  0x5E14AA543248e5C6449e30Bf3834aD918Ce3503F

# Verify Randomness.sol
# https://rinkeby.etherscan.io/address/0xc414051c1B3054f7389d745507fdf171AE70621F#code
hh verify --network rinkeby \
  --constructor-args ./scripts/args/rinkeby/randomness.js \
  0xc414051c1B3054f7389d745507fdf171AE70621F
```

## Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```
