import { StorageFile } from '@entity/StorageFile';

export type FileAction =
    | LoadFileAction
    | ReleaseFileAction
    | AddFileAction
    | RemoveFileAction
    | AddFileLinkAction
    | RemoveFileLinkAction;

export type LoadFileAction = { type: 'FILE/LOAD_FILE'; payload: StorageFile };
export type ReleaseFileAction = { type: 'FILE/RELEASE_FILE'; payload: number };

export type AddFileAction = {
    type: 'FILE/ADD_FILE';
    payload: { id: number; content: ArrayBuffer };
};
export type RemoveFileAction = { type: 'FILE/REMOVE_FILE'; payload: number };
export type AddFileLinkAction = {
    type: 'FILE/ADD_LINK';
    payload: number;
};
export type RemoveFileLinkAction = {
    type: 'FILE/REMOVE_LINK';
    payload: number;
};
