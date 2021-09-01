import { arrayBufferToBase64, stringToArrayBuffer } from '../utils/transforms';

export interface FrontendSession {
    publicKey: CryptoKey;
    privateKey: CryptoKey;
    browserName: string;
    osName: string;
}

type Query = { [_: string]: string };
type FullRequest = { url: string; query?: Query; body?: any };
type FetchingRequest = { url: string; query?: Query };

export default class BackendApi {
    private constructor(private session: FrontendSession, private publicKeyBase64: string) {}

    static async build(session: FrontendSession): Promise<BackendApi> {
        const spki = await window.crypto.subtle.exportKey(
            'spki',
            session.publicKey as CryptoKey,
        );
        return new BackendApi(session, arrayBufferToBase64(spki));
    }

    private buildQueryString = (query: Query) =>
        Object.entries(query)
            .map(([k, v]) => `${k}=${v}`)
            .join('&');

    private buildFullUrl = (url: string, query?: Query) => {
        if (query) {
            return `${url}?${this.buildQueryString(query)}`;
        } else {
            return url;
        }
    };

    private signRequest = async (request: {
        url: string;
        browserName: string;
        osName: string;
        method: string;
        body?: any;
    }) => {
        console.log(JSON.stringify(request));
        const signature = await window.crypto.subtle.sign(
            {
                name: 'ECDSA',
                hash: 'SHA-512', // SHA-1, SHA-256, SHA-384, or SHA-512
            },
            this.session.privateKey,
            await stringToArrayBuffer(JSON.stringify(request)),
        );
        return arrayBufferToBase64(signature);
    };

    private request = async (method: string, { url, query, body }: FullRequest) => {
        const fullUrl = this.buildFullUrl(url, query);
        const signature = await this.signRequest({
            url: fullUrl,
            browserName: this.session.browserName,
            osName: this.session.osName,
            method: method,
            body,
        });
        return await fetch(fullUrl, {
            method: method,
            headers: {
                'X-PublicKey': this.publicKeyBase64,
                'X-BrowserName': this.session.browserName,
                'X-OsName': this.session.osName,
                'X-Signature': signature,
                ...(body ? { 'Content-Type': 'application/json' } : {}),
            },
            ...(body ? { body: JSON.stringify(body) } : {}),
        });
    };

    private get = async ({ url, query }: FetchingRequest) =>
        this.request('GET', { url, query });

    private post = async ({ url, query, body }: FullRequest) =>
        this.request('POST', { url, query, body });

    private put = async ({ url, query, body }: FullRequest) =>
        this.request('PUT', { url, query, body });

    private delete = async ({ url, query }: FetchingRequest) =>
        this.request('DELETE', { url, query });

    test = (message: string) => {
        return this.get({ url: '/api/test-sign', query: { message } });
    };

    testCreate = (message: { text: string }) => {
        return this.post({ url: '/api/test-post', body: message });
    };
}
