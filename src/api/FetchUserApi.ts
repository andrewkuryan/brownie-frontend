import BackendApi, {
    BackendUserApi,
    FulfillUserParams,
    InitLoginParams,
    VerifyLoginParams,
} from './BackendApi';
import {
    ActiveUser,
    BlankUser,
    ContactsPublicItem,
    GuestUser,
    IDPublicItem,
    LoginPublicItem,
    Permission,
    User,
    UserData,
    UserPublicItem,
    UserPublicItemType,
} from '@entity/User';
import { getApiValue, getApiValues } from '@utils/parser';
import {
    ActiveUserContact,
    EmailContactData,
    TelegramContactData,
    UnconfirmedUserContact,
    UserContact,
} from '@entity/Contact';

export default class FetchUserApi implements BackendUserApi {
    constructor(private backendApi: BackendApi) {}

    async getUser(): Promise<User> {
        const result = await this.backendApi.getJson({ url: '/api/user' });
        return parseUser(result);
    }

    async addEmail(emailAddress: string) {
        const result = await this.backendApi.post({
            url: '/api/user/contact/email',
            body: { emailAddress },
        });
        return parseContact(result);
    }

    async resendVerificationCode() {
        const result = await this.backendApi.post({
            url: '/api/user/contact/resend-code',
        });
        return parseContact(result);
    }

    async verifyContact(contact: UserContact, verificationCode: string) {
        const result = await this.backendApi.post({
            url: `/api/user/contact/${contact.id}/verify`,
            body: { verificationCode },
        });
        return parseContact(result);
    }

    async fulfillUser(params: FulfillUserParams) {
        const result = await this.backendApi.put({
            url: '/api/user/fulfill',
            body: params,
        });
        return parseUser(result) as ActiveUser;
    }

    async initLogin(params: InitLoginParams) {
        const result = await this.backendApi.post({
            url: '/api/user/login/init',
            body: params,
        });
        return getApiValues(result, { salt: 'string', BHex: 'string' });
    }

    async verifyLogin(params: VerifyLoginParams) {
        const result = await this.backendApi.post({
            url: '/api/user/login/verify',
            body: params,
        });
        const { RHex, user } = getApiValues(result, { RHex: 'string', user: 'object' });
        return { RHex, user: parseUser(user) as ActiveUser };
    }

    async logout() {
        await this.backendApi.post({
            url: '/api/user/logout',
        });
    }

    async getUserPublicInfo(userId: number) {
        const result = await this.backendApi.getJson({
            url: `/api/user/${userId}/info`,
        });
        return parseUserInfo(result);
    }
}

function parseUser(parsedJson: any): User {
    const { type, data } = getApiValues(parsedJson, { type: 'string', data: 'object' });
    const { id, permissions } = getApiValues(data, { id: 'number', permissions: 'string[]' });
    switch (type) {
        case 'GuestUser':
            return new GuestUser(id, permissions as Permission[]);
        case 'BlankUser':
            const contact = parseContact(getApiValue(data, 'contact', 'object'));
            return new BlankUser(id, permissions as Permission[], contact);
        case 'ActiveUser':
            const contacts = getApiValue(data, 'contacts', 'object[]').map(parseContact);
            const userData = parseUserData(getApiValue(data, 'data', 'object'));
            const publicItems = getApiValue(parsedJson, 'publicItems', 'string[]');
            return new ActiveUser(
                id,
                permissions as Permission[],
                contacts,
                userData,
                publicItems as Array<UserPublicItemType>,
            );
        default:
            throw new Error(`Unknown User type: ${type}`);
    }
}

function parseUserData(parsedJson: any): UserData {
    const login = getApiValue(parsedJson, 'login', 'string');
    return new UserData(login);
}

function parseUserInfo(parsedJson: any): Array<UserPublicItem> {
    return parsedJson.map((rawItem: any) => {
        const { type, data } = getApiValues(rawItem, { type: 'string', data: 'object' });
        switch (type) {
            case 'ID':
                const idValue = getApiValue(data, 'value', 'number');
                return new IDPublicItem(idValue);
            case 'Login':
                const loginValue = getApiValue(data, 'value', 'string');
                return new LoginPublicItem(loginValue);
            case 'Contacts':
                const contactsValue = getApiValue(data, 'value', 'object[]').map(parseContact);
                return new ContactsPublicItem(contactsValue);
        }
    });
}

function parseContact(parsedJson: any): UserContact {
    const { type: contactType, data: rawContact } = getApiValues(parsedJson, {
        type: 'string',
        data: 'object',
    });
    const { id: contactId, data: rawContactDataInfo } = getApiValues(rawContact, {
        id: 'number',
        data: 'object',
    });
    const { type: contactDataType, data: rawContactData } = getApiValues(rawContactDataInfo, {
        type: 'string',
        data: 'object',
    });
    let contactData;
    switch (contactDataType) {
        case 'EmailContactData':
            const emailAddress = getApiValue(rawContactData, 'emailAddress', 'string');
            contactData = new EmailContactData(emailAddress);
            break;
        case 'TelegramContactData':
            const { telegramId, firstName, username } = getApiValues(rawContactData, {
                telegramId: 'number',
                firstName: 'string',
                username: 'string?',
            });
            contactData = new TelegramContactData(telegramId, firstName, username);
            break;
        default:
            throw new Error(`Unknown ContactData type: ${contactDataType}`);
    }
    switch (contactType) {
        case 'UnconfirmedUserContact':
            return new UnconfirmedUserContact(contactId, contactData);
        case 'ActiveUserContact':
            return new ActiveUserContact(contactId, contactData);
        default:
            throw new Error(`Unknown Contact type: ${contactType}`);
    }
}
