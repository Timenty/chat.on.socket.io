import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
          socket.on(eventName, handler({ socket, io }));
        } else {
          console.error(`Handler for event "${eventName}" is not a function`);
        }
      });
    }).catch(err => {
      console.error('Failed to load socket handlers:', err);
    });
  }
}
