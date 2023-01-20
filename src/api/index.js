import { query, Router } from 'express';
import path from 'path';
import url from 'url';;
import * as dotenv from 'dotenv'
import request from 'request';
import * as IPFS from 'ipfs-core';
import fs from 'fs';

const ipfs = await IPFS.create({
    Peering: {
        peers: [
            {
                "ID": "QmcfgsJsMtx6qJb74akCw1M24X1zFwgGo11h1cuhwQjtJP",
                "Addrs": ["/dnsaddr/node-8.ingress.cloudflare-ipfs.com"]
            }
        ]
    }
});

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

dotenv.config({
    path: __dirname + '/../../blockchain/.env'
})

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS

const ASSETS_IPFS = process.env.ASSETS_IPFS

import authenticate from "./authentication.js";
export default () => {
    let api = Router();
    // perhaps expose some API metadata at the root
    api.use(authenticate);
    api.get('/contract_address', (req, res) => {
        res.json({ contract_address: CONTRACT_ADDRESS });
    });

    api.get('/download', async (req, res) => {
        //let addressx = await web3.eth.accounts.recover(req.body.message ,req.body.signature);
        //console.log(addressx);
        let zipURL = `https://cloudflare-ipfs.com/ipfs/${ASSETS_IPFS}/${res.locals.tokenID}.zip`;
        console.log(`Address ${res.locals.userAddress} downloaded the assets from ${zipURL}`);
        request(zipURL).pipe(res);
    });

    api.post('/push-ipfs', async (req, res) => {
        const { cid } = await ipfs.add(JSON.stringify(req.body));

        res.send(cid.toJSON());
    });

    //TODO: Replace with smart contract
    api.post('/update-contract', async (req, res) => {

        fs.writeFile(req.body.name, req.body.cid, err => {
            if (err) {
                console.error(err);
            }
            // file written successfully
        });
        res.send();
    });

    // TODO: Replace with smart Contract
    api.get('/latest-ipfs/:model', (req, res) => {
        let cid = fs.readFileSync(req.params.model, { encoding: 'utf8', flag: 'r' });
        res.send({
            cid: cid
        })
    });

    return api;
}
