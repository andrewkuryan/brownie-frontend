import { FunctionalComponent } from 'preact';
import { ReduxProps } from '../../Main';
import HeaderView from '../common/header';

import './home.styl';

const HomeView: FunctionalComponent<ReduxProps> = ({ useStore, dispatch }) => {
    return (
        <div class="homeRoot">
            <HeaderView useStore={useStore} dispatch={dispatch} />
        </div>
    );
};

export default HomeView;
