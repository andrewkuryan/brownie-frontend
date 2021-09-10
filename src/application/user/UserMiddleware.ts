import BackendApi from '@api/BackendApi';
import { middlewareForActionType } from '@utils/redux';
import { LoadUserAction, VerifyContactAction } from '@application/user/UserActions';
import { ActiveUser, BlankUser } from '@entity/User';

export const loadUserMiddleware = (api: BackendApi) =>
    middlewareForActionType<LoadUserAction>('USER/LOAD', (middlewareApi, action) => {
        api.userApi
            .getUser()
            .then(result =>
                middlewareApi.dispatch({ type: 'USER/SET_USER', payload: result }),
            );
        return action;
    });

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
