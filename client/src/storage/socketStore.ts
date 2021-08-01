import { io, Socket } from 'socket.io-client';
import type { ChatMessage } from '../types/message.type';

const socket: Socket = io('localhost:3000');

function setUserName(userName: string): void {
    socket.emit('add user', userName);
}

function sendMessage(msg: ChatMessage): void {
    socket.emit('new message', msg);
}

export {
    setUserName,
    sendMessage,
    socket,
};