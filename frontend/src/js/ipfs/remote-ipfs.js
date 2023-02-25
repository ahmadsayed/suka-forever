
async function saveLedgerToRemoteIPFS() {
    $('.modal').modal('show');
    let response = await saveToRemoteIPFS(JSON.stringify(gltf));
    let cid = response;
    let latestCID = currentSuka != null ? localStorage.getItem(currentSuka.name) : null;
    const snapshot = await screenshot();
    let img = await saveToRemoteIPFS(JSON.stringify({
        image: snapshot
    }));
    microLedger = {
        prev: latestCID,
        ts: new Date(new Date().getTime()).toLocaleString(),
        img: img,
        cid: cid
    };
    let ledgerCID = await saveToRemoteIPFS(JSON.stringify(microLedger));
    console.log('CID created via ipfs.add:', ledgerCID)

    // Save to localStorage till user decide to publish 
    localStorage.setItem(currentSuka.name, ledgerCID);
    updateHistoryList();
    $('.modal').modal('hide');

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
    let { cid } = await client.add(data, {
        "authorization":  `Bearer ${authToken}`
    });
    // const response = await fetch(`/api/push-ipfs`, {
    //     method: 'POST',
    //     mode: 'cors',
    //     cache: 'no-cache',
    //     credentials: 'same-origin',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     referrerPolicy: 'no-referrer',
    //     body: data
    // });
    // const res = await response.json();

    return cid.toString();
}
