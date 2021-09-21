import { arrayBufferToHex } from '@utils/transforms';

export function generateRandomHex(byteSize: number): string {
    const arr = new Uint8Array(byteSize);
    crypto.getRandomValues(arr);
    return arrayBufferToHex(arr.buffer);
}

export function generateRandomInt(bitSize: number): bigint {
    const length = Math.ceil(bitSize / 32);
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    const bitString = arr
        .reduce((prev, cur) => {
            const curBit = cur.toString(2);
            return prev + nZero(32 - curBit.length) + curBit;
        }, '')
        .substr(0, bitSize);
    return BigInt('0b' + bitString);
}

export function nZero(n: number): string {
    if (n < 1) {
        return '';
    }
    const t = nZero(n >> 1);
    if ((n & 1) === 0) {
        return t + t;
    } else {
        return t + t + '0';
    }
}

export function modExp(base: bigint, exp: bigint, N: bigint): bigint {
    if (exp === BigInt(0)) {
        return BigInt(1);
    }
    const z = modExp(base, exp / BigInt(2), N);
    if (exp % BigInt(2) === BigInt(0)) {
        return (z * z) % N;
    } else {
        return (base * z * z) % N;
    }
}
