import { FunctionalComponent } from 'preact';
import { ReduxProps } from '../../Main';
import Form, { useForm } from '@components/form';
import { FormInput, FormPasswordInput } from '@components/input';
import { SubmitButton } from '@components/button';

import './login.styl';

const LoginView: FunctionalComponent<ReduxProps> = ({ dispatch }) => {
    const { formProps } = useForm({
        structure: {
            login: 'string',
            password: 'string',
        },
        onSubmit: ({ login, password }) => {
            console.log(login, password);
        },
    });

    return (
        <div class="loginRoot">
            <Form formProps={formProps}>
                <div class="loginCard">
                    <h2>Login</h2>
                    <div>
                        <div>
                            <p>Login</p>
                            <FormInput form={formProps} name={'login'} />
                        </div>
                        <div>
                            <p>Password</p>
                            <FormPasswordInput form={formProps} name={'password'} />
                        </div>
                    </div>
                    <SubmitButton form={formProps} text={'Confirm'} />
                </div>
            </Form>
        </div>
    );
};

export default LoginView;
