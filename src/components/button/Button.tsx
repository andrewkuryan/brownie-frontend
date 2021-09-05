import { FunctionalComponent, VNode } from 'preact';

import './button.styl';

export interface ButtonProps {
    text: string;
    onClick: () => void;
    className?: string;
    graphics?: VNode<any>;
    link?: string;
}

export const Button: FunctionalComponent<ButtonProps> = ({
    text,
    className,
    onClick,
    graphics,
    link,
}) => {
    return link === undefined ? (
        <button class={`buttonRoot ${className || ''}`} onClick={onClick}>
            {text}
            {graphics}
        </button>
    ) : (
        <a class={`buttonRoot ${className || ''}`} onClick={onClick} href={link}>
            {text}
            {graphics}
        </a>
    );
};
