import BackendApi from '@api/BackendApi';
import { middlewareForActionType } from '@utils/redux';
import {
    FulfillUserAction,
    LoginAction,
    LoadUserAction,
    VerifyContactAction,
    AddEmailContactAction,
    ResendVerificationCodeAction,
} from '@application/user/UserActions';
import { commonApiMiddlewareWrapper } from '@application/Store';
import SrpGenerator from '@utils/crypto/srp';
import { hash512 } from '@utils/crypto/sha';

export const loadUserMiddleware = (api: BackendApi) =>
    middlewareForActionType<LoadUserAction>('USER/LOAD', (middlewareApi, action) =>
        commonApiMiddlewareWrapper(middlewareApi, action, () =>
            api.userApi
                .getUser()
                .then(result =>
                    middlewareApi.dispatch({ type: 'USER/SET_USER', payload: result }),
                ),
        ),
    );

export const addEmailMiddleware = (api: BackendApi) =>
    middlewareForActionType<AddEmailContactAction>('USER/ADD_EMAIL', (middlewareApi, action) =>
        commonApiMiddlewareWrapper(middlewareApi, action, () =>
            api.userApi.addEmail(action.payload.emailAddress).then(result =>
                middlewareApi.dispatch({
                    type: 'USER/SET_CONTACT',
                    payload: result,
                }),
            ),
        ),
    );

export const resendVerificationCodeMiddleware = (api: BackendApi) =>
    middlewareForActionType<ResendVerificationCodeAction>(
        'USER/RESEND_VERIFICATION_CODE',
        (middlewareApi, action) =>
            commonApiMiddlewareWrapper(middlewareApi, action, () =>
                api.userApi.resendVerificationCode().then(result =>
                    middlewareApi.dispatch({
                        type: 'USER/SET_CONTACT',
                        payload: result,
                    }),
                ),
            ),
    );

export const verifyContactMiddleware = (api: BackendApi) =>
    middlewareForActionType<VerifyContactAction>(
        'USER/VERIFY_CONTACT',
        (middlewareApi, action) =>
            commonApiMiddlewareWrapper(middlewareApi, action, () =>
                api.userApi
                    .verifyContact(action.payload.contact, action.payload.verificationCode)
                    .then(result =>
                        middlewareApi.dispatch({ type: 'USER/SET_CONTACT', payload: result }),
                    ),
            ),
    );

export const fulfillUserMiddleware = (api: BackendApi, srpGenerator: SrpGenerator) =>
    middlewareForActionType<FulfillUserAction>('USER/FULFILL', (middlewareApi, action) =>
        commonApiMiddlewareWrapper(middlewareApi, action, () =>
            srpGenerator
                .generateSaltVerifier(action.payload.login, action.payload.password)
                .then(({ salt, verifier }) =>
                    api.userApi.fulfillUser({
                        login: action.payload.login,
                        salt: salt,
                        verifierHex: verifier.toString(16),
                    }),
                )
                .then(result =>
                    middlewareApi.dispatch({ type: 'USER/SET_USER', payload: result }),
                ),
        ),
    );

export const loginMiddleware = (api: BackendApi, srpGenerator: SrpGenerator) =>
    middlewareForActionType<LoginAction>('USER/LOGIN', (middlewareApi, action) => {
        const { a, A } = srpGenerator.generateA();
        const { login, password } = action.payload;
        return commonApiMiddlewareWrapper(middlewareApi, action, () =>
            api.userApi
                .initLogin({ login, AHex: A.toString(16) })
                .then(async ({ salt, BHex }) => {
                    const B = BigInt('0x' + BHex);
                    const S = await srpGenerator.computeSession(
                        login,
                        password,
                        salt,
                        a,
                        A,
                        B,
                    );
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
                })
                .then(() => {
                    window.location.href = '/home';
                }),
        );
    });

export const logoutMiddleware = (api: BackendApi) =>
    middlewareForActionType('USER/LOGOUT', (middlewareApi, action) =>
        commonApiMiddlewareWrapper(middlewareApi, action, () =>
            api.userApi
                .logout()
                .then(() => api.regenerateSession)
                .then(() => middlewareApi.dispatch({ type: 'USER/LOAD' })),
        ),
    );
