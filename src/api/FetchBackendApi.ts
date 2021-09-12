import { arrayBufferToBase64, stringToArrayBuffer } from '@utils/transforms';
import BackendApi, { BackendUserApi, FetchingRequest, FullRequest, Query } from './BackendApi';
import FetchUserApi from './FetchUserApi';
import FrontendSession from '@entity/Session';

export default class FetchBackendApi implements BackendApi {
    userApi: BackendUserApi;

    constructor(private session: FrontendSession) {
        this.userApi = new FetchUserApi(this);
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
        console.log('Request: ', request);
        const signature = await window.crypto.subtle.sign(
            {
                name: 'ECDSA',
                hash: 'SHA-512', // SHA-1, SHA-256, SHA-384, or SHA-512
            },
            this.session.privateKey,
            stringToArrayBuffer(JSON.stringify(request)),
        );
        return arrayBufferToBase64(signature);
    };

    private jsonRequest = async (method: string, { url, query, body }: FullRequest) => {
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
                'X-PublicKey': this.session.publicKey,
                'X-BrowserName': this.session.browserName,
                'X-OsName': this.session.osName,
                'X-Signature': signature,
                ...(body ? { 'Content-Type': 'application/json' } : {}),
            },
            ...(body ? { body: JSON.stringify(body) } : {}),
        }).then(res => res.json());
    };

    get = async ({ url, query }: FetchingRequest) => this.jsonRequest('GET', { url, query });

    post = async ({ url, query, body }: FullRequest) =>
        this.jsonRequest('POST', { url, query, body });

    put = async ({ url, query, body }: FullRequest) =>
        this.jsonRequest('PUT', { url, query, body });

    delete = async ({ url, query }: FetchingRequest) =>
        this.jsonRequest('DELETE', { url, query });
}
