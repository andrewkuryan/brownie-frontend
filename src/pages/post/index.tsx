import { FunctionalComponent } from 'preact';
import { ReduxProps } from '../../Main';
import { useEffect } from 'preact/hooks';
import HeaderView from '../common/header';
import { userLogin } from '@entity/User';
import {
    ImageParagraph,
    postCategories,
    tagColorToRgb,
    TextItem,
    TextParagraph,
} from '@entity/Post';
import ApiImage from '@components/fat/apiImage';

import './post.styl';

import UserIcon from '@assets/account_circle_black_48dp.svg';
import HomeIcon from '@assets/home_black_18dp.svg';

interface PostViewProps extends ReduxProps {
    id: number;
}

const PostView: FunctionalComponent<PostViewProps> = ({ id, useStore, dispatch }) => {
    const selectedPost = useStore(state => state.post.selectedPost, 'PostView (post)');
    const selectedPostAuthorInfo = useStore(
        state => state.post.selectedPostAuthorInfo,
        'PostView (author)',
    );
    useEffect(() => {
        dispatch({ type: 'POST/SELECT_POST', payload: id });
    }, []);
    return (
        <div class="postRoot">
            <HeaderView useStore={useStore} dispatch={dispatch} />
            <div class="postContent">
                {selectedPost && postCategories(selectedPost).length > 0 && (
                    <div class="postCategories">
                        <HomeIcon />
                        <span class="categoryDivider">»</span>
                        {postCategories(selectedPost).map((category, index) =>
                            index > 0 ? (
                                <>
                                    <span class="categoryDivider">»</span>
                                    <span class="categoryName">{category}</span>
                                </>
                            ) : (
                                <span class="categoryName">{category}</span>
                            ),
                        )}
                    </div>
                )}
                <div class="postHeader">
                    <div class="userInfo">
                        <UserIcon />
                        <p>
                            {(selectedPostAuthorInfo && userLogin(selectedPostAuthorInfo)) ??
                                'Anonymous'}
                        </p>
                    </div>
                    <p>
                        {selectedPost?.createdAt?.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                        })}
                    </p>
                </div>
                <h1>{selectedPost?.title}</h1>
                {selectedPost && selectedPost.tags.length > 0 && (
                    <div class="postTags">
                        {selectedPost.tags.map(tag => (
                            <span
                                class="postTag"
                                style={{ backgroundColor: tagColorToRgb(tag.color) }}
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>
                )}
                {selectedPost?.paragraphs?.map(paragraph => {
                    if (paragraph instanceof TextParagraph) {
                        return <TextParagraphView {...paragraph} />;
                    } else {
                        return (
                            <ImageParagraphView
                                {...paragraph}
                                useStore={useStore}
                                dispatch={dispatch}
                            />
                        );
                    }
                })}
            </div>
        </div>
    );
};

const TextParagraphView: FunctionalComponent<TextParagraph> = ({ items }) => {
    return (
        <div class="paragraph textParagraph">
            {items.map(item => (
                <TextItemView {...item} />
            ))}
        </div>
    );
};

const TextItemView: FunctionalComponent<TextItem> = ({ text, formatting }) => {
    return (
        <span
            class={`textItem ${formatting.fontWeight === 'BOLD' ? 'boldItem' : ''} ${
                formatting.fontStyle === 'ITALIC' ? 'italicItem' : ''
            } ${formatting.textDecoration === 'UNDERLINE' ? 'underlinedItem' : ''}`}
        >
            {text}
        </span>
    );
};

const ImageParagraphView: FunctionalComponent<ImageParagraph & ReduxProps> = ({
    file,
    description,
    useStore,
    dispatch,
}) => {
    return (
        <div class="paragraph imageParagraph">
            <ApiImage file={file} useStore={useStore} dispatch={dispatch} />
            {description && <p>{description}</p>}
        </div>
    );
};

export default PostView;
