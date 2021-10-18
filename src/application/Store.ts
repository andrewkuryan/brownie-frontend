import { Dispatch, MiddlewareAPI, Reducer } from 'redux';

import { defaultUserState, userReducer, UserState } from './user/UserReducer';
import { UserAction } from './user/UserActions';

export interface AppState {
    user: UserState;
    error: Error | null;
}

export type SetErrorAction = { type: 'APP/SET_ERROR'; payload: Error };
export type ResetErrorAction = { type: 'APP/RESET_ERROR' };

export type AppAction = UserAction | SetErrorAction | ResetErrorAction;

export const defaultAppState: AppState = {
    user: defaultUserState,
    error: null,
};

export const appReducer: Reducer<AppState, AppAction> = (
    state: AppState | undefined,
    action: AppAction,
) => {
    if (state === undefined) {
        return defaultAppState;
    }
    switch (action.type.split('/')[0]) {
        case 'USER':
            return { ...state, user: userReducer(state.user, action as UserAction) };
        case 'APP':
            switch (action.type.split('/')[1]) {
                case 'SET_ERROR':
                    return { ...state, error: (action as SetErrorAction).payload };
                case 'RESET_ERROR':
                    return { ...state, error: null };
                default:
                    return defaultAppState;
            }
        default:
            return defaultAppState;
    }
};

export const errorHandlingMiddleware = (
    middlewareApi: MiddlewareAPI<Dispatch<AppAction>, AppState>,
    fn: () => Promise<any>,
) =>
    fn().catch(exc => {
        middlewareApi.dispatch({ type: 'APP/SET_ERROR', payload: exc });
    });
