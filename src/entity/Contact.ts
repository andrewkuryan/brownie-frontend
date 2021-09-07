export class UnconfirmedUserContact {
    constructor(public readonly id: number, public readonly data: ContactData) {}
}

export class ActiveUserContact {
    constructor(public readonly id: number, public readonly data: ContactData) {}
}

export type UserContact = UnconfirmedUserContact | ActiveUserContact;

export class EmailContactData {
    constructor(public readonly emailAddress: string) {}
}

export class TelegramContactData {
    constructor(
        public readonly telegramId: number,
        public readonly firstName: string,
        public readonly username: string | null,
    ) {}
}

export type ContactData = EmailContactData | TelegramContactData;
