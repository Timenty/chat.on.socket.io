import { writable } from 'svelte/store';
import { nanoid } from 'nanoid';
import type { Message, ChatMessage, SystemMessage } from '../types/message.type';
import { User } from '../types/user.type';
import { user as userStore } from './userStore';

/**
 * Интерфейс для хранения информации о чате с контактом
 */
interface Chat {
    contactUserName: string;  // Полное имя контакта (включая тег)
    messages: Message[];      // История сообщений
}

/**
 * Состояние хранилища чатов
 */
interface ChatState {
    chats: Map<string, Chat>;           // Мапа чатов по полному имени контакта
    currentContactUserName: string | null; // Полное имя текущего открытого чата
}

// Начальное состояние хранилища
const initialState: ChatState = {
    chats: new Map(),
    currentContactUserName: null
};

/**
 * Создает хранилище чатов с необходимыми методами управления
 */
function chatStore() {
    const { subscribe, update } = writable(initialState);

    // Подписка на изменения данных пользователя
    let currentUser: { user: User | null; authorized: boolean };
    userStore.subscribe((v) => currentUser = v);
    
    // Локальная копия состояния для внутреннего использования
    let state: ChatState;
    subscribe((v: ChatState) => state = v);

    /**
     * Проверяет, является ли сообщение чатовым (не системным)
     */
    const isChatMessage = (message: Message): message is ChatMessage => {
        return 'userName' in message;
    };

    /**
     * Добавляет новое сообщение в соответствующий чат
     * @param message - Объект сообщения (чатовое или системное)
     */
    const pushMessage = (message: Message): void => {
        update(chatState => {
            // Обработка системных сообщений
            if (!isChatMessage(message)) {
                // Системные сообщения добавляются в текущий открытый чат
                if (chatState.currentContactUserName) {
                    const currentChat = chatState.chats.get(chatState.currentContactUserName);
                    if (currentChat) {
                        currentChat.messages = [...currentChat.messages, message];
                        chatState.chats.set(chatState.currentContactUserName, currentChat);
                    }
                }
                return chatState;
            }

            // Определяем, к какому чату относится сообщение
            // Если текущий пользователь отправитель - берем получателя
            // Если текущий пользователь получатель - берем отправителя
            const userUserName = currentUser.user?.userName || '';
            const messageContactUserName = message.from === userUserName ? message.to : message.from;
            if (!messageContactUserName) return chatState;
            
            // Получаем или создаем чат для этого контакта
            let chat = chatState.chats.get(messageContactUserName);
            if (!chat) {
                chat = {
                    contactUserName: messageContactUserName,
                    messages: []
                };
            }

            // Проверка на дубликаты сообщений
            const isDuplicate = chat.messages.some(existingMsg => {
                if (!isChatMessage(existingMsg)) return false;
                
                return (
                    existingMsg.text === message.text &&
                    existingMsg.userName === message.userName &&
                    existingMsg.time.getTime() === new Date(message.time).getTime() &&
                    existingMsg.from === message.from &&
                    existingMsg.to === message.to
                );
            });

            // Добавляем сообщение только если оно не дубликат
            if (!isDuplicate) {
                chat.messages = [...chat.messages, {
                    ...message,
                    time: new Date(message.time)
                }];
                chatState.chats.set(messageContactUserName, chat);
            }
            
            return chatState;
        });
    };

    /**
     * Инициализирует чат с контактом и загружает историю сообщений
     */
    const initializeChat = (contactUserName: string, messages: Message[]): void => {
        update(chatState => {
            chatState.chats.set(contactUserName, {
                contactUserName,
                messages: messages.map(msg => ({
                    ...msg,
                    time: new Date(msg.time)
                }))
            });
            chatState.currentContactUserName = contactUserName;
            return chatState;
        });
    };

    /**
     * Обработчик загрузки истории сообщений
     */
    const handleChatHistory = (contactUserName: string, messages: Message[]): void => {
        initializeChat(contactUserName, messages);
    };

    /**
     * Переключает текущий активный чат
     */
    const switchToChat = (contactUserName: string): void => {
        update(chatState => {
            // Создаем новый чат, если его еще нет
            if (!chatState.chats.has(contactUserName)) {
                chatState.chats.set(contactUserName, {
                    contactUserName,
                    messages: []
                });
            }
            chatState.currentContactUserName = contactUserName;
            return chatState;
        });
    };

    /**
     * Добавляет системное сообщение в текущий чат
     */
    const log = (text: string, type: 'info' | 'error' | 'success' = 'info'): void => {
        const systemMessage: SystemMessage = {
            id: nanoid(),
            text,
            type,
            time: new Date()
        };
        pushMessage(systemMessage);
    };

    // Публичный интерфейс хранилища
    return {
        subscribe,
        pushMessage,
        initializeChat,
        handleChatHistory,
        switchToChat,
        getCurrentChat: () => state.currentContactUserName ? state.chats.get(state.currentContactUserName) : null,
        getUser: () => currentUser.user,
        log
    };
}

// Экспортируем единственный экземпляр хранилища
export const chat = chatStore();
