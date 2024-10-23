import { userJoin, getCurrentUser, getRoomUsers } from '../utils/users.mjs';
import { formatMessage } from '../utils/messages.mjs';

const joinRoom = ({ socket, io }) => {
  return ({ userName, room }) => {
    const users = userJoin(socket.id, userName, room);
    const user = getCurrentUser(socket.id);

    if (!user) {
      return socket.emit('error', { message: 'Unable to join room' });
    }

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(
      'Admin',
      `Welcome ${user.userName}! Your tag is ${user.tag}`,
      'system'
    ));

    // Send user info back to the client
    socket.emit('userInfo', {
      id: user.id,
      userName: user.userName,
      tag: user.tag,
      contacts: user.contacts
    });

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit('user joined', {
        userName: user.userName,
        tag: user.tag,
        time: new Date(),
        numUsers: getRoomUsers(user.room).length
      });

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  };
};

export default joinRoom;
