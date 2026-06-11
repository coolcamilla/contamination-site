import React, { useState } from "react";
import { auth, db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

function SignIn({onSuccess}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (!user.emailVerified) {
                toast.warning("Ваш email не подтверждён. Проверьте почту или отправьте письмо повторно", {
                    position: "top-center",
                    autoClose: 6000
                });
            } else {
                toast.success("Вход успешно выполнен!", {
                    position: "top-center"
                });
            }

            setEmail("");
            setPassword("");

            if (onSuccess) {
                onSuccess();
            }

        } catch (error) {
            let errorMessage = "Не удалось войти в аккаунт";
            
            if (error.code === 'auth/invalid-credential' || 
                error.code === 'auth/user-not-found' || 
                error.code === 'auth/wrong-password') {
                errorMessage = "Неверный email или пароль";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Некорректный формат email";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "Слишком много попыток входа. Попробуйте позже";
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = "Ошибка сети. Проверьте подключение к интернету";
            } else {
                errorMessage = error.message || "Произошла ошибка при входе";
            }
            
            toast.error(errorMessage, {
                position: "top-center",
                autoClose: 5000
            });
        }
    };

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            toast.warning("Введите email для восстановления пароля", { position: "top-center" });
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email.trim());
            toast.success("Письмо для сброса пароля отправлено на " + email, { position: "top-center" });
        } catch (error) {
            let errorMessage = "Не удалось отправить письмо";
            if (error.code === 'auth/invalid-email') {
                errorMessage = "Некорректный формат email";
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = "Пользователь с таким email не найден";
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = "Ошибка сети. Проверьте подключение к интернету";
            } else {
                errorMessage = error.message || "Произошла ошибка";
            }
            toast.error(errorMessage, { position: "top-center", autoClose: 5000 });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Вход</h3>

            <div className="mb-3">
                <label>Почта</label>
                <input
                    type="email"
                    value={email}
                    className="form-control"
                    placeholder="Почта"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className="mb-3">
                <label>Пароль</label>
                <input
                    type="password"
                    value={password}
                    className="form-control"
                    placeholder="Пароль"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <div className="forgot-password-wrapper">
                    <button 
                        type="button" 
                        className="btn-link" 
                        onClick={handleForgotPassword}
                    >
                        Забыли пароль?
                    </button>
                </div>
            </div>

            <button type="submit" className="btn-submit">
                Войти
            </button>

        </form>
    )
}

export default SignIn;
