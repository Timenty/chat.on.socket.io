let users = [];

/**
 * Join user to chat
 * @param { string } id
 * @param { string } userName
 * @param { string } room
 * @returns { User } user
 */
const userJoin = (id, userName, room) => {
  const user = { id, userName, room };

  users = [...users, user];

  return user;
}

/**
 * Get current user
 * @param { string } id 
 * @returns { User } user
 */
const getCurrentUser = (id) => users.find(user => user.id === id);

/**
 * User leaves chat
 * @param { string } id
 * @returns { Array<User> } array of users
 */
const userLeave = (id) => {
  return users = users.filter(user => user.id !== id);
}

/**
 * Get room users
 * @param { string } room
 * @returns { Array<User> } array of users
 */
const getRoomUsers = (room = 'unknown') => {
  return users.filter(user => user.room === room)
};

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
};
