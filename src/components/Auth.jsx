import { useState } from "react";
import SignIn from "./SignIn";
import SignUp from "./SignUp";

function Auth() {
    const [isLogin, setIsLogin] = useState(true);

    const toggleMode = () => {
        setIsLogin(!isLogin);
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                {isLogin ? <SignIn /> : <SignUp />}

                <div className="auth-toggle">
                    {isLogin ? (
                        <p>
                            Нет аккаунта?{" "}
                            <button type="button" onClick={toggleMode}>
                                Зарегистрироваться
                            </button>
                        </p>
                    ) : (
                        <p>
                            Уже есть аккаунт?{" "}
                            <button type="button" onClick={toggleMode}>
                                Войти
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Auth;