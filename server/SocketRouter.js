const socketHandlers = require(`${__dirname}/socketHandlers`);

class SocketRouter {
  constructor(socket = null, io = null) {
    if (!(socket || io))
      throw new Error('socket and io params required');

      // registerHandlers
      Object.keys(socketHandlers).map(handlerName => {
        const handler = socketHandlers[handlerName]({ socket, io });
        socket.on(`${handlerName}`, handler);
      });
    }
}

module.exports = SocketRouter;