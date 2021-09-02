import BackendApi, { BackendUserApi } from './BackendApi';
import { GuestUser, User } from '@entity/User';

export default class FetchUserApi implements BackendUserApi {
    constructor(private backendApi: BackendApi) {}

    async getUser(): Promise<User> {
        const result = await this.backendApi.get({ url: '/api/user' });
        let user;
        switch (result.type) {
            case 'GuestUser':
                user = new GuestUser(result.data.id, result.data.permissions)
                break;
            default:
                throw new Error(`Unknown object type: ${result.type}`)
        }
        return user;
    }
}
