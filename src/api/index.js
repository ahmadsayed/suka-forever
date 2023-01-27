import { query, Router } from 'express';
import path from 'path';
import url from 'url';;
import * as dotenv from 'dotenv'
import request from 'request';
import fs from 'fs';

import { create } from 'ipfs-http-client'


const ipfs = create(new URL('http://ipfs.sukaverse.club:5001'))


const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

dotenv.config({
    path: __dirname + '/../../blockchain/.env'
})

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS

const ASSETS_IPFS = process.env.ASSETS_IPFS

import authenticate from "./authentication.js";
import { captureRejectionSymbol } from 'events';
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
        let zipURL = `https://ipfs.io/ipfs/${ASSETS_IPFS}/${res.locals.tokenID}.zip`;
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

    api.delete('/update-contract/:model', async (req, res) => {
        if (fs.existsSync(req.params.model)) {
            fs.unlinkSync(req.params.model);

        }
        res.send();
    });

    // TODO: Replace with smart Contract
    api.get('/latest-ipfs/:model', (req, res) => {
        if (fs.existsSync(req.params.model)) {
            let cid = fs.readFileSync(req.params.model, { encoding: 'utf8', flag: 'r' });
            res.send(JSON.stringify({
                cid: cid
            }))
        } else {
            res.send(
                JSON.stringify({
                    cid: null
                }
                ));
        }

    });
    async function getFromIPFS(cid) {
        let data = '';
        for await (const file of ipfs.cat(cid)) {

            const buffer = new Uint16Array(file);
            buffer.forEach(code => {
                data += String.fromCharCode(code);
            });
        }
        return data;
    }
    async function microLedgerToList(cid, cids = []) {
        const data = JSON.parse(await getFromIPFS(cid));
        cids.push(data);
        if (data.prev != null) {
            await microLedgerToList(data.prev, cids);
        }
        return cids;
    }
    api.get('/microledger/:cid', async (req, res) => {
        res.send(JSON.stringify(await microLedgerToList(req.params.cid)));
    });

    return api;
}
