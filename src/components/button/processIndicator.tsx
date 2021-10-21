import { FunctionalComponent } from 'preact';

import './processIndicator.styl';

export interface ProcessIndicatorProps {
    isActive: boolean;
}

const ProcessIndicator: FunctionalComponent<ProcessIndicatorProps> = ({ isActive }) => {
    return (
        <svg class={`buttonSpinner ${isActive ? 'active' : ''}`} viewBox="0 0 100 100">
            <circle class="path" cx="50" cy="50" r="45" />
        </svg>
    );
};

export default ProcessIndicator;
