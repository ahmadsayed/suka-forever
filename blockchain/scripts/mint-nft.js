require("dotenv").config()
const API_URL = process.env.API_URL
const PUBLIC_KEY = process.env.PUBLIC_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY
const CONTRACT_ADDRESS =  process.env.CONTRACT_ADDRESS

const { createAlchemyWeb3 } = require("@alch/alchemy-web3")
const web3 = createAlchemyWeb3(API_URL)

const contract = require("../artifacts/contracts/SukaNFT.sol/SukaNFT.json")
const contractAddress = CONTRACT_ADDRESS
const nftContract = new web3.eth.Contract(contract.abi, contractAddress)

async function mintNFT(uri) {
  const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, "latest") //get latest nonce
  console.log(nonce);
  //the transaction
  const tx = {
    from: PUBLIC_KEY,
    to: contractAddress,
    nonce: nonce,
    gas: 500000,
    data: nftContract.methods.mintNFT(PUBLIC_KEY, uri).encodeABI(),
  }

  const signPromise = web3.eth.accounts.signTransaction(tx, PRIVATE_KEY)
  signPromise
    .then((signedTx) => {
      web3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
        function (err, hash) {
          if (!err) {
            console.log(
              "The hash of your transaction is: ",
              hash
            )
          } else {
            console.log(
              "Something went wrong when submitting your transaction:",
              err
            )
          }
        }
      )
    })
    .catch((err) => {
      console.log("Promise failed:", err)
    })
}


async function readURI(tokenid) {
   // const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, "latest") //get latest nonce
  

    const data = await nftContract.methods.tokenURI(tokenid).call();

  }
 
async function mintall () {
  mintNFT("ipfs://QmYw2Twd9UJ5KVWPj2rHrFAj7SskLmKgPJyTnRCvTZJmpv/purple-1.json")  
  await new Promise(resolve => setTimeout(resolve, 50000));
  mintNFT("ipfs://QmYw2Twd9UJ5KVWPj2rHrFAj7SskLmKgPJyTnRCvTZJmpv/green-1.json")  
  await new Promise(resolve => setTimeout(resolve, 50000));
  mintNFT("ipfs://QmYw2Twd9UJ5KVWPj2rHrFAj7SskLmKgPJyTnRCvTZJmpv/purple-1.json")
  await new Promise(resolve => setTimeout(resolve, 50000));
  mintNFT("ipfs://QmYw2Twd9UJ5KVWPj2rHrFAj7SskLmKgPJyTnRCvTZJmpv/red-1.json")
  await new Promise(resolve => setTimeout(resolve, 50000));
  mintNFT("ipfs://QmYw2Twd9UJ5KVWPj2rHrFAj7SskLmKgPJyTnRCvTZJmpv/yellow-1.json")
}

//mintNFT("ipfs://QmUMyN4ERfq3ibHBAbYUgkvY3boDCCA3AqSpzKGVcTccmA");
mintall();

//mintNFT("ipfs://QmZD3o5HmeKYCsuFBknp1bWfcS48EMKRWPMrvWPhKNT6Y6/2")

//readURI(1)
