import { query, Router } from 'express';
import path from 'path';
import url from 'url';;
import * as dotenv from 'dotenv' 
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

dotenv.config({
    path: __dirname+'/../../blockchain/.env'
})

const CONTRACT_ADDRESS =  process.env.CONTRACT_ADDRESS


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
        res.json(JSON.stringify({
            result: "success"
        }));
    });
    return api;
}
