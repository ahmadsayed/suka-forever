import { query, Router } from 'express';
import path from 'path';
import url from 'url';;
import * as dotenv from 'dotenv' 
import  request  from 'request';
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

dotenv.config({
    path: __dirname+'/../../blockchain/.env'
})

const CONTRACT_ADDRESS =  process.env.CONTRACT_ADDRESS

const ASSETS_IPFS = process.env.ASSETS_IPFS

import authenticate from "./authentication.js"; 
export default () => {
    let api = Router();
    // perhaps expose some API metadata at the root
    api.use(authenticate);
    api.get('/contract_address', (req, res) => {
        res.json({ contract_address:  CONTRACT_ADDRESS});
    });

    api.get('/download', async (req, res) => {
        //let addressx = await web3.eth.accounts.recover(req.body.message ,req.body.signature);
        //console.log(addressx);
        let zipURL = `https://cloudflare-ipfs.com/ipfs/${ASSETS_IPFS}/${res.locals.tokenID}.zip`;
        console.log(`Address ${res.locals.userAddress} downloaded the assets from ${zipURL}`);
        request(zipURL).pipe(res);
    });
    return api;
}
