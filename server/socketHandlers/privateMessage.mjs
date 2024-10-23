import { getCurrentUser, getUserByTag } from '../utils/users.mjs';
import { formatMessage } from '../utils/messages.mjs';
import { nanoid } from 'nanoid';

const privateMessage = ({ socket, io }) => {
  return ({ message, recipientTag }) => {
    const sender = getCurrentUser(socket.id);
    const recipient = getUserByTag(recipientTag);

    if (!sender || !recipient || !recipient.id) {
      return socket.emit('messageError', {
        error: 'Unable to send private message. User may be offline.'
      });
    }

    const formattedMessage = formatMessage(
      sender.userName,
      message,
      nanoid(),
      true, // isPrivate
      sender.tag
    );

    // Send to recipient
    io.to(recipient.id).emit('privateMessage', {
      ...formattedMessage,
      from: sender.tag
    });

    // Send confirmation to sender
    socket.emit('privateMessage', {
      ...formattedMessage,
      to: recipient.tag
    });
  };
};

export default privateMessage;
