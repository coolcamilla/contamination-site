import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import React, { useState } from "react";
import { auth, db } from "../firebase";
import { setDoc, doc, getDoc, increment, addDoc, serverTimestamp, collection } from "firebase/firestore";
import { toast } from "react-toastify";
import { DISTRICTS } from "../constants/districts";
import { ROLES } from "../constants/roles";

function SignUp({ onSuccess }) {
    const [role, setRole] = useState(ROLES.USER);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [district, setDistrict] = useState(DISTRICTS[0]);
    const [referralId, setReferralId] = useState("");

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const isCompany = role === ROLES.COMPANY;
            const displayName = isCompany ? companyName : `${firstName} ${lastName}`;

            await updateProfile(user, { displayName });

            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: displayName,
                role: role,
                points: 0,
                createdAt: new Date(),
            };

            if (isCompany) {
                userData.companyName = companyName;
            } else {
                userData.firstName = firstName;
                userData.lastName = lastName;
                userData.district = district;
            }

            await setDoc(doc(db, "Users", user.uid), userData);

            // Реферальная логика
            if (!isCompany && referralId.trim()) {
                const referrerDoc = await getDoc(doc(db, "Users", referralId.trim()));
                
                if (referrerDoc.exists()) {
                    // Начисляем 20 коинов пригласившему
                    await setDoc(doc(db, "Users", referralId.trim()), {
                        points: increment(20)
                    }, { merge: true });

                    // Записываем в историю
                    await addDoc(collection(db, "ecoCoinsHistory"), {
                        userId: referralId.trim(),
                        amount: 20,
                        reason: "Реферальный бонус",
                        referredUserId: user.uid,
                        referredUserName: displayName,
                        createdAt: serverTimestamp()
                    });

                    toast.success("Регистрация успешна! Друг получил 20 🪙", { position: "top-center" });
                } else {
                    toast.warning("Регистрация успешна, но ID друга не найден", { position: "top-center" });
                }
            } else {
                toast.success("Регистрация успешна!", { position: "top-center" });
            }

            setEmail("");
            setPassword("");
            setFirstName("");
            setLastName("");
            setCompanyName("");
            setReferralId("");

            if (onSuccess) onSuccess();

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
            
            toast.error(errorMessage, { position: "top-center", autoClose: 5000 });
        }
    };

    return (
        <form onSubmit={handleSignUp}>
            <h3>Регистрация</h3>

            {/* Переключатель роли */}
            <div className="mb-3">
                <label>Тип аккаунта</label>
                <div className="role-selector">
                    <button
                        type="button"
                        className={`role-btn ${role === ROLES.USER ? "active" : ""}`}
                        onClick={() => setRole(ROLES.USER)}
                    >
                        👤 Пользователь
                    </button>
                    <button
                        type="button"
                        className={`role-btn ${role === ROLES.COMPANY ? "active" : ""}`}
                        onClick={() => setRole(ROLES.COMPANY)}
                    >
                        🏢 Управляющая компания
                    </button>
                </div>
            </div>

            {/* Поля для пользователя */}
            {role === ROLES.USER && (
                <>
                    <div className="mb-3">
                        <label>Имя *</label>
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
                        <label>Фамилия *</label>
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
                        <label>Район проживания *</label>
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

                    {/* Реферальное поле — только для пользователей, необязательное */}
                    <div className="mb-3">
                        <label>ID друга</label>
                        <input
                            type="text"
                            value={referralId}
                            className="form-control"
                            placeholder="Вставьте ID друга (необязательно)"
                            onChange={(e) => setReferralId(e.target.value)}
                        />
                        <small className="form-hint">Ваш друг получит 20 ЭКО Коинов</small>
                    </div>
                </>
            )}

            {/* Поля для компании */}
            {role === ROLES.COMPANY && (
                <div className="mb-3">
                    <label>Название компании *</label>
                    <input
                        type="text"
                        value={companyName}
                        className="form-control"
                        placeholder="Название компании"
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                    />
                </div>
            )}

            {/* Общие поля */}
            <div className="mb-3">
                <label>Почта *</label>
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
                <label>Пароль *</label>
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
                Зарегистрироваться
            </button>
        </form>
    );
}

export default SignUp;
