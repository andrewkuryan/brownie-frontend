export function stringToArrayBuffer(text: string, encoding = 'UTF-8'): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
        const blob = new Blob([text], { type: `text/plain;charset=${encoding}` });
        const reader = new FileReader();
        reader.onload = evt => {
            if (evt.target) {
                resolve(evt.target.result as ArrayBuffer);
            } else {
                reject(new Error('Could not convert string to array!'));
            }
        };
        reader.readAsArrayBuffer(blob);
    });
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

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}
