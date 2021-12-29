import { Post } from '@entity/Post';
import { UserPublicItem } from '@entity/User';

export type PostAction = SelectPostAction | SetSelectedPostAction | SetSelectedPostAuthorInfo;

export type SelectPostAction = { type: 'POST/SELECT_POST'; payload: number };
export type SetSelectedPostAction = { type: 'POST/SET_SELECTED_POST'; payload: Post };
export type SetSelectedPostAuthorInfo = {
    type: 'POST/SET_SELECTED_POST_AUTHOR_INFO';
    payload: Array<UserPublicItem>;
};
