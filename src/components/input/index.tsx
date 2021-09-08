import { FunctionalComponent } from 'preact';

import './input.styl';

export interface InputProps {
    promptText?: string;
}

const Input: FunctionalComponent<InputProps> = ({ promptText }) => {
    return <input class="inputField" type="text" placeholder={promptText} />;
};

export default Input;
