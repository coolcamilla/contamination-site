import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import React, { useState } from "react";
import { auth, db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import { DISTRICTS } from "../constants/districts";

function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [district, setDistrict] = useState(DISTRICTS[0]);

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            // 1. Создаём пользователя
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            console.log("Пользователь создан:", user.uid);
            
            await updateProfile(user, {
                displayName: `${firstName} ${lastName}`
            });
            
            console.log("Профиль обновлён");
            
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
            
            console.log("Данные сохранены в Firestore");
            toast.success("Регистрация успешна!", {
                position: "top-center",
            });
            
            setEmail("");
            setPassword("");
            setFirstName("");
            setLastName("");
            
        } catch (error) {
            console.log("Ошибка регистрации:", error.code, error.message);
            toast.error(error.message, {
                position: "bottom-center",
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