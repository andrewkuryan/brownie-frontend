export default class FrontendSession {
    constructor(
        private publicKey: CryptoKey,
        private privateKey: CryptoKey,
        private browserName: string,
        private osName: string,
    ) {}

    getPublicKey() {
        return this.publicKey;
    }

    getPrivateKey() {
        return this.privateKey;
    }

    getBrowserName() {
        return this.browserName;
    }

    getOsName() {
        return this.osName;
    }
}
