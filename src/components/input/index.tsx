import { FunctionalComponent, VNode } from 'preact';
import { FormProps, FormStructure } from '@components/form';
import { useState } from 'preact/hooks';

import './input.styl';

import ViewIcon from '@assets/view.svg';
import PrivateIcon from '@assets/private.svg';
import ErrorIcon from '@assets/warning_amber_black_48dp.svg';

export interface InputProps {
    placeholder?: string;
    maxLength?: number;
    onPaste?: (event: ClipboardEvent) => void;
}

const Input: FunctionalComponent<InputProps> = inputProps => {
    return <input class="inputField" type="text" {...inputProps} />;
};

export interface FormInputProps<T extends FormStructure> extends InputProps {
    form: FormProps<T>;
    name: Extract<keyof T, string>;
    showErrorLabel?: boolean;
    onFulfill?: () => void;
}

function FormInputTemplate<T extends FormStructure>({
    type,
    option,
    form: { formId, onChange },
    showErrorLabel = true,
    ...inputProps
}: FormInputProps<T> & { type: string; option?: VNode }) {
    return (
        <div id={`wrapper-${inputProps.name}-${formId}`} class="inputFieldWrapper">
            <input
                id={`input-${inputProps.name}-${formId}`}
                class="inputField"
                type={type}
                form={formId}
                onInput={ev =>
                    onChange(inputProps.name, (ev.target as HTMLInputElement).value)
                }
                {...inputProps}
            />
            {showErrorLabel && (
                <div id={`error-${inputProps.name}-${formId}`} class="inputError">
                    <span class="errorLabel">
                        <ErrorIcon />
                    </span>
                    <div class="tooltipWrapper">
                        <span class="tooltip" />
                        <span class="tooltipArrow" />
                    </div>
                </div>
            )}
            {option}
        </div>
    );
}

export function FormInput<T extends FormStructure>(inputProps: FormInputProps<T>) {
    return <FormInputTemplate type={'text'} {...inputProps} />;
}

export function FormPasswordInput<T extends FormStructure>(inputProps: FormInputProps<T>) {
    const [type, setType] = useState<'text' | 'password'>('password');

    return (
        <FormInputTemplate
            type={type}
            option={
                <span
                    class="passwordToggle"
                    onClick={() => setType(type === 'text' ? 'password' : 'text')}
                >
                    {type === 'text' ? <PrivateIcon /> : <ViewIcon />}
                </span>
            }
            {...inputProps}
        />
    );
}

export default Input;
