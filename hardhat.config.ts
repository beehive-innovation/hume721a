import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";

dotenv.config();

function createLocalHostConfig() {
  const url = "http://localhost:8545";
  const mnemonic =
    "test test test test test test test test test test test junk";
  return {
    accounts: {
      count: 10,
      initialIndex: 0,
      mnemonic,
      path: "m/44'/60'/0'/0",
    },
    url,
    blockGasLimit: 30000000,
    allowUnlimitedContractSize: true,
  };
}

const config: HardhatUserConfig = {
  typechain: {
    outDir: "typechain",
  },
  solidity: {
    compilers: [
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100,
          },
          metadata: {
            useLiteralContent: true,
          },
        },
      },
    ],
  },
  defaultNetwork: "hardhat",
  networks: {
    localhost: createLocalHostConfig(),
    hardhat: {
      blockGasLimit: 30000000,
      allowUnlimitedContractSize: true,
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${process.env.API_KEY || ""}`,
      accounts: [
        `0x${
          process.env.PRIVATE_KEY ||
          "0000000000000000000000000000000000000000000000000000000000000000"
        }`,
      ],
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.API_KEY || ""}`,
      accounts: [
        `0x${
          process.env.PRIVATE_KEY ||
          "0000000000000000000000000000000000000000000000000000000000000000"
        }`,
      ],
    },
  },
  mocha: {
    timeout: 600000,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
