import { writable } from 'svelte/store';
import { setUserName as emitUserName } from './socketStore';

function createUserStore() {
    const { subscribe, update } = writable({
        userName: ''
    });

    return {
        subscribe,
        setUserName: (userName = '') => {
            emitUserName(userName);
            update(u => ({...u, userName}));
        },
    };
}

export const user = createUserStore();