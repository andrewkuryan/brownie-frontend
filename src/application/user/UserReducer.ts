import { ActiveUser, BlankUser, GuestUser, User } from '@entity/User';
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
        case 'USER/ADD_CONTACT':
            if (state.currentUser instanceof GuestUser) {
                return {
                    ...state,
                    currentUser: new BlankUser(
                        state.currentUser.id,
                        state.currentUser.permissions,
                        action.payload,
                    ),
                };
            } else if (state.currentUser instanceof BlankUser) {
                return {
                    ...state,
                    currentUser: new BlankUser(
                        state.currentUser.id,
                        state.currentUser.permissions,
                        action.payload,
                    ),
                };
            } else if (state.currentUser instanceof ActiveUser) {
                return {
                    ...state,
                    currentUser: new ActiveUser(
                        state.currentUser.id,
                        state.currentUser.permissions,
                        [...state.currentUser.contacts, action.payload],
                        state.currentUser.data,
                    ),
                };
            }
        case 'USER/LOAD':
            return state;
        case 'USER/ADD_EMAIL':
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
