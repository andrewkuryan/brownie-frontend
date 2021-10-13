import { ActiveUser, User } from '@entity/User';
import { ActiveUserContact, UnconfirmedUserContact, UserContact } from '@entity/Contact';

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

export interface FulfillUserParams {
    login: string;
    salt: string;
    verifierHex: string;
}

export interface InitLoginParams {
    login: string;
    AHex: string;
}

export interface InitLoginResponse {
    salt: string;
    BHex: string;
}

export interface VerifyLoginParams {
    login: string;
    AHex: string;
    BHex: string;
    MHex: string;
}

export interface VerifyLoginResponse {
    RHex: string;
    user: ActiveUser;
}

export interface BackendUserApi {
    getUser: () => Promise<User>;
    addEmail: (emailAddress: string) => Promise<UnconfirmedUserContact>;
    verifyContact: (contact: UserContact, verificationCode: string) => Promise<ActiveUserContact>;
    fulfillUser: (params: FulfillUserParams) => Promise<ActiveUser>;
    initLogin: (params: InitLoginParams) => Promise<InitLoginResponse>;
    verifyLogin: (params: VerifyLoginParams) => Promise<VerifyLoginResponse>;
}
