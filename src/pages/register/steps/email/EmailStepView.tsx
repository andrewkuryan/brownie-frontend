import { FunctionalComponent } from 'preact';
import Input from '../../../../components/input';
import Button from '../../../../components/button';

import './emailStep.styl';

export const EmailStepView: FunctionalComponent = () => {
    return (
        <div class="emailStepRoot">
            <h2>Input your email address</h2>
            <Input />
            <Button text="Confirm" />
        </div>
    );
};
