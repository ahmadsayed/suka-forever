import { query, Router } from 'express';
import path from 'path';
import url from 'url';

import * as dotenv from 'dotenv' 
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

dotenv.config({
    path: __dirname+'/../../blockchain/.env'
})
const CONTRACT_ADDRESS =  process.env.CONTRACT_ADDRESS

export default () => {
    let api = Router();
    // perhaps expose some API metadata at the root
    api.get('/contract_address', (req, res) => {
        res.json({ contract_address:  CONTRACT_ADDRESS});
    });
    return api;
}
