import { Dispatch, MiddlewareAPI, Store } from 'redux';
import { useEffect, useState } from 'preact/hooks';
import { AppAction, AppState } from '@application/Store';
import isEqual from 'lodash.isequal';

export function useStore<T>(
    store: Store<AppState, AppAction>,
    getter: (state: AppState) => T,
) {
    const [reduxState, setReduxState] = useState(getter(store.getState()));
    useEffect(() => {
        console.log('Use effect');
        const unsubscribe = store.subscribe(() => {
            if (!isEqual(getter(store.getState()), reduxState)) {
                console.log('New state: ', store.getState());
                setReduxState(getter(store.getState()));
            }
        });
        return () => unsubscribe();
    }, []);
    return reduxState;
}

export const middlewareForActionType = (
    actionType: AppAction['type'],
    middleware: (
        middlewareApi: MiddlewareAPI<Dispatch<AppAction>, AppState>,
        action: AppAction,
    ) => AppAction,
) => {
    return (api: MiddlewareAPI<Dispatch<AppAction>, AppState>) =>
        (next: Dispatch<AppAction>) =>
        (action: AppAction) => {
            if (action.type === actionType) {
                return next(middleware(api, action));
            } else {
                return next(action);
            }
        };
};
