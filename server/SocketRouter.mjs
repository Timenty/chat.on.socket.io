import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// List of events that require authentication
const protectedEvents = [
  'chatMessage',
  'privateMessage',
  'typing',
  'typingStop',
  'contactManagement'
];

async function loadSocketHandlers() {
  const socketHandlersIndexPath = join(__dirname, 'socketHandlers', 'index.mjs');
  const handlersModule = await import(socketHandlersIndexPath);
  return handlersModule.default;
}

export class SocketRouter {
  constructor(socket = null, io = null) {
    if (!socket || !io) throw new Error('socket and io params required');

    loadSocketHandlers().then(socketHandlers => {
      Object.keys(socketHandlers).forEach(eventName => {
        const handler = socketHandlers[eventName];
        if (typeof handler === 'function') {
          // Wrap handler with authentication check for protected events
          if (protectedEvents.includes(eventName)) {
            socket.on(eventName, this.authenticateHandler(socket, handler({ socket, io })));
          } else {
            socket.on(eventName, handler({ socket, io }));
          }
        } else {
          console.error(`Handler for event "${eventName}" is not a function`);
        }
      });
    }).catch(err => {
      console.error('Failed to load socket handlers:', err);
    });
  }

  /**
   * Middleware to check if the socket is authenticated
   * @param {Socket} socket - The socket instance
   * @param {Function} handler - The event handler function
   * @returns {Function} - Wrapped handler with authentication check
   */
  authenticateHandler(socket, handler) {
    return (...args) => {
      const callback = args[args.length - 1];
      const isCallback = typeof callback === 'function';
      
      if (!this.isAuthenticated(socket)) {
        const error = { error: 'Authentication required' };
        if (isCallback) {
          return callback(error);
        }
        return socket.emit('error', error);
      }

      return handler(...args);
    };
  }

  /**
   * Check if a socket is authenticated
   * @param {Socket} socket - The socket to check
   * @returns {boolean}
   */
  isAuthenticated(socket) {
    return socket.auth?.authorized === true;
  }

  /**
   * Get authenticated user data from socket
   * @param {Socket} socket - The socket to get user data from
   * @returns {object|null}
   */
  getAuthUser(socket) {
    return socket.auth?.user || null;
  }
}
