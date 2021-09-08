import { FunctionalComponent, Fragment } from 'preact';

import './stepper.styl';

export interface StepperProps {
    numOfSteps: number;
    currentStep: number;
}

const Stepper: FunctionalComponent<StepperProps> = ({ numOfSteps, currentStep }) => {
    return (
        <div class="stepperRoot">
            {[...Array(numOfSteps).keys()].map(num => (
                <Fragment>
                    <p
                        class={`stepPoint ${currentStep === num + 1 ? 'current' : ''} ${
                            currentStep > num + 1 ? 'passed' : ''
                        }`}
                    >
                        {num + 1}
                    </p>
                    {num < numOfSteps - 1 && (
                        <div
                            class={`stepPlaceholder ${currentStep > num + 1 ? 'passed' : ''}`}
                        />
                    )}
                </Fragment>
            ))}
        </div>
    );
};

export default Stepper;