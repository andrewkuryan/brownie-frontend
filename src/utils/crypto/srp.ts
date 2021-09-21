import { generateRandomHex, generateRandomInt, modExp, nZero } from '@utils/crypto/common';
import { hash512 } from '@utils/crypto/sha';

export default class SrpGenerator {
    private constructor(
        private readonly N: bigint,
        private readonly NBitLen: number,
        private readonly g: bigint,
        private readonly k: bigint,
    ) {}

    static async build(N: bigint, NBitLen: number, g: bigint): Promise<SrpGenerator> {
        const nHex = N.toString(16);
        const gHex = g.toString(16);
        const hashIn =
            ((nHex.length & 1) == 0 ? nHex : '0' + nHex) +
            nZero(nHex.length - gHex.length) +
            gHex;
        const kTmp = BigInt('0x' + hash512(hashIn));
        return kTmp < N
            ? new SrpGenerator(N, NBitLen, g, kTmp)
            : new SrpGenerator(N, NBitLen, g, kTmp % N);
    }

    async generateSaltVerifier(
        login: string,
        password: string,
    ): Promise<{ salt: string; verifier: bigint }> {
        const salt = generateRandomHex(32);
        const x = await this.computeX(login, password, salt);
        const verifier = modExp(this.g, x, this.N);
        return { salt: salt, verifier };
    }

    async computeX(login: string, password: string, salt: string): Promise<bigint> {
        const iHex = hash512(login + ':' + password);
        const oHex = hash512(salt + iHex);
        const xTmp = BigInt('0x' + oHex);
        return xTmp < this.N ? xTmp : xTmp % (this.N - BigInt(1));
    }

    generateA(): { a: bigint; A: bigint } {
        const a = generateRandomInt(2048);
        return { a, A: modExp(this.g, a, this.N) };
    }

    async computeU(A: bigint, B: bigint) {
        const aHex = A.toString(16);
        const bHex = B.toString(16);
        const nLen = 2 * ((this.NBitLen + 7) >> 3);
        const hashIn = nZero(nLen - aHex.length) + aHex + nZero(nLen - bHex.length) + bHex;
        const uTmp = BigInt('0x' + hash512(hashIn));
        return uTmp < this.N ? uTmp : uTmp % (this.N - BigInt(1));
    }

    async computeSession(
        username: string,
        password: string,
        saltHex: string,
        a: bigint,
        A: bigint,
        B: bigint,
    ): Promise<bigint> {
        const u = await this.computeU(A, B);
        const x = await this.computeX(username, password, saltHex);
        return modExp(B - this.k * modExp(this.g, x, this.N), a + u * x, this.N);
    }

    async computeM(username: string, saltHash: string, A: bigint, B: bigint, KHex: string) {
        const NHex = BigInt('0x' + hash512(this.N.toString(16)));
        const gHex = BigInt('0x' + hash512(this.g.toString(16)));
        return hash512(
            (NHex ^ gHex).toString(16) +
                hash512(username) +
                saltHash +
                A.toString(16) +
                B.toString(16) +
                KHex,
        );
    }

    computeR(A: bigint, MHex: string, KHex: string) {
        return hash512(A.toString(16) + MHex + KHex);
    }
}
