import { createStore, Reducer } from 'redux';

import { defaultUserState, userReducer, UserState } from './user/UserReducer';
import { UserAction } from './user/UserActions';

export interface AppState {
    user: UserState;
}

export type AppAction = UserAction;

const defaultAppState: AppState = {
    user: defaultUserState,
};

const appReducer: Reducer<AppState, AppAction> = (
    state: AppState | undefined,
    action: AppAction,
) => {
    if (state === undefined) {
        return defaultAppState;
    }
    switch (action.type.split('/')[0]) {
        case 'USER':
            return { ...state, user: userReducer(state.user, action) };
        default:
            return defaultAppState;
    }
};

export const store = createStore<AppState, AppAction, {}, {}>(appReducer, defaultAppState);
