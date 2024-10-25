import { formatMessage } from '../utils/messages.mjs';
import { getCurrentUser } from '../utils/users.mjs';

/**
 * Обработчик сообщений чата
 * @param {Object} params - Параметры обработчика
 * @param {Object} params.io - Экземпляр Socket.IO сервера
 * @param {Object} params.socket - Сокет подключенного клиента
 * @returns {Function} Функция обработки сообщения
 */
export default function chatMessage({ io, socket }) {
  /**
   * Функция обработки входящего сообщения
   * @param {Object} message - Объект сообщения
   * @param {string} message.text - Текст сообщения
   * @param {string} message.to - Получатель сообщения (полное имя включая тег)
   */
  return async (message) => {
    // Получаем информацию о текущем пользователе по ID сокета
    const user = await getCurrentUser(socket.id);
    
    // Если пользователь не найден, прерываем обработку
    if (!user) {
      return;
    }

    // Форматируем сообщение перед отправкой
    const formattedMessage = await formatMessage(
      user.userName, // Полное имя отправителя (включая тег)
      message.text,
      false,
      message.to,    // Полное имя получателя (если есть)
      user.userName  // Полное имя отправителя
    );

    // Отправляем отформатированное сообщение всем подключенным клиентам
    // В клиентском коде сообщение будет отфильтровано и показано только нужным получателям
    io.emit('message', formattedMessage);
  };
}
