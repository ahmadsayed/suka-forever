/**

* @type import('hardhat/config').HardhatUserConfig

*/

require('dotenv').config();

require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
const { API_URL, PRIVATE_KEY } = process.env;
module.exports = {
  solidity: "0.8.17",
  defaultNetwork: "local",
  networks: {
    hardhat: {},
    local: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    },
    goerli: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  },
}