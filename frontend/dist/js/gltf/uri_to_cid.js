async function convertURItoCID(gltf) {

    let cloned = _.cloneDeep(gltf);
    base64_prefix = "data:application/octet-stream;base64,";
    cid_prefix = "data:application/cid;base64,";
    for (const buffer of cloned.buffers) {
        current_uri = buffer.uri;
        if (current_uri.startsWith("data:application/octet-stream;base64,")) {
            base64_data = current_uri.replace(base64_prefix, "");
            console.log(base64_data);
            let cid = null;
            if (localNode != null) {                
                cid = await saveToBrowserIPFS(base64_data);

                if (await db.cacheCID.get(cid) == null) {
                    try{
                        db.cacheCID.put({
                            cid: cid, 
                            base64: base64_data
                        });
                    } catch(error) {
                        console.error(error);
                    }
                    saveToRemoteIPFS(base64_data);
                }
            } else {
                cid = await saveToRemoteIPFS(base64_data);
            }

            cid_uri = cid_prefix + cid;

            buffer.uri = cid_uri;
        } 
    }

    return cloned;
}

async function convertToDataURI(gltf) {
    let cloned = _.cloneDeep(gltf);
    base64_prefix = "data:application/octet-stream;base64,";
    cid_prefix = "data:application/cid;base64,";
    for (const buffer of cloned.buffers) {
        current_uri = buffer.uri;
        if (current_uri.startsWith("data:application/cid;base64,")) {
            cid_uri = current_uri.replace(cid_prefix, "");
            let base64 = await db.cacheCID.get(cid_uri) 
            ;
            if (base64 == null) {
                base64 = await getBase64FromRemoteIPFS(cid_uri);
                try {
                    localStorage.setItem(cid_uri, base64);
                    db.cacheCID.Put({
                        cid: cid_uri, 
                        base64: base64
                    });
                } catch(err) {
                    console.error("Unable to store to local cache will clear");
                }
            }
            base64_uri = base64_prefix + base64.base64;

            buffer.uri = base64_uri;
        } 
    }
    return cloned;
}