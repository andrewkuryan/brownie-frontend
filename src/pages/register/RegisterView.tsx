import { FunctionComponent } from 'preact';
import EmailStepView from './steps/email';

import './register.styl';

export const RegisterView: FunctionComponent = () => {
    return (
        <div class="registerRoot">
            <div class="stepCard">
                <div class="stepContent">
                    <EmailStepView />
                </div>
                <div class="stepsWrapper">
                    <div class="stepPoint">
                        <p>1</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
