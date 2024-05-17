/**
 * @param {String} userName 
 * @param {String} text 
 * @returns {{
 *  uid: string,
 *  userName: String,
 *  message: String,
 *  time: number
 * }}
 */
export const formatMessage = (userName, message, uid) => ({
  uid,
  userName,
  message,
  time: Date.now(),
});
