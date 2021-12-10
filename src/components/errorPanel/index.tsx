import { FunctionalComponent } from 'preact';
import { OutlineButton } from '@components/button';

import './errorPanel.styl';

import CloseIcon from '@assets/close_white_48dp.svg';

interface ErrorPanelProps {
    error: Error | null;
    onClose: () => void;
}

const ErrorPanel: FunctionalComponent<ErrorPanelProps> = ({ error, onClose }) => {
    return (
        <div class={`errorPanelRoot ${error !== null ? 'active' : ''}`}>
            <p>{error?.message}</p>
            <OutlineButton text="" onClick={onClose} graphics={<CloseIcon />} />
        </div>
    );
};

export default ErrorPanel;
