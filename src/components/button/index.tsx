import { FunctionalComponent, VNode } from 'preact';
import { FormProps, FormStructure } from '@components/form';

import './button.styl';

export interface ButtonProps {
    text: string;
    onClick: () => void;
    graphics?: VNode<any>;
    link?: string;
}

export const OutlineButton: FunctionalComponent<Omit<ButtonProps, 'link'>> = ({
    text,
    onClick,
    graphics,
}) => {
    return (
        <button class="outlineButtonRoot" onClick={onClick}>
            {text}
            {graphics}
        </button>
    );
};

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

export type ButtonFormProps<T extends FormStructure> = Omit<
    ButtonProps,
    'link' | 'onClick'
> & { form: FormProps<T> };

export function SubmitButton<T extends FormStructure>({
    text,
    graphics,
    form,
}: ButtonFormProps<T>) {
    return (
        <button type="submit" class="buttonRoot" form={form.formId}>
            {text}
            {graphics}
        </button>
    );
}

export default Button;
