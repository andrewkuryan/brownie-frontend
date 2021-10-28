import { FunctionalComponent } from 'preact';
import { ReduxProps } from '../../Main';
import Form, { useForm } from '@components/form';
import { FormInput, FormPasswordInput } from '@components/input';
import { SubmitButton } from '@components/button';
import {
    isNonZeroLength,
    shouldBeAtLeastN,
    shouldBeNotEmpty,
    withConditions,
} from '@components/form/validators';

import './login.styl';

const LoginView: FunctionalComponent<ReduxProps> = ({ dispatch, useStore }) => {
    const isProcessing = useStore(state => state.isProcessing, 'LoginView');
    const { formProps } = useForm({
        structure: {
            login: 'string',
            password: 'string',
        },
        onSubmit: ({ login, password }) => {
            dispatch({ type: 'USER/LOGIN', payload: { login, password } });
        },
        inputValidators: {
            login: {
                submitValidate: shouldBeNotEmpty(),
            },
            password: {
                submitValidate: shouldBeNotEmpty(),
                realtimeValidate: withConditions(shouldBeAtLeastN(5), isNonZeroLength),
            },
        },
    });

    return (
        <div class="loginRoot">
            <Form formProps={formProps}>
                <div class="loginCard">
                    <h2>Login</h2>
                    <div class="formField">
                        <p>Login</p>
                        <FormInput form={formProps} name={'login'} />
                    </div>
                    <div class="formField">
                        <p>Password</p>
                        <FormPasswordInput form={formProps} name={'password'} />
                    </div>
                    <SubmitButton
                        form={formProps}
                        text={'Confirm'}
                        isProcessing={isProcessing['USER/LOGIN']}
                    />
                </div>
            </Form>
        </div>
    );
};

export default LoginView;
