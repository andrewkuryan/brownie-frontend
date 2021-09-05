import BackendApi from '@api/BackendApi';
import { middlewareForActionType } from '@utils/redux';

export const loadUserMiddleware = (api: BackendApi) =>
    middlewareForActionType('USER/LOAD', (middlewareApi, action) => {
        api.userApi
            .getUser()
            .then(result =>
                middlewareApi.dispatch({ type: 'USER/SET_USER', payload: result }),
            );
        return action;
    });
