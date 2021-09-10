import { FunctionComponent } from 'preact';
import ProgressIndicator from '@components/progressIndicator';

import './loading.styl';

const LoadingView: FunctionComponent = () => {
    return (
        <div class="loadingRoot">
            <ProgressIndicator />
        </div>
    );
};

export default LoadingView;
