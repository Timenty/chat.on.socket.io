import { writable } from 'svelte/store';
import type { Contact } from '../types/user.type';
import { socketStore } from './socketStore';

function createContactsStore() {
    const { subscribe, update, set } = writable<{
        contacts: Contact[];
        pendingRequests: string[];
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

    socket.on('contactRequest', ({ from }) => {
        update(store => ({
            ...store,
            pendingRequests: [...store.pendingRequests, from]
        }));
    });

    socket.on('contactError', ({ error }) => {
        console.error('Contact error:', error);
    });

    return {
        subscribe,
        
        addContact: (contactTag: string) => {
            socket.emit('addContact', { contactTag });
        },

        updateContacts: (contacts: Contact[]) => {
            update(store => ({
                ...store,
                contacts
            }));
        },

        addPendingRequest: (tag: string) => {
            update(store => ({
                ...store,
                pendingRequests: [...store.pendingRequests, tag]
            }));
        },

        removePendingRequest: (tag: string) => {
            update(store => ({
                ...store,
                pendingRequests: store.pendingRequests.filter(t => t !== tag)
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
