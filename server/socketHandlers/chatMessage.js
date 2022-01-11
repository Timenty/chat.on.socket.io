const { getCurrentUser } = require("../utils/users");
const { formatMessage } = require("../utils/messages");
const { nanoid } = require("nanoid");

const chatMessage = ({ socket }) => {
  // Listen for chatMessage
  return ({ message }) => {
    const user = getCurrentUser(socket.id);
    if (!user) return;

    console.log(
      'io to user.room emit message',
      user,
      formatMessage(user.userName, message, nanoid())
    );

    socket.to(user.room)
          .emit(
            'message',
            formatMessage(user.userName, message, nanoid())
          );
  };
};

module.exports = chatMessage;
