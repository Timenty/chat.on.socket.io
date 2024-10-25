import type { Socket } from 'socket.io-client';
import { writable, get } from 'svelte/store';
import type { ChatMessage } from '../types/message.type';
import { User } from '../types/user.type';
import { chat } from './chatStore';
import { user as userStore } from './userStore';
import { eventBus } from './eventBus';

interface SocketState {
    connected: boolean;
    currentUser: User | null;
    token: string | null;
}

function createSocketStore() {
    const { subscribe, update, set } = writable<SocketState>({
        connected: false,
        currentUser: null,
        token: localStorage.getItem('socket_token')
    });

    // Initialize socket with auth
    const token = localStorage.getItem('socket_token') ?? undefined;
    const socket = eventBus.initializeSocket(token);

    // Socket event handlers
    socket.on('connect', () => {
        console.log('on connected');
        update(socketData => ({ ...socketData, connected: true }));
        
        const currentUser = get({ subscribe }).currentUser;
        if (currentUser && !get({ subscribe }).token) {
            authenticate(currentUser);
        }
    });

    socket.on("disconnect", () => {
        console.log('on disconnect');
        update(socketData => ({ ...socketData, connected: false }));
    });

    socket.on("messageHistory", (messages: ChatMessage[]) => {
        console.log('received message history', messages);
        const currentUser = get({ subscribe }).currentUser;
        if (currentUser && messages.length > 0) {
            const firstMsg = messages[0];
            const contactUserName = firstMsg.from === currentUser.userName ? firstMsg.to : firstMsg.from;
            if (contactUserName) {
                chat.initializeChat(contactUserName, messages);
            }
        }
    });

    socket.on("privateChatHistory", ({ contactUserName, messages }) => {
        console.log('received private chat history', messages);
        chat.handleChatHistory(contactUserName, messages);
    });

    socket.on("message", (msg: ChatMessage) => {
        console.log('on message', msg);
        chat.pushMessage(msg);
    });

    socket.on("privateMessage", (msg: ChatMessage) => {
        console.log('on private message', msg);
        const currentUser = get({ subscribe }).currentUser;
        
        if (currentUser) {
            if (msg.to === currentUser.userName || msg.from === currentUser.userName) {
                const transformedMessage = {
                    ...msg,
                    isSender: msg.from === currentUser.userName,
                    isRecipient: msg.to === currentUser.userName
                };
                chat.pushMessage(transformedMessage);
            }
        }
    });

    socket.on("messageError", ({ error }) => {
        console.error('Message error:', error);
        chat.log(error, 'error');
    });

    socket.on("user joined", (data: { userName: string; time: string; numUsers: number }) => {
        const { userName, time } = data;
        const messageTime = (new Date(time)).toLocaleTimeString();
        chat.log(`${userName} joined at ${messageTime}`, 'info');
    });

    socket.on("user left", (data: { userName: string; time: string; numUsers: number }) => {
        const { userName, time } = data;
        const messageTime = (new Date(time)).toLocaleTimeString();
        chat.log(`${userName} left at ${messageTime}`, 'info');
    });

    socket.on("reconnect", () => {
        chat.log("you have been reconnected", 'success');
        
        const currentUser = get({ subscribe }).currentUser;
        const token = get({ subscribe }).token;
        
        if (currentUser) {
            if (token) {
                socket.auth = { token };
            } else {
                authenticate(currentUser);
            }
        }
    });

    const authenticate = async (userData: User) => {
        try {
            const response = await eventBus.emitUserName(userData.userName);
            if (response.success && response.token) {
                const token = response.token;
                localStorage.setItem('socket_token', token);
                
                if (response.userData) {
                    const user = new User(
                        response.userData.id || '',
                        response.userData.userName,
                        response.userData.contacts
                    );
                    userStore.setUserData(user);
                    update(state => ({ 
                        ...state, 
                        token,
                        currentUser: user
                    }));
                }
                return response;
            }
            throw new Error('Authentication failed');
        } catch (error) {
            throw error;
        }
    };

    return {
        subscribe,
        setCurrentUser: async (userData: { userName: string }) => {
            try {
                const user = new User('', userData.userName);
                await authenticate(user);
                return true;
            } catch (error) {
                console.error('Authentication failed:', error);
                return false;
            }
        },
        getCurrentUser: () => get({ subscribe }).currentUser,
        getSocket: () => socket,
        logout: () => {
            localStorage.removeItem('socket_token');
            userStore.reset();
            set({
                connected: socket.connected,
                currentUser: null,
                token: null
            });
        },
        requestChatHistory: (contactUserName: string) => {
            eventBus.emitGetPrivateMessages(contactUserName);
        }
    };
}

const socketStore = createSocketStore();

function sendMessage(msg: ChatMessage): void {
    if (!socketStore.getCurrentUser()) {
        chat.log('You must be authenticated to send messages', 'error');
        return;
    }

    const currentUser = socketStore.getCurrentUser();
    if (!currentUser) return;

    if (msg.isPrivate && msg.to) {
        eventBus.emitPrivateMessage(msg.text, msg.to);

        const localMessage = {
            ...msg,
            userName: currentUser.userName,
            from: currentUser.userName,
            isSender: true
        };
        chat.pushMessage(localMessage);
    } else {
        const messageToSend = {
            ...msg,
            userName: currentUser.userName
        };
        chat.pushMessage(messageToSend);
        eventBus.emitChatMessage(messageToSend);
    }
}

export {
    sendMessage,
    socketStore
};
