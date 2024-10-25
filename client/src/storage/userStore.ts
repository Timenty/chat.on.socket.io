import { writable } from 'svelte/store';
import { User } from '../types/user.type';
import { eventBus } from './eventBus';

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
        setUserName: async (userName = '') => {
            try {
                const response = await eventBus.emitUserName(userName);
                if (response.success) {
                    eventBus.emitJoinRoom(userName);
                    update(state => ({
                        ...state,
                        authorized: true,
                        user: new User(state.user?.id || '', userName, state.user?.contacts)
                    }));
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Failed to set username:', error);
                return false;
            }
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
