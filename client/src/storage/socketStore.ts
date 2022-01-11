import { io, Socket } from 'socket.io-client';
import { writable } from 'svelte/store';
import type { ChatMessage } from '../types/message.type';
import { chat } from './chatStore';

const socket: Socket = io('localhost:3000');
const room = 'temporaryRoom';

// Socket status
function createSocketStore() {
    const { subscribe, update } = writable({
        connected: false,
    });

    // @ts-ignore
    socket.addEventListener('connect', () => {
        console.log('on connected');
        update(socketData => ({ ...socketData, connected: true }));
    })
    // @ts-ignore
    socket.addEventListener("disconnect", () => {
        console.log('on disconnect');
        update(socketData => ({ ...socketData, connected: false }));
    });

    return {
        subscribe,
    };
}
const socketStore = createSocketStore();


// Handlers
socket.on("message", (msg) => {
    console.log('on message', msg);
    chat.pushMessage(msg)
});

socket.on("user joined", (data) => {
    const { userName, time } = data;
    const messageTime = (new Date(time)).toLocaleTimeString();

    chat.log({ message: `${userName} joined. at: ${messageTime}` } as ChatMessage);

    console.log('user joined', data);

    chat.addParticipantsMessage(data);
});

socket.on("user left", (data) => {
    const { userName, time } = data;
    const messageTime = (new Date(time)).toLocaleTimeString();

    chat.log({ message: `${userName} left. at: ${messageTime}` } as ChatMessage);

    console.log('user left', data);
    chat.addParticipantsMessage(data);
});

socket.on("disconnect", () => chat.log({ message: "you have been disconnected" } as ChatMessage));

socket.on("reconnect", () => {
    chat.log({ message: "you have been reconnected" } as ChatMessage);
    const userName = chat.getUser().userName;
    if (userName) socket.emit("joinRoom", { userName, room });
});

// Actions
function setUserName(userName: string): void {
    socket.emit('joinRoom', { userName, room });
}

function sendMessage(msg: ChatMessage): void {
    chat.pushMessage(msg);
    console.log('send message', msg);
    socket.emit('chatMessage', msg);
}

export {
    setUserName,
    sendMessage,
    socket,
    socketStore,
};