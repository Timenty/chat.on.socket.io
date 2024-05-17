// Setup basic express server
import express from 'express';
import cors from 'cors';
import http from 'http';
import { SocketService } from './SocketService.mjs';

const app = express();
const server = http.createServer(app);

// Setup socket io
new SocketService(server);

// Middlewares
app.use(cors());

// Configure server
const CONNECTION = process.env.CONNECTION || 'http';
const DOMAIN = process.env.DOMAIN || 'localhost';
const PORT = process.env.PORT || 3000;

// Server start
server.listen(PORT, () => {
  console.log(`Server listening at port: ${PORT}`);
  console.log(`url: ${CONNECTION}://${DOMAIN}:${PORT}`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
});
