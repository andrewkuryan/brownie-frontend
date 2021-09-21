import { arrayBufferToHex, stringToArrayBuffer } from '@utils/transforms';

const ZERO = BigInt(0);
const ONE = BigInt(1);
const TWO = BigInt(2);

const N = BigInt(
    '0x1ebf99b3991d1f5eff8d19cbbd3eef5f1254fa977e08bdc097e5b6fd554649e134327b44d1115ffacf5278614ca4452d68692489c0745392f8db33f4ab74e8251a9e5032f4654ef1c17e286bb875e8d172451c439f4cf71277a16a333be25cd803744ee7888b3a9a8319011e82c58188914cac8c5155c71ac919c9390fe1589b7',
);
const N_BITLEN = 1024;
const g = TWO;
const k = BigInt(
    '0x439ed3dae05ef86e497bb7d9aa27d6907e517c35c526abbb4b833abcf6cc23e0913435c1cdfa1fafcbc491e4602c61f95e47172a02d8ddb3c6b977d5f00b371',
);

export async function generateSaltVerifier(
    login: string,
    password: string,
): Promise<{ salt: string; verifier: bigint }> {
    const saltArrBuff = generateRandomArrayBuffer(32);
    const salt = arrayBufferToHex(saltArrBuff);
    const x = await computeX(login, password, salt);
    const verifier = modExp(g, x, N);
    return { salt: salt, verifier };
}

export function generateA(): { a: bigint; A: bigint } {
    const a = generateRandomInt(512);
    return { a, A: modExp(g, a, N) };
}

export async function computeU(A: bigint, B: bigint) {
    let hashIn = '';
    const aHex = A.toString(16);
    const bHex = B.toString(16);
    const nLen = 2 * ((N_BITLEN + 7) >> 3);
    hashIn += nzero(nLen - aHex.length) + aHex;
    hashIn += nzero(nLen - bHex.length) + bHex;
    const uHash = await sha512Hex(hashIn);
    const uTmp = BigInt('0x' + uHash);
    if (uTmp < N) {
        return uTmp;
    } else {
        return uTmp % (N - ONE);
    }
}

export async function computeX(
    login: string,
    password: string,
    salt: string,
): Promise<bigint> {
    const iHex = await sha512Hex(login + ':' + password);
    const oHex = await sha512Hex(salt + iHex);
    const xTmp = BigInt('0x' + oHex);
    if (xTmp < N) {
        return xTmp;
    } else {
        return xTmp % (N - ONE);
    }
}

export async function computeSession(
    username: string,
    password: string,
    saltHex: string,
    a: bigint,
    A: bigint,
    B: bigint,
): Promise<bigint> {
    const u = await computeU(A, B);
    const x = await computeX(username, password, saltHex);
    return modExp(B - k * modExp(g, x, N), a + u * x, N);
}

export async function computeM(
    username: string,
    saltHash: string,
    A: bigint,
    B: bigint,
    KHex: string,
) {
    const NHex = BigInt('0x' + (await sha512Hex(N.toString(16))));
    const gHex = BigInt('0x' + (await sha512Hex(g.toString(16))));
    return sha512Hex(
        (NHex ^ gHex).toString(16) +
            (await sha512Hex(username)) +
            saltHash +
            A.toString(16) +
            B.toString(16) +
            KHex,
    );
}

export function computeR(A: bigint, MHex: string, KHex: string) {
    return sha512Hex(A.toString(16) + MHex + KHex);
}

function generateRandomArrayBuffer(byteSize: number): ArrayBuffer {
    const arr = new Uint8Array(byteSize);
    crypto.getRandomValues(arr);
    return arr.buffer;
}

export function generateRandomInt(bitSize: number): bigint {
    const length = Math.ceil(bitSize / 32);
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    const bitString = arr
        .reduce((prev, cur) => {
            const curBit = cur.toString(2);
            return prev + nzero(32 - curBit.length) + curBit;
        }, '')
        .substr(0, bitSize);
    return BigInt('0b' + bitString);
}

export async function sha512Hex(message: string): Promise<string> {
    const buf = await crypto.subtle.digest('SHA-512', stringToArrayBuffer(message));
    return arrayBufferToHex(buf);
}

function nzero(n: number): string {
    if (n < 1) {
        return '';
    }
    const t = nzero(n >> 1);
    if ((n & 1) === 0) {
        return t + t;
    } else {
        return t + t + '0';
    }
}

export function modExp(base: bigint, exp: bigint, N: bigint): bigint {
    if (exp === ZERO) {
        return ONE;
    }
    const z = modExp(base, exp / TWO, N);
    if (exp % TWO === ZERO) {
        return (z * z) % N;
    } else {
        return (base * z * z) % N;
    }
}
