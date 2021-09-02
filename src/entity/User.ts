type Permission = 'READ_UPDATES';

export class GuestUser {
    constructor(private id: number, private permissions: Array<Permission>) {}

    getId() {
        return this.id;
    }

    getPermissions() {
        return this.permissions;
    }
}

export type User = GuestUser;
