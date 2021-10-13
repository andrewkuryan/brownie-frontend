import { FunctionComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { Router, Route } from 'preact-router';
import RegisterView from './pages/register';
import LoginView from './pages/login';
import { detect } from 'detect-browser';
import FetchBackendApi from '@api/FetchBackendApi';
import FrontendSession from '@entity/Session';
import LoadingView from './pages/loading';
import { applyMiddleware, createStore } from 'redux';
import { AppAction, appReducer, AppState, defaultAppState } from '@application/Store';
import {
    fulfillUserMiddleware,
    loginMiddleware,
    loadUserMiddleware,
    verifyContactMiddleware,
    addEmailMiddleware,
} from '@application/user/UserMiddleware';
import { useStore } from '@utils/redux';
import SrpGenerator from '@utils/crypto/srp';
import { exportPublicKey, getEcdsaKeyPair, parsePublicKey } from '@utils/crypto/ecdsa';

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

export type ReduxProps = {
    useStore: <T>(getter: (state: AppState) => T) => T;
    dispatch: (action: AppAction) => void;
};

export const MainView: FunctionComponent = () => {
    const [reduxProps, setReduxProps] = useState<ReduxProps | undefined>(undefined);

    useEffect(() => {
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
