import { getCurrentUser } from '../utils/users.mjs';

const typingStop = ({ socket, io }) => {
  return async () => {
    const user = await getCurrentUser(socket.id);
    if (!user) return;

    // Broadcast typing stop event to all users except sender
    socket.broadcast.emit('typingStop', {
      userName: user.userName  // userName now contains both name and tag
    });
  };
};

export default typingStop;
