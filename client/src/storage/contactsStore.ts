import { writable } from 'svelte/store';
import type { Contact } from '../types/user.type';
import { socketStore } from './socketStore';

function createContactsStore() {
    const { subscribe, update, set } = writable<{
        contacts: Contact[];
        pendingRequests: string[];  // Now stores full userNames instead of just tags
    }>({
        contacts: [],
        pendingRequests: []
    });

    const socket = socketStore.getSocket();

    // Set up socket event listeners
    socket.on('contactsUpdated', ({ contacts: updatedContacts }) => {
        update(store => ({
            ...store,
            contacts: updatedContacts
        }));
    });

    socket.on('contactsList', ({ contacts: contactsList }) => {
        update(store => ({
            ...store,
            contacts: contactsList
        }));
    });

    socket.on('contactRequest', ({ from, userName }) => {
        update(store => ({
            ...store,
            pendingRequests: [...store.pendingRequests, userName]
        }));
    });

    socket.on('contactError', ({ error }) => {
        console.error('Contact error:', error);
    });

    return {
        subscribe,
        
        addContact: (contactUserName: string) => {
            console.log('addContact', contactUserName);
            socket.emit('addContact', { contactUserName });
        },

        updateContacts: (contacts: Contact[]) => {
            console.log('updateContacts', contacts);
            update(store => ({
                ...store,
                contacts
            }));
        },

        addPendingRequest: (userName: string) => {
            update(store => ({
                ...store,
                pendingRequests: [...store.pendingRequests, userName]
            }));
        },

        removePendingRequest: (userName: string) => {
            update(store => ({
                ...store,
                pendingRequests: store.pendingRequests.filter(name => name !== userName)
            }));
        },

        getContacts: () => {
            socket.emit('getContacts');
        },

        reset: () => {
            set({
                contacts: [],
                pendingRequests: []
            });
        }
    };
}

export const contacts = createContactsStore();
