# Описание Socket.IO API

## Клиентские события (emit)

### `authenticate`
- **Назначение**: Аутентификация пользователя на сервере
- **Параметры**: 
  - `userName`: string - Имя пользователя
- **Ответ**: Promise с данными:
  - `success`: boolean - Успешность операции
  - `token`: string (опционально) - Токен для последующих подключений
  - `userData`: object (опционально) - Данные пользователя
- **Описание**: Инициирует аутентификацию пользователя и получает токен для будущих подключений

### `privateMessage`
- **Назначение**: Отправка личного сообщения конкретному пользователю
- **Параметры**:
  - `message`: string - Текст сообщения
  - `recipientUserName`: string - Имя получателя
- **Описание**: Отправляет приватное сообщение, которое видит только указанный получатель

### `chatMessage`
- **Назначение**: Отправка сообщения в чат
- **Параметры**:
  - `message`: Объект ChatMessage, содержащий:
    - `text`: string - Содержание сообщения
    - `to`: string (опционально) - Имя получателя
- **Описание**: Отправляет сообщение, которое будет доставлено соответствующим получателям

### `getPrivateMessages`
- **Назначение**: Запрос истории чата с конкретным пользователем
- **Параметры**:
  - `contactUserName`: string - Имя пользователя контакта
- **Описание**: Получает историю сообщений между текущим пользователем и указанным контактом

## Серверные события (on)

### `connect`
- **Назначение**: Обработка подключения сокета
- **Описание**: Срабатывает при успешном подключении клиента к серверу
- **Действие**: Обновляет статус подключения и при необходимости выполняет аутентификацию

### `disconnect`
- **Назначение**: Обработка отключения сокета
- **Описание**: Срабатывает при отключении клиента от сервера
- **Действие**: Обновляет статус подключения

### `messageHistory`
- **Назначение**: Получение истории сообщений чата
- **Параметры**:
  - `messages`: Массив объектов ChatMessage
- **Описание**: Получает и отображает историю сообщений для чата

### `privateChatHistory`
- **Назначение**: Получение истории личных сообщений
- **Параметры**:
  - `contactUserName`: string - Имя контакта
  - `messages`: Массив сообщений
- **Описание**: Получает и отображает историю личных сообщений с конкретным пользователем

### `message`
- **Назначение**: Получение сообщений чата
- **Параметры**:
  - Объект ChatMessage с деталями сообщения
- **Описание**: Обрабатывает входящие сообщения чата и отображает их в окне чата

### `privateMessage`
- **Назначение**: Получение личных сообщений
- **Параметры**:
  - Объект ChatMessage с дополнительными флагами:
    - `isSender`: boolean - Флаг отправителя
    - `isRecipient`: boolean - Флаг получателя
- **Описание**: Обрабатывает входящие личные сообщения и отображает их в соответствующем чате

### `messageError`
- **Назначение**: Обработка ошибок сообщений
- **Параметры**:
  - `error`: string - Текст ошибки
- **Описание**: Отображает сообщения об ошибках, связанных с отправкой/получением сообщений

### `user joined`
- **Назначение**: Обработка уведомлений о входе пользователя
- **Параметры**:
  - `userName`: string - Имя пользователя
  - `time`: string - Время
  - `numUsers`: number - Количество пользователей
- **Описание**: Отображает уведомление, когда новый пользователь присоединяется

### `user left`
- **Назначение**: Обработка уведомлений о выходе пользователя
- **Параметры**:
  - `userName`: string - Имя пользователя
  - `time`: string - Время
  - `numUsers`: number - Количество пользователей
- **Описание**: Отображает уведомление, когда пользователь покидает чат

### `reconnect`
- **Назначение**: Обработка переподключения сокета
- **Описание**: Управляет логикой переподключения, включая повторную аутентификацию при необходимости