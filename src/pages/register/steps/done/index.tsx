import { FunctionalComponent } from 'preact';
import Button from '@components/button';

import '../commonStep.styl';
import './doneStep.styl';

const DoneStepView: FunctionalComponent = () => {
    return (
        <div class="commonStepRoot doneStepRoot">
            <h2>Registration completed successfully</h2>
            <p>Now you can go back to home page and continue using Brownie</p>
            <Button text={'Go to home page'} onClick={() => {}} link="/home" />
        </div>
    );
};

export default DoneStepView;
