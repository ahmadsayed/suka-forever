import express from 'express';
import path from 'path';
import http from 'http';
import url from 'url';
import api from './api/index.js';
export const app = express();
const port = process.env.PORT || 9090;
export const server = http.createServer(app);
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

app.use(express.static(__dirname + '../public/'));

app.use(express.json());



app.use('/api', api());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});


server.listen(port);

console.log('Server started at http://localhost:' + port);