import { writable } from 'svelte/store';
import type { User } from '../types/user.type';
import { setUserName as emitUserName } from './socketStore';

export interface UserState extends Partial<User> {
    authorized: boolean;
}

const initialState: UserState = {
    userName: '',
    authorized: false,
    id: '',
    tag: '',
    contacts: []
};

function createUserStore() {
    const { subscribe, update, set } = writable<UserState>(initialState);

    return {
        subscribe,
        setUserName: (userName = '') => {
            emitUserName(userName);
            console.log('set username ', userName);
            update(u => ({
                ...u,
                authorized: true,
                userName
            }));
        },
        setUserData: (userData: Partial<User>) => {
            update(u => ({
                ...u,
                ...userData
            }));
        },
        reset: () => set(initialState)
    };
}

export const user = createUserStore();
