
// Web3modal instance
let web3Modal

// Chosen wallet provider given by the dialog window
let provider;


// Address of the selected account
let selectedAccount;


let web3;

let evmChains;

const chainID = 3141;

let activeProject = null;
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
                            rpcUrls: [urls]//https://api.hyperspace.node.glif.io/rpc/v1']
                        }
                    ]
                });
            }
        }
    }
}
let contract = null;

async function fetchAccountData() {

    // Get a Web3 instance for the wallet
    web3 = new Web3(provider);
    switchToFileCoin();
    const tokenContract = "0xd2c5268649f44aEcc5897Fe975A575dd389F6cd2";
    const tokenURIABI = (await (await fetch('/js/blockchain/abi.json')).json());
    // Get list of accounts of the connected wallet
    const accounts = await web3.eth.getAccounts();

    // MetaMask does not give you all accounts, only the selected account
    console.log("Got accounts", accounts);
    selectedAccount = accounts[0];

    contract = new web3.eth.Contract(tokenURIABI, tokenContract);

    const totalSupply = await contract.methods.totalSupply().call();
    console.log(totalSupply);
    listAllTokensbyAddress(selectedAccount);

}

async function listAllTokensbyAddress(address) {

    
    const template = document.querySelector("#suka-template");
    const sukaList = document.querySelector("#sukas-list");
    while (sukaList.getElementsByClassName("my-suka").length > 0) {
        d = sukaList.getElementsByClassName("my-suka")[0];
        d.parentNode.removeChild(d);
    }

    initSamples();

    if (address == null) {
        return;
    }

    const balance = await contract.methods.balanceOf(address).call();
    for (let i = 0; i < balance; i++) {
        const token = await contract.methods.tokenOfOwnerByIndex(address, i).call();
        let cid = await contract.methods.tokenURI(token).call();
        try {
            const metadata = await getFromRemoteIPFS(cid);
            loadMeshList(metadata, token, cid);
 
        } catch (error) {
            console.error(error);
        }
    }
    const tokenIds = await contract.methods.listTokens(address).call();
    tokenIds.forEach(async (token) => {
        let cid = await contract.methods.tokenURI(token).call();
        console.log(`CID: ${cid}, Token: ${token}`);
        try {
            const metadata = await getFromRemoteIPFS(cid);
            loadMeshList(metadata, token, cid);

        } catch (error) {
            console.error(error);
        }        
    });
    
    async function loadMeshList(metadata, token, cid) {
        if (metadata.hasOwnProperty("img")) {
            const imageData = await getFromRemoteIPFS(metadata.img);
            const clone = template.content.cloneNode(true);
            clone.querySelector(".my-suka").src = imageData.image;
            clone.querySelector(".my-suka").onclick = async function () {
                currentSuka = {
                    name: token,
                    gltf: `https://ipfs.sukaverse.club/ipfs/${metadata.cid}?name=${convertNumberToString(BigInt(token))}.gltf`
                }
                switchToView();
                importMesh(currentSuka);
                localStorage.setItem(currentSuka.name, cid);

                updateHistoryList();
                activeProject = convertNumberToString(BigInt(token));
                document.getElementById("publish").disabled = false;

                document.getElementById("notification").textContent = `Active project -> ${activeProject}`


            }
            sukaList.appendChild(clone);

        }
    }

}


function checkIfAddressOwnThisNTF(address, name) {
    const balance = contract.method.balanceOf(address).call();
    let owner = false;
    for (let i = 0; i < balance; i++) {
        const token = contract.method.tokenOfOwnerByIndex(address, i).call();
        if (token == name) {
            owner = true;
            break;
        }
    }
    return owner;
}
function mintNFT(cid, tokenID) {
    contract.methods.mintNFT(cid, tokenID).send({
        from: selectedAccount
    }).on('transactionHash', function (hash) {
        console.log(`tx hash: ${hash}`);
    })
        .on('confirmation', function (confirmationNumber, receipt) {
            console.log(`confirmation number: ${confirmationNumber}, receipt: ${JSON.stringify(receipt)}`);
        })
        .on('receipt', function (receipt) {
            console.log(`receipt: ${JSON.stringify(receipt)}`);
            document.getElementById("publish").disabled = false;

            listAllTokensbyAddress(selectedAccount);

        })
        .on('error', function (error, receipt) {
            console.log(`receipt: ${JSON.stringify(receipt)}, error: ${JSON.stringify(error)}`);
        });
}

function mintNFTWithTeams(cid, tokenID, finalteams) {
    contract.methods.mintNFT(cid, tokenID, finalteams).send({
        from: selectedAccount
    }).on('transactionHash', function (hash) {
        console.log(`tx hash: ${hash}`);
    })
        .on('confirmation', function (confirmationNumber, receipt) {
            console.log(`confirmation number: ${confirmationNumber}, receipt: ${JSON.stringify(receipt)}`);
        })
        .on('receipt', function (receipt) {
            console.log(`receipt: ${JSON.stringify(receipt)}`);
            document.getElementById("publish").disabled = false;

            listAllTokensbyAddress(selectedAccount);

        })
        .on('error', function (error, receipt) {
            console.log(`receipt: ${JSON.stringify(receipt)}, error: ${JSON.stringify(error)}`);
        });
}

function updateProject(cid, tokenID) {
    contract.methods.updateTokenURI(tokenID, cid).send({
        from: selectedAccount
    }).on('transactionHash', function (hash) {
        console.log(`tx hash: ${hash}`);
    })
        .on('confirmation', function (confirmationNumber, receipt) {
            console.log(`confirmation number: ${confirmationNumber}, receipt: ${JSON.stringify(receipt)}`);
        })
        .on('receipt', function (receipt) {
            console.log(`receipt: ${JSON.stringify(receipt)}`);
            listAllTokensbyAddress(selectedAccount);

        })
        .on('error', function (error, receipt) {
            console.log(`receipt: ${JSON.stringify(receipt)}, error: ${JSON.stringify(error)}`);
        });
}


//    function addEditor(uint256 tokenId, address[] memory editor) public {

function addEditorList(tokenid, addressList) {
    contract.methods.addEditor(tokenid, addressList).send({
        from: selectedAccount
    }).on('transactionHash', function (hash) {
        console.log(`tx hash: ${hash}`);
    })
        .on('confirmation', function (confirmationNumber, receipt) {
            console.log(`confirmation number: ${confirmationNumber}, receipt: ${JSON.stringify(receipt)}`);
        })
        .on('receipt', function (receipt) {
            console.log(`receipt: ${JSON.stringify(receipt)}`);
            
        })
        .on('error', function (error, receipt) {
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

    await refreshAccountData();    // Set the UI back to the initial state
    document.querySelector("#prepare").style.display = "none";
    document.querySelector("#connected").style.display = "block";
    document.querySelector("#publish").style.display = "block";
    document.querySelector("#notification").style.display = "block";


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
    document.querySelector("#publish").style.display = "none";
    document.querySelector("#notification").style.display = "none";
    listAllTokensbyAddress(null);



}

async function publish() {
    console.log("Publish");
    let tokenID = BigInt(`0x${converStringToNumber(activeProject)}`);
    await saveLedgerToRemoteIPFS();
    let cid = localStorage.getItem(currentSuka.name);
    //updateProject(cid, tokenId);

    console.log(`Update the URI for ${activeProject}`);
    //TODO: Update the URI for this specific Item 
     updateProject(cid, tokenID);


}

function openDialog() {
    document.querySelector("#myModal").classList.add("show");
}

function converStringToNumber(data) {
    var hex = "";
    for (let i = 0; i < data.length; i++) {
        hex += data.charCodeAt(i).toString(16);
    }
    return hex;
}

function convertNumberToString(number) {
    var hex = number.toString(16);
    var str = "";
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
}

async function confirm() {
    activeProject = document.getElementById("projectName").value;
    let teams = document.getElementById("teams").value;
    document.getElementById("notification").textContent = `Active project -> ${activeProject}`


    console.log(`Set active project -> ${activeProject}`);
    // Create new project using activeProject and currentSuka 
    let tokenId = BigInt(`0x${converStringToNumber(activeProject)}`);
    await saveLedgerToRemoteIPFS();
    teams = teams.split(" ").join(",");
    teams = teams.split("\n").join(",");
    let finalteams = [];
    let teamlist = teams.split(","); // Split by CSV
    teamlist.forEach(address => {
        console.log(address);
        if (web3.utils.isAddress(address)) {
            finalteams.push(address);
        }
    })
    console.log(`teams: ${finalteams}`);

    let cid = localStorage.getItem(currentSuka.name);
    console.log(`tokenID= ${tokenId}, cid= ${cid}`);
    if (finalteams.length > 0) {
        mintNFTWithTeams(cid, tokenId, finalteams);
    } else {
        mintNFT(cid, tokenId);
    }

    //TODO: Call Mint NFT
    //TODO: Add Member if needed
    document.querySelector("#myModal").classList.remove("show");

    
}
function cancel() {
    console.log("Cancelled");
    document.querySelector("#myModal").classList.remove("show");

}

function listMyToken() {

}


window.addEventListener('DOMContentLoaded', async event => {
    document.getElementById("publish").onclick = publish;
    document.getElementById("publish").disabled = true;
    document.getElementById("notification").onclick = openDialog;
    document.getElementById("confirm").onclick = confirm;
    document.getElementById("cancel").onclick = cancel;
    if (activeProject != null) {
        document.getElementById("notification").textContent = `Active project -> ${activeProject}`
    }


});


