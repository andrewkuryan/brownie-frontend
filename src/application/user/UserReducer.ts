import { User } from '@entity/User';
import { UserAction } from './UserActions';
import { Reducer } from 'redux';

export interface UserState {
    currentUser: User | null;
}

export const defaultUserState: UserState = {
    currentUser: null,
};

export const userReducer: Reducer<UserState, UserAction> = (
    state: UserState | undefined,
    action: UserAction,
) => {
    if (state === undefined) {
        return defaultUserState;
    }
    switch (action.type) {
        case 'USER/SET_USER':
            return { ...state, currentUser: action.payload };
        case 'USER/LOAD':
            return state;
        case 'USER/VERIFY_CONTACT':
            return state;
        case 'USER/FULFILL':
            return state;
        case 'USER/LOGIN':
            return state;
        default:
            return defaultUserState;
    }
};
