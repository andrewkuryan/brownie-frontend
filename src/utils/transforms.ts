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

export function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
