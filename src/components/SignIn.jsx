import React, { useState } from "react";
import { auth, db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import { signInWithEmailAndPassword } from "firebase/auth";

function SignIn({onSuccess}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            toast.success("Вход успешно выполнен!", {
                position: "top-center"
            });

            setEmail("");
            setPassword("");

            if (onSuccess) {
                onSuccess();
            }

        } catch (error) {
            let errorMessage = "Не удалось войти в аккаунт";
            
            // Firebase объединяет ошибки user-not-found и wrong-password в invalid-credential
            // из соображений безопасности, чтобы не раскрывать существование email
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
            </div>

            <button type="submit" className="btn-submit">
                Войти
            </button>

        </form>
    )
}

export default SignIn;