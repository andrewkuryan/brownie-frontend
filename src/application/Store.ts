import { Dispatch, MiddlewareAPI, Reducer } from 'redux';

import { defaultUserState, userReducer, UserState } from './user/UserReducer';
import { UserAction } from './user/UserActions';

export interface AppState {
    user: UserState;
    error: Error | null;
    isProcessing: boolean;
}

export type SetErrorAction = { type: 'APP/SET_ERROR'; payload: Error };
export type ResetErrorAction = { type: 'APP/RESET_ERROR' };

export type StartProcessingAction = { type: 'APP/START_PROCESSING' };
export type FinishProcessingAction = { type: 'APP/FINISH_PROCESSING' };

export type AppAction =
    | UserAction
    | SetErrorAction
    | ResetErrorAction
    | StartProcessingAction
    | FinishProcessingAction;

export const defaultAppState: AppState = {
    user: defaultUserState,
    error: null,
    isProcessing: false,
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
                case 'START_PROCESSING':
                    return { ...state, isProcessing: true };
                case 'FINISH_PROCESSING':
                    return { ...state, isProcessing: false };
                default:
                    return defaultAppState;
            }
        default:
            return defaultAppState;
    }
};

export const errorHandlingMiddlewareWrapper = (
    middlewareApi: MiddlewareAPI<Dispatch<AppAction>, AppState>,
    fn: () => Promise<any>,
) =>
    fn().catch(exc => {
        middlewareApi.dispatch({ type: 'APP/SET_ERROR', payload: exc });
    });

export const loggingMiddleware =
    (api: MiddlewareAPI<Dispatch<AppAction>, AppState>) =>
    (next: Dispatch<AppAction>) =>
    (action: AppAction) => {
        const nextAction = next(action);
        console.log(`%cNEXT STATE:`, 'color: yellow;', api.getState());
        return nextAction;
    };
