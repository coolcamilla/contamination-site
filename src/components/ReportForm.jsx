import { useState } from "react";
import { auth, db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import { toast } from "react-toastify";
import "./ReportForm.css";

function ReportForm({ coords, onClose, onSuccess }) {
    const [trashLevel, setTrashLevel] = useState(3);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [photoUrl, setPhotoUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);

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
                photoUrl: photoUrl,
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

    const showCloudinaryWidget = () => {
        if (!window.cloudinary) {
            console.error("Cloudinary widget script not loaded");
            toast.error("Ошибка загрузки виджета", { position: "bottom-center" });
            return;
        }

        setIsUploading(true);
        const uploadWidget = window.cloudinary.createUploadWidget(
            {
                cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
                uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET,
                sources: ['local', 'camera'],
                multiple: false,
                maxFiles: 1,
                clientAllowedFormats: ["image/jpeg", "image/png", "image/webp"]
            },
            (error, result) => {
                setIsUploading(false);
                if (error) {
                    console.error("Upload error:", error);
                    toast.error("Ошибка загрузки фото", { position: "bottom-center" });
                    return;
                }
                if (result.event === 'success') {
                    setPhotoUrl(result.info.secure_url);
                    toast.success("Фото загружено!", { position: "top-center" });
                }
            }
        );
        uploadWidget.open();
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

                    <div className="form-group">
                        <label>Фото</label>
                        <button
                            type="button"
                            onClick={showCloudinaryWidget}
                            disabled={isUploading}
                            className="upload-photo-btn"
                        >
                            {isUploading ? "Загрузка..." : (photoUrl ? "Изменить фото" : "Выбрать фото")}
                        </button>
                        
                        {photoUrl && (
                            <div className="photo-preview">
                                <img src={photoUrl} alt="Загруженное фото" />
                                <button 
                                    type="button" 
                                    className="remove-photo-btn" 
                                    onClick={() => setPhotoUrl("")}
                                    title="Удалить фото"
                                >
                                    ×
                                </button>
                            </div>
                        )}
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