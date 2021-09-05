import { User } from '@entity/User';

export type UserAction =
    { type: 'USER/SET_USER', payload: User } |
    { type: 'USER/LOAD' };