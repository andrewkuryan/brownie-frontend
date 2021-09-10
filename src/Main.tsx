import { FunctionComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { Router, Route } from 'preact-router';
import RegisterView from './pages/register';
import { detect } from 'detect-browser';
import FetchBackendApi from '@api/FetchBackendApi';
import FrontendSession from '@entity/Session';
import { arrayBufferToBase64 } from '@utils/transforms';
import LoadingView from './pages/loading';
import { applyMiddleware, createStore } from 'redux';
import { AppAction, appReducer, AppState, defaultAppState } from '@application/Store';
import { loadUserMiddleware, verifyContactMiddleware } from '@application/user/UserMiddleware';
import { useStore } from '@utils/redux';

async function createSession(): Promise<FrontendSession> {
    const browser = detect();
    const savedPrivateKey = localStorage.getItem('privateKey');
    const savedPublicKey = localStorage.getItem('publicKey');
    if (!savedPrivateKey || !savedPublicKey) {
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: 'ECDSA',
                namedCurve: 'P-521', // P-256, P-384, or P-521
            },
            true,
            ['sign'],
        );
        if (keyPair.publicKey === undefined || keyPair.privateKey === undefined) {
            throw new Error('Can\'t generate key pair');
        }
        const exportedPublicKey = arrayBufferToBase64(
            await crypto.subtle.exportKey('spki', keyPair.publicKey),
        );
        const exportedPrivateKey = arrayBufferToBase64(
            await crypto.subtle.exportKey('pkcs8', keyPair.privateKey),
        );
        localStorage.setItem('publicKey', exportedPublicKey);
        localStorage.setItem('privateKey', exportedPrivateKey);
        return new FrontendSession(
            exportedPublicKey,
            exportedPrivateKey,
            browser?.name || 'unknown',
            browser?.os || 'unknown',
        );
    } else {
        return new FrontendSession(
            savedPublicKey,
            savedPrivateKey,
            browser?.name || 'unknown',
            browser?.os || 'unknown',
        );
    }
}

export type ReduxProps = {
    useStore: <T>(getter: (state: AppState) => T) => T;
    dispatch: (action: AppAction) => void;
};

export const MainView: FunctionComponent = () => {
    const [reduxProps, setReduxProps] = useState<ReduxProps | undefined>(undefined);

    useEffect(() => {
        createSession()
            .then(session => FetchBackendApi.build(session))
            .then(api => {
                const store = createStore<AppState, AppAction, {}, {}>(
                    appReducer,
                    defaultAppState,
                    applyMiddleware(loadUserMiddleware(api), verifyContactMiddleware(api)),
                );
                store.dispatch({ type: 'USER/LOAD' });
                setReduxProps({
                    useStore: getter => useStore(store, getter),
                    dispatch: store.dispatch,
                });
            });
    }, []);

    return reduxProps === undefined ? (
        <LoadingView />
    ) : (
        <Router>
            <Route
                path='/register'
                component={RegisterView}
                useStore={reduxProps.useStore}
                dispatch={reduxProps.dispatch}
            />
        </Router>
    );
};
