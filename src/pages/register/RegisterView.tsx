import { FunctionComponent } from 'preact';
import ContactsStepView from './steps/contacts';
import { ReduxProps } from '../../Main';

import './register.styl';

export const RegisterView: FunctionComponent<ReduxProps> = ({ useStore, dispatch }) => {
    return (
        <div class="registerRoot">
            <div class="stepCard">
                <div class="stepContent">
                    <ContactsStepView useStore={useStore} dispatch={dispatch} />
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
