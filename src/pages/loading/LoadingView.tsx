import { FunctionComponent } from 'preact';
import ProgressIndicator from '@components/progressIndicator';

import './loading.styl';

export const LoadingView: FunctionComponent = () => {
    return <div class="loadingRoot">
        <ProgressIndicator />
    </div>
}