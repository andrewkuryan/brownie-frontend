import { FunctionalComponent, VNode } from 'preact';
import { FormStructure } from '@components/form';

import './button.styl';

export interface ButtonProps {
    text: string;
    onClick: () => void;
    graphics?: VNode<any>;
    link?: string;
}

const Button: FunctionalComponent<ButtonProps> = ({ text, onClick, graphics, link }) => {
    return link === undefined ? (
        <button class="buttonRoot" onClick={onClick}>
            {text}
            {graphics}
        </button>
    ) : (
        <a class="buttonRoot" onClick={onClick} href={link}>
            {text}
            {graphics}
        </a>
    );
};

export type ButtonFormProps = Omit<ButtonProps, 'link' | 'onClick'>;

export function FormButton<T extends FormStructure>(): FunctionalComponent<ButtonFormProps> {
    return ({ text, graphics }) => {
        return (
            <button type="submit" class="buttonRoot">
                {text}
                {graphics}
            </button>
        );
    };
}

export default Button;
