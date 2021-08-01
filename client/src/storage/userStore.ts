import { writable } from 'svelte/store';
import { setUserName as emitUserName } from './socketStore';

function createUserStore() {
    const { subscribe, update } = writable({
        userName: 'Василий'
    });

    return {
        subscribe,
        setUserName: (userName = '') => {
            update(u => ({...u, userName}));
            emitUserName(userName);
        },
    };
}

export const user = createUserStore();