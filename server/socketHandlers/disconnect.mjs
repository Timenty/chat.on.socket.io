import { userLeave, getRoomUsers } from '../utils/users.mjs';
import { formatMessage } from '../utils/messages.mjs';
import { nanoid } from 'nanoid';

const disconnect = ({ socket, io }) => {
  return () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit('message', formatMessage('System', `${user.userName} has left the chat`, nanoid()));
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }

    // Remove all listeners
    socket.removeAllListeners();
  };
};

export default disconnect;