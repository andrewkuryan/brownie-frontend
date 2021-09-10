import { FunctionalComponent } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { FormInput, InputFormProps } from '@components/input';
import { PrimitiveType } from '@utils/parser';
import { ButtonFormProps, FormButton } from '@components/button';

export type FormStructure = { [key: string]: { type: 'string' | 'number' } };
type SubmitValueType<T extends FormStructure> = {
    [key in keyof T]: PrimitiveType<T[key]['type']>;
};
type FormProps<T extends FormStructure> = {
    onSubmit: (values: SubmitValueType<T>) => void;
};

export function useForm<T extends FormStructure>(
    structure: T,
): {
    Form: FunctionalComponent<FormProps<T>>;
    Input: FunctionalComponent<InputFormProps<T>>;
    Button: FunctionalComponent<ButtonFormProps>;
} {
    return {
        Form: ({ children, onSubmit }) => {
            const processForm = (ev: Event) => {
                ev.preventDefault();
                const result: any = {};
                Object.entries(structure).forEach(([key, value]) => {
                    const element = formRef.current?.elements?.namedItem(key);
                    if (element instanceof HTMLInputElement) {
                        switch (value.type) {
                            case 'string':
                                result[key] = element.value;
                                break;
                            case 'number':
                                result[key] = parseFloat(element.value);
                                break;
                        }
                    }
                });
                onSubmit(result);
                return false;
            };

            const formRef = useRef<HTMLFormElement>(null);
            useLayoutEffect(() => {
                if (formRef?.current !== null) {
                    formRef.current.addEventListener('submit', processForm);
                }
            });

            return <form ref={formRef}>{children}</form>;
        },
        Input: FormInput<T>(),
        Button: FormButton<T>(),
    };
}
