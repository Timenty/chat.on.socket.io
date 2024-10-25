import { writable } from 'svelte/store';
import { User } from '../types/user.type';
import { setUserName as emitUserName } from './socketStore';

export interface UserState {
    user: User | null;
    authorized: boolean;
}

const initialState: UserState = {
    user: null,
    authorized: false
};

function createUserStore() {
    const { subscribe, update, set } = writable<UserState>(initialState);

    return {
        subscribe,
        setUserName: (userName = '') => {
            emitUserName(userName);
            console.log('set username ', userName);
            update(state => ({
                ...state,
                authorized: true,
                user: new User(state.user?.id || '', userName, state.user?.contacts)
            }));
        },
        setUserData: (userData: Partial<User>) => {
            update(state => ({
                ...state,
                user: state.user ? new User(
                    userData.id || state.user.id,
                    userData.userName || state.user.userName,
                    userData.contacts || state.user.contacts
                ) : null
            }));
        },
        reset: () => set(initialState)
    };
}

export const user = createUserStore();
