import { FunctionComponent } from 'preact';
import { Router, Route } from 'preact-router';
import RegisterView from './pages/register';
import LoginView from './pages/login';
import { AppAction, AppState } from '@application/Store';
import ErrorPanel from '@components/errorPanel';

export type ReduxProps = {
    useStore: <T>(getter: (state: AppState) => T, componentName?: string) => T;
    dispatch: (action: AppAction) => void;
};

export const MainView: FunctionComponent<ReduxProps> = ({ useStore, dispatch }) => {
    const error = useStore(state => state.error, 'MainView');

    return (
        <>
            <ErrorPanel error={error} onClose={() => dispatch({ type: 'APP/RESET_ERROR' })} />
            <Router>
                <Route
                    path="/register"
                    component={RegisterView}
                    useStore={useStore}
                    dispatch={dispatch}
                />
                <Route
                    path="/login"
                    component={LoginView}
                    useStore={useStore}
                    dispatch={dispatch}
                />
            </Router>
        </>
    );
};
