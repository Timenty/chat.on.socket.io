import { formatMessage } from '../utils/messages.mjs';
import { getCurrentUser } from '../utils/users.mjs';
import { sessionOps } from '../utils/redis.mjs';

export default function privateMessage({ io, socket }) {
  return async ({ message, recipientTag }) => {
    const user = await getCurrentUser(socket.id);
    
    if (!user) {
      return;
    }

    // Create message for recipient
    const formattedMessage = await formatMessage(
      user.userName,
      message,
      true,
      user.tag,  // senderTag
      recipientTag,  // to
      user.tag   // from
    );

    const targetSession = await sessionOps.getSession(recipientTag);
    
    if (targetSession) {
      // Send to recipient
      io.to(targetSession.socketId).emit('privateMessage', {
        ...formattedMessage,
        isRecipient: true
      });
    }
    
    // Send to sender
    socket.emit('privateMessage', {
      ...formattedMessage,
      isSender: true
    });
  };
}
