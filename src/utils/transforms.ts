export function stringToUint8Array(text: string): Uint8Array {
    const bufView = new Uint8Array(text.length);
    for (let i = 0, strLen = text.length; i < strLen; i++) {
        bufView[i] = text.charCodeAt(i);
    }
    return bufView;
}

export function stringToArrayBuffer(text: string): ArrayBuffer {
    return stringToUint8Array(text).buffer;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export function arrayBufferToHex(buffer: ArrayBuffer): string {
    return [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, '0')).join('');
}