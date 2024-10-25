import { messageOps } from './redis.mjs';

/**
 * Форматирует и сохраняет сообщение
 * @param {string} userName - Полное имя отправителя (включая тег)
 * @param {string} text - Текст сообщения
 * @param {boolean} isPrivate - Флаг приватного сообщения
 * @param {string} to - Полное имя получателя (включая тег)
 * @param {string} from - Полное имя отправителя (включая тег)
 * @returns {Promise<Object>} Отформатированное и сохраненное сообщение
 */
export async function formatMessage(userName, text, isPrivate = false, to = '', from = '') {
  // Сохраняем сообщение в Redis и получаем сохраненную версию
  const message = await messageOps.saveMessage({
    userName,   // Полное имя пользователя (включая тег)
    text,       // Текст сообщения
    isPrivate,  // Флаг приватности (для личных сообщений)
    to,         // Полное имя получателя
    from        // Полное имя отправителя
  });
  
  return message;
}

/**
 * Получает последние сообщения из истории
 * @param {number} limit - Максимальное количество сообщений
 * @returns {Promise<Array>} Массив последних сообщений
 */
export async function getRecentMessages(limit = 50) {
  return await messageOps.getRecentMessages(limit);
}

/**
 * Получает историю личных сообщений между двумя пользователями
 * @param {string} from - Полное имя первого пользователя (включая тег)
 * @param {string} to - Полное имя второго пользователя (включая тег)
 * @param {number} limit - Максимальное количество сообщений
 * @returns {Promise<Array>} Массив личных сообщений
 */
export async function getPrivateMessages(from, to, limit = 50) {
  return await messageOps.getPrivateMessages(from, to, limit);
}
