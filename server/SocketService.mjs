import { Server } from 'socket.io';
import { SocketRouter } from './SocketRouter.mjs';

const socketIOConfig = {
  cors: {
    origin: ["http://127.0.0.1:8080", "http://localhost:8080"],
    methods: ["GET", "POST"]
  }
};

export class SocketService {
  io;
  /**
   * @param {http.Server} server 
   */
  constructor(server = null) {
    console.log('Initializing SocketService...');
    this.__setup(server);
  }

  /**
   * @param {http.Server} server 
   */
  __setup(server) {
    if (!server) {
      throw new Error('server param missing');
    }

    this.io = new Server(server, socketIOConfig); // Исправление здесь
    this.io.on('connection', socket => {
      console.log('socket connected', socket.id);
      new SocketRouter(socket, this.io);
    });

    this.io.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });
  }
}
