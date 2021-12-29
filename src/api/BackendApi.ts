import { ActiveUser, User, UserPublicItem } from '@entity/User';
import { ActiveUserContact, UnconfirmedUserContact, UserContact } from '@entity/Contact';
import { Post } from '@entity/Post';
import { StorageFile } from '@entity/StorageFile';

export type Query = { [_: string]: string };
export type FullRequest = { url: string; query?: Query; body?: any };
export type PreparedRequest = { fullUrl: string; body?: any };
export type FetchingRequest = { url: string; query?: Query };

export const jsonContentType = ['application/json'];
export type JsonContentType = typeof jsonContentType;

export const fileContentType = ['image/jpeg'];
export type FileContentType = typeof fileContentType;

export default interface BackendApi {
    getJson: (params: FetchingRequest) => Promise<any>;
    getFile: (params: FetchingRequest, checksum: string) => Promise<ArrayBuffer>;
    post: (params: FullRequest) => Promise<any>;
    put: (params: FullRequest) => Promise<any>;
    delete: (params: FetchingRequest) => Promise<any>;

    regenerateSession: () => Promise<void>;

    userApi: BackendUserApi;
    postApi: BackendPostApi;
    fileApi: BackendFileApi;
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
    resendVerificationCode: () => Promise<UnconfirmedUserContact>;
    verifyContact: (
        contact: UserContact,
        verificationCode: string,
    ) => Promise<ActiveUserContact>;
    fulfillUser: (params: FulfillUserParams) => Promise<ActiveUser>;
    initLogin: (params: InitLoginParams) => Promise<InitLoginResponse>;
    verifyLogin: (params: VerifyLoginParams) => Promise<VerifyLoginResponse>;
    logout: () => Promise<void>;

    getUserPublicInfo: (userId: number) => Promise<Array<UserPublicItem>>;
}

export interface BackendPostApi {
    getPostById: (id: number) => Promise<Post>;
}

export interface BackendFileApi {
    getFileContent: (file: StorageFile) => Promise<ArrayBuffer>;
}
