import BackendApi, {
    BackendFileApi,
    BackendPostApi,
    BackendUserApi,
    FetchingRequest,
    fileContentType,
    FileContentType,
    FullRequest,
    jsonContentType,
    JsonContentType,
    PreparedRequest,
    Query,
} from './BackendApi';
import FetchUserApi from './FetchUserApi';
import FrontendSession from '@entity/Session';
import { createSign, verifySign } from '@utils/crypto/ecdsa';
import FetchPostApi from '@api/FetchPostApi';
import FetchFileApi from '@api/FetchFileApi';
import { arrayBufferToHex } from '@utils/transforms';

export default class FetchBackendApi implements BackendApi {
    userApi: BackendUserApi;
    postApi: BackendPostApi;
    fileApi: BackendFileApi;

    constructor(
        private session: FrontendSession,
        private readonly serverPublicKey: CryptoKey,
        private readonly regenerateSessionFn: (
            oldSession: FrontendSession,
        ) => Promise<FrontendSession>,
    ) {
        this.userApi = new FetchUserApi(this);
        this.postApi = new FetchPostApi(this);
        this.fileApi = new FetchFileApi(this);
    }

    regenerateSession = async () => {
        this.session = await this.regenerateSessionFn(this.session);
    };

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
        result: { url: string; method: string; body?: string; checksum?: string },
        signature: string,
    ) => verifySign(this.serverPublicKey, signature, this.stringifyResult(result));

    private stringifyResult = (result: {
        url: string;
        method: string;
        body?: string;
        checksum?: string;
    }) =>
        `{"url":"${result.url}","method":"${result.method}"${
            result.body ? `,"body":${result.body}` : ''
        }${result.checksum ? `,"checksum":"${result.checksum}"` : ''}}`;

    private makeRequest = async (
        method: string,
        { fullUrl, body }: PreparedRequest,
        expectedContentTypes: JsonContentType | FileContentType,
    ) => {
        const signature = await this.signRequest({
            url: fullUrl,
            browserName: this.session.browserName,
            osName: this.session.osName,
            method,
            body,
        });
        return fetch(fullUrl, {
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
            if (res.ok) {
                const contentType = res.headers.get('content-type')?.split(';')[0];
                if (expectedContentTypes.find(type => type === contentType)) {
                    return res;
                } else {
                    throw new Error(`Unexpected content type: ${contentType}`);
                }
            } else {
                const errorText = await res.text();
                throw new Error(errorText);
            }
        });
    };

    private fileRequest = async (
        method: string,
        { url, query, body }: FullRequest,
        checksum: string,
    ) => {
        const fullUrl = this.buildFullUrl(url, query);
        return this.makeRequest(method, { fullUrl, body }, fileContentType).then(async res => {
            const verifyObject: any = { url: fullUrl, method };
            const body = await res.arrayBuffer();
            verifyObject.checksum = arrayBufferToHex(
                await window.crypto.subtle.digest({ name: 'SHA-512' }, body),
            );
            const verifyResult = await this.verifyRequest(
                verifyObject,
                res.headers.get('X-Signature') ?? '',
            );
            if (!verifyResult || checksum !== verifyObject.checksum) {
                throw new Error("Can't verify server response");
            }
            return body;
        });
    };

    private jsonRequest = async (method: string, { url, query, body }: FullRequest) => {
        const fullUrl = this.buildFullUrl(url, query);
        return this.makeRequest(method, { fullUrl, body }, jsonContentType).then(async res => {
            const verifyObject: any = { url: fullUrl, method };
            let body = await res.text();
            verifyObject.body = body;
            try {
                body = JSON.parse(body);
            } catch (exc) {}
            const verifyResult = await this.verifyRequest(
                verifyObject,
                res.headers.get('X-Signature') ?? '',
            );
            if (!verifyResult) {
                throw new Error("Can't verify server response");
            }
            return body;
        });
    };

    getJson = async (request: FetchingRequest) => this.jsonRequest('GET', request);

    getFile = async (request: FetchingRequest, checksum: string) =>
        this.fileRequest('GET', request, checksum);

    post = async (request: FullRequest) => this.jsonRequest('POST', request);

    put = async (request: FullRequest) => this.jsonRequest('PUT', request);

    delete = async (request: FetchingRequest) => this.jsonRequest('DELETE', request);
}
