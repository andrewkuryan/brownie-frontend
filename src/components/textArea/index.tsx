import { FunctionalComponent } from 'preact';
import { JSXInternal } from 'preact/src/jsx';

import './textArea.styl';

export interface TextAreaProps {
    onInput?: JSXInternal.EventHandler<JSXInternal.TargetedEvent<HTMLTextAreaElement, Event>>;
}

const TextArea: FunctionalComponent<TextAreaProps> = textAreaProps => {
    return <textarea class="textAreaField" {...textAreaProps} />;
};

export default TextArea;
