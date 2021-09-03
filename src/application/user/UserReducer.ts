import { User } from '@entity/User';
import { UserAction } from './UserActions';
import { Reducer } from 'redux';

export interface UserState {
    currentUser: User | null;
    counter: number;
}

export const defaultUserState: UserState = {
    currentUser: null,
    counter: 0,
};

export const userReducer: Reducer<UserState, UserAction> = (state: UserState | undefined, action: UserAction) => {
    if (state === undefined) {
        return defaultUserState;
    }
    switch (action.type) {
        case 'USER/SET_USER':
            return { ...state, currentUser: action.payload };
        case 'USER/TEST':
            return { ...state, counter: state.counter + action.payload };
        default:
            return defaultUserState;
    }
}