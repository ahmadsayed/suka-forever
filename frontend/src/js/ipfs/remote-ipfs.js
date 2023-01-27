async function saveLedgerToRemoteIPFS() {
    let response = await saveToRemoteIPFS(JSON.stringify(gltf));
    let cid = response["/"];
    let latestCID = await getLatest(currentSuka.name);
    const snapshot = await screenshot();
    let img = await saveToRemoteIPFS(JSON.stringify({
        image: snapshot
    }));
    img = img["/"];
    microLedger = {
        prev: latestCID,
        ts: new Date(new Date().getTime()).toLocaleString(),
        img: img,
        cid: cid
    };
    let ledgerCID = await saveToRemoteIPFS(JSON.stringify(microLedger));
    console.log('CID created via ipfs.add:', ledgerCID)
    updateContract(currentSuka.name, ledgerCID["/"]);
    // Save to localStorage till user decide to publish 
    localStorage.setItem(currentSuka.name, ledgerCID["/"]);
}


async function remoteMicroLedgerToList(cid) {
    const historyItems = await (await fetch(`/api/microledger/${cid}`)).json();
    return historyItems;
}

async function getLatest(name) {
    const response = await (await fetch(`/api/latest-ipfs/${name}`)).json();
    return response.cid;
}

async function saveToRemoteIPFS(data) {
    document.getElementById("remote-save").disabled = true;

    const response = await fetch(`/api/push-ipfs`, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer',
        body: data
    });
    const res = await response.json();

    return res;
}

async function updateContract(name, cid) {
    const response = await fetch(`/api/update-contract`, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
            name: name,
            cid: cid
        })
    });
    updateHistoryList();

    // return await response.json();
}