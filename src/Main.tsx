import { FunctionComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { Router, Route } from 'preact-router';
import RegisterView from './pages/register';
import LoginView from './pages/login';
import { detect } from 'detect-browser';
import FetchBackendApi from '@api/FetchBackendApi';
import FrontendSession from '@entity/Session';
import { arrayBufferToBase64 } from '@utils/transforms';
import LoadingView from './pages/loading';
import { applyMiddleware, createStore } from 'redux';
import { AppAction, appReducer, AppState, defaultAppState } from '@application/Store';
import {
    fulfillUserMiddleware,
    loginMiddleware,
    loadUserMiddleware,
    verifyContactMiddleware,
} from '@application/user/UserMiddleware';
import { useStore } from '@utils/redux';

function openSignKeyPairStore(): Promise<IDBObjectStore> {
    return new Promise((resolve, reject) => {
        const open = window.indexedDB.open('BrownieDatabase', 1);
        open.onupgradeneeded = () => {
            const db = open.result;
            db.createObjectStore('SignKeyPairStore', { keyPath: 'id' });
        };
        open.onsuccess = () => {
            const db = open.result;
            const tx = db.transaction('SignKeyPairStore', 'readwrite');
            const store = tx.objectStore('SignKeyPairStore');
            resolve(store);
            tx.oncomplete = () => {
                db.close();
            };
        };
        open.onerror = () => {
            reject();
        };
    });
}

async function saveKeys(keyPair: CryptoKeyPair) {
    const store = await openSignKeyPairStore();
    store.put({ id: 'signKeyPair', keys: keyPair });
}

async function loadKeys(): Promise<CryptoKeyPair | null> {
    const store = await openSignKeyPairStore();
    return new Promise((resolve, reject) => {
        const getData = store.get('signKeyPair');
        getData.onsuccess = () => {
            const keys = getData.result?.keys ?? null;
            resolve(keys);
        };
        getData.onerror = () => {
            reject();
        };
    });
}

async function getKeyPair(): Promise<CryptoKeyPair> {
    const savedKeys = await loadKeys();
    if (savedKeys === null) {
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: 'ECDSA',
                namedCurve: 'P-521', // P-256, P-384, or P-521
            },
            false,
            ['sign'],
        );
        if (keyPair.publicKey === undefined || keyPair.privateKey === undefined) {
            throw new Error("Can't generate key pair");
        }
        await saveKeys(keyPair);
        return keyPair;
    } else {
        return savedKeys;
    }
}

async function createSession(): Promise<FrontendSession> {
    const keyPair = await getKeyPair();
    const browser = detect();
    const exportedPublicKey = arrayBufferToBase64(
        await crypto.subtle.exportKey('spki', keyPair.publicKey!),
    );
    return new FrontendSession(
        exportedPublicKey,
        keyPair.privateKey!,
        browser?.name || 'unknown',
        browser?.os || 'unknown',
    );
}

export type ReduxProps = {
    useStore: <T>(getter: (state: AppState) => T) => T;
    dispatch: (action: AppAction) => void;
};

export const MainView: FunctionComponent = () => {
    const [reduxProps, setReduxProps] = useState<ReduxProps | undefined>(undefined);

    useEffect(() => {
        createSession().then(session => {
            const api = new FetchBackendApi(session);
            const store = createStore<AppState, AppAction, {}, {}>(
                appReducer,
                defaultAppState,
                applyMiddleware(
                    loadUserMiddleware(api),
                    verifyContactMiddleware(api),
                    fulfillUserMiddleware(api),
                    loginMiddleware(api),
                ),
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
                path="/register"
                component={RegisterView}
                useStore={reduxProps.useStore}
                dispatch={reduxProps.dispatch}
            />
            <Route
                path="/login"
                component={LoginView}
                useStore={reduxProps.useStore}
                dispatch={reduxProps.dispatch}
            />
        </Router>
    );
};
