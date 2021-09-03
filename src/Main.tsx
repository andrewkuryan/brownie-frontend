import { FunctionComponent } from 'preact';
import { useEffect } from 'preact/hooks';
import { Router, Route } from 'preact-router';
import RegisterView from './pages/register';
import { detect } from 'detect-browser';
import FetchBackendApi from '@api/FetchBackendApi';
import FrontendSession from '@entity/Session';
import { arrayBufferToBase64 } from '@utils/transforms';

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
            throw new Error("Can't generate key pair");
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

export const MainView: FunctionComponent = () => {
    useEffect(() => {
        createSession()
            .then(session => FetchBackendApi.build(session))
            .then(api => api.userApi.getUser())
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
