import { writable } from 'svelte/store';
import { nanoid } from 'nanoid';
import type { Message, ChatMessage, SystemMessage } from '../types/message.type';
import { User } from '../types/user.type';
import { user as userStore } from './userStore';

interface Chat {
    contactUserName: string;
    messages: Message[];
}

interface ChatState {
    chats: Map<string, Chat>;
    currentContactTag: string | null;
    currentContactUserName: string | null;
}

const initialState: ChatState = {
    chats: new Map(),
    currentContactTag: null,
    currentContactUserName: null
};

function chatStore() {
    const { subscribe, update } = writable(initialState);

    let currentUser: { user: User | null; authorized: boolean };
    userStore.subscribe((v) => currentUser = v);
    
    let state: ChatState;
    subscribe((v: ChatState) => state = v);

    const isChatMessage = (message: Message): message is ChatMessage => {
        return 'userName' in message;
    };

    const pushMessage = (message: Message): void => {
        update(chatState => {
            if (!isChatMessage(message)) {
                if (chatState.currentContactUserName) {
                    const currentChat = chatState.chats.get(chatState.currentContactTag!);
                    if (currentChat) {
                        currentChat.messages = [...currentChat.messages, message];
                        chatState.chats.set(chatState.currentContactTag!, currentChat);
                    }
                }
                return chatState;
            }

            const userUserName = currentUser.user?.userName || '';
            const messageContactUserName = message.from === userUserName ? message.to : message.from;
            if (!messageContactUserName) return chatState;
            
            const messageContactTag = messageContactUserName.split('#')[1];
            
            let chat = chatState.chats.get(messageContactTag);
            if (!chat) {
                chat = {
                    contactUserName: messageContactUserName,
                    messages: []
                };
            }

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

            if (!isDuplicate) {
                chat.messages = [...chat.messages, {
                    ...message,
                    time: new Date(message.time)
                }];
                chatState.chats.set(messageContactTag, chat);
            }
            
            return chatState;
        });
    };

    const initializeChat = (contactUserName: string, messages: Message[]): void => {
        const contactTag = contactUserName.split('#')[1];
        update(chatState => {
            chatState.chats.set(contactTag, {
                contactUserName,
                messages: messages.map(msg => ({
                    ...msg,
                    time: new Date(msg.time)
                }))
            });
            chatState.currentContactTag = contactTag;
            chatState.currentContactUserName = contactUserName;
            return chatState;
        });
    };

    const handleChatHistory = (contactUserName: string, messages: Message[]): void => {
        initializeChat(contactUserName, messages);
    };

    const switchToChat = (contactTag: string): void => {
        update(chatState => {
            if (!chatState.chats.has(contactTag)) {
                const contact = currentUser.user?.contacts?.find(c => c.split('#')[1] === contactTag);
                if (contact) {
                    chatState.chats.set(contactTag, {
                        contactUserName: contact,
                        messages: []
                    });
                    chatState.currentContactTag = contactTag;
                    chatState.currentContactUserName = contact;
                }
            } else {
                chatState.currentContactTag = contactTag;
                chatState.currentContactUserName = chatState.chats.get(contactTag)?.contactUserName || null;
            }
            return chatState;
        });
    };

    const log = (text: string, type: 'info' | 'error' | 'success' = 'info'): void => {
        const systemMessage: SystemMessage = {
            id: nanoid(),
            text,
            type,
            time: new Date()
        };
        pushMessage(systemMessage);
    };

    return {
        subscribe,
        pushMessage,
        initializeChat,
        handleChatHistory,
        switchToChat,
        getCurrentChat: () => state.currentContactTag ? state.chats.get(state.currentContactTag) : null,
        getUser: () => currentUser.user,
        log
    };
}

export const chat = chatStore();
