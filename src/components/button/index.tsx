import { FunctionalComponent, VNode } from 'preact';
import { FormProps, FormStructure } from '@components/form';
import ProcessIndicator from './processIndicator';

import './button.styl';

export interface ButtonProps {
    text: string;
    onClick: () => void;
    graphics?: VNode<any>;
    link?: string;
    isProcessing?: boolean;
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

const Button: FunctionalComponent<ButtonProps> = ({
    text,
    onClick,
    graphics,
    link,
    isProcessing,
}) => {
    return link === undefined ? (
        <button class="buttonRoot" onClick={onClick}>
            <ProcessIndicator isActive={isProcessing ?? false} />
            <>
                {text}
                {graphics}
            </>
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
    isProcessing,
}: ButtonFormProps<T>) {
    return (
        <button type="submit" class="buttonRoot" form={form.formId}>
            <ProcessIndicator isActive={isProcessing ?? false} />
            <>
                {text}
                {graphics}
            </>
        </button>
    );
}

export default Button;
