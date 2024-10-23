import { writable } from 'svelte/store';
import { nanoid } from 'nanoid';
import type { Message, ChatMessage, SystemMessage } from '../types/message.type';
import type { UserState } from './userStore';
import { user as userStore } from './userStore';

interface Chat {
    id: number;
    messages: Message[];
}

interface ChatState {
    chats: Chat[];
    currentChat: Chat;
}

const initialState: ChatState = {
    chats: [
        {
            id: 1,
            messages: []
        }
    ],
    currentChat: {
        id: 1,
        messages: []
    }
};

function chatStore() {
    const { subscribe, update } = writable(initialState);

    let user: UserState;
    userStore.subscribe((v: UserState) => user = v);
    let state: ChatState;
    subscribe((v: ChatState) => state = v);

    const getChatById = (chats: Chat[], chatId: number) => {
        return chats.find(({id}) => chatId === id);
    };

    const pushMessage = (message: Message): void => {
        update(chatStruct => {
            const { currentChat } = chatStruct;
            currentChat.messages = [...currentChat.messages, message];
            return chatStruct;
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

    const addParticipantsMessage = (data: { numUsers: number }): void => {
        const text = data.numUsers === 1
            ? `there's 1 participant`
            : `there are ${data.numUsers} participants`;
        
        log(text, 'info');
    };

    return {
        getChatById,
        subscribe,
        pushMessage,
        addParticipantsMessage,
        getUser: () => user,
        log,
        setCurrentChatById: (currentChatId: number) => update(chatStruct => ({
            ...chatStruct,
            currentChatId,
        })),
    };
}

export const chat = chatStore();
