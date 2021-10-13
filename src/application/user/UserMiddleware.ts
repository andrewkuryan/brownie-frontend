import BackendApi from '@api/BackendApi';
import { middlewareForActionType } from '@utils/redux';
import {
    FulfillUserAction,
    LoginAction,
    LoadUserAction,
    VerifyContactAction,
    AddEmailContactAction,
} from '@application/user/UserActions';
import { ActiveUser, BlankUser } from '@entity/User';
import SrpGenerator from '@utils/crypto/srp';
import { hash512 } from '@utils/crypto/sha';

export const loadUserMiddleware = (api: BackendApi) =>
    middlewareForActionType<LoadUserAction>('USER/LOAD', (middlewareApi, action) => {
        api.userApi
            .getUser()
            .then(result =>
                middlewareApi.dispatch({ type: 'USER/SET_USER', payload: result }),
            );
        return action;
    });

export const addEmailMiddleware = (api: BackendApi) =>
    middlewareForActionType<AddEmailContactAction>(
        'USER/ADD_EMAIL',
        (middlewareApi, action) => {
            api.userApi.addEmail(action.payload.emailAddress).then(result => {
                console.log(result);
            });
            return action;
        },
    );

export const verifyContactMiddleware = (api: BackendApi) =>
    middlewareForActionType<VerifyContactAction>(
        'USER/VERIFY_CONTACT',
        (middlewareApi, action) => {
            api.userApi
                .verifyContact(action.payload.contact, action.payload.verificationCode)
                .then(result => {
                    const currentUser = middlewareApi.getState().user.currentUser;
                    let newUser = null;
                    if (currentUser instanceof BlankUser) {
                        newUser = new BlankUser(
                            currentUser.id,
                            currentUser.permissions,
                            result,
                        );
                    } else if (currentUser instanceof ActiveUser) {
                        newUser = new ActiveUser(
                            currentUser.id,
                            currentUser.permissions,
                            [...currentUser.contacts, result],
                            currentUser.data,
                        );
                    }
                    middlewareApi.dispatch({ type: 'USER/SET_USER', payload: newUser });
                });
            return action;
        },
    );

export const fulfillUserMiddleware = (api: BackendApi, srpGenerator: SrpGenerator) =>
    middlewareForActionType<FulfillUserAction>('USER/FULFILL', (middlewareApi, action) => {
        srpGenerator
            .generateSaltVerifier(action.payload.login, action.payload.password)
            .then(({ salt, verifier }) => {
                return api.userApi.fulfillUser({
                    login: action.payload.login,
                    salt: salt,
                    verifierHex: verifier.toString(16),
                });
            })
            .then(result => {
                middlewareApi.dispatch({ type: 'USER/SET_USER', payload: result });
            });
        return action;
    });

export const loginMiddleware = (api: BackendApi, srpGenerator: SrpGenerator) =>
    middlewareForActionType<LoginAction>('USER/LOGIN', (middlewareApi, action) => {
        const { a, A } = srpGenerator.generateA();
        const login = action.payload.login;
        const password = action.payload.password;
        api.userApi.initLogin({ login, AHex: A.toString(16) }).then(async ({ salt, BHex }) => {
            const B = BigInt('0x' + BHex);
            const S = await srpGenerator.computeSession(login, password, salt, a, A, B);
            const KHex = hash512(S.toString(16));
            const MHex = await srpGenerator.computeM(login, salt, A, B, KHex);
            const { RHex, user } = await api.userApi.verifyLogin({
                login,
                AHex: A.toString(16),
                BHex,
                MHex,
            });
            const expectedR = await srpGenerator.computeR(A, MHex, KHex);
            if (RHex == expectedR) {
                middlewareApi.dispatch({ type: 'USER/SET_USER', payload: user });
            } else {
                throw new Error('Server not verified');
            }
        });
        return action;
    });
