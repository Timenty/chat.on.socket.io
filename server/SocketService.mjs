import { Server } from 'socket.io';
import { SocketRouter } from './SocketRouter.mjs';
import { socketAuth, generateToken } from './middleware/socketAuth.mjs';
import { userJoin } from './utils/users.mjs';

/**
 * Конфигурация Socket.IO сервера
 * Разрешаем подключения только с локальных адресов для разработки
 */
const socketIOConfig = {
  cors: {
    origin: ["http://127.0.0.1:8080", "http://localhost:8080"],
    methods: ["GET", "POST"]
  }
};

/**
 * Основной класс для управления WebSocket соединениями
 * Отвечает за:
 * - Инициализацию Socket.IO сервера
 * - Аутентификацию пользователей
 * - Управление подключенными сокетами
 * - Маршрутизацию сообщений
 */
export class SocketService {
  io;  // Экземпляр Socket.IO сервера
  authenticatedSockets = new Map();  // Хранилище аутентифицированных сокетов

  /**
   * Создает новый экземпляр SocketService
   * @param {http.Server} server - HTTP сервер для привязки Socket.IO
   */
  constructor(server = null) {
    console.log('Initializing SocketService...');
    this.__setup(server);
  }

  /**
   * Генерирует случайный 4-значный тег для пользователя
   * Используется если пользователь не предоставил свой тег
   * @returns {string} Случайный тег в формате '1234'
   */
  generateTag() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * Настраивает Socket.IO сервер и обработчики событий
   * @param {http.Server} server - HTTP сервер для привязки Socket.IO
   * @private
   */
  __setup(server) {
    if (!server) {
      throw new Error('server param missing');
    }

    // Создаем экземпляр Socket.IO сервера
    this.io = new Server(server, socketIOConfig);
    
    // Подключаем middleware для аутентификации
    this.io.use(socketAuth);

    // Обработка нового подключения
    this.io.on('connection', socket => {
      console.log('socket connected', socket.id);
      
      // Обработка запроса на аутентификацию
      socket.on('authenticate', async (userData, callback) => {
        try {
          // Генерируем тег для пользователя, если он не предоставлен
          const userWithTag = {
            ...userData,
            tag: this.generateTag()
          };
          
          // Сохраняем пользователя в Redis для последующей синхронизации
          await userJoin(socket.id, userWithTag.userName, userWithTag.tag);
          
          // Генерируем JWT токен для пользователя
          const token = generateToken(userWithTag);

          // Сохраняем информацию об аутентифицированном пользователе
          this.authenticatedSockets.set(socket.id, {
            ...userWithTag,
            token
          });
          
          // Отправляем успешный ответ клиенту
          callback({ 
            success: true, 
            token,
            userData: userWithTag // Отправляем обратно полные данные пользователя с тегом
          });
        } catch (error) {
          console.error('Authentication error:', error);
          callback({ success: false, error: 'Authentication failed' });
        }
      });

      // Обработка отключения сокета
      socket.on('disconnect', () => {
        this.authenticatedSockets.delete(socket.id);
        console.log('socket disconnected', socket.id);
      });

      // Инициализируем маршрутизатор сокетов для данного подключения
      new SocketRouter(socket, this.io);
    });

    // Обработка ошибок Socket.IO сервера
    this.io.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });
  }

  /**
   * Получает данные аутентифицированного пользователя по ID сокета
   * @param {string} socketId - ID сокета
   * @returns {object|null} Данные пользователя или null, если не найден
   */
  getAuthenticatedUser(socketId) {
    return this.authenticatedSockets.get(socketId) || null;
  }

  /**
   * Проверяет, аутентифицирован ли сокет
   * @param {string} socketId - ID сокета
   * @returns {boolean} true если сокет аутентифицирован
   */
  isAuthenticated(socketId) {
    return this.authenticatedSockets.has(socketId);
  }
}
