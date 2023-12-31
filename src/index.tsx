import { render } from 'preact';
import { MainView } from './Main';

import FrontendSession from '@entity/Session';
import {
    clearEcdsaStorage,
    exportPublicKey,
    getEcdsaKeyPair,
    parsePublicKey,
} from '@utils/crypto/ecdsa';
import { detect } from 'detect-browser';

import FetchBackendApi from '@api/FetchBackendApi';
import SrpGenerator from '@utils/crypto/srp';
import { applyMiddleware, createStore } from 'redux';
import { AppAction, appReducer, AppState, loggingMiddleware } from '@application/Store';
import {
    addEmailMiddleware,
    fulfillUserMiddleware,
    loadUserMiddleware,
    loginMiddleware,
    logoutMiddleware,
    resendVerificationCodeMiddleware,
    verifyContactMiddleware,
} from '@application/user/UserMiddleware';
import { selectPostMiddleware } from '@application/post/PostMiddleware';
import { loadFileMiddleware, releaseFileMiddleware } from '@application/file/FileMiddleware';
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

async function regenerateSession(oldSession: FrontendSession): Promise<FrontendSession> {
    await clearEcdsaStorage();
    const newKeyPair = await getEcdsaKeyPair();
    const exportedPublicKey = await exportPublicKey(newKeyPair.publicKey!);
    return new FrontendSession(
        exportedPublicKey,
        newKeyPair.privateKey!,
        oldSession.browserName,
        oldSession.osName,
    );
}

createSession().then(async session => {
    const serverPublicKey = await parsePublicKey(ECDSA_SERVER_PUBLIC_KEY);
    const api = new FetchBackendApi(session, serverPublicKey, regenerateSession, API_URL);
    const srpGenerator = await SrpGenerator.build(
        BigInt('0x' + SRP_N),
        parseInt(SRP_NBitLen),
        BigInt('0x' + SRP_g),
    );
    const user = await api.userApi.getUser();
    const store = createStore<AppState, AppAction, {}, {}>(
        appReducer({
            error: null,
            isProcessing: {},
            user: {
                currentUser: user,
            },
            post: {
                selectedPost: null,
                selectedPostAuthorInfo: null,
            },
            file: {
                files: {},
            },
        }),
        undefined,
        applyMiddleware(
            loggingMiddleware,
            loadUserMiddleware(api),
            addEmailMiddleware(api),
            resendVerificationCodeMiddleware(api),
            verifyContactMiddleware(api),
            fulfillUserMiddleware(api, srpGenerator),
            loginMiddleware(api, srpGenerator),
            logoutMiddleware(api),
            selectPostMiddleware(api),
            loadFileMiddleware(api),
            releaseFileMiddleware(api),
        ),
    );
    if (typeof stopBrownieIndicator === 'function') {
        stopBrownieIndicator();
    }
    render(
        <MainView
            useStore={(getter, componentName) => useStore(store, getter, componentName)}
            dispatch={store.dispatch}
        />,
        document.body,
        document.getElementById('app')!,
    );
});
