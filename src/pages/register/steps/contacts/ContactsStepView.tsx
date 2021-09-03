import { FunctionalComponent } from 'preact';
import Input from '@components/input';
import Button from '@components/button';

import { useStore } from '@utils/redux';
import { store } from '../../../../application/Store';

import './contactsStep.styl';

export const ContactsStepView: FunctionalComponent = () => {
    const state = useStore(store, state => state.user);

    return (
        <div class="contactsStepRoot">
            <h2>Enter your contact information</h2>
            <Input promptText="Email address" />
            <p>{state.counter}</p>
            <Button
                text="Confirm"
                onClick={() => {
                    store.dispatch({ type: 'USER/TEST', payload: 1 });
                }}
            />
        </div>
    );
};
