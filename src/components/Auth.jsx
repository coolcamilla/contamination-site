import { useState } from "react";
import "./Auth.css";
import SignIn from "./SignIn";
import SignUp from "./SignUp";

function Auth({onSuccess}) {
    const [isLogin, setIsLogin] = useState(true);

    const toggleMode = () => {
        setIsLogin(!isLogin);
    }

    const handleAuthSuccess = () => {
        // Вызываем onSuccess только после успешного входа/регистрации
        if (onSuccess) {
            onSuccess();
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {isLogin ? (
                    <SignIn onSuccess={handleAuthSuccess} />
                ) : (
                    <SignUp onSuccess={handleAuthSuccess} />
                )}

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