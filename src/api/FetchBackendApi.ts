import BackendApi, { BackendUserApi, FetchingRequest, FullRequest, Query } from './BackendApi';
import FetchUserApi from './FetchUserApi';
import FrontendSession from '@entity/Session';
import { createSign, verifySign } from '@utils/crypto/ecdsa';

export default class FetchBackendApi implements BackendApi {
    userApi: BackendUserApi;

    constructor(
        private readonly session: FrontendSession,
        private readonly serverPublicKey: CryptoKey,
    ) {
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

    private signRequest = (request: {
        url: string;
        browserName: string;
        osName: string;
        method: string;
        body?: any;
    }) => createSign(this.session.privateKey, JSON.stringify(request));

    private verifyRequest = (
        result: { url: string; method: string; body?: any },
        signature: string,
    ) => verifySign(this.serverPublicKey, signature, JSON.stringify(result));

    private jsonRequest = async (method: string, { url, query, body }: FullRequest) => {
        const fullUrl = this.buildFullUrl(url, query);
        const signature = await this.signRequest({
            url: fullUrl,
            browserName: this.session.browserName,
            osName: this.session.osName,
            method,
            body,
        });
        return await fetch(fullUrl, {
            method,
            headers: {
                'X-PublicKey': this.session.publicKey,
                'X-BrowserName': this.session.browserName,
                'X-OsName': this.session.osName,
                'X-Signature': signature,
                ...(body ? { 'Content-Type': 'application/json' } : {}),
            },
            ...(body ? { body: JSON.stringify(body) } : {}),
        }).then(async res => {
            const body = await res.json();
            const verifyResult = await this.verifyRequest(
                { url: fullUrl, method, body },
                res.headers.get('X-Signature') ?? '',
            );
            if (!verifyResult) {
                throw new Error("Can't verify server response");
            }
            return body;
        });
    };

    get = async (request: FetchingRequest) => this.jsonRequest('GET', request);

    post = async (request: FullRequest) => this.jsonRequest('POST', request);

    put = async (request: FullRequest) => this.jsonRequest('PUT', request);

    delete = async (request: FetchingRequest) => this.jsonRequest('DELETE', request);
}
