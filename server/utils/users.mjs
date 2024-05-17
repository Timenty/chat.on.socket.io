let users = [];

/**
 * Join user to chat
 * @param { string } id
 * @param { string } userName
 * @param { string } room
 * @returns { User } user
 */
export const userJoin = (id, userName, room) => {
  const user = { id, userName, room };

  users = [...users, user];

  return user;
};

/**
 * Get current user
 * @param { string } id 
 * @returns { User } user
 */
export const getCurrentUser = (id) => users.find(user => user.id === id);

/**
 * User leaves chat
 * @param { string } id
 * @returns { Array<User> } array of users
 */
export const userLeave = (id) => {
  users = users.filter(user => user.id !== id);
  return users;
};

/**
 * Get room users
 * @param { string } room
 * @returns { Array<User> } array of users
 */
export const getRoomUsers = (room = 'unknown') => {
  return users.filter(user => user.room === room);
};
