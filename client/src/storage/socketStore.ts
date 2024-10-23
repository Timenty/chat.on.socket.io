import { io, Socket } from 'socket.io-client';
import { writable, get } from 'svelte/store';
import type { ChatMessage } from '../types/message.type';
import type { User } from '../types/user.type';
import { chat } from './chatStore';
import { user as userStore } from './userStore';

const room = 'temporaryRoom';
let socket: Socket;

interface SocketState {
    connected: boolean;
    currentUser: User | null;
    token: string | null;
}

// Socket status
function createSocketStore() {
    const { subscribe, update, set } = writable<SocketState>({
        connected: false,
        currentUser: null,
        token: localStorage.getItem('socket_token')
    });

    // Initialize socket with auth
    const token = localStorage.getItem('socket_token');
    socket = io('localhost:3000', {
        auth: token ? { token } : undefined
    });

    socket.on('connect', () => {
        console.log('on connected');
        update(socketData => ({ ...socketData, connected: true }));
        
        // Re-authenticate if we have user data
        const currentUser = get({ subscribe }).currentUser;
        if (currentUser && !get({ subscribe }).token) {
            authenticate(currentUser);
        }
    });

    socket.on("disconnect", () => {
        console.log('on disconnect');
        update(socketData => ({ ...socketData, connected: false }));
    });

    // Message History Handler
    socket.on("messageHistory", (messages: ChatMessage[]) => {
        console.log('received message history', messages);
        chat.initializeMessages(messages);
    });

    // Message Handlers
    socket.on("message", (msg: ChatMessage) => {
        console.log('on message', msg);
        chat.pushMessage(msg);
    });

    socket.on("privateMessage", (msg: ChatMessage) => {
        console.log('on private message', msg);
        const currentUser = get({ subscribe }).currentUser;
        
        if (currentUser) {
            // Add sender/recipient flags
            if (msg.from === currentUser.tag) {
                msg.isSender = true;
            } else if (msg.to === currentUser.tag) {
                msg.isRecipient = true;
            }
            chat.pushMessage(msg);
        }
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

    socket.on("reconnect", () => {
        chat.log("you have been reconnected", 'success');
        
        const currentUser = get({ subscribe }).currentUser;
        const token = get({ subscribe }).token;
        
        if (currentUser) {
            if (token) {
                // Reconnect with existing token
                socket.auth = { token };
            } else {
                // Re-authenticate
                authenticate(currentUser);
            }
        }
    });

    const authenticate = async (userData: User) => {
        return new Promise((resolve, reject) => {
            socket.emit('authenticate', userData, (response: { success: boolean; token?: string; userData?: User; error?: string }) => {
                if (response.success && response.token) {
                    const token = response.token || null;
                    localStorage.setItem('socket_token', token as string);
                    
                    // Update user data with the received data including tag
                    if (response.userData) {
                        const completeUserData = {
                            ...response.userData,
                            authorized: true
                        };
                        userStore.setUserData(completeUserData);
                        update(state => ({ 
                            ...state, 
                            token,
                            currentUser: completeUserData 
                        }));
                    }
                    
                    resolve(response);
                } else {
                    reject(response.error || 'Authentication failed');
                }
            });
        });
    };

    return {
        subscribe,
        setCurrentUser: async (user: User) => {
            try {
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
        }
    };
}

const socketStore = createSocketStore();

// Actions
async function setUserName(userName: string): Promise<void> {
    const user = { userName };
    const success = await socketStore.setCurrentUser(user as User);
    
    if (success) {
        socket.emit('joinRoom', { userName, room });
    } else {
        chat.log('Failed to authenticate', 'error');
    }
}

function sendMessage(msg: ChatMessage): void {
    if (!socketStore.getCurrentUser()) {
        chat.log('You must be authenticated to send messages', 'error');
        return;
    }

    const currentUser = socketStore.getCurrentUser();
    if (!currentUser) return;

    if (msg.isPrivate && msg.to) {
        // For private messages, only emit to server and wait for confirmation
        socket.emit('privateMessage', {
            message: msg.text,
            recipientTag: msg.to
        });
    } else {
        // For public messages, add to chat immediately and emit
        chat.pushMessage(msg);
        socket.emit('chatMessage', msg);
    }
}

export {
    setUserName,
    sendMessage,
    socketStore
};
