import { formatMessage } from '../utils/messages.mjs';
import { getCurrentUser } from '../utils/users.mjs';

export default function chatMessage({ io, socket }) {
  return async (message) => {
    const user = await getCurrentUser(socket.id);
    
    if (!user) {
      return;
    }

    const formattedMessage = await formatMessage(
      user.userName,
      message.text,
      false,
      user.tag
    );

    io.emit('message', formattedMessage);
  };
}
