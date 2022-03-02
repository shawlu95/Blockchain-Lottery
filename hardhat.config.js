require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");
require("hardhat-gas-reporter");
require("solidity-coverage");
require('@openzeppelin/hardhat-upgrades');
require('hardhat-contract-sizer');
require("hardhat-erc1820");

module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    version: "0.8.7",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
    },
  },
  networks: {
    ganache: {
      url: "HTTP://127.0.0.1:7545",
      network_id: "5777"
    },
    rinkeby: {
      chainId: 4,
      url: "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      from: process.env.ADMIN_PRIVATE_KEY,
      accounts: [
        process.env.ADMIN_PRIVATE_KEY,
        process.env.USER_1_KEY,
        process.env.USER_2_KEY
      ]
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20000000000,
      from: process.env.ADMIN_PRIVATE_KEY,
      accounts: [
        process.env.ADMIN_PRIVATE_KEY,
        process.env.USER_1_KEY,
        process.env.USER_2_KEY
      ]
    },
    bsc: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 20000000000,
      from: process.env.ADMIN_PRIVATE_KEY_PROD,
      accounts: [process.env.ADMIN_PRIVATE_KEY_PROD]
    }
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_TOKEN,
      rinkeby: process.env.ETHERSCAN_TOKEN,
      bsc: process.env.BSCSCAN_TOKEN,
      bscTestnet: process.env.BSCSCAN_TOKEN
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  contractSizer: {
    except: ['contracts/Memento.sol', 'contracts/Memo.sol']
  }
};
