import { Dispatch, MiddlewareAPI, Store } from 'redux';
import { useEffect, useState } from 'preact/hooks';
import { AppAction, AppState } from '@application/Store';

export function useStore<T>(
    store: Store<AppState, AppAction>,
    getter: (state: AppState) => T,
    componentName?: string,
) {
    const [reduxState, setReduxState] = useState(getter(store.getState()));
    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            if (!deepEqual(getter(store.getState()), reduxState)) {
                console.log(`%cUPDATE COMPONENT ${componentName}`, 'color: red;');
                setReduxState(getter(store.getState()));
            }
        });
        return () => unsubscribe();
    }, [reduxState]);
    return reduxState;
}

export const middlewareForActionType = <T extends AppAction>(
    actionType: T['type'],
    middleware: (
        middlewareApi: MiddlewareAPI<Dispatch<AppAction>, AppState>,
        action: T,
    ) => AppAction,
) => {
    return (api: MiddlewareAPI<Dispatch<AppAction>, AppState>) =>
        (next: Dispatch<AppAction>) =>
        (action: AppAction) => {
            if (action.type === actionType) {
                return next(middleware(api, action as T));
            } else {
                return next(action);
            }
        };
};

export function deepEqual(x: any, y: any) {
    if (x === y) {
        return true;
    } else if (typeof x == 'object' && x != null && typeof y == 'object' && y != null) {
        if (Object.keys(x).length !== Object.keys(y).length) {
            return false;
        }
        if (x.constructor.name !== y.constructor.name) {
            return false;
        }
        for (const prop in x) {
            if (x.hasOwnProperty(prop)) {
                if (y.hasOwnProperty(prop)) {
                    if (!deepEqual(x[prop], y[prop])) {
                        return false;
                    }
                } else {
                    return false;
                }
            }
        }
        return true;
    } else {
        return false;
    }
}
