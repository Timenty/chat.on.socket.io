import { userOps, sessionOps } from './redis.mjs';

export async function userJoin(id, userName, tag) {
  const user = { id, userName, tag };
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

export async function addContact(userId, contactTag) {
  await userOps.addContact(userId, contactTag);
}

export async function removeContact(userId, contactTag) {
  await userOps.removeContact(userId, contactTag);
}

export async function getContacts(userId) {
  return await userOps.getContacts(userId);
}
