## Basic Lottery
Use VRF to generate random number which determines lottery winner. Prerequisite: create a [VRF subscription](https://vrf.chain.link/) and fund with LINK token. 
* A minimum entrance fee is imposed (USD denominated). The amount is converted to Ether (native token of the chain) using Chainlink price feed oracle.
* Admin manually controls when to start and end the lottery.
* After lottery ends, all deposit is sent to the winner.

```bash
npm install

hh run scripts/deploy.js --network bscTestnet
hh verify --network bscTestnet \
  --constructor-args ./scripts/args/bscTestnet.js \
  0xa7d798621096f761342804272E0752B677E25783

run scripts/deploy.js --network rinkeby
hh verify --network rinkeby \
  --constructor-args ./scripts/args/rinkeby.js \
  0xe02c4643a042238C86fBbd8eE70fAE5E3D70055E
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
