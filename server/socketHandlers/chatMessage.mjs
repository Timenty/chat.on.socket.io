import { getCurrentUser } from '../utils/users.mjs';
import { formatMessage } from '../utils/messages.mjs';
import { nanoid } from 'nanoid';

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

export default chatMessage;