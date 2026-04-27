import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import React, { useState } from "react";
import { auth, db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import { DISTRICTS } from "../constants/districts";

function SignUp({onSuccess}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [district, setDistrict] = useState(DISTRICTS[0]);

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, {
                displayName: `${firstName} ${lastName}`
            });

            await setDoc(doc(db, "Users", user.uid), {
                uid: user.uid,
                email: user.email,
                firstName: firstName,
                lastName: lastName,
                displayName: `${firstName} ${lastName}`,
                district: district,
                points: 0,
                role: "user",
                createdAt: new Date(),
            });

            toast.success("Регистрация успешна!", {
                position: "top-center",
            });

            setEmail("");
            setPassword("");
            setFirstName("");
            setLastName("");

            if (onSuccess) {
                onSuccess();
            }

        } catch (error) {
            let errorMessage = "Не удалось зарегистрироваться";
            
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "Этот email уже зарегистрирован";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Некорректный формат email";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "Пароль должен содержать не менее 6 символов";
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = "Ошибка сети. Проверьте подключение к интернету";
            } else {
                errorMessage = error.message || "Произошла ошибка при регистрации";
            }
            
            toast.error(errorMessage, {
                position: "top-center",
                autoClose: 5000
            });
        }
    };

    return (
        <form onSubmit={handleSignUp}>
            <h3>Регистрация</h3>

            <div className="mb-3">
                <label>Имя</label>
                <input
                    type="text"
                    value={firstName}
                    className="form-control"
                    placeholder="Имя"
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                />
            </div>

            <div className="mb-3">
                <label>Фамилия</label>
                <input
                    type="text"
                    value={lastName}
                    className="form-control"
                    placeholder="Фамилия"
                    onChange={(e) => setLastName(e.target.value)}
                    required
                />
            </div>

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

            <div className="mb-3">
                <label>Район проживания</label>
                <select
                    value={district}
                    className="form-control"
                    onChange={(e) => setDistrict(e.target.value)}
                    required
                >
                    {DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>

            <button type="submit" className="btn-submit">
                Зарегистрироваться
            </button>
        </form>
    );
}

export default SignUp;