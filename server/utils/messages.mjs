import { messageOps } from './redis.mjs';

export async function formatMessage(userName, text, isPrivate = false, senderTag = '', to = '', from = '') {
  const message = await messageOps.saveMessage({
    userName,
    text,
    isPrivate,
    senderTag,
    to,
    from
  });
  
  return message;
}

export async function getRecentMessages(limit = 50) {
  return await messageOps.getRecentMessages(limit);
}

export async function getPrivateMessages(from, to, limit = 50) {
  return await messageOps.getPrivateMessages(from, to, limit);
}
