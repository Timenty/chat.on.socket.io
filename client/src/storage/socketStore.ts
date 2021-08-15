import { io, Socket } from 'socket.io-client';
import type { ChatMessage } from '../types/message.type';
import { chat } from './chatStore';

const socket: Socket = io('localhost:3000');

function setUserName(userName: string): void {
    socket.emit('add user', userName);
}

function sendMessage(message: ChatMessage): void {
    chat.pushMessage(message);
    socket.emit('new message', message);
}

socket.on("new message", ({message}) => chat.pushMessage(message));

socket.on("user joined", (data) => {
    console.log('user joined', data);
    chat.log({ message: `${data.username} joined` } as ChatMessage);
    chat.addParticipantsMessage(data);
});

socket.on("user left", (data) => {
    console.log('user left', data);
    chat.log({ message: `${data.username} left` } as ChatMessage);
    chat.addParticipantsMessage(data);
});

socket.on("disconnect", () => chat.log({ message: "you have been disconnected" } as ChatMessage));

socket.on("reconnect", () => {
    chat.log({ message: "you have been reconnected" } as ChatMessage);
    const userName = chat.getUser().userName;
    if (userName) socket.emit("add user", userName);
});


export {
    setUserName,
    sendMessage,
    socket,
};