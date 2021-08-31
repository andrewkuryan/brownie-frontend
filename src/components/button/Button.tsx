import { FunctionalComponent } from 'preact';

import './button.styl';

export interface ButtonProps {
    text: string;
    className?: string;
}

export const Button: FunctionalComponent<ButtonProps> = ({ text, className }) => {
    return <button class={`buttonRoot ${className || ''}`}>{text}</button>;
};
