import { userJoin, getRoomUsers } from '../utils/users.mjs';
import { formatMessage } from '../utils/messages.mjs';
import { nanoid } from 'nanoid';

const joinRoom = ({ socket, io }) => {
  // Runs when client join to room
  return ({ userName, room }) => {
    const user = userJoin(socket.id, userName, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage('kekSystem', 'Welcome to ChatCord!'), nanoid());

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage('kekSystem', `${user.userName} has joined the chat`, nanoid())
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  };
};

export default joinRoom;