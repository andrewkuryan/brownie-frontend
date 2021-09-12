export default class FrontendSession {
    constructor(
        public readonly publicKey: string,
        public readonly privateKey: CryptoKey,
        public readonly browserName: string,
        public readonly osName: string,
    ) {}
}
