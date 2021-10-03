import { FunctionalComponent } from 'preact';
import Form, { useForm } from '@components/form';
import { FormInput, FormPasswordInput } from '@components/input';
import { SubmitButton } from '@components/button';
import {
    isNonZeroLength,
    shouldBeAtLeastN,
    shouldBeNotEmpty,
    withConditions,
} from '@components/form/validators';
import { ReduxProps } from '../../../../Main';

import '../commonStep.styl';
import './fulfillStep.styl';

const FulfillStepView: FunctionalComponent<ReduxProps> = ({ dispatch }) => {
    const { formProps } = useForm({
        structure: {
            login: 'string',
            password: 'string',
            passwordConfirm: 'string',
        },
        inputValidators: {
            login: {
                submitValidate: shouldBeNotEmpty(),
            },
            password: {
                submitValidate: shouldBeNotEmpty(),
                realtimeValidate: withConditions(shouldBeAtLeastN(5), isNonZeroLength),
            },
            passwordConfirm: {
                submitValidate: shouldBeNotEmpty(),
                realtimeValidate: withConditions(shouldBeAtLeastN(5), isNonZeroLength),
            },
        },
        realtimeValidate: values => {
            if (values.password !== values.passwordConfirm) {
                return [
                    { name: 'password', text: 'Passwords do not match' },
                    { name: 'passwordConfirm', text: 'Passwords do not match' },
                ];
            }
            return [];
        },
        onSubmit: values => {
            dispatch({ type: 'USER/FULFILL', payload: values });
        },
    });

    return (
        <div class="commonStepRoot fulfillStepRoot">
            <h2>Fill in the rest of the data</h2>
            <Form formProps={formProps}>
                <div class="inputsBlock">
                    <div class="inputWrapper">
                        <p>Login</p>
                        <FormInput form={formProps} name={'login'} />
                    </div>
                    <div class="inputWrapper">
                        <p>Password</p>
                        <FormPasswordInput form={formProps} name={'password'} />
                    </div>
                    <div class="inputWrapper">
                        <p>Confirm Password</p>
                        <FormPasswordInput form={formProps} name={'passwordConfirm'} />
                    </div>
                </div>
                <SubmitButton form={formProps} text={'Confirm'} />
            </Form>
        </div>
    );
};

export default FulfillStepView;
