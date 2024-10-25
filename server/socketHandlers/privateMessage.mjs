import { formatMessage, getPrivateMessages } from '../utils/messages.mjs';
import { getCurrentUser } from '../utils/users.mjs';
import { sessionOps } from '../utils/redis.mjs';

/**
 * Обработчик приватных сообщений
 * Отвечает за отправку личных сообщений и получение истории чата
 * 
 * @param {Object} params - Параметры обработчика
 * @param {Server} params.io - Экземпляр Socket.IO сервера
 * @param {Socket} params.socket - Сокет отправителя
 */
export default function privateMessage({ io, socket }) {
  /**
   * Обработчик отправки приватного сообщения
   * 
   * @param {Object} params - Параметры сообщения
   * @param {string} params.message - Текст сообщения
   * @param {string} params.recipientUserName - Полное имя получателя (включая тег)
   */
  const handleSendMessage = async ({ message, recipientUserName }) => {
    // Получаем данные отправителя
    const user = await getCurrentUser(socket.id);
    
    // Если пользователь не найден, прерываем отправку
    if (!user) {
      return;
    }

    // Форматируем сообщение для отправки
    const formattedMessage = await formatMessage(
      user.userName,  // Полное имя отправителя (включая тег)
      message,
      true,
      recipientUserName,  // Полное имя получателя
      user.userName       // Полное имя отправителя
    );

    // Получаем активную сессию получателя из Redis
    const targetSession = await sessionOps.getSession(recipientUserName);
    
    if (targetSession) {
      // Отправляем сообщение получателю
      // Добавляем флаг isRecipient для клиентской логики
      io.to(targetSession.socketId).emit('privateMessage', {
        ...formattedMessage,
        isRecipient: true
      });
    }
    
    // Отправляем копию сообщения отправителю
    // Добавляем флаг isSender для клиентской логики
    socket.emit('privateMessage', {
      ...formattedMessage,
      isSender: true
    });
  };

  /**
   * Обработчик запроса истории чата
   * 
   * @param {Object} params - Параметры запроса
   * @param {string} params.contactUserName - Полное имя контакта (включая тег)
   */
  const handleGetChatHistory = async ({ contactUserName }) => {
    // Получаем данные запрашивающего пользователя
    const user = await getCurrentUser(socket.id);
    
    if (!user) {
      return;
    }

    // Получаем историю личных сообщений между пользователями из Redis
    const messages = await getPrivateMessages(user.userName, contactUserName);
    
    // Отправляем историю сообщений запросившему пользователю
    socket.emit('privateChatHistory', {
      contactUserName,
      messages
    });
  };

  // Регистрируем обработчики событий на сокете
  socket.on('privateMessage', handleSendMessage);     // Обработка отправки сообщения
  socket.on('getChatHistory', handleGetChatHistory); // Обработка запроса истории

  // Возвращаем основной обработчик для обратной совместимости
  // с системой аутентификации в SocketRouter
  return handleSendMessage;
}
