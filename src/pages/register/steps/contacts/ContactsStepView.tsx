import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import Input from '@components/input';
import Button from '@components/button';
import { ReduxProps } from '../../../../Main';
import { User } from '@entity/User';

import './contactsStep.styl';
import telegramIcon from '@assets/telegram_icon_136124_white.svg';
import copyIcon from '@assets/content_copy_white_48dp.svg';

const EmailContactOption: FunctionalComponent<{ selected: boolean }> = ({ selected }) => {
    return (
        <div class={`emailOptionRoot ${selected ? 'selected' : ''}`}>
            <p class="emailLabel">Enter your email address:</p>
            <div class="emailInputWrapper">
                <Input promptText="example: test@test.com" />
                <Button text="Confirm" onClick={() => {}} />
            </div>
        </div>
    );
};

const TgContactOption: FunctionalComponent<ReduxProps & { selected: boolean }> = ({
    useStore,
    selected,
}) => {
    const state = useStore(state => state.user);

    const formatLink = (user: User | null) =>
        `https://t.me/BrownieUpdatesBot?start=${user?.getId()}`;

    return (
        <div class={`tgOptionRoot ${selected ? 'selected' : ''}`}>
            <p class="description">
                Follow the link to the chat with the Brownie bot and press the "Start" button:
            </p>
            <div class="buttonBlock">
                <Button
                    text="Copy link"
                    onClick={() =>
                        navigator.clipboard.writeText(formatLink(state.currentUser))
                    }
                    graphics={<img class="buttonIcon" src={copyIcon} alt="⬈" />}
                />
                <Button
                    text="Follow the link"
                    onClick={() => {
                        console.log('After Follow');
                    }}
                    link={formatLink(state.currentUser)}
                    graphics={<img class="buttonIcon" src={telegramIcon} alt="⬈" />}
                />
            </div>
        </div>
    );
};

export const ContactsStepView: FunctionalComponent<ReduxProps> = ({ useStore, dispatch }) => {
    const [selectedOption, setSelectedOption] = useState<'email' | 'tg'>('email');

    return (
        <div class="contactsStepRoot">
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
                <EmailContactOption selected={selectedOption === 'email'} />
                <TgContactOption
                    selected={selectedOption === 'tg'}
                    useStore={useStore}
                    dispatch={dispatch}
                />
            </div>
        </div>
    );
};
