import { render } from 'preact';
import { MainView } from './Main';

import FrontendSession from '@entity/Session';
import { exportPublicKey, getEcdsaKeyPair, parsePublicKey } from '@utils/crypto/ecdsa';
import { detect } from 'detect-browser';

import FetchBackendApi from '@api/FetchBackendApi';
import SrpGenerator from '@utils/crypto/srp';
import { applyMiddleware, createStore } from 'redux';
import { AppAction, appReducer, AppState, defaultAppState } from '@application/Store';
import {
    addEmailMiddleware,
    fulfillUserMiddleware,
    loadUserMiddleware,
    loginMiddleware,
    verifyContactMiddleware,
} from '@application/user/UserMiddleware';
import { useStore } from '@utils/redux';

import './index.styl';

async function createSession(): Promise<FrontendSession> {
    const keyPair = await getEcdsaKeyPair();
    const browser = detect();
    const exportedPublicKey = await exportPublicKey(keyPair.publicKey!);
    return new FrontendSession(
        exportedPublicKey,
        keyPair.privateKey!,
        browser?.name || 'unknown',
        browser?.os || 'unknown',
    );
}

createSession().then(async session => {
    const serverPublicKey = await parsePublicKey(ECDSA_SERVER_PUBLIC_KEY);
    const api = new FetchBackendApi(session, serverPublicKey);
    const srpGenerator = await SrpGenerator.build(
        BigInt('0x' + SRP_N),
        parseInt(SRP_NBitLen),
        BigInt('0x' + SRP_g),
    );
    const store = createStore<AppState, AppAction, {}, {}>(
        appReducer,
        defaultAppState,
        applyMiddleware(
            loadUserMiddleware(api),
            addEmailMiddleware(api),
            verifyContactMiddleware(api),
            fulfillUserMiddleware(api, srpGenerator),
            loginMiddleware(api, srpGenerator),
        ),
    );
    store.dispatch({ type: 'USER/LOAD' });
    if (typeof stopBrownieIndicator === 'function') {
        stopBrownieIndicator();
    }
    render(
        <MainView useStore={getter => useStore(store, getter)} dispatch={store.dispatch} />,
        document.body,
        document.getElementById('app')!,
    );
});
