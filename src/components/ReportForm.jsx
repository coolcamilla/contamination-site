import { useState } from "react";
import { auth, db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import { toast } from "react-toastify";
import "./ReportForm.css";

function ReportForm({ coords, onClose, onSuccess }) {
    const [trashLevel, setTrashLevel] = useState(3);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await addDoc(collection(db, "reports"), {
                userId: auth.currentUser.uid,
                coordinates: {
                    lat: coords.lat,
                    lng: coords.lng
                },
                trashLevel: trashLevel,
                comment: comment,
                createdAt: new Date(),
                status: "pending"
            });

            toast.success("Отметка добавлена!", {position: "top-center"});

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Ошибка: ", error);
            toast.error("Ошибка при добавлении", { position: "bottom-center"});
        } finally {
            setLoading(false);
        }
    };

    const getLevelInfo = (level) => {
        const levels = {
            1: { color: "#00ff00", emoji: "😊", text: "Очень чисто" },
            2: { color: "#88ff00", emoji: "🙂", text: "Чисто" },
            3: { color: "#ffff00", emoji: "😐", text: "Средне" },
            4: { color: "#ff8800", emoji: "😟", text: "Грязно" },
            5: { color: "#ff0000", emoji: "😡", text: "Очень грязно" }
        };
        return levels[level];
    };

    const levelInfo = getLevelInfo(trashLevel);

    return (
        <div className="report-modal-overlay" onClick={onClose}>
            <div className="report-modal" onClick={(e) => e.stopPropagation()}>
                <button className="report-modal-close" onClick={onClose}>×</button>
                <h2>Сообщить о загрязнении</h2>
                <p className="report-coords">
                    📍 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Уровень загрязнения</label>
                        <div className="level-selector">
                            {[1, 2, 3, 4, 5].map(level => (
                                <button
                                    key={level}
                                    type="button"
                                    className={`level-btn ${trashLevel === level ? "active" : ""}`}
                                    style={{ backgroundColor: getLevelInfo(level).color }}
                                    onClick={() => setTrashLevel(level)}
                                >
                                    {getLevelInfo(level).emoji}
                                </button>
                            ))}
                        </div>
                        <div className="level-text" style={{ color: levelInfo.color }}>
                            {levelInfo.text}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Комментарий</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Опишите проблему..."
                            rows="4"
                            className="comment-input"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">
                            Отмена
                        </button>
                        <button type="submit" disabled={loading} className="submit-btn">
                            {loading ? "Отправка..." : "Отправить"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ReportForm;