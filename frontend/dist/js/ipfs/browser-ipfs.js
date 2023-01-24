async function saveToIPFS() {
    const results = await node.add(JSON.stringify(gltf));
    const cid = results.path
    // localStorage.setItem(currentSuka.name, cid);

    microLedger = {
        prev: localStorage.getItem(currentSuka.name),
        ts: new Date(new Date().getTime()).toLocaleString(),
        cid: cid
    };
    const updateLedger = await node.add(JSON.stringify(microLedger));

    console.log('CID created via ipfs.add:', cid)
    localStorage.setItem(currentSuka.name, updateLedger.path);
    //document.getElementById("ipfs-save").disabled = true;

    updateHistoryList();

}

async function cacheToIPFS() {
    sukas.forEach(async suka => {
        fetch(suka.gltf)
            .then(res => res.json())
            .then(async gltf => {
                const results = await node.add(JSON.stringify(gltf));
                const cid = results.path
                // localStorage.setItem(currentSuka.name, cid);

                microLedger = {
                    prev: localStorage.getItem(suka.name),
                    ts: new Date(new Date().getTime()).toLocaleString(),
                    cid: cid
                };

                const updateLedger = await node.add(JSON.stringify(microLedger));

                console.log('CID created via ipfs.add:', updateLedger.path)
                localStorage.setItem(suka.name, updateLedger.path);
            })


    })

}

async function microLedgerToList(cid, cids = []) {
    const data = JSON.parse(await getFromIPFS(cid));
    cids.push(data);
    if (data.prev != null) {
        await microLedgerToList(data.prev, cids);
    }
    return cids;
}