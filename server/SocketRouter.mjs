import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Список событий, требующих аутентификации
 * Эти события будут обрабатываться только для аутентифицированных пользователей
 */
const protectedEvents = [
  'chatMessage',      // Отправка сообщения в чат
  'privateMessage',   // Отправка личного сообщения
  'typing',          // Уведомление о наборе текста
  'typingStop',      // Уведомление о прекращении набора текста
  'contactManagement' // Управление контактами
];

/**
 * Асинхронно загружает все обработчики сокетов
 * @returns {Promise<Object>} Объект с обработчиками событий
 */
async function loadSocketHandlers() {
  const socketHandlersIndexPath = join(__dirname, 'socketHandlers', 'index.mjs');
  const handlersModule = await import(socketHandlersIndexPath);
  return handlersModule.default;
}

/**
 * Класс маршрутизатор сокетов
 * Отвечает за:
 * - Загрузку и подключение обработчиков событий
 * - Проверку аутентификации для защищенных событий
 * - Управление состоянием аутентификации
 */
export class SocketRouter {
  /**
   * @param {Socket} socket - Экземпляр сокета клиента
   * @param {Server} io - Экземпляр Socket.IO сервера
   */
  constructor(socket = null, io = null) {
    if (!socket || !io) throw new Error('socket and io params required');

    // Асинхронно загружаем и подключаем обработчики событий
    loadSocketHandlers().then(socketHandlers => {
      Object.keys(socketHandlers).forEach(eventName => {
        const handler = socketHandlers[eventName];
        if (typeof handler === 'function') {
          // Оборачиваем защищенные события в проверку аутентификации
          if (protectedEvents.includes(eventName)) {
            socket.on(eventName, this.authenticateHandler(socket, handler({ socket, io })));
          } else {
            // Незащищенные события подключаются напрямую
            socket.on(eventName, handler({ socket, io }));
          }
        } else {
          console.error(`Handler for event "${eventName}" is not a function`);
        }
      });
    }).catch(err => {
      console.error('Failed to load socket handlers:', err);
    });
  }

  /**
   * Middleware для проверки аутентификации сокета
   * Оборачивает обработчик события проверкой аутентификации
   * 
   * @param {Socket} socket - Экземпляр сокета
   * @param {Function} handler - Функция обработчик события
   * @returns {Function} Обработчик с проверкой аутентификации
   */
  authenticateHandler(socket, handler) {
    return (...args) => {
      // Проверяем наличие callback функции в аргументах
      const callback = args[args.length - 1];
      const isCallback = typeof callback === 'function';
      
      // Если сокет не аутентифицирован, возвращаем ошибку
      if (!this.isAuthenticated(socket)) {
        const error = { error: 'Authentication required' };
        if (isCallback) {
          return callback(error);
        }
        return socket.emit('error', error);
      }

      // Если аутентификация прошла, вызываем оригинальный обработчик
      return handler(...args);
    };
  }

  /**
   * Проверяет, аутентифицирован ли сокет
   * @param {Socket} socket - Сокет для проверки
   * @returns {boolean} true если сокет аутентифицирован
   */
  isAuthenticated(socket) {
    return socket.auth?.authorized === true;
  }

  /**
   * Получает данные аутентифицированного пользователя из сокета
   * @param {Socket} socket - Сокет для получения данных
   * @returns {object|null} Данные пользователя или null
   */
  getAuthUser(socket) {
    return socket.auth?.user || null;
  }
}
