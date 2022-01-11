import { writable } from 'svelte/store';
import type { ChatMessage } from '../types/message.type';
import { user as userStore } from './userStore';

const initialState = {
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

    let user; userStore.subscribe((v) =>  user = v);
    // функцонал подписки на обновления стейта
    let state; subscribe((v) => state = v);

    const getChatById = (chats: Array<any>, chatId: number) => {
        return chats.find(({id}) => chatId === id);
    }

    const pushMessage = (message): void => {
        update(chatStruct => {
            const { currentChat } = chatStruct;
            currentChat.messages = [...currentChat.messages, message];
            return chatStruct;
        });
    };

    const log = (message: ChatMessage): void => {
        message.userName = "log";
        pushMessage(message);
    };

    const addParticipantsMessage = (data: any) => {
        let chatMessage: ChatMessage = {
            message: '',
            userName: '',
            time: Date.now()
        };

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
