import { FunctionalComponent } from 'preact';
import { useForm } from '@components/form';

import '../commonStep.styl';
import './fulfillStep.styl';

const FulfillStepView: FunctionalComponent = () => {
    const { Form, Input, Password, Button } = useForm({
        login: { type: 'string?' },
        password: { type: 'string' },
        passwordConfirm: { type: 'string' },
    });

    return (
        <Form
            onSubmit={values => {
                console.log(values);
            }}
        >
            <div class="commonStepRoot fulfillStepRoot">
                <h2>Fill in the rest of the data</h2>
                <div class="inputsBlock">
                    <div class="inputWrapper">
                        <p>Login</p>
                        <Input name={'login'} />
                    </div>
                    <div class="inputWrapper">
                        <p>Password *</p>
                        <Password name={'password'} />
                    </div>
                    <div class="inputWrapper">
                        <p>Confirm Password *</p>
                        <Password name={'passwordConfirm'} />
                    </div>
                </div>
                <Button text={'Confirm'} />
            </div>
        </Form>
    );
};

export default FulfillStepView;
