import { FunctionalComponent } from 'preact';
import { ReduxProps } from '../../Main';
import { userDisplayName } from '@entity/User';

import './home.styl';

import UserIcon from '@assets/account_circle_black_48dp.svg';

const HomeView: FunctionalComponent<ReduxProps> = ({ useStore, dispatch }) => {
    const currentUser = useStore(state => state.user.currentUser, 'HomeView');
    return (
        <div class="homeRoot">
            <div class="header">
                <div class="userInfo">
                    <UserIcon />
                    <p>{userDisplayName(currentUser)}</p>
                    <div class="tooltipWrapper">
                        <span class="tooltipArrow" />
                        <div class="tooltip">
                            <p>View Profile</p>
                            <hr />
                            <a href="/login">
                                <p>Login to another account</p>
                            </a>
                            <hr />
                            <p onClick={() => dispatch({ type: 'USER/LOGOUT' })}>Logout</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeView;
