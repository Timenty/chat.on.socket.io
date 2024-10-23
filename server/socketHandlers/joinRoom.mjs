import { userJoin, getOnlineUsers } from '../utils/users.mjs';
import { messageOps } from '../utils/redis.mjs';

export default function joinRoom({ io, socket }) {
  return async ({ userName, tag }) => {
    const user = await userJoin(socket.id, userName, tag);
    const onlineUsers = await getOnlineUsers();
    
    // Get recent messages from Redis
    const recentMessages = await messageOps.getRecentMessages(50);

    // Send message history to the joining user
    socket.emit('messageHistory', recentMessages);

    // Welcome current user
    socket.emit('message', {
      userName: 'Admin',
      text: `Welcome ${userName}!`,
      time: new Date(),
      id: 'system'
    });

    // Broadcast when a user connects
    socket.broadcast.emit('user joined', {
      userName,
      tag,
      time: new Date(),
      numUsers: onlineUsers.length
    });

    // Send users info
    io.emit('onlineUsers', onlineUsers);
  };
};
