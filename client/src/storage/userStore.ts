import { writable } from 'svelte/store';
import { setUserName as emitUserName } from './socketStore';

function createUserStore() {
    const { subscribe, update } = writable({
        userName: '',
        authorized: false,
    });

    return {
        subscribe,
        setUserName: (userName = '') => {
            emitUserName(userName);
            console.log('set username ', userName);
            update(u => ({...u, authorized: true, userName}));
        },
    };
}

export const user = createUserStore();