import { Post } from '@entity/Post';
import { Reducer } from 'redux';
import { PostAction } from '@application/post/PostActions';
import { UserPublicItem } from '@entity/User';

export interface PostState {
    selectedPost: Post | null;
    selectedPostAuthorInfo: Array<UserPublicItem> | null;
}

export const postReducer: (defaultState: PostState) => Reducer<PostState, PostAction> =
    defaultState => (state: PostState | undefined, action: PostAction) => {
        if (state === undefined) {
            return defaultState;
        }
        switch (action.type) {
            case 'POST/SET_SELECTED_POST':
                return { ...state, selectedPost: action.payload };
            case 'POST/SET_SELECTED_POST_AUTHOR_INFO':
                return { ...state, selectedPostAuthorInfo: action.payload };
            case 'POST/SELECT_POST':
                return state;
            default:
                return state;
        }
    };
