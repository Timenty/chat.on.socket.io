import { userOps, sessionOps } from './redis.mjs';

export async function userJoin(id, userName) {
  const user = { id, userName };  // userName now contains both name and tag
  await userOps.saveUser(user);
  await sessionOps.createSession(id, id); // Using id as socketId for simplicity
  return user;
}

export async function getCurrentUser(id) {
  return await userOps.getUser(id);
}

export async function userLeave(id) {
  await userOps.updateUserStatus(id, 'offline');
  await sessionOps.removeSession(id);
}

export async function getOnlineUsers() {
  return await userOps.getOnlineUsers();
}

export async function addContact(userId, contactUserName) {
  await userOps.addContact(userId, contactUserName);
}

export async function removeContact(userId, contactUserName) {
  await userOps.removeContact(userId, contactUserName);
}

export async function getContacts(userId) {
  return await userOps.getContacts(userId);
}
