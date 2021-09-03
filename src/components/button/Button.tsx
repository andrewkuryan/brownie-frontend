import { FunctionalComponent } from 'preact';

import './button.styl';

export interface ButtonProps {
    text: string;
    onClick: () => void;
    className?: string;
}

export const Button: FunctionalComponent<ButtonProps> = ({ text, className, onClick }) => {
    return (
        <button class={`buttonRoot ${className || ''}`} onClick={onClick}>
            {text}
        </button>
    );
};
