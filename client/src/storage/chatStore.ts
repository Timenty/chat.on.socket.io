import { writable } from 'svelte/store';
import type { ChatMessage } from '../types/message.type';
import { user as userStore } from './userStore';

const initialState = {
    currentChatId: 1,
    list: [
        {
            id: 1,
            messages: []
        }
    ],
};

function chatStore() {
    const { subscribe, update, set } = writable(initialState);

    let user; userStore.subscribe((v) =>  user = v);
    // функцонал подписки на обновления стейта
    let state; subscribe((v) => state = v);

    const getChatById = (chats: Array<any>, chatId: number) => {
        return chats.find(({id}) => chatId === id);
    }
    const getCurrentChat = () => getChatById(state.list, state.currentChatId);

    return {
        subscribe,
        pushMessage(message: ChatMessage): void {
            update(chatStruct => {
                const { currentChatId, list } = chatStruct;
                const chat = getChatById(list, currentChatId);
                chat.messages = [...chat.messages, message];
                return chatStruct;
            });
        },
        getCurrentChat,
        setCurrentChatById: (currentChatId: number) => update(chatStruct => ({
            ...chatStruct,
            currentChatId,
        })),
    };
}

export const chat = chatStore();
