import { FunctionComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import ContactsStepView from './steps/contacts';
import VerifyStepView from './steps/verify';
import FulfillStepView from './steps/fulfill';
import DoneStepView from './steps/done';
import { ReduxProps } from '../../Main';
import Stepper from '@components/stepper';
import { ActiveUser, BlankUser, GuestUser } from '@entity/User';
import { ActiveUserContact, UnconfirmedUserContact } from '@entity/Contact';

import './register.styl';

const RegisterView: FunctionComponent<ReduxProps> = ({ useStore, dispatch }) => {
    const currentUser = useStore(state => state.user.currentUser);
    const [currentStep, setCurrentStep] = useState<
        'contact' | 'verifyContact' | 'fulfill' | 'done'
    >('contact');

    useEffect(() => {
        console.log('Register useEffect');
        if (currentUser instanceof GuestUser) {
            setCurrentStep('contact');
        } else if (
            currentUser instanceof BlankUser &&
            currentUser.contact instanceof UnconfirmedUserContact
        ) {
            setCurrentStep('verifyContact');
        } else if (
            currentUser instanceof BlankUser &&
            currentUser.contact instanceof ActiveUserContact
        ) {
            setCurrentStep('fulfill');
        } else if (currentUser instanceof ActiveUser) {
            setCurrentStep('done');
        }
    }, [
        currentUser?.constructor?.name,
        ...(currentUser instanceof BlankUser ? [currentUser.contact.constructor.name] : []),
    ]);

    return (
        <div class="registerRoot">
            <div class="stepCard">
                <div class="stepContent">
                    {currentStep === 'contact' ? (
                        <ContactsStepView user={currentUser as GuestUser} />
                    ) : currentStep === 'verifyContact' ? (
                        <VerifyStepView
                            contact={
                                (currentUser as BlankUser).contact as UnconfirmedUserContact
                            }
                            useStore={useStore}
                            dispatch={dispatch}
                        />
                    ) : currentStep === 'fulfill' ? (
                        <FulfillStepView useStore={useStore} dispatch={dispatch} />
                    ) : currentStep === 'done' ? (
                        <DoneStepView />
                    ) : null}
                </div>
                <Stepper
                    numOfSteps={4}
                    currentStep={
                        currentStep === 'contact'
                            ? 1
                            : currentStep === 'verifyContact'
                            ? 2
                            : currentStep == 'fulfill'
                            ? 3
                            : currentStep === 'done'
                            ? 4
                            : 0
                    }
                />
            </div>
        </div>
    );
};

export default RegisterView;
