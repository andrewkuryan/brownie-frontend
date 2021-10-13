import { User } from '@entity/User';
import { UserContact } from '@entity/Contact';

export type UserAction =
    | SetUserAction
    | LoadUserAction
    | AddEmailContactAction
    | VerifyContactAction
    | FulfillUserAction
    | LoginAction;

export type SetUserAction = { type: 'USER/SET_USER'; payload: User | null };
export type LoadUserAction = { type: 'USER/LOAD' };
export type AddEmailContactAction = {
    type: 'USER/ADD_EMAIL';
    payload: { emailAddress: string };
};
export type VerifyContactAction = {
    type: 'USER/VERIFY_CONTACT';
    payload: { contact: UserContact; verificationCode: string };
};
export type FulfillUserAction = {
    type: 'USER/FULFILL';
    payload: { login: string; password: string };
};
export type LoginAction = {
    type: 'USER/LOGIN';
    payload: { login: string; password: string };
};
