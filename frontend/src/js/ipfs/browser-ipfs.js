localNode = null;
var db = null;

async function saveToBrowserIPFS(data) {
    const results = await localNode.add(data);
    const cid = results.path
    return cid;
}

window.addEventListener('DOMContentLoaded', async event => {
    var init_browser_ipfs = async function (){
        localNode = await Ipfs.create({
            config: {
              EXPERIMENTAL: {
                pubsub: false,
                libp2p: false
              }              
            }
          });

    }();
    db = new Dexie("sukaDB");
    db.version(1).stores({
        cacheCID: `
          cid,
          base64`,
        cachSignature: `
            tokenId,
            signature
        `,
      });
});