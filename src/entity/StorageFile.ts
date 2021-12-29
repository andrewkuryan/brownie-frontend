export type StorageFileFormat = 'JPG' | 'TEXT' | 'UNDEFINED';

export class StorageFile {
    constructor(
        public readonly id: number,
        public readonly size: number,
        public readonly format: StorageFileFormat,
        public readonly checksum: string,
    ) {}
}
