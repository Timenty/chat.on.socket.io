import { userLeave } from '../utils/users.mjs';
import { formatMessage } from '../utils/messages.mjs';
import { nanoid } from 'nanoid';

const disconnect = ({ socket, io }) => {
  return async () => {
    await userLeave(socket.id);

    // Remove all listeners
    socket.removeAllListeners();
  };
};

export default disconnect;
