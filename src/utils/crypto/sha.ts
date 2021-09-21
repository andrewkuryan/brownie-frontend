export function hash512(message: string) {
    return keccak1600(576, 1024, message);
}

function keccak1600(r: number, c: number, M: string) {
    const l = c / 2;
    let msg = utf8Encode(M);

    const state: Array<Array<bigint>> = [[], [], [], [], []];
    for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
            state[x][y] = BigInt(0);
        }
    }

    const q = r / 8 - (msg.length % (r / 8));
    if (q == 1) {
        msg += String.fromCharCode(0x86);
    } else {
        msg += String.fromCharCode(0x06);
        msg += String.fromCharCode(0x00).repeat(q - 2);
        msg += String.fromCharCode(0x80);
    }

    const w = 64;
    const blocksize = (r / w) * 8;

    for (let i = 0; i < msg.length; i += blocksize) {
        for (let j = 0; j < r / w; j++) {
            const i64 =
                (BigInt(msg.charCodeAt(i + j * 8)) << BigInt(0)) +
                (BigInt(msg.charCodeAt(i + j * 8 + 1)) << BigInt(8)) +
                (BigInt(msg.charCodeAt(i + j * 8 + 2)) << BigInt(16)) +
                (BigInt(msg.charCodeAt(i + j * 8 + 3)) << BigInt(24)) +
                (BigInt(msg.charCodeAt(i + j * 8 + 4)) << BigInt(32)) +
                (BigInt(msg.charCodeAt(i + j * 8 + 5)) << BigInt(40)) +
                (BigInt(msg.charCodeAt(i + j * 8 + 6)) << BigInt(48)) +
                (BigInt(msg.charCodeAt(i + j * 8 + 7)) << BigInt(56));
            const x = j % 5;
            const y = Math.floor(j / 5);
            state[x][y] = state[x][y] ^ i64;
        }
        keccak_f_1600(state);
    }

    return transpose(state)
        .map(plane =>
            plane
                .map(lane =>
                    lane.toString(16).padStart(16, '0').match(/.{2}/g)!.reverse().join(''),
                )
                .join(''),
        )
        .join('')
        .slice(0, l / 4);

    function transpose(array: Array<Array<bigint>>) {
        return array.map((row, r) => array.map(col => col[r]));
    }

    function utf8Encode(str: string) {
        try {
            return new TextEncoder()
                .encode(str)
                .reduce((prev, curr) => prev + String.fromCharCode(curr), '');
        } catch (e) {
            return unescape(encodeURIComponent(str));
        }
    }
}

function keccak_f_1600(a: Array<Array<bigint>>) {
    const nRounds = 24;

    const RC = [
        BigInt('0x0000000000000001'),
        BigInt('0x0000000000008082'),
        BigInt('0x800000000000808a'),
        BigInt('0x8000000080008000'),
        BigInt('0x000000000000808b'),
        BigInt('0x0000000080000001'),
        BigInt('0x8000000080008081'),
        BigInt('0x8000000000008009'),
        BigInt('0x000000000000008a'),
        BigInt('0x0000000000000088'),
        BigInt('0x0000000080008009'),
        BigInt('0x000000008000000a'),
        BigInt('0x000000008000808b'),
        BigInt('0x800000000000008b'),
        BigInt('0x8000000000008089'),
        BigInt('0x8000000000008003'),
        BigInt('0x8000000000008002'),
        BigInt('0x8000000000000080'),
        BigInt('0x000000000000800a'),
        BigInt('0x800000008000000a'),
        BigInt('0x8000000080008081'),
        BigInt('0x8000000000008080'),
        BigInt('0x0000000080000001'),
        BigInt('0x8000000080008008'),
    ];

    for (let r = 0; r < nRounds; r++) {
        const C = [],
            D = [];
        for (let x = 0; x < 5; x++) {
            C[x] = a[x][0];
            for (let y = 1; y < 5; y++) {
                C[x] = C[x] ^ a[x][y];
            }
        }
        for (let x = 0; x < 5; x++) {
            D[x] = C[(x + 4) % 5] ^ ROT(C[(x + 1) % 5], 1);
            for (let y = 0; y < 5; y++) {
                a[x][y] = a[x][y] ^ D[x];
            }
        }

        let [x, y] = [1, 0];
        let current = a[x][y];
        for (let t = 0; t < 24; t++) {
            const [X, Y] = [y, (2 * x + 3 * y) % 5];
            const tmp = a[X][Y];
            a[X][Y] = ROT(current, (((t + 1) * (t + 2)) / 2) % 64);
            current = tmp;
            [x, y] = [X, Y];
        }

        for (let y = 0; y < 5; y++) {
            const C = [];
            for (let x = 0; x < 5; x++) C[x] = a[x][y];
            for (let x = 0; x < 5; x++) {
                a[x][y] = C[x] ^ (~C[(x + 1) % 5] & C[(x + 2) % 5]);
            }
        }

        a[0][0] = a[0][0] ^ RC[r];
    }

    function ROT(a: bigint, d: number) {
        return BigInt.asUintN(64, (a << BigInt(d)) | (a >> BigInt(64 - d)));
    }
}
