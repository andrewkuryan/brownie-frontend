import BackendApi from '@api/BackendApi';
import { middlewareForActionType } from '@utils/redux';
import { LoadFileAction, ReleaseFileAction } from '@application/file/FileActions';
import { commonApiMiddlewareWrapper } from '@application/Store';

export const loadFileMiddleware = (api: BackendApi) =>
    middlewareForActionType<LoadFileAction>('FILE/LOAD_FILE', (middlewareApi, action) =>
        commonApiMiddlewareWrapper(middlewareApi, action, async () => {
            if (!middlewareApi.getState().file.files[action.payload.id]) {
                const result = await api.fileApi.getFileContent(action.payload);
                middlewareApi.dispatch({
                    type: 'FILE/ADD_FILE',
                    payload: { id: action.payload.id, content: result },
                });
            } else {
                middlewareApi.dispatch({
                    type: 'FILE/ADD_LINK',
                    payload: action.payload.id,
                });
            }
        }),
    );

export const releaseFileMiddleware = (api: BackendApi) =>
    middlewareForActionType<ReleaseFileAction>('FILE/RELEASE_FILE', (middlewareApi, action) =>
        commonApiMiddlewareWrapper(middlewareApi, action, async () => {
            if (middlewareApi.getState().file.files[action.payload]?.linkCount <= 1) {
                middlewareApi.dispatch({ type: 'FILE/REMOVE_FILE', payload: action.payload });
            } else {
                middlewareApi.dispatch({ type: 'FILE/REMOVE_LINK', payload: action.payload });
            }
        }),
    );
