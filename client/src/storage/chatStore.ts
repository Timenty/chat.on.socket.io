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
    getCurrentChat() {
        return this.list.find(({id}) => id === this.currentChatId);
    }
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

    const pushMessage = (message: ChatMessage): void => {
        update(chatStruct => {
            const { currentChatId, list } = chatStruct;
            const chat = getChatById(list, currentChatId);
            chat.messages = [...chat.messages, message];
            return chatStruct;
        });
    };

    const log = (message: ChatMessage): void => {
        message.username = "log";
        pushMessage(message);
    };

    const addParticipantsMessage = (data: any) => {
        let chatMessage: ChatMessage;

        if (data.numUsers === 1) {
            chatMessage.message += `there's 1 participant`;
        } else {
            chatMessage.message += `there are ${data.numUsers} participants`;
        }

        log(chatMessage);
    };

    return {
        getChatById,
        subscribe,
        getCurrentChat,
        pushMessage,
        addParticipantsMessage,
        getUser: () => {
            return user;
        },
        log,
        setCurrentChatById: (currentChatId: number) => update(chatStruct => ({
            ...chatStruct,
            currentChatId,
        })),
    };
}

export const chat = chatStore();
