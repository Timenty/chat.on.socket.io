import { getCurrentUser } from '../utils/users.mjs';

const typingStop = ({ socket, io }) => {
  return async () => {
    const user = await getCurrentUser(socket.id);
    if (!user) return;

    // Broadcast stop typing event to all users except sender
    socket.broadcast.emit('stop typing', {
      userName: user.userName,
      tag: user.tag
    });
  };
};

export default typingStop;
