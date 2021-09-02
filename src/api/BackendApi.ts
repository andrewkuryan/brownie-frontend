import { User } from '@entity/User';

export type Query = { [_: string]: string };
export type FullRequest = { url: string; query?: Query; body?: any };
export type FetchingRequest = { url: string; query?: Query };

export default interface BackendApi {
    get: (params: FetchingRequest) => Promise<any>;
    post: (params: FullRequest) => Promise<any>;
    put: (params: FullRequest) => Promise<any>;
    delete: (params: FetchingRequest) => Promise<any>;

    userApi: BackendUserApi;
}

export interface BackendUserApi {
    getUser: () => Promise<User>;
}
