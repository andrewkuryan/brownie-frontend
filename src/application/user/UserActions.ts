import { User } from '@entity/User';
import { UserContact } from '@entity/Contact';

export type UserAction =
    | SetUserAction
    | LoadUserAction
    | VerifyContactAction
    | FulfillUserAction;

export type SetUserAction = { type: 'USER/SET_USER'; payload: User | null };
export type LoadUserAction = { type: 'USER/LOAD' };
export type VerifyContactAction = {
    type: 'USER/VERIFY_CONTACT';
    payload: { contact: UserContact; verificationCode: string };
};
export type FulfillUserAction = {
    type: 'USER/FULFILL';
    payload: { login: string | null; password: string; passwordConfirm: string };
};
