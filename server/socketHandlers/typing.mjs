import { getCurrentUser } from '../utils/users.mjs';

const typing = ({ socket, io }) => {
  return async () => {
    const user = await getCurrentUser(socket.id);
    if (!user) return;

    // Broadcast typing event to all users except sender
    socket.broadcast.emit('typing', {
      userName: user.userName  // userName now contains both name and tag
    });
  };
};

export default typing;
