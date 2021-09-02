import { arrayBufferToBase64, stringToArrayBuffer } from '@utils/transforms';
import BackendApi, { BackendUserApi, FetchingRequest, FullRequest, Query } from './BackendApi';
import FetchUserApi from './FetchUserApi';
import FrontendSession from '@entity/Session';

export default class FetchBackendApi implements BackendApi {
    userApi: BackendUserApi;

    private constructor(private session: FrontendSession, private publicKeyBase64: string) {
        this.userApi = new FetchUserApi(this);
    }

    static async build(session: FrontendSession): Promise<FetchBackendApi> {
        const spki = await window.crypto.subtle.exportKey(
            'spki',
            session.getPublicKey() as CryptoKey,
        );
        return new FetchBackendApi(session, arrayBufferToBase64(spki));
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
            this.session.getPrivateKey(),
            await stringToArrayBuffer(JSON.stringify(request)),
        );
        return arrayBufferToBase64(signature);
    };

    private jsonRequest = async <T>(method: string, { url, query, body }: FullRequest) => {
        const fullUrl = this.buildFullUrl(url, query);
        const signature = await this.signRequest({
            url: fullUrl,
            browserName: this.session.getBrowserName(),
            osName: this.session.getOsName(),
            method: method,
            body,
        });
        return (await fetch(fullUrl, {
            method: method,
            headers: {
                'X-PublicKey': this.publicKeyBase64,
                'X-BrowserName': this.session.getBrowserName(),
                'X-OsName': this.session.getOsName(),
                'X-Signature': signature,
                ...(body ? { 'Content-Type': 'application/json' } : {}),
            },
            ...(body ? { body: JSON.stringify(body) } : {}),
        }).then(res => res.json())) as T;
    };

    get = async <T>({ url, query }: FetchingRequest) =>
        this.jsonRequest<T>('GET', { url, query });

    post = async <T>({ url, query, body }: FullRequest) =>
        this.jsonRequest<T>('POST', { url, query, body });

    put = async <T>({ url, query, body }: FullRequest) =>
        this.jsonRequest<T>('PUT', { url, query, body });

    delete = async <T>({ url, query }: FetchingRequest) =>
        this.jsonRequest<T>('DELETE', { url, query });
}
