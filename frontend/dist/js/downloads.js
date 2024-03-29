
// Web3modal instance
let web3Modal

// Chosen wallet provider given by the dialog window
let provider;


// Address of the selected account
let selectedAccount;


let web3;

let evmChains;

/**
 * Setup the orchestra
 */
async function init() {
    const Web3Modal = window.Web3Modal.default;
    // const WalletConnectProvider = window.WalletConnectProvider.default;
    // const Fortmatic = window.Fortmatic;
    evmChains = window.evmChains;

    console.log("window.web3 is", window.web3, "window.ethereum is", window.ethereum);

    // Check that the web page is run in a secure context,
    // as otherwise MetaMask won't be available
    // if(location.protocol !== 'https:') {
    // https://ethereum.stackexchange.com/a/62217/620
    //   const alert = document.querySelector("#alert-error-https");
    //   alert.style.display = "block";
    //   document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
    //   return;
    //    }

    // Tell Web3modal what providers we have available.
    // Built-in web browser provider (only one can exist as a time)
    // like MetaMask, Brave or Opera is added automatically by Web3modal
    const providerOptions = {
    };
    web3Modal = new Web3Modal({
        cacheProvider: false, // optional
        providerOptions, // required
        disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
    });

    console.log("Web3Modal instance is", web3Modal);
}

async function switchNetwork(web3, chainID, chainName, urls) {
    if (window.ethereum.networkVersion !== chainID) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: web3.utils.toHex(chainID) }]
            });
        } catch (err) {
            // This error code indicates that the chain has not been added to MetaMask
            if (err.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainName: chainName,
                            chainId: web3.utils.toHex(chainID),
                            nativeCurrency: { name: 'MATIC', decimals: 18, symbol: 'MATIC' },
                            rpcUrls: [urls]//https://rpc-mumbai.matic.today/']
                        }
                    ]
                });
            }
        }
    }
}

function createCatalog(image, name, isCurrentOwnwer, tokenid, tokenContract) {
    const template = document.querySelector("#template-downloads");
    const downloadRow = document.querySelector("#download-row");


    const clone = template.content.cloneNode(true);
    clone.querySelector(".image-location").src = image;
    clone.querySelector(".image-description").textContent = name;
    let downloadButton = clone.querySelector(".download-btn");
    downloadButton.style.display = isCurrentOwnwer ? "block" : "none";
    downloadButton.setAttribute("onclick", `submitOwnershipProof(${tokenid}, "${selectedAccount.toString()}", "${tokenContract}")`);

    downloadRow.appendChild(clone);

}

async function submitOwnershipProof(tokenid, account, tokenContract) {
    let message = `${tokenid}:${tokenContract}`
    const signature = await web3.eth.personal.sign(message, selectedAccount);  // Load chain information over an HTTP API
    let base64message = btoa(message);
    let base64Signature = btoa(signature);
    fetch('/api/download', {
        method: 'GET',
        headers: {
            'authorization': `Bearer ${base64message}.${base64Signature}`
        }
    })
        .then(res => res.blob())
        .then(blob => {
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = `${tokenid}.zip`;
            document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
            a.click();
            a.remove();  //afterwards we remove the element again 
        });
}

/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
async function fetchAccountData() {

    // Get a Web3 instance for the wallet
    web3 = new Web3(provider);
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });

    if (params.network && params.network == 'live') {
        if (window.ethereum.networkVersion !== "137") {
            switchNetwork(web3, 137, 'Polygon', 'https://polygon-rpc.com');
            return;
        }
    } else {
        if (window.ethereum.networkVersion !== "80001") {
            switchNetwork(web3, 80001, 'Mumbai', 'https://rpc-mumbai.matic.today/');
            return;
        }
    }
    const tokenContract = (await (await fetch('/api/contract_address')).json()).contract_address;//"0x9b8088C47DCc83987c87ce2C82390630f91d9c7c"
    const tokenURIABI = [
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
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "index",
                    "type": "uint256"
                }
            ],
            "name": "tokenOfOwnerByIndex",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "totalSupply",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "supply",
                    "type": "uint256"
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
        }
    ];
    console.log("Web3 instance is", web3);

    // Get connected chain id from Ethereum node
    const chainId = await web3.eth.getChainId();
    const chainData = evmChains.getChain(chainId);
    //document.querySelector("#network-name").textContent = chainData.name;

    // Get list of accounts of the connected wallet
    const accounts = await web3.eth.getAccounts();

    // MetaMask does not give you all accounts, only the selected account
    selectedAccount = accounts[0];

    const contract = new web3.eth.Contract(tokenURIABI, tokenContract)
    myNode = document.querySelector("#download-row")
    while (myNode.firstChild) {
        myNode.removeChild(myNode.lastChild);
    }
    const totalSupply = await contract.methods.totalSupply().call();
    for (let i = 1; i <= totalSupply; i++) {
        //List all Token
        contract.methods.tokenURI(i).call().then(tokenURI => {
            fetch(`https://ipfs.sukaverse.club/ipfs/${tokenURI.slice(7)}`)
                .then(res => res.json())
                .then(async (metadata) => {
                    const imgCID = metadata.image;
                    const imageURL = `https://ipfs.sukaverse.club/ipfs/${imgCID.slice(7)}`;
                    const ownerAddress = await contract.methods.ownerOf(i).call();
                    createCatalog(imageURL, metadata.name, selectedAccount == ownerAddress, i, tokenContract);
                });
        });
    }

    // Display fully loaded UI for wallet data
    document.querySelector("#prepare").style.display = "none";
    document.querySelector("#connected").style.display = "block";
}

/**
 * Fetch account data for UI when
 * - User switches accounts in wallet
 * - User switches networks in wallet
 * - User connects wallet initially
 */
async function refreshAccountData() {

    // If any current data is displayed when
    // the user is switching acounts in the wallet
    // immediate hide this data
    document.querySelector("#connected").style.display = "none";
    document.querySelector("#prepare").style.display = "block";

    // Disable button while UI is loading.
    // fetchAccountData() will take a while as it communicates
    // with Ethereum node via JSON-RPC and loads chain data
    // over an API call.
    document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
    let myNode = document.querySelector("#download-row")
    while (myNode.firstChild) {
        myNode.removeChild(myNode.lastChild);
    }
    await fetchAccountData(provider);
    document.querySelector("#btn-connect").removeAttribute("disabled")
}


/**
 * Connect wallet button pressed.
 */
async function onConnect() {
    console.log("Opening a dialog", web3Modal);
    // Check if Web3 has been injected by the browser (Mist/MetaMask).  
    try {
        provider = await web3Modal.connect();
    } catch (e) {
        alert("Could not get a wallet connection");

        return;
    }

    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts) => {
        fetchAccountData();
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
        fetchAccountData();
    });

    // Subscribe to networkId change
    provider.on("networkChanged", (networkId) => {
        fetchAccountData();
    });

    await refreshAccountData();
}

/**
 * Disconnect wallet button pressed.
 */
async function onDisconnect() {

    console.log("Killing the wallet connection", provider);

    // TODO: Which providers have close method?
    if (provider.close) {
        await provider.close();

        // If the cached provider is not cleared,
        // WalletConnect will default to the existing session
        // and does not allow to re-scan the QR code with a new wallet.
        // Depending on your use case you may want or want not his behavir.
        await web3Modal.clearCachedProvider();
        provider = null;
    }

    selectedAccount = null;

    // Set the UI back to the initial state
    document.querySelector("#prepare").style.display = "block";
    document.querySelector("#connected").style.display = "none";
}

// Highlights current date on contact page
window.addEventListener('DOMContentLoaded', event => {
    init();
    onConnect();
    document.querySelector("#btn-connect").addEventListener("click", onConnect);
    document.querySelector("#btn-disconnect").addEventListener("click", onDisconnect);

    document.querySelector("#prepare").style.display = "block";
    document.querySelector("#connected").style.display = "none";



})
