import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc, collection, query, where, getCountFromServer } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { toast } from "react-toastify";
import { DISTRICTS } from "../constants/districts";
import "./UserProfile.css";

function UserProfile({ user, userData: initialUserData }) {
    const [userData, setUserData] = useState(initialUserData);
    const [reportsCount, setReportsCount] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        district: "",
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            const snap = await getDoc(doc(db, "Users", user.uid));
            if (snap.exists()) {
                const data = snap.data();
                setUserData(data);
                setFormData({
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    district: data.district || DISTRICTS[0],
                });
            }
        };
        fetchData();
    }, [user]);

    // Считаем количество заявок
    useEffect(() => {
        if (!user) return;
        const countReports = async () => {
            const q = query(collection(db, "reports"), where("userId", "==", user.uid));
            const snapshot = await getCountFromServer(q);
            setReportsCount(snapshot.data().count);
        };
        countReports();
    }, [user]);

    const handleCopyId = () => {
        if (user?.uid) {
            navigator.clipboard.writeText(user.uid);
            toast.success("ID скопирован!", { position: "top-center", autoClose: 2000 });
        }
    };

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const newDisplayName = `${formData.firstName} ${formData.lastName}`.trim();

            await updateDoc(doc(db, "Users", user.uid), {
                firstName: formData.firstName,
                lastName: formData.lastName,
                displayName: newDisplayName,
                district: formData.district,
            });

            await updateProfile(user, { displayName: newDisplayName });

            setUserData((prev) => ({
                ...prev,
                firstName: formData.firstName,
                lastName: formData.lastName,
                displayName: newDisplayName,
                district: formData.district,
            }));

            toast.success("Данные обновлены!", { position: "top-center" });
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            toast.error("Ошибка при сохранении", { position: "bottom-center" });
        } finally {
            setSaving(false);
        }
    };

    if (!userData) {
        return <div className="up-loading">Загрузка профиля…</div>;
    }

    return (
        <div className="up-container">
            <h2 className="up-title">О пользователе</h2>

            <div className="up-card">
                {/* ID */}
                <div className="up-field up-field--id">
                    <label>ID пользователя</label>
                    <div className="up-id-row">
                        <code className="up-id">{user?.uid || "—"}</code>
                        <button className="up-copy-btn" onClick={handleCopyId} title="Скопировать">
                            📋
                        </button>
                    </div>
                </div>

                {/* Имя */}
                <div className="up-field">
                    <label>Имя</label>
                    {isEditing ? (
                        <input
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="up-input"
                        />
                    ) : (
                        <div className="up-value">{userData.firstName}</div>
                    )}
                </div>

                {/* Фамилия */}
                <div className="up-field">
                    <label>Фамилия</label>
                    {isEditing ? (
                        <input
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="up-input"
                        />
                    ) : (
                        <div className="up-value">{userData.lastName}</div>
                    )}
                </div>

                {/* Район */}
                <div className="up-field">
                    <label>Район проживания</label>
                    {isEditing ? (
                        <select
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            className="up-input"
                        >
                            {DISTRICTS.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    ) : (
                        <div className="up-value">{userData.district}</div>
                    )}
                </div>

                <div className="up-field up-field--readonly">
                    <label>Отправлено заявок</label>
                    <div className="up-value up-value--big">{reportsCount}</div>
                </div>

                <div className="up-actions">
                    {isEditing ? (
                        <>
                            <button
                                className="up-btn up-btn--secondary"
                                onClick={() => setIsEditing(false)}
                                disabled={saving}
                            >
                                Отмена
                            </button>
                            <button
                                className="up-btn up-btn--primary"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? "Сохранение…" : "Сохранить"}
                            </button>
                        </>
                    ) : (
                        <button
                            className="up-btn up-btn--primary"
                            onClick={() => setIsEditing(true)}
                        >
                            Редактировать
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserProfile;
