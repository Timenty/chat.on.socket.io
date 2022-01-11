const socketIO = require('socket.io');
const SocketRouter = require(`${__dirname}/SocketRouter`);
const socketIOConfig = {
  cors: {
    origin: "http://127.0.0.1:5000",
    methods: ["GET", "POST"]
  }
};

class SocketService {
  io;
  /**
   * @param {http.Server} server 
   */
  constructor(server = null) {
    this.__setup(server);
  }

  /**
   * @param {http.Server} server 
   */
  __setup(server) {
    if (!server) {
      throw new Error('server param missing');
    }

    this.io = socketIO(server, socketIOConfig);
    this.io.on('connection', socket => {
      console.log('socket connected', socket.id);
      new SocketRouter(socket, this.io);
    })
  }
}

module.exports = SocketService;
