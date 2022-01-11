const { getCurrentUser } = require("../utils/users");
const { formatMessage } = require("../utils/messages");
const { nanoid } = require("nanoid");

const typingStop = ({ socket: { id }, io }) => {
  // Listen for chatMessage
  return ({ message }) => {
    console.log('user stop typing');
//     socket.broadcast.emit('stop typing', {
//       username: socket.username
//     });
    // const user = getCurrentUser(id);
    // if (!user) return;
    // console.log('io to user.room emit message', user,formatMessage(user.userName, message, nanoid()));
    // io.to(user.room).emit('message', formatMessage(user.userName, message, nanoid()));
  };
};

module.exports = typingStop;
