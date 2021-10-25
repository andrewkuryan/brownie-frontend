import { FunctionComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import ContactsStepView from './steps/contacts';
import VerifyStepView from './steps/verify';
import FulfillStepView from './steps/fulfill';
import DoneStepView from './steps/done';
import { ReduxProps } from '../../Main';
import Stepper from '@components/stepper';
import { OutlineButton } from '@components/button';
import { ActiveUser, BlankUser, GuestUser } from '@entity/User';
import { ActiveUserContact, UnconfirmedUserContact } from '@entity/Contact';

import './register.styl';

import arrowLeft from '@assets/double_arrow_left_green_48dp.svg';
import arrowLeftDisabled from '@assets/double_arrow_left_grey_48dp.svg';
import arrowRight from '@assets/double_arrow_right_green_48dp.svg';
import arrowRightDisabled from '@assets/double_arrow_right_grey_48dp.svg';

type RegisterStep = 'contact' | 'verifyContact' | 'fulfill' | 'done';
const steps: Array<RegisterStep> = ['contact', 'verifyContact', 'fulfill', 'done'];

const RegisterView: FunctionComponent<ReduxProps> = ({ useStore, dispatch }) => {
    const currentUser = useStore(state => state.user.currentUser, 'RegisterView');
    const [currentStep, setCurrentStep] = useState<RegisterStep>('contact');

    useEffect(() => {
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

    const isLeftNavButtonActive = currentStep === 'verifyContact';
    const isRightNavButtonActive = currentStep === 'contact';

    return (
        <div class="registerRoot">
            <div class="stepCard">
                <div class="stepNavigation">
                    <OutlineButton
                        text=""
                        graphics={
                            isLeftNavButtonActive ? (
                                <img src={arrowLeft} alt="‹‹" />
                            ) : (
                                <img src={arrowLeftDisabled} alt="‹‹" />
                            )
                        }
                        onClick={() =>
                            setCurrentStep(steps[Math.max(steps.indexOf(currentStep) - 1, 0)])
                        }
                        isDisabled={!isLeftNavButtonActive}
                    />
                    <OutlineButton
                        text=""
                        graphics={
                            isRightNavButtonActive ? (
                                <img src={arrowRight} alt="››" />
                            ) : (
                                <img src={arrowRightDisabled} alt="››" />
                            )
                        }
                        onClick={() =>
                            setCurrentStep(
                                steps[
                                    Math.min(steps.indexOf(currentStep) + 1, steps.length - 1)
                                ],
                            )
                        }
                        isDisabled={!isRightNavButtonActive}
                    />
                </div>
                <div class="stepContent">
                    {currentStep === 'contact' ? (
                        <ContactsStepView
                            user={currentUser as GuestUser}
                            useStore={useStore}
                            dispatch={dispatch}
                        />
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
                <Stepper numOfSteps={4} currentStep={steps.indexOf(currentStep) + 1} />
            </div>
        </div>
    );
};

export default RegisterView;
