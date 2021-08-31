import { FunctionComponent } from 'preact';
import { useEffect } from 'preact/hooks';
import { Router, Route } from 'preact-router';
import RegisterView from './pages/register';

const stringToArrayBuffer = (text: string, encoding = 'UTF-8'): Promise<ArrayBuffer> => {
    return new Promise<ArrayBuffer>((resolve, reject) => {
        const blob = new Blob([text], { type: `text/plain;charset=${encoding}` });
        const reader = new FileReader();
        reader.onload = evt => {
            if (evt.target) {
                resolve(evt.target.result as ArrayBuffer);
            } else {
                reject(new Error('Could not convert string to array!'));
            }
        };
        reader.readAsArrayBuffer(blob);
    });
};


function arrayBufferToBase64( buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array( buffer );
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

async function sign(message: string): Promise<{ publicKey: string; signature: string }> {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: 'ECDSA',
            namedCurve: 'P-521', // P-256, P-384, or P-521
        },
        false,
        ['sign', 'verify'],
    );
    const signature = await window.crypto.subtle.sign(
        {
            name: 'ECDSA',
            hash: 'SHA-512', // SHA-1, SHA-256, SHA-384, or SHA-512
        },
        keyPair.privateKey as CryptoKey, // ECDSA private key
        await stringToArrayBuffer(message), // BufferSource
    );
    const spki = await window.crypto.subtle.exportKey('spki', keyPair.publicKey as CryptoKey);
    return {
        publicKey: arrayBufferToBase64(spki),
        signature: arrayBufferToBase64(signature),
    };
}

export const MainView: FunctionComponent = () => {
    useEffect(() => {
        const message = 'Test message';

        sign(message).then(res => {
            console.log(res);

            fetch(`/test-sign?message=${message}`, {
                method: 'GET',
                headers: {
                    "signature": res.signature, // res.signature.substring(0, 1) + 'A' + res.signature.substring(2, res.signature.length),
                    "publicKey": res.publicKey,
                }
            });
        });
    });

    return (
        <Router>
            <Route component={RegisterView} path="/register" />
        </Router>
    );
};
