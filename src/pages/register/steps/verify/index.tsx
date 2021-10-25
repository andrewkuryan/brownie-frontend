import { FunctionalComponent } from 'preact';
import { ReduxProps } from '../../../../Main';
import { UnconfirmedUserContact } from '@entity/Contact';
import Form, { useForm } from '@components/form';
import { FormInput } from '@components/input';
import { SubmitButton } from '@components/button';
import { isNonZeroLength, shouldBeANumber, withConditions } from '@components/form/validators';

import '../commonStep.styl';
import './verifyStep.styl';

export interface VerifyStepViewProps {
    contact: UnconfirmedUserContact;
}

const VerifyStepView: FunctionalComponent<VerifyStepViewProps & ReduxProps> = ({
    dispatch,
    useStore,
    contact,
}) => {
    const isProcessing = useStore(state => state.isProcessing, 'VerifyStepView');
    const keyArray: Array<
        'digit-1' | 'digit-2' | 'digit-3' | 'digit-4' | 'digit-5' | 'digit-6'
    > = ['digit-1', 'digit-2', 'digit-3', 'digit-4', 'digit-5', 'digit-6'];
    const { formProps, setInputValue, setFocus } = useForm({
        structure: {
            'digit-1': 'string',
            'digit-2': 'string',
            'digit-3': 'string',
            'digit-4': 'string',
            'digit-5': 'string',
            'digit-6': 'string',
        },
        inputValidators: keyArray.reduce(
            (prev, cur) => ({
                ...prev,
                [cur]: {
                    realtimeValidate: withConditions(shouldBeANumber(), isNonZeroLength),
                    submitValidate: shouldBeANumber(),
                },
            }),
            {},
        ),
        onSubmit: values => {
            const verificationCode = Object.values(values).reduce(
                (prev, current) => prev + current,
                '',
            );
            dispatch({
                type: 'USER/VERIFY_CONTACT',
                payload: { contact, verificationCode },
            });
        },
    });

    return (
        <div class="commonStepRoot verifyStepRoot">
            <h2>Verify your contact information</h2>
            <Form formProps={formProps}>
                <div class="inputBlock">
                    <p>Enter the verification code you received:</p>
                    <div class="codeInputWrapper">
                        {keyArray.map((digit, i) => (
                            <FormInput
                                form={formProps}
                                name={digit}
                                maxLength={1}
                                showErrorLabel={false}
                                onPaste={e => {
                                    for (let index = i; index < keyArray.length; index++) {
                                        setInputValue(
                                            keyArray[index],
                                            e.clipboardData?.getData('text')[index - i] ?? '',
                                        );
                                    }
                                }}
                                onFulfill={() => {
                                    if (i < keyArray.length - 1) {
                                        setFocus(keyArray[i + 1]);
                                    }
                                }}
                            />
                        ))}
                    </div>
                    <SubmitButton
                        form={formProps}
                        text="Verify"
                        isProcessing={
                            isProcessing['USER/VERIFY_CONTACT'] ||
                            isProcessing['USER/RESEND_VERIFICATION_CODE']
                        }
                    />
                </div>
            </Form>
            <div class="resendInfoWrapper">
                <p class="resendInfo">
                    If you haven't received verification code, you can try to{' '}
                    <span
                        class="resendText"
                        onClick={() => dispatch({ type: 'USER/RESEND_VERIFICATION_CODE' })}
                    >
                        Resend
                    </span>{' '}
                    it
                </p>
            </div>
        </div>
    );
};

export default VerifyStepView;
