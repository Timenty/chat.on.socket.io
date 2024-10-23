/**
 * Format message
 * @param { string } userName
 * @param { string } text
 * @param { string } id
 * @param { boolean } isPrivate
 * @param { string } senderTag
 * @returns { Object } message
 */
export const formatMessage = (userName, text, id, isPrivate = false, senderTag = null) => {
  return {
    id,
    userName,
    text,
    time: new Date(),
    isPrivate,
    senderTag
  };
};
