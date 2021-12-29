import { FunctionalComponent } from 'preact';
import { ReduxProps } from '../../Main';
import { useEffect } from 'preact/hooks';
import HeaderView from '../common/header';
import { userLogin } from '@entity/User';
import { ImageParagraph, TextItem, TextParagraph } from '@entity/Post';
import ApiImage from '@components/fat/apiImage';

import './post.styl';

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
    console.log(selectedPost);
    console.log(selectedPostAuthorInfo);
    return (
        <div class="postRoot">
            <HeaderView useStore={useStore} dispatch={dispatch} />
            <div class="postContent">
                <div class="postHeader">
                    <p>
                        {(selectedPostAuthorInfo && userLogin(selectedPostAuthorInfo)) ??
                            'Anonymous'}
                    </p>
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
            class={`${formatting.fontWeight === 'BOLD' ? 'boldItem' : ''} ${
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
