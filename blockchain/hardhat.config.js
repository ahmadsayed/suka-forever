/**

* @type import('hardhat/config').HardhatUserConfig

*/

require('dotenv').config();

require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-truffle5");
require("hardhat-gas-reporter");
const { API_URL, PRIVATE_KEY } = process.env;
module.exports = {
  solidity: "0.8.17",
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000,
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: '7SMr-3gaTKa10UPWknNbxUBRccDU1zkI'
    }
  },
  defaultNetwork: "polygon",
  networks: {
    hardhat: {
    },
    local: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    },
    goerli: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    }, 
    polygon: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/7SMr-3gaTKa10UPWknNbxUBRccDU1zkI",
      accounts: ["0xef437c9c017445a40449f6e7e1567099e65c22b92fea0435d5787e9b09e6eccd"],
    }
  },
}