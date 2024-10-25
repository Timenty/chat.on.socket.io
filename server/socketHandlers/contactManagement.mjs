import { getCurrentUser } from '../utils/users.mjs';
import { userOps, sessionOps } from '../utils/redis.mjs';

const contactManagement = ({ socket, io }) => {
  // Add contact handler
  socket.on('addContact', async ({ contactUserName }) => {
    try {
      const user = await getCurrentUser(socket.id);
      
      if (!user) {
        return socket.emit('contactError', {
          error: 'You must be logged in to add contacts'
        });
      }

      // Check if contact exists
      const contactUser = await userOps.getUserByUserName(contactUserName);
      if (!contactUser) {
        return socket.emit('contactError', {
          error: 'User not found'
        });
      }

      await userOps.addContact(socket.id, contactUserName);

      // Get updated contacts list with full user data
      const contacts = await userOps.getContacts(socket.id);
      socket.emit('contactsUpdated', { contacts });

      // Notify the target user
      const targetSession = await sessionOps.getSession(contactUser.id);
      if (targetSession) {
        io.to(targetSession.socketId).emit('contactRequest', {
          from: user.userName,
          userName: user.userName
        });
      }
    } catch (error) {
      console.error('Contact management error:', error);
      socket.emit('contactError', {
        error: 'Unable to add contact. Please try again.'
      });
    }
  });

  // Get contacts list handler
  socket.on('getContacts', async () => {
    try {
      const user = await getCurrentUser(socket.id);
      
      if (!user) {
        return socket.emit('contactError', {
          error: 'You must be logged in to view contacts'
        });
      }

      // Get contacts list with full user data
      const contacts = await userOps.getContacts(socket.id);
      socket.emit('contactsList', { contacts });
    } catch (error) {
      console.error('Get contacts error:', error);
      socket.emit('contactError', {
        error: 'Unable to fetch contacts. Please try again.'
      });
    }
  });

  return () => {}; // Return empty handler as main logic is in socket.on
};

export default contactManagement;
