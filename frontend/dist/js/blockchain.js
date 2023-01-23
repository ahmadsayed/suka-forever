
// Web3modal instance
let web3Modal

// Chosen wallet provider given by the dialog window
let provider;


// Address of the selected account
let selectedAccount;


let web3;

let evmChains;

const chainID = 3141;

/**
 * Setup the orchestra
 */
async function init() {
    const Web3Modal = window.Web3Modal.default;
    // const WalletConnectProvider = window.WalletConnectProvider.default;
    // const Fortmatic = window.Fortmatic;
    evmChains = window.evmChains;

    console.log("window.web3 is", window.web3, "window.ethereum is", window.ethereum);

    const providerOptions = {
    };
    web3Modal = new Web3Modal({
        cacheProvider: false, // optional
        providerOptions, // required
        disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
    });

    console.log("Web3Modal instance is", web3Modal);
}


async function switchToFileCoin() {
    if (window.ethereum.networkVersion !== chainID) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: web3.utils.toHex(3141) }]
            });
        } catch (err) {
            // This error code indicates that the chain has not been added to MetaMask
            if (err.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainName: "Filecoin - Hyperspace testnet",
                            chainId: web3.utils.toHex(chainID),
                            nativeCurrency: { name: 'tFIL', decimals: 18, symbol: 'tFIL' },
                            rpcUrls: [urls]//https://api.hyperspace.node.glif.io/rpc/v0']
                        }
                    ]
                });
            }
        }
    }
}

async function fetchAccountData() {

    // Get a Web3 instance for the wallet
    web3 = new Web3(provider);
    switchToFileCoin();
    const tokenContract = "0xD6177dd28FD4F8e661E5A4a1b46e15b41d030E43";
    const tokenURIABI =  (await (await fetch('/js/abi.json')).json()).output.abi;
    // Get list of accounts of the connected wallet
    const accounts = await web3.eth.getAccounts();

    // MetaMask does not give you all accounts, only the selected account
    console.log("Got accounts", accounts);
    selectedAccount = accounts[0];

    const contract = new web3.eth.Contract(tokenURIABI, tokenContract);

    const totalSupply = await contract.methods.totalSupply().call();
    console.log(totalSupply);
    contract.methods.updateTokenURI(1,"helooo").send({
        from: selectedAccount
    }).on('transactionHash', function(hash){
        console.log(`tx hash: ${hash}`);
    })
    .on('confirmation', function(confirmationNumber, receipt){
        console.log(`confirmation number: ${confirmationNumber}, receipt: ${JSON.stringify(receipt)}`);
    })
    .on('receipt', function(receipt){
        console.log(`receipt: ${JSON.stringify(receipt)}`);
    })
    .on('error', function(error, receipt) { 
        console.log(`receipt: ${JSON.stringify(receipt)}, error: ${JSON.stringify(error)}`);
    });

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
    await fetchAccountData(provider);
    document.querySelector("#btn-connect").removeAttribute("disabled")
}


/**
 * Connect wallet button pressed.
 */
async function onConnect() {
    init();
    console.log("Opening a dialog", web3Modal);
    // Check if Web3 has been injected by the browser (Mist/MetaMask).  
    try {
        provider = await web3Modal.connect();
    } catch (e) {
        console.log("Could not get a wallet connection", e);
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


