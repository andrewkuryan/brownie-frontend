import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import { FormInput } from '@components/input';
import Button, { SubmitButton } from '@components/button';
import { GuestUser, User } from '@entity/User';
import Form, { useForm } from '@components/form';
import {
    isNonZeroLength,
    shouldBeNotEmpty,
    shouldMatchRegex,
    withConditions,
} from '@components/form/validators';
import { ReduxProps } from '../../../../Main';

import '../commonStep.styl';
import './contactsStep.styl';
import telegramIcon from '@assets/telegram_icon_136124_white.svg';
import copyIcon from '@assets/content_copy_white_48dp.svg';

const EmailContactOption: FunctionalComponent<{ selected: boolean } & ReduxProps> = ({
    selected,
    useStore,
    dispatch,
}) => {
    const isProcessing = useStore(state => state.isProcessing, 'EmailContactOption');
    const { formProps } = useForm({
        structure: { email: 'string' },
        inputValidators: {
            email: {
                realtimeValidate: withConditions(
                    shouldMatchRegex(
                        /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
                        'Invalid email address',
                    ),
                    isNonZeroLength,
                ),
                submitValidate: shouldBeNotEmpty(),
            },
        },
        onSubmit: ({ email }) => {
            dispatch({ type: 'USER/ADD_EMAIL', payload: { emailAddress: email } });
        },
    });

    return (
        <div class={`emailOptionRoot ${selected ? 'selected' : ''}`}>
            <p class="emailLabel">Enter your email address:</p>
            <div class="emailInputWrapper">
                <Form formProps={formProps}>
                    <FormInput form={formProps} name={'email'} placeholder="Email address" />
                    <SubmitButton
                        form={formProps}
                        text="Confirm"
                        isProcessing={isProcessing['USER/ADD_EMAIL']}
                    />
                </Form>
            </div>
        </div>
    );
};

const TgContactOption: FunctionalComponent<{ user: GuestUser; selected: boolean }> = ({
    user,
    selected,
}) => {
    const formatLink = (user: User | null) =>
        `https://t.me/BrownieUpdatesBot?start=userId-${user?.id}`;

    return (
        <div class={`tgOptionRoot ${selected ? 'selected' : ''}`}>
            <p class="description">
                Follow the link to the chat with the Brownie bot and press the "Start" button:
            </p>
            <div class="buttonBlock">
                <Button
                    text="Copy link"
                    onClick={() => navigator.clipboard.writeText(formatLink(user))}
                    graphics={<img class="buttonIcon" src={copyIcon} alt="⬈" />}
                />
                <Button
                    text="Follow the link"
                    onClick={() => {}}
                    link={formatLink(user)}
                    graphics={<img class="buttonIcon" src={telegramIcon} alt="⬈" />}
                />
            </div>
        </div>
    );
};

export interface ContactsStepViewProps {
    user: GuestUser;
}

const ContactsStepView: FunctionalComponent<ContactsStepViewProps & ReduxProps> = ({
    user,
    dispatch,
    useStore,
}) => {
    const [selectedOption, setSelectedOption] = useState<'email' | 'tg'>('email');

    return (
        <div class="commonStepRoot contactsStepRoot">
            <h2>Enter your contact information</h2>
            <div class="optionsWrapper">
                <p
                    class={`contactOption emailOption ${
                        selectedOption === 'email' ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedOption('email')}
                />
                <p
                    class={`contactOption tgOption ${
                        selectedOption === 'tg' ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedOption('tg')}
                />
            </div>
            <div class="optionContent">
                <EmailContactOption
                    selected={selectedOption === 'email'}
                    dispatch={dispatch}
                    useStore={useStore}
                />
                <TgContactOption selected={selectedOption === 'tg'} user={user} />
            </div>
        </div>
    );
};

export default ContactsStepView;
