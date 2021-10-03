import { RenderableProps } from 'preact';
import { PrimitiveType } from '@utils/parser';
import React from 'preact/compat';

export type FormValidators<T extends FormStructure> = {
    [key in keyof T]?: {
        realtimeValidate?: (value: PrimitiveType<T[key]>) => Array<string>;
        submitValidate?: (value: PrimitiveType<T[key]>) => Array<string>;
    };
};

export type FormInputType = 'string' | 'string?' | 'number';
export type FormStructure = {
    [key: string]: FormInputType;
};
type SubmitValueType<T extends FormStructure> = {
    [key in keyof T]: PrimitiveType<T[key]>;
};
type ValidateError<T extends FormStructure> = Array<{
    name: keyof T;
    text: string;
}>;

export function generateId(size: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < size; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function parseInputValue<T extends FormInputType>(
    value: string | null,
    type: T,
): PrimitiveType<T> {
    switch (type) {
        case 'string':
            return (value ?? '') as PrimitiveType<T>;
        case 'string?':
            return (value ?? null) as PrimitiveType<T>;
        case 'number':
            return parseInt(value ?? '0') as PrimitiveType<T>;
        default:
            throw new Error(`Unknown type: ${type}`);
    }
}

export default function Form<T extends FormStructure>({
    formProps: { formId, processForm },
    children,
}: RenderableProps<{ formProps: FormProps<T> }>) {
    return (
        <>
            <form id={formId} onSubmit={processForm} />
            <>{children}</>
        </>
    );
}

export interface FormProps<T extends FormStructure> {
    formId: string;
    onChange: (input: keyof T, newValue: string) => void;
    processForm: (ev: Event) => void;
}

export function useForm<T extends FormStructure>({
    structure,
    inputValidators,
    onSubmit,
    realtimeValidate,
    submitValidate,
}: {
    structure: T;
    inputValidators?: FormValidators<T>;
    onSubmit: (values: SubmitValueType<T>) => void;
    realtimeValidate?: (values: SubmitValueType<T>) => ValidateError<T>;
    submitValidate?: (values: SubmitValueType<T>) => ValidateError<T>;
}): {
    formProps: FormProps<T>;
    setInputValue: <V extends Extract<keyof T, string>>(
        name: V,
        value: PrimitiveType<T[V]>,
    ) => void;
    setFocus: (name: Extract<keyof T, string>) => void;
} {
    const formId = `form-${generateId(8)}`;

    const getInput = (name: string) =>
        document.getElementById(`input-${name}-${formId}`) as HTMLInputElement;

    const getInputWrapper = (name: string) =>
        document.getElementById(`wrapper-${name}-${formId}`)!;

    const getErrorWrapper = (name: string) =>
        document.getElementById(`error-${name}-${formId}`);

    const getErrorTooltip = (name: string) =>
        getErrorWrapper(name)?.getElementsByClassName('tooltip')[0];

    const getFormValues = () =>
        Object.entries(structure)
            .map(([key, value]) => ({ [key]: parseInputValue(getInput(key).value, value) }))
            .reduce((prev, cur) => ({ ...prev, ...cur }), {}) as SubmitValueType<T>;

    const setValidateError = (error: ValidateError<T>) =>
        Object.keys(structure).forEach(key => {
            const errorText = error
                .filter(error => error.name === key)
                .map(error => error.text)
                .join('<hr/>');
            getInputWrapper(key).classList.toggle('error', errorText.length > 0);
            getErrorWrapper(key)?.classList.toggle('active', errorText.length > 0);
            const errorTooltip = getErrorTooltip(key);
            if (errorTooltip) {
                errorTooltip.innerHTML = errorText;
            }
        });

    const applyValidators = (
        newValues: SubmitValueType<T>,
        type: 'realtimeValidate' | 'submitValidate',
    ) => {
        let error: ValidateError<T> = [];
        for (let key in inputValidators) {
            if (inputValidators.hasOwnProperty(key)) {
                const res = inputValidators[key]?.[type]?.(newValues[key]) ?? [];
                error = [...error, ...res.map(error => ({ name: key, text: error }))];
            }
        }
        return error;
    };

    const applyRealtimeValidate = (newValues: SubmitValueType<T>) => [
        ...(realtimeValidate?.(newValues) ?? []),
        ...applyValidators(newValues, 'realtimeValidate'),
    ];

    const applySubmitValidate = (newValues: SubmitValueType<T>) => [
        ...applyRealtimeValidate(newValues),
        ...(submitValidate?.(newValues) ?? []),
        ...applyValidators(newValues, 'submitValidate'),
    ];

    const processForm = (ev: Event) => {
        ev.preventDefault();
        const formValues = getFormValues();
        const error = applySubmitValidate(formValues);
        setValidateError(error);
        if (error.length === 0) {
            onSubmit(formValues);
        }
        return false;
    };

    const applyFulfillEvents = (error: ValidateError<T>) => {
        Object.keys(structure).forEach(key => {
            const input = getInput(key);
            if (
                input.value.length == (input?.getAttribute('maxlength') ?? -1) &&
                error.filter(error => error.name === key).length === 0
            ) {
                input.dispatchEvent(new CustomEvent('Fulfill'));
            }
        });
    };

    const onChange = () => {
        const formValues = getFormValues();
        const error = applyRealtimeValidate(formValues);
        setValidateError(error);
        applyFulfillEvents(error);
    };

    return {
        formProps: { formId, onChange, processForm },
        setInputValue: (name, value) => {
            getInput(name).value = value?.toString() ?? '';
            onChange();
        },
        setFocus: name => getInput(name).focus(),
    };
}
