import { FunctionalComponent } from 'preact';
import { ReduxProps } from '../../Main';

const LoginView: FunctionalComponent<ReduxProps> = ({ dispatch }) => {
    const onLogin = async (e: Event) => {
        e.preventDefault();
        const login = (document.getElementById('username_log') as HTMLInputElement).value;
        const password = (document.getElementById('password_log') as HTMLInputElement).value;
        dispatch({ type: 'USER/LOGIN', payload: { login, password } });
    };

    return (
        <div>
            <div>
                <h2>Login</h2>
                <label>Username</label>
                <input id="username_log" type="text" />
                <label>Password</label>
                <input id="password_log" type="password" />
                <button onClick={onLogin}>Login</button>
            </div>
        </div>
    );
};

export default LoginView;
