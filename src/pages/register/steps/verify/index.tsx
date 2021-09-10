import { FunctionalComponent } from 'preact';
import { ReduxProps } from '../../../../Main';
import { UnconfirmedUserContact } from '@entity/Contact';
import { useForm } from '@components/form';

import './verifyStep.styl';
import '../commonStep.styl';

export interface VerifyStepViewProps {
    contact: UnconfirmedUserContact;
}

const VerifyStepView: FunctionalComponent<VerifyStepViewProps & ReduxProps> = ({
    dispatch,
    contact,
}) => {
    const { Form, Input, Button } = useForm({
        'digit-1': { type: 'string' },
        'digit-2': { type: 'string' },
        'digit-3': { type: 'string' },
        'digit-4': { type: 'string' },
        'digit-5': { type: 'string' },
        'digit-6': { type: 'string' },
    });

    return (
        <Form
            onSubmit={values => {
                const verificationCode = Object.values(values).reduce(
                    (prev, current) => prev + current,
                    '',
                );
                dispatch({
                    type: 'USER/VERIFY_CONTACT',
                    payload: { contact, verificationCode },
                });
            }}
        >
            <div class="commonStepRoot verifyStepRoot">
                <h2>Verify your contact information</h2>
                <div class="inputBlock">
                    <p>Enter the verification code you received:</p>
                    <div class="codeInputWrapper">
                        {([1, 2, 3, 4, 5, 6] as Array<1 | 2 | 3 | 4 | 5 | 6>).map(i => (
                            <Input
                                name={`digit-${i}`}
                                maxLength={1}
                                promptText={i.toString()}
                            />
                        ))}
                    </div>
                </div>
                <Button text="Verify" />
            </div>
        </Form>
    );
};

export default VerifyStepView;
