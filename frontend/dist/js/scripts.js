/*!
* Start Bootstrap - Business Casual v7.0.8 (https://startbootstrap.com/theme/business-casual)
* Copyright 2013-2022 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-business-casual/blob/master/LICENSE)
*/
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const Fortmatic = window.Fortmatic;
const evmChains = window.evmChains;

// Web3modal instance
let web3Modal

// Chosen wallet provider given by the dialog window
let provider;


// Address of the selected account
let selectedAccount;


let web3;

/**
 * Setup the orchestra
 */
function init() {

    console.log("Initializing example");
    console.log("WalletConnectProvider is", WalletConnectProvider);
    console.log("Fortmatic is", Fortmatic);
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

/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
 async function fetchAccountData() {

    // Get a Web3 instance for the wallet
    web3 = new Web3(provider);
  
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
      }     
  ];
    console.log("Web3 instance is", web3);
  
    // Get connected chain id from Ethereum node
    const chainId = await web3.eth.getChainId();
    const message = "Hello World"
    const chainData = evmChains.getChain(chainId);
    //document.querySelector("#network-name").textContent = chainData.name;
  
    // Get list of accounts of the connected wallet
    const accounts = await web3.eth.getAccounts();
  
    // MetaMask does not give you all accounts, only the selected account
    console.log("Got accounts", accounts);
    selectedAccount = accounts[0];
  
    //document.querySelector("#selected-account").textContent = selectedAccount;
  
    // Get a handl
    // const template = document.querySelector("#template-balance");
    // const templateNFT = document.querySelector("#template-nft");
  
    // const accountContainer = document.querySelector("#accounts");
    // const nftContainer = document.querySelector("#nft")
  
    // Purge UI elements any previously loaded accounts
    // accountContainer.innerHTML = '';
    // nftContainer.innerHTML = '';
    
    const contract = new web3.eth.Contract(tokenURIABI, tokenContract)
  
    // Go through all accounts and get their ETH balance
    const rowResolvers = accounts.map(async (address) => {
      web3.eth.getBalance(address);
      const balance = await web3.eth.getBalance(address);
      console.log(balance);
      const nftBalance = await contract.methods.balanceOf(address).call();
      console.log(nftBalance);
  
      // ethBalance is a BigNumber instance
      // https://github.com/indutny/bn.js/
      const ethBalance = web3.utils.fromWei(balance, "ether");
      const humanFriendlyBalance = parseFloat(ethBalance).toFixed(4);
      console.log(humanFriendlyBalance);
      //Fill in the templated row and put in the document
      //const clone = template.content.cloneNode(true);
      //clone.querySelector(".address").textContent = address;
      //clone.querySelector(".balance").textContent = humanFriendlyBalance;
  
      //accountContainer.appendChild(clone);
  
    //   const nft = template.content.cloneNode(true);
    //   nft.querySelector(".address").textContent = "SUKA";
    //   nft.querySelector(".balance").textContent = nftBalance;
    //   nftContainer.appendChild(nft);
  
      for (let i = 0; i < nftBalance; i++) { 
        const nftToken = templateNFT.content.cloneNode(true);
        const tokenid = await contract.methods.tokenOfOwnerByIndex(address, i).call();
        //nftToken.querySelector(".address").textContent =  tokenid;
        const tokenURI  = await contract.methods.tokenURI(tokenid).call();
        console.log(tokenURI);
        //nftToken.querySelector(".balance").textContent = tokenURI;
  
        // let button = document.createElement("button");
        // button.setAttribute("onclick", `submitOwnershipProof(${tokenid}, "${selectedAccount.toString()}", "${tokenContract}")`);
        // button.textContent = "Download"
        // nftToken.querySelector(".download").appendChild(button);
        // nftContainer.appendChild(nftToken);      
      }
    });
  
    // Because rendering account does its own RPC commucation
    // with Ethereum node, we do not want to display any results
    // until data for all accounts is loaded
    await Promise.all(rowResolvers);
  
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
    await fetchAccountData(provider);
    document.querySelector("#btn-connect").removeAttribute("disabled")
}


/**
 * Connect wallet button pressed.
 */
async function onConnect() {

    console.log("Opening a dialog", web3Modal);
    try {
        provider = await web3Modal.connect();
    } catch (e) {
        console.log("Could not get a wallet connection", e);
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
    document.querySelector("#btn-connect").addEventListener("click", onConnect);
    document.querySelector("#btn-disconnect").addEventListener("click", onDisconnect);


    const canvas = document.getElementById("renderCanvas"); // Get the canvas element
    const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

    var createScene = function () {
        var scene = new BABYLON.Scene(engine);

        var environment = scene.createDefaultEnvironment({
            createSkybox: false,
            createGround: false,
            skyboxSize: 1,
            skyboxColor: BABYLON.Color3.White(),
            enableGroundShadow: false,
            groundYBias: 1
        });
        //scene.ambientColor = BABYLON.Color3.White();
        scene.clearColor = new BABYLON.Color4(0.0, 0.0, 0.0, 0.0);
        //var camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 2, 40, new BABYLON.Vector3(0, 0, 0), scene);
        var camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 2.5, 6.5), scene);
        // This targets the camera to scene origin
        camera.setTarget(new BABYLON.Vector3(0, 0.2, 0));


        let scrollHeight = canvas.scrollHeight;
        let stop = false;
        BABYLON.SceneLoader.ImportMesh("", "/assets/glb/", "intro.glb", scene, function (newMeshes, particleSystems, skeletons, animationGroups) {
            animationGroups.forEach(animation => {
                animation.stop();
            });
            window.addEventListener("scroll", (event) => {
                let position = this.scrollY;
                if (!stop)
                    camera.setTarget(new BABYLON.Vector3(0, 0.2 + (position / (scrollHeight / 6)), 0));
                //camera.position.y = camera.position.y + (position/(scrollHeight/6))
                animationGroups.forEach(animation => {
                    let key = ((position / scrollHeight) * animation.to) * 3.5
                    if (key < animation.to && key > 0) {
                        stop = false;
                        animation.start(false, 1, key, key, false);
                    } else if (animation.to > 0) {
                        stop = true;
                    }
                });
            });
        });
        return scene;
    };

    // Add your code here matching the playground format

    const scene = createScene(); //Call the createScene function

    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop(function () {
        scene.render();
    });

    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () {
        engine.resize();
    });
})

