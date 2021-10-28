import { UserContact } from '@entity/Contact';

export type Permission = 'READ_UPDATES';

export class GuestUser {
    constructor(public readonly id: number, public readonly permissions: Array<Permission>) {}
}

export class BlankUser {
    constructor(
        public readonly id: number,
        public readonly permissions: Array<Permission>,
        public readonly contact: UserContact,
    ) {}
}

export class ActiveUser {
    constructor(
        public readonly id: number,
        public readonly permissions: Array<Permission>,
        public readonly contacts: Array<UserContact>,
        public readonly data: UserData,
    ) {}
}

export class UserData {
    constructor(public readonly login: string) {}
}

export type User = GuestUser | BlankUser | ActiveUser;

export function userDisplayName(user: User) {
    if (user instanceof GuestUser || user instanceof BlankUser) {
        return `Guest (${user.id})`;
    } else {
        return user.data.login;
    }
}
