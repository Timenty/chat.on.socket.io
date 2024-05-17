import { getCurrentUser } from '../utils/users.mjs';
import { formatMessage } from '../utils/messages.mjs';
import { nanoid } from 'nanoid';

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

export default typingStop;