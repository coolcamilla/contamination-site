import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import { toast } from "react-toastify";
import "./ReportForm.css";
import { getLevelInfo } from '../constants/levels';

function ReportForm({ coords, onClose, onSuccess }) {
    const [trashLevel, setTrashLevel] = useState(3);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [photoUrl, setPhotoUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ФОТО ОБЯЗАТЕЛЬНО
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
                comment: comment.trim() || null, // необязательный — сохраняем null если пусто
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
            toast.error("Ошибка загрузки виджета");
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
                    toast.error("Ошибка загрузки фото");
                    return;
                }
                if (result.event === 'success') {
                    setPhotoUrl(result.info.secure_url);
                    toast.success("Фото загружено!");
                }
            }
        );
        uploadWidget.open();
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
                        <label>
                            Комментарий
                        </label>
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
