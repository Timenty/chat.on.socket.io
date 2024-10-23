let users = [];

function generateTag() {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let tag = '';
  for (let i = 0; i < 4; i++) {
    tag += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return tag;
}

/**
 * Join user to chat
 * @param { string } id
 * @param { string } userName
 * @param { string } room
 * @returns { User } user
 */
export const userJoin = (id, userName, room) => {
  const existingUser = users.find(u => u.userName === userName);
  if (existingUser) {
    // Preserve contacts array and other properties while updating connection details
    existingUser.id = id;
    existingUser.room = room;
    existingUser.lastSeen = new Date();
    return users;
  }

  const tag = generateTag();
  const user = { 
    id, 
    userName, 
    room,
    tag: `${userName}#${tag}`,
    contacts: [],
    lastSeen: new Date()
  };
  
  users = [...users, user];
  return users;
};

/**
 * Get current user
 * @param { string } id 
 * @returns { User } user
 */
export const getCurrentUser = (id) => users.find(user => user.id === id);

/**
 * Get user by tag
 * @param { string } tag 
 * @returns { User } user
 */
export const getUserByTag = (tag) => users.find(user => user.tag === tag);

/**
 * Add contact
 * @param { string } userId
 * @param { string } contactTag
 * @returns { boolean } success
 */
export const addContact = (userId, contactTag) => {
  const user = getCurrentUser(userId);
  const contact = getUserByTag(contactTag);
  
  if (!user || !contact || user.id === contact.id) {
    return false;
  }

  if (!user.contacts.includes(contactTag)) {
    user.contacts.push(contactTag);
  }
  
  return true;
};

/**
 * Get user contacts
 * @param { string } userId
 * @returns { Array<User> } contacts
 */
export const getUserContacts = (userId) => {
  const user = getCurrentUser(userId);
  if (!user) return [];
  
  return user.contacts.map(tag => {
    const contact = getUserByTag(tag);
    if (!contact) return null;
    
    return {
      userName: contact.userName,
      tag: contact.tag,
      status: contact.id ? 'online' : 'offline',
      lastSeen: contact.lastSeen
    };
  }).filter(Boolean);
};

/**
 * User leaves chat
 * @param { string } id
 * @returns { Array<User> } array of users
 */
export const userLeave = (id) => {
  const user = getCurrentUser(id);
  if (user) {
    user.id = null;
    user.room = null;
    user.lastSeen = new Date();
  }
  return users.filter(user => user.id !== null);
};

/**
 * Get room users
 * @param { string } room
 * @returns { Array<User> } array of users
 */
export const getRoomUsers = (room) => users.filter(user => user.room === room);

/**
 * Get all users
 */
export const getAllUsers = () => users;
