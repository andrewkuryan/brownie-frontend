import { FunctionComponent } from 'preact';
import { useState } from 'preact/hooks';
import ContactsStepView from './steps/contacts';
import { ReduxProps } from '../../Main';
import Stepper from '@components/stepper';

import './register.styl';

const RegisterView: FunctionComponent<ReduxProps> = ({ useStore, dispatch }) => {
    const [currentStep, setCurrentStep] = useState<
        'contact' | 'verifyContact' | 'fulfill' | 'done'
    >('contact');

    return (
        <div class="registerRoot">
            <div class="stepCard">
                <div class="stepContent">
                    <ContactsStepView useStore={useStore} dispatch={dispatch} />
                </div>
                <Stepper numOfSteps={4} currentStep={4} />
            </div>
        </div>
    );
};

export default RegisterView;
