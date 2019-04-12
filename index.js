
require('dotenv').config();
const http = require('http');
const app = require('./server');

const port = process.env.PORT || 3000;

const server = http.createServer(app);
server.listen(port, () => console.log('server started...') );