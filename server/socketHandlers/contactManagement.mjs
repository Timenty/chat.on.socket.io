import { getCurrentUser, addContact, getUserContacts, getUserByTag } from '../utils/users.mjs';

const contactManagement = ({ socket, io }) => {
  // Add contact handler
  socket.on('addContact', ({ contactTag }) => {
    const user = getCurrentUser(socket.id);
    
    if (!user) {
      return socket.emit('contactError', {
        error: 'You must be logged in to add contacts'
      });
    }

    const success = addContact(socket.id, contactTag);
    if (!success) {
      return socket.emit('contactError', {
        error: 'Unable to add contact. User not found or invalid tag.'
      });
    }

    // Get updated contacts list
    const contacts = getUserContacts(socket.id);
    socket.emit('contactsUpdated', { contacts });

    // Notify the added contact
    const contact = getUserByTag(contactTag);
    if (contact && contact.id) {
      io.to(contact.id).emit('contactRequest', {
        from: user.tag,
        userName: user.userName
      });
    }
  });

  // Get contacts list handler
  socket.on('getContacts', () => {
    const user = getCurrentUser(socket.id);
    
    if (!user) {
      return socket.emit('contactError', {
        error: 'You must be logged in to view contacts'
      });
    }

    const contacts = getUserContacts(socket.id);
    socket.emit('contactsList', { contacts });
  });

  return () => {}; // Return empty handler as main logic is in socket.on
};

export default contactManagement;
