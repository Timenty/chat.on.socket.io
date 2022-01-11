const { userLeave, getRoomUsers } = require("../utils/users");
const { formatMessage } = require("../utils/messages");
const { nanoid } = require("nanoid");

const disconnect = ({ socket, io }) => {
  // Runs when client disconnects
  return () => {
    const user = userLeave(socket.id);

    if (!user) return;

    io.to(user.room).emit(
      'message',
      formatMessage('kekSystem', `${user.userName} has left the chat`, nanoid())
    );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  };
};

module.exports = disconnect;