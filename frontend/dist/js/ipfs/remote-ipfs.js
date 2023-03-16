
async function getFromRemoteIPFS(cid) {
    const sukaURL = `https://ipfs.sukaverse.club/ipfs/${cid}`
    const json = await (await fetch(sukaURL)).json();
    return json;
}

async function getBase64FromRemoteIPFS(cid) {
    const sukaURL = `https://ipfs.sukaverse.club/ipfs/${cid}`
    const text = await (await fetch(sukaURL)).text();
    return text;
}
async function saveLedgerToRemoteIPFS() {
    $('.modal').modal('show');
    let response = await saveToRemoteIPFS(JSON.stringify(await convertURItoCID(gltf)));
    let cid = response;
    let latestCID = currentSuka != null ? localStorage.getItem(currentSuka.name) : null;
    const snapshot = await screenshot();
    document.getElementById("remote-save").disabled = true;
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

    // Save to localStorage till user decide to publish 
    localStorage.setItem(currentSuka.name, ledgerCID);
    updateHistoryList();
    $('.modal').modal('hide');

}



// async function remoteMicroLedgerToList(cid) {
//     const historyItems = await (await fetch(`/api/microledger/${cid}`)).json();
//     return historyItems;
// }


async function remoteMicroLedgerToList(cid, cids = []) {
    const data = await getFromRemoteIPFS(cid);
    cids.push(data);
    if (data.prev != null) {
        await remoteMicroLedgerToList(data.prev, cids);
    }
    return cids;
}
async function getLatest(name) {
    const response = await (await fetch(`/api/latest-ipfs/${name}`)).json();
    return response.cid;
}

async function saveToRemoteIPFS(data) {
    let { cid } = await client.add(data, {
        "authorization":  `Bearer ${authToken}`
    });
    return cid.toString();
}
