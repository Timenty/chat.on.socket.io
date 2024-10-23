import { io, Socket } from 'socket.io-client';
import { writable, get } from 'svelte/store';
import type { ChatMessage } from '../types/message.type';
import type { User } from '../types/user.type';
import { chat } from './chatStore';
import { user as userStore } from './userStore';

const room = 'temporaryRoom';
let socket: Socket;

// Socket status
function createSocketStore() {
    const { subscribe, update } = writable({
        connected: false,
        currentUser: null as User | null,
    });

    // Initialize socket here to ensure it's created before use
    socket = io('localhost:3000');

    socket.on('connect', () => {
        console.log('on connected');
        update(socketData => ({ ...socketData, connected: true }));
    });

    socket.on("disconnect", () => {
        console.log('on disconnect');
        update(socketData => ({ ...socketData, connected: false }));
    });

    // Message Handlers
    socket.on("message", (msg: ChatMessage) => {
        console.log('on message', msg);
        chat.pushMessage(msg);
    });

    socket.on("privateMessage", (msg: ChatMessage) => {
        console.log('on private message', msg);
        chat.pushMessage(msg);
    });

    socket.on("messageError", ({ error }) => {
        console.error('Message error:', error);
        chat.log(error, 'error');
    });

    // User Status Handlers
    socket.on("user joined", (data: { userName: string; time: string; tag: string; numUsers: number }) => {
        const { userName, time, tag, numUsers } = data;
        const messageTime = (new Date(time)).toLocaleTimeString();

        chat.log(`${userName} (${tag}) joined at ${messageTime}`, 'info');
        console.log('user joined', data);
        chat.addParticipantsMessage({ numUsers });
    });

    socket.on("user left", (data: { userName: string; time: string; tag: string; numUsers: number }) => {
        const { userName, time, tag, numUsers } = data;
        const messageTime = (new Date(time)).toLocaleTimeString();

        chat.log(`${userName} (${tag}) left at ${messageTime}`, 'info');
        console.log('user left', data);
        chat.addParticipantsMessage({ numUsers });
    });

    socket.on("disconnect", () => {
        chat.log("you have been disconnected", 'error');
    });

    socket.on("reconnect", () => {
        chat.log("you have been reconnected", 'success');
        
        const currentUser = get({ subscribe }).currentUser;
        if (currentUser) {
            socket.emit("joinRoom", { 
                userName: currentUser.userName,
                room 
            });
        }
    });

    return {
        subscribe,
        setCurrentUser: (user: User) => {
            update(socketData => ({ ...socketData, currentUser: user }));
        },
        getCurrentUser: () => get({ subscribe }).currentUser,
        getSocket: () => socket
    };
}

const socketStore = createSocketStore();

// Actions
function setUserName(userName: string): void {
    socket.emit('joinRoom', { userName, room });
}

function sendMessage(msg: ChatMessage): void {
    if (msg.isPrivate && msg.to) {
        socket.emit('privateMessage', {
            message: msg.text,
            recipientTag: msg.to
        });
    } else {
        chat.pushMessage(msg);
        console.log('send message', msg);
        socket.emit('chatMessage', msg);
    }
}

export {
    setUserName,
    sendMessage,
    socketStore
};
