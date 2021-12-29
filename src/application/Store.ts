import { Dispatch, MiddlewareAPI, Reducer } from 'redux';

import { userReducer, UserState } from './user/UserReducer';
import { UserAction } from './user/UserActions';
import { postReducer, PostState } from '@application/post/PostReducer';
import { PostAction } from '@application/post/PostActions';
import { FileAction } from '@application/file/FileActions';
import { fileReducer, FileState } from '@application/file/FileReducer';

export interface AppState {
    user: UserState;
    post: PostState;
    file: FileState;
    error: Error | null;
    isProcessing: { [key in AppAction['type']]?: true };
}

export type SetErrorAction = { type: 'APP/SET_ERROR'; payload: Error };
export type ResetErrorAction = { type: 'APP/RESET_ERROR' };

export type StartProcessingAction = {
    type: 'APP/START_PROCESSING';
    payload: AppAction['type'];
};
export type FinishProcessingAction = {
    type: 'APP/FINISH_PROCESSING';
    payload: AppAction['type'];
};

export type AppAction =
    | UserAction
    | PostAction
    | FileAction
    | SetErrorAction
    | ResetErrorAction
    | StartProcessingAction
    | FinishProcessingAction;

export const appReducer: (defaultState: AppState) => Reducer<AppState, AppAction> =
    defaultState => {
        const appUserReducer = userReducer(defaultState.user);
        const appPostReducer = postReducer(defaultState.post);
        const appFileReducer = fileReducer(defaultState.file);
        return (state: AppState | undefined, action: AppAction) => {
            if (state === undefined) {
                return defaultState;
            }
            switch (action.type.split('/')[0]) {
                case 'USER':
                    return {
                        ...state,
                        user: appUserReducer(state.user, action as UserAction),
                    };
                case 'POST':
                    return {
                        ...state,
                        post: appPostReducer(state.post, action as PostAction),
                    };
                case 'FILE':
                    return {
                        ...state,
                        file: appFileReducer(state.file, action as FileAction),
                    };
                case 'APP':
                    switch (action.type.split('/')[1]) {
                        case 'SET_ERROR':
                            return { ...state, error: (action as SetErrorAction).payload };
                        case 'RESET_ERROR':
                            return { ...state, error: null };
                        case 'START_PROCESSING':
                            return {
                                ...state,
                                isProcessing: {
                                    ...state.isProcessing,
                                    [(action as StartProcessingAction).payload]: true,
                                },
                            };
                        case 'FINISH_PROCESSING':
                            return {
                                ...state,
                                isProcessing: {
                                    ...state.isProcessing,
                                    [(action as FinishProcessingAction).payload]: undefined,
                                },
                            };
                        default:
                            return state;
                    }
                default:
                    return state;
            }
        };
    };

export const errorHandlingMiddlewareWrapper = (
    middlewareApi: MiddlewareAPI<Dispatch<AppAction>, AppState>,
    fn: () => Promise<any>,
) =>
    fn().catch(exc => {
        middlewareApi.dispatch({ type: 'APP/SET_ERROR', payload: exc });
    });

export const displayProcessMiddlewareWrapper = (
    middlewareApi: MiddlewareAPI<Dispatch<AppAction>, AppState>,
    action: AppAction,
    fn: () => Promise<any>,
) =>
    Promise.resolve()
        .then(() =>
            middlewareApi.dispatch({ type: 'APP/START_PROCESSING', payload: action.type }),
        )
        .then(() => fn())
        .finally(() =>
            middlewareApi.dispatch({ type: 'APP/FINISH_PROCESSING', payload: action.type }),
        );

export const commonApiMiddlewareWrapper = (
    middlewareApi: MiddlewareAPI<Dispatch<AppAction>, AppState>,
    action: AppAction,
    fn: () => Promise<any>,
) => {
    displayProcessMiddlewareWrapper(middlewareApi, action, () =>
        errorHandlingMiddlewareWrapper(middlewareApi, fn),
    );
    return action;
};

export const loggingMiddleware =
    (api: MiddlewareAPI<Dispatch<AppAction>, AppState>) =>
    (next: Dispatch<AppAction>) =>
    (action: AppAction) => {
        const nextAction = next(action);
        console.log(`%cNEXT STATE:`, 'color: yellow;', api.getState());
        return nextAction;
    };
