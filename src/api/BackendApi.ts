import { User } from '@entity/User';

export type Query = { [_: string]: string };
export type FullRequest = { url: string; query?: Query; body?: any };
export type FetchingRequest = { url: string; query?: Query };

export default interface BackendApi {
    get: <T>(params: FetchingRequest) => Promise<T>;
    post: <T>(params: FullRequest) => Promise<T>;
    put: <T>(params: FullRequest) => Promise<T>;
    delete: <T>(params: FetchingRequest) => Promise<T>;

    userApi: BackendUserApi;
}

export interface BackendUserApi {
    getUser: () => Promise<User>;
}
