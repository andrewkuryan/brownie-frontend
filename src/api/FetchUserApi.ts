import BackendApi, { BackendUserApi } from './BackendApi';
import { ActiveUser, BlankUser, GuestUser, Permission, User, UserData } from '@entity/User';
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
        const result = await this.backendApi.get({ url: '/api/user' });
        return parseUser(result);
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
            return new ActiveUser(id, permissions as Permission[], contacts, userData);
        default:
            throw new Error(`Unknown User type: ${type}`);
    }
}

function parseUserData(parsedJson: any): UserData {
    const login = getApiValue(parsedJson, 'login', 'string?');
    return new UserData(login);
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
