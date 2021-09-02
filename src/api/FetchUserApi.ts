import BackendApi, { BackendUserApi } from './BackendApi';
import { User } from '@entity/User';

export default class FetchUserApi implements BackendUserApi {
    constructor(private backendApi: BackendApi) {}

    getUser(): Promise<User> {
        return this.backendApi.get({ url: '/api/user' });
    }
}
