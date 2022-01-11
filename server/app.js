// Setup basic express server
const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
const SocketService = require('./SocketService');
const server = http.createServer(app);
// Setup socket io
const socket = new SocketService(server);

// Middlewares
app.use(cors());

// Configure server
const CONNECTION = process.env.CONNECTION || 'http';
const DOMAIN = process.env.DOMAIN || 'localhost';
const PORT = process.env.PORT || 3000;

// Server start
server.listen(PORT, () => {
  console.log(`Server listening at port: ${PORT}`)
  console.log(`url: ${CONNECTION}://${DOMAIN}/${PORT}`)
});
