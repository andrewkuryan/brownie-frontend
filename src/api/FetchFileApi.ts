import BackendApi, { BackendFileApi } from '@api/BackendApi';
import { StorageFile } from '@entity/StorageFile';

export default class FetchFileApi implements BackendFileApi {
    constructor(private backendApi: BackendApi) {}

    getFileContent(file: StorageFile): Promise<ArrayBuffer> {
        return this.backendApi.getFile({ url: `/api/files/${file.id}` }, file.checksum);
    }
}
