import { Reducer } from 'redux';
import { FileAction } from '@application/file/FileActions';

export interface FileState {
    files: {
        [id: number]: {
            content: ArrayBuffer;
            linkCount: number;
        };
    };
}

export const fileReducer: (defaultState: FileState) => Reducer<FileState, FileAction> =
    defaultState => (state: FileState | undefined, action: FileAction) => {
        if (state === undefined) {
            return defaultState;
        }
        switch (action.type) {
            case 'FILE/ADD_FILE':
                return {
                    ...state,
                    files: {
                        ...state.files,
                        [action.payload.id]: { content: action.payload.content, linkCount: 1 },
                    },
                };
            case 'FILE/REMOVE_FILE':
                const newFiles = state.files;
                delete state.files[action.payload];
                return { ...state, files: newFiles };
            case 'FILE/ADD_LINK':
                return {
                    ...state,
                    files: {
                        ...state.files,
                        [action.payload]: {
                            ...state.files[action.payload],
                            linkCount: state.files[action.payload].linkCount + 1,
                        },
                    },
                };
            case 'FILE/REMOVE_LINK':
                return {
                    ...state,
                    files: {
                        ...state.files,
                        [action.payload]: {
                            ...state.files[action.payload],
                            linkCount: state.files[action.payload].linkCount - 1,
                        },
                    },
                };
            case 'FILE/LOAD_FILE':
                return state;
            case 'FILE/RELEASE_FILE':
                return state;
            default:
                return state;
        }
    };
