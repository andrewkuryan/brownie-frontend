import { FunctionComponent } from 'preact';
import { Router, Route } from 'preact-router';
import RegisterView from './pages/register';
import LoginView from './pages/login';
import { AppAction, AppState } from '@application/Store';

export type ReduxProps = {
    useStore: <T>(getter: (state: AppState) => T) => T;
    dispatch: (action: AppAction) => void;
};

export const MainView: FunctionComponent<ReduxProps> = reduxProps => {
    return (
        <Router>
            <Route
                path="/register"
                component={RegisterView}
                useStore={reduxProps.useStore}
                dispatch={reduxProps.dispatch}
            />
            <Route
                path="/login"
                component={LoginView}
                useStore={reduxProps.useStore}
                dispatch={reduxProps.dispatch}
            />
        </Router>
    );
};
