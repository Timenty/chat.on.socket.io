import { io, Socket } from 'socket.io-client';
import type { ChatMessage } from '../types/message.type';
import { User } from '../types/user.type';

let socket: Socket;

// Initialize socket
const initializeSocket = (token?: string) => {
    socket = io('localhost:3000', {
        auth: token ? { token } : undefined
    });
    return socket;
};

// Get socket instance
const getSocket = () => socket;

// Socket events
const emitUserName = async (userName: string): Promise<{ success: boolean; token?: string; userData?: any }> => {
    return new Promise((resolve, reject) => {
        socket.emit('authenticate', new User('', userName), (response: {
            success: boolean;
            token?: string;
            userData?: any;
            error?: string;
        }) => {
            if (response.success) {
                resolve(response);
            } else {
                reject(response.error || 'Authentication failed');
            }
        });
    });
};

const emitJoinRoom = (userName: string) => {
    socket.emit('joinRoom', { userName });
};

const emitPrivateMessage = (message: string, recipientUserName: string) => {
    socket.emit('privateMessage', {
        message,
        recipientUserName
    });
};

const emitChatMessage = (message: ChatMessage) => {
    socket.emit('chatMessage', message);
};

const emitGetPrivateMessages = (contactUserName: string) => {
    socket.emit('getPrivateMessages', { contactUserName });
};

export const eventBus = {
    initializeSocket,
    getSocket,
    emitUserName,
    emitJoinRoom,
    emitPrivateMessage,
    emitChatMessage,
    emitGetPrivateMessages
};
