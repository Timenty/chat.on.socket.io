import { io, Socket } from 'socket.io-client';
import { writable, get } from 'svelte/store';
import type { ChatMessage } from '../types/message.type';
import { User } from '../types/user.type';
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
        const currentUser = get({ subscribe }).currentUser;
        if (currentUser && messages.length > 0) {
            // Get the contact userName from the first message
            const firstMsg = messages[0];
            const contactUserName = firstMsg.from === currentUser.userName ? firstMsg.to : firstMsg.from;
            if (contactUserName) {
                chat.initializeChat(contactUserName, messages);
            }
        }
    });

    // Private Chat History Handler
    socket.on("privateChatHistory", ({ contactUserName, messages }) => {
        console.log('received private chat history', messages);
        chat.handleChatHistory(contactUserName, messages);
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

    // User Status Handlers
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
            socket.emit('authenticate', userData, (response: { 
                success: boolean; token?: string; userData?: any; error?: string
             }) => {
                if (response.success && response.token) {
                    const token = response.token || null;
                    localStorage.setItem('socket_token', token as string);
                    
                    // Update user data with the received data
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
                    
                    resolve(response);
                } else {
                    reject(response.error || 'Authentication failed');
                }
            });
        });
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
            socket.emit('getPrivateMessages', { contactUserName });
        }
    };
}

const socketStore = createSocketStore();

// Actions
async function setUserName(userName: string): Promise<void> {
    const success = await socketStore.setCurrentUser({ userName });
    
    if (success) {
        socket.emit('joinRoom', { userName });
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
        // For private messages, emit to server with required format
        socket.emit('privateMessage', {
            message: msg.text,
            recipientUserName: msg.to
        });

        // Add message to local chat
        const localMessage = {
            ...msg,
            userName: currentUser.userName,
            from: currentUser.userName,
            isSender: true
        };
        chat.pushMessage(localMessage);
    } else {
        // For public messages
        const messageToSend = {
            ...msg,
            userName: currentUser.userName
        };
        chat.pushMessage(messageToSend);
        socket.emit('chatMessage', messageToSend);
    }
}

export {
    setUserName,
    sendMessage,
    socketStore
};
