import { FunctionalComponent } from 'preact';
import { FormStructure } from '@components/form';
import { useState } from 'preact/hooks';

import './input.styl';

export interface InputProps {
    promptText?: string;
    maxLength?: number;
}

const Input: FunctionalComponent<InputProps> = ({ promptText, maxLength }) => {
    return (
        <input class="inputField" type="text" placeholder={promptText} maxLength={maxLength} />
    );
};

export interface InputFormProps<T extends FormStructure> extends InputProps {
    name: keyof T;
}

export function FormInput<T extends FormStructure>(): FunctionalComponent<InputFormProps<T>> {
    return ({ name, promptText, maxLength }) => {
        return (
            <input
                class="inputField"
                type="text"
                name={name.toString()}
                placeholder={promptText}
                maxLength={maxLength}
            />
        );
    };
}

export function FormPasswordInput<T extends FormStructure>(): FunctionalComponent<
    InputFormProps<T>
> {
    return ({ name, promptText, maxLength }) => {
        const [type, setType] = useState<'text' | 'password'>('password');

        return (
            <div class="passwordFieldWrapper">
                <input
                    class="inputField"
                    type={type}
                    name={name.toString()}
                    placeholder={promptText}
                    maxLength={maxLength}
                />
                <span
                    class={`passwordToggle ${type}`}
                    onClick={() => {
                        setType(type === 'text' ? 'password' : 'text');
                    }}
                />
            </div>
        );
    };
}

export default Input;
