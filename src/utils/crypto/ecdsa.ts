import {
    arrayBufferToBase64,
    base64ToArrayBuffer,
    stringToArrayBuffer,
} from '@utils/transforms';

const algorithm = { name: 'ECDSA', namedCurve: 'P-521' };

function openSignKeyPairStore(): Promise<IDBObjectStore> {
    return new Promise((resolve, reject) => {
        const open = indexedDB.open('BrownieDatabase', 1);
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

export async function getEcdsaKeyPair(): Promise<CryptoKeyPair> {
    const savedKeys = await loadKeys();
    if (savedKeys === null) {
        const keyPair = await window.crypto.subtle.generateKey(algorithm, false, ['sign']);
        if (keyPair.publicKey === undefined || keyPair.privateKey === undefined) {
            throw new Error('Can\'t generate key pair');
        }
        await saveKeys(keyPair);
        return keyPair;
    } else {
        return savedKeys;
    }
}

export async function createSign(privateKey: CryptoKey, message: string): Promise<string> {
    const signature = await crypto.subtle.sign(
        {
            ...algorithm,
            hash: { name: 'SHA-512' },
        },
        privateKey,
        stringToArrayBuffer(message),
    );
    return arrayBufferToBase64(signature);
}

export async function verifySign(
    publicKey: CryptoKey,
    signBase64: string,
    message: string,
): Promise<boolean> {
    return crypto.subtle.verify(
        {
            ...algorithm,
            hash: { name: 'SHA-512' },
        },
        publicKey,
        base64ToArrayBuffer(signBase64),
        stringToArrayBuffer(message),
    );
}

export async function exportPublicKey(key: CryptoKey) {
    return arrayBufferToBase64(await crypto.subtle.exportKey('spki', key));
}

export async function parsePublicKey(base64Key: string) {
    return crypto.subtle.importKey('spki', base64ToArrayBuffer(base64Key), algorithm, false, [
        'verify',
    ]);
}
