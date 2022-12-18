import { createAlchemyWeb3 } from '@alch/alchemy-web3'
import Web3 from 'web3';
import path from 'path';
import url from 'url';
import { Buffer } from 'buffer';
import * as dotenv from 'dotenv'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
dotenv.config({
  path: __dirname + '/../../blockchain/.env'
});

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS
const API_URL = process.env.API_URL
const httpPorvider = new Web3.providers.HttpProvider(API_URL);
const web3 = createAlchemyWeb3(API_URL, { writeProvider: httpPorvider })

const tokenURIABI = [{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    }
  ],
  "name": "ownerOf",
  "outputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    }
  ],
  "name": "tokenURI",
  "outputs": [
    {
      "internalType": "string",
      "name": "",
      "type": "string"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}
];
// middleware for authentication
export default async function authorize(request, _response, next) {
  if (request.path != '/download') {
    next();
    return;
  }

  // Extract token id , contract address, signature from the header
  const apiToken = request.headers['authorization'].split(' ')[1].split('.');
  const message = Buffer.from(apiToken[0], 'base64').toString();
  const signature = Buffer.from(apiToken[1], 'base64').toString();
  const tokenID = message.split(':')[0];
  const contractAddress = message.split(':')[1];

  // Query the blockchain RPC for the NFT owner
  const contract = new web3.eth.Contract(tokenURIABI, contractAddress);
  const ownerAddress = await contract.methods.ownerOf(parseInt(tokenID)).call();
  // Logging
  let addressx = await web3.eth.accounts.recover(message, signature);

  // Ensure the signed message match the owner as per the blockchain
  if (addressx != ownerAddress) {
    _response.status(403).json({
      error: `Your address ${addressx} does not own token ${tokenID} in contract ${contractAddress}`
    })
    return;
  } 
  _response.locals.tokenID = tokenID;
  next();
}