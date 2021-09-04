import { FunctionalComponent, VNode } from 'preact';

import './button.styl';

export interface ButtonProps {
    text: string;
    onClick: () => void;
    className?: string;
    graphics?: VNode<any>;
}

export const Button: FunctionalComponent<ButtonProps> = ({
    text,
    className,
    onClick,
    graphics,
}) => {
    return (
        <button class={`buttonRoot ${className || ''}`} onClick={onClick}>
            {text}
            {graphics}
        </button>
    );
};
