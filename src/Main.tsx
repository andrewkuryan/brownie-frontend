import { FunctionComponent } from 'preact';
import { useEffect } from 'preact/hooks';
import { Router, Route } from 'preact-router';
import RegisterView from './pages/register';
import { detect } from 'detect-browser';
import BackendApi, { FrontendSession } from './api/BackendApi';

async function createSession(): Promise<FrontendSession> {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: 'ECDSA',
            namedCurve: 'P-521', // P-256, P-384, or P-521
        },
        false,
        ['sign', 'verify'],
    );
    if (keyPair.publicKey === undefined || keyPair.privateKey === undefined) {
        throw new Error("Can't generate key pair");
    }
    const browser = detect();
    return {
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey,
        browserName: browser?.name || 'unknown',
        osName: browser?.os || 'unknown',
    };
}

export const MainView: FunctionComponent = () => {
    useEffect(() => {
        createSession()
            .then(session => BackendApi.build(session))
            .then(api => api.testCreate({ text: 'Test message' }))
            .then(res => res.json())
            .then(result => {
                console.log(result);
            });
    });

    return (
        <Router>
            <Route component={RegisterView} path="/register" />
        </Router>
    );
};
