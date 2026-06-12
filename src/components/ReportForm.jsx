import { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import { toast } from "react-toastify";
import "./ReportForm.css";
import { getLevelInfo } from '../constants/levels';

const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

function ReportForm({ coords, onClose, onSuccess }) {
    const [trashLevel, setTrashLevel] = useState(3);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [photoUrl, setPhotoUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const [address, setAddress] = useState("");
    const [addressLoading, setAddressLoading] = useState(false);

    const formatAddress = (addressData) => {
        if (!addressData) return null;

        const streetKeys = ['road', 'street', 'pedestrian', 'avenue', 'square', 'place'];
        let street = null;

        for (const key of streetKeys) {
            if (addressData[key]) {
                street = addressData[key];
                break;
            }
        }

        const houseNumber = addressData.house_number;

        if (street && houseNumber) {
            return `${street}, ${houseNumber}`;
        } else if (street) {
            return street;
        } else if (houseNumber) {
            return `д. ${houseNumber}`;
        }

        return null;
    };

    useEffect(() => {
        if (!coords) return;

        const fetchAddress = async () => {
            setAddressLoading(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}&accept-language=ru`
                );
                const data = await response.json();
                const shortAddress = formatAddress(data.address);
                setAddress(shortAddress || data.display_name || "");
            } catch (err) {
                console.error("Ошибка геокодирования:", err);
                setAddress("");
            } finally {
                setAddressLoading(false);
            }
        };

        fetchAddress();
    }, [coords]);

    // Прямая загрузка в Cloudinary через fetch
    const uploadToCloudinary = async (file) => {
        if (!CLOUD_NAME || !UPLOAD_PRESET) {
            toast.error("Ошибка конфигурации Cloudinary. Проверьте .env файл", {
                position: "top-center",
                autoClose: 5000,
            });
            return null;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || "Ошибка загрузки");
            }

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error("Ошибка загрузки в Cloudinary:", error);
            toast.error(`Ошибка загрузки: ${error.message}`, {
                position: "top-center",
                autoClose: 4000,
            });
            return null;
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Проверка формата
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Допустимые форматы: JPG, PNG, WebP", {
                position: "top-center",
                autoClose: 4000,
            });
            return;
        }

        // Проверка размера (макс 10 МБ)
        if (file.size > 10 * 1024 * 1024) {
            toast.error("Файл слишком большой (макс 10 МБ)", {
                position: "top-center",
                autoClose: 4000,
            });
            return;
        }

        setIsUploading(true);
        const url = await uploadToCloudinary(file);
        setIsUploading(false);

        if (url) {
            setPhotoUrl(url);
            toast.success("Фото загружено!", { position: "top-center" });
        }

        // Сброс input, чтобы можно было выбрать тот же файл повторно
        e.target.value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!photoUrl) {
            toast.error("Прикрепите фото для создания заявки", {
                position: "top-center",
                autoClose: 4000,
            });
            return;
        }

        setLoading(true);

        try {
            await addDoc(collection(db, "reports"), {
                userId: auth.currentUser.uid,
                coordinates: {
                    lat: coords.lat,
                    lng: coords.lng
                },
                address: address || null,
                trashLevel: trashLevel,
                comment: comment.trim() || null,
                photoUrl: photoUrl,
                createdAt: new Date(),
                status: "pending"
            });

            toast.success("Заявка отправлена!", { position: "top-center" });

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Ошибка: ", error);
            toast.error("Ошибка при добавлении", { position: "bottom-center" });
        } finally {
            setLoading(false);
        }
    };

    const levelInfo = getLevelInfo(trashLevel);

    return (
        <div className="report-modal-overlay" onClick={onClose}>
            <div className="report-modal" onClick={(e) => e.stopPropagation()}>
                <button className="report-modal-close" onClick={onClose}>×</button>
                <h2>Сообщить о загрязнении</h2>

                <p className="report-coords">
                    📍 {addressLoading 
                        ? "Определение адреса..." 
                        : (address || `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`)
                    }
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
                        <label>
                            Фото <span className="required-hint">*</span>
                        </label>

                        {/* Скрытый нативный input для загрузки */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/jpeg,image/png,image/webp"
                            style={{ display: "none" }}
                        />

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
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
