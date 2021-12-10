import { FunctionalComponent } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { useForm } from '@components/form';
import { FormInput } from '@components/input';
import TextEditor from '@components/textEditor';

import './postCreate.styl';

import TextFieldIcon from '@assets/text_fields_black_48dp.svg';
import ImageFieldIcon from '@assets/image_black_48dp.svg';

import BoldIcon from '@assets/format_bold_black_48dp.svg';
import ItalicIcon from '@assets/format_italic_black_48dp.svg';
import UnderlinedIcon from '@assets/format_underlined_black_48dp.svg';

const PostCreateView: FunctionalComponent = () => {
    const { formProps } = useForm({
        structure: {
            title: 'string',
        },
        onSubmit: values => {},
    });

    return (
        <div class="postCreateRoot">
            <h2>New Post</h2>
            <FormInput form={formProps} name={'title'} placeholder={'Title'} />
            <PostObjectView />
        </div>
    );
};

const PostObjectView: FunctionalComponent = () => {
    const [type, setType] = useState<'text' | 'image' | undefined>(undefined);
    const textEditor = useRef<TextEditor>();

    return (
        <div class="postObject">
            {type === undefined ? (
                <div class="selectBlock">
                    <TextFieldIcon onclick={() => setType('text')} />
                    <ImageFieldIcon onclick={() => setType('image')} />
                </div>
            ) : type === 'text' ? (
                <div class="contentWrapper">
                    <TextOptionsBlock
                        onBold={() => {
                            textEditor.current?.wrapSelected(['bold']);
                        }}
                        onItalic={() => {
                            textEditor.current?.wrapSelected(['italic']);
                        }}
                        onUnderlined={() => {
                            textEditor.current?.wrapSelected(['underlined']);
                        }}
                    />
                    <TextEditor
                        ref={textEditor}
                        defaultContent={
                            <>
                                Something <span class="textItem bold">bold</span> content
                                <div>
                                    Test italic <span class="textItem italic">end</span>
                                </div>
                                <div>
                                    <span class="textItem italic">Start</span> italic
                                </div>
                            </>
                        }
                        onSelect={() => {}}
                    />
                </div>
            ) : undefined}
        </div>
    );
};

const TextOptionsBlock: FunctionalComponent<{
    onBold: () => void;
    onItalic: () => void;
    onUnderlined: () => void;
}> = ({ onBold, onItalic, onUnderlined }) => {
    return (
        <div class="textOptionsBlock">
            <BoldIcon
                onclick={onBold}
                onmousedown={e => {
                    e.preventDefault();
                    return false;
                }}
            />
            <ItalicIcon
                onclick={onItalic}
                onmousedown={e => {
                    e.preventDefault();
                    return false;
                }}
            />
            <UnderlinedIcon
                onclick={onUnderlined}
                onmousedown={e => {
                    e.preventDefault();
                    return false;
                }}
            />
        </div>
    );
};

export default PostCreateView;
