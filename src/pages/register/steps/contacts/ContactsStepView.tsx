import { FunctionalComponent } from 'preact';
import Input from '@components/input';
import Button from '@components/button';

import './contactsStep.styl';

export const ContactsStepView: FunctionalComponent = () => {
    return (
        <div class="contactsStepRoot">
            <h2>Enter your contact information</h2>
            <Input promptText="Email address" />
            <Button text="Confirm" />
        </div>
    );
};
