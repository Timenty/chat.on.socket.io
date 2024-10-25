import { userJoin, getOnlineUsers } from '../utils/users.mjs';
import { messageOps } from '../utils/redis.mjs';

export default function joinRoom({ io, socket }) {
  return async ({ userName }) => {
    const user = await userJoin(socket.id, userName);  // userName now contains both name and tag
    const onlineUsers = await getOnlineUsers();
    
    // Get recent messages from Redis
    const recentMessages = await messageOps.getRecentMessages(50);

    // Send message history to the joining user
    socket.emit('messageHistory', recentMessages);

    // Welcome current user
    socket.emit('message', {
      userName: 'Admin',
      text: `Welcome ${userName.split('#')[0]}!`,  // Extract display name for welcome message
      time: new Date(),
      id: 'system'
    });

    // Broadcast when a user connects
    socket.broadcast.emit('user joined', {
      userName,  // Send full userName
      time: new Date(),
      numUsers: onlineUsers.length
    });

    // Send users info
    io.emit('onlineUsers', onlineUsers);
  };
};
