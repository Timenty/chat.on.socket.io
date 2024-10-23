import { Server } from 'socket.io';
import { SocketRouter } from './SocketRouter.mjs';
import { socketAuth, generateToken } from './middleware/socketAuth.mjs';
import { userJoin } from './utils/users.mjs';

const socketIOConfig = {
  cors: {
    origin: ["http://127.0.0.1:8080", "http://localhost:8080"],
    methods: ["GET", "POST"]
  }
};

export class SocketService {
  io;
  authenticatedSockets = new Map();

  /**
   * @param {http.Server} server 
   */
  constructor(server = null) {
    console.log('Initializing SocketService...');
    this.__setup(server);
  }

  /**
   * Generate a random 4-digit tag
   * @returns {string}
   */
  generateTag() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * @param {http.Server} server 
   */
  __setup(server) {
    if (!server) {
      throw new Error('server param missing');
    }

    this.io = new Server(server, socketIOConfig);
    
    // Apply authentication middleware
    this.io.use(socketAuth);

    this.io.on('connection', socket => {
      console.log('socket connected', socket.id);
      
      // Handle authentication
      socket.on('authenticate', async (userData, callback) => {
        try {
          // Generate a tag if one doesn't exist
          const userWithTag = {
            ...userData,
            tag: userData.tag || this.generateTag()
          };
          
          // Save user to Redis
          await userJoin(socket.id, userWithTag.userName, userWithTag.tag);
          
          const token = generateToken(userWithTag);
          this.authenticatedSockets.set(socket.id, {
            ...userWithTag,
            token
          });
          
          callback({ 
            success: true, 
            token,
            userData: userWithTag // Send back the complete user data including tag
          });
        } catch (error) {
          console.error('Authentication error:', error);
          callback({ success: false, error: 'Authentication failed' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.authenticatedSockets.delete(socket.id);
        console.log('socket disconnected', socket.id);
      });

      // Initialize socket router with auth context
      new SocketRouter(socket, this.io);
    });

    this.io.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });
  }

  /**
   * Get authenticated user data for a socket
   * @param {string} socketId 
   * @returns {object|null}
   */
  getAuthenticatedUser(socketId) {
    return this.authenticatedSockets.get(socketId) || null;
  }

  /**
   * Check if a socket is authenticated
   * @param {string} socketId 
   * @returns {boolean}
   */
  isAuthenticated(socketId) {
    return this.authenticatedSockets.has(socketId);
  }
}
