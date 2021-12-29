import BackendApi from '@api/BackendApi';
import { middlewareForActionType } from '@utils/redux';
import { SelectPostAction } from '@application/post/PostActions';
import { commonApiMiddlewareWrapper } from '@application/Store';

export const selectPostMiddleware = (api: BackendApi) =>
    middlewareForActionType<SelectPostAction>('POST/SELECT_POST', (middlewareApi, action) =>
        commonApiMiddlewareWrapper(middlewareApi, action, () =>
            api.postApi.getPostById(action.payload).then(async post => {
                middlewareApi.dispatch({
                    type: 'POST/SET_SELECTED_POST',
                    payload: post,
                });
                const authorInfo = await api.userApi.getUserPublicInfo(post.authorId);
                middlewareApi.dispatch({
                    type: 'POST/SET_SELECTED_POST_AUTHOR_INFO',
                    payload: authorInfo,
                });
            }),
        ),
    );
