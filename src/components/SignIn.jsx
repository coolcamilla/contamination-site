import React, { use, useState } from "react";
import { auth, db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import { signInWithEmailAndPassword } from "firebase/auth";

function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit =async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log("Вход успешно выполнен!")
            toast.success("Вход успешно выполнен!", {
                position: "top-center",
            });

            setEmail("");
            setPassword("");

        } catch (error) {
            console.log(error.message);
            toast.success(error.message, {
                position: "bottom-center",
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