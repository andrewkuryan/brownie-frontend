import { ActiveUserContact, UserContact } from '@entity/Contact';

export type UserPermission = 'BrowseOwnPosts' | 'BrowseAllPosts' | 'CreatePosts';

export class GuestUser {
    constructor(
        public readonly id: number,
        public readonly permissions: Array<UserPermission>,
    ) {}
}

export class BlankUser {
    constructor(
        public readonly id: number,
        public readonly permissions: Array<UserPermission>,
        public readonly contact: UserContact,
    ) {}
}

export class ActiveUser {
    constructor(
        public readonly id: number,
        public readonly permissions: Array<UserPermission>,
        public readonly contacts: Array<UserContact>,
        public readonly data: UserData,
        public readonly publicItems: Array<UserPublicItemType>,
    ) {}
}

export class UserData {
    constructor(public readonly login: string) {}
}

export type User = GuestUser | BlankUser | ActiveUser;

export type UserPublicItemType = 'ID' | 'LOGIN' | 'CONTACTS';

export class IDPublicItem {
    constructor(public readonly value: number) {}
}
export class LoginPublicItem {
    constructor(public readonly value: string) {}
}
export class ContactsPublicItem {
    constructor(public readonly value: Array<ActiveUserContact>) {}
}
export type UserPublicItem = IDPublicItem | LoginPublicItem | ContactsPublicItem;

export function userDisplayName(user: User) {
    if (user instanceof GuestUser || user instanceof BlankUser) {
        return `Guest (${user.id})`;
    } else {
        return user.data.login;
    }
}

export function userLogin(publicItems: Array<UserPublicItem>): string | null {
    return (
        (publicItems.find(item => item instanceof LoginPublicItem) as LoginPublicItem)
            ?.value ?? null
    );
}

export function userContacts(user: User) {
    if (user instanceof GuestUser) {
        return []
    } else if (user instanceof BlankUser) {
        return [user.contact]
    } else {
        return user.contacts;
    }
}
