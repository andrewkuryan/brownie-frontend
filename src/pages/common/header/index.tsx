import { FunctionalComponent } from 'preact';
import { GuestUser, userDisplayName } from '@entity/User';
import { ReduxProps } from '../../../Main';

import './header.styl';

import UserIcon from '@assets/account_circle_black_48dp.svg';

const HeaderView: FunctionalComponent<ReduxProps> = ({ useStore, dispatch }) => {
    const currentUser = useStore(state => state.user.currentUser, 'HomeView');
    return (
        <div class="headerRoot">
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
                        {!(currentUser instanceof GuestUser) && (
                            <>
                                <hr />
                                <p onClick={() => dispatch({ type: 'USER/LOGOUT' })}>Logout</p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeaderView;
