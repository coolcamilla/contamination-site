import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from "firebase/firestore";
import { getLevelInfo } from "../constants/levels";
import { toast } from "react-toastify";
import "./ReportsHistory.css";
import { increment, addDoc, serverTimestamp } from "firebase/firestore";

const STATUS_MAP = {
    pending:   { label: "На рассмотрении", color: "#ff8800", bg: "#fff4e6" },
    approved:  { label: "Одобрена",        color: "#2d7a4f", bg: "#e8f5ee" },
    rejected:  { label: "Отклонена",       color: "#c44",    bg: "#fff0f0" },
    completed: { label: "Выполнена",       color: "#1a472a", bg: "#d4e6d9" },
};

function ReportDetailModal({ report, onClose, isCompany, onStatusChange }) {
    const level = getLevelInfo(report.trashLevel);
    const status = STATUS_MAP[report.status] || STATUS_MAP.pending;

    const handleApprove = async () => {
        try {
            const reportRef = doc(db, "reports", report.id);
            const userRef = doc(db, "Users", report.userId);

            // Одобряем заявку
            await updateDoc(reportRef, { status: "approved" });

            // Начисляем 10 коинов пользователю
            await updateDoc(userRef, {
                points: increment(10)
            });

            // Сохраняем в историю
            await addDoc(collection(db, "ecoCoinsHistory"), {
                userId: report.userId,
                amount: 10,
                reason: "Заявка одобрена",
                reportId: report.id,
                createdAt: serverTimestamp()
            });

            toast.success("Заявка одобрена!", { position: "top-center" });
            onStatusChange();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Ошибка при одобрении", { position: "bottom-center" });
        }
    };

    const handleReject = async () => {
        try {
            await updateDoc(doc(db, "reports", report.id), { status: "rejected" });
            toast.info("Заявка отклонена", { position: "top-center" });
            onStatusChange();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Ошибка при отклонении", { position: "bottom-center" });
        }
    };

    return (
        <div className="rh-modal-overlay" onClick={onClose}>
            <div className="rh-modal" onClick={(e) => e.stopPropagation()}>
                <button className="rh-modal-close" onClick={onClose}>×</button>

                <div className="rh-modal-header">
                    <div className="rh-modal-dot" style={{ backgroundColor: level.color }} />
                    <h3>Заявка №{report.id.slice(0, 6).toUpperCase()}</h3>
                </div>

                <div className="rh-modal-status" style={{ color: status.color, background: status.bg }}>
                    {status.label}
                </div>

                {report.address && (
                    <div className="rh-modal-address">📍 {report.address}</div>
                )}

                <div className="rh-modal-meta">
                    <span>📅 {report.createdAt?.toDate?.().toLocaleDateString('ru-RU') || '—'}</span>
                    <span>{level.emoji} {level.text}</span>
                </div>

                {report.photoUrl && (
                    <div className="rh-modal-photo">
                        <img src={report.photoUrl} alt="Фото" />
                    </div>
                )}

                {report.comment && (
                    <div className="rh-modal-comment">
                        <label>Комментарий</label>
                        <p>{report.comment}</p>
                    </div>
                )}

                {/* Кнопки для компании */}
                {isCompany && report.status === "pending" && (
                    <div className="rh-modal-actions">
                        <button className="rh-btn rh-btn--reject" onClick={handleReject}>
                            ❌ Отклонить
                        </button>
                        <button className="rh-btn rh-btn--approve" onClick={handleApprove}>
                            ✓ Одобрить
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function ReportsHistory({ userData }) {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const isCompany = userData?.role === "company";

    useEffect(() => {
        let q;

        if (isCompany) {
            q = query(
                collection(db, "reports"),
                where("status", "==", "pending"),
                orderBy("createdAt", "desc")
            );
        } else {
            if (!auth.currentUser) return;
            q = query(
                collection(db, "reports"),
                where("userId", "==", auth.currentUser.uid),
                orderBy("createdAt", "desc")
            );
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setReports(data);
            setLoading(false);
        }, (err) => {
            console.error("Ошибка загрузки заявок:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [isCompany, refreshKey]);

    const handleStatusChange = () => {
        setRefreshKey((prev) => prev + 1);
    };

    if (loading) {
        return <div className="rh-loading">Загрузка заявок…</div>;
    }

    if (reports.length === 0) {
        return (
            <div className="rh-empty">
                <h3>{isCompany ? "Нет новых заявок" : "У вас пока нет заявок"}</h3>
                <p>{isCompany ? "Все заявки обработаны" : "Нажмите на карту, чтобы создать первую отметку"}</p>
            </div>
        );
    }

    return (
        <div className="rh-container">
            <h2 className="rh-title">{isCompany ? "Заявки на рассмотрении" : "Мои заявки"}</h2>

            <div className="rh-grid">
                {reports.map((report) => {
                    const status = STATUS_MAP[report.status] || STATUS_MAP.pending;
                    return (
                        <div
                            key={report.id}
                            className="rh-card"
                            onClick={() => setSelectedReport(report)}
                        >
                            <div className="rh-card-header">
                                <span
                                    className="rh-card-badge"
                                    style={{ color: status.color, background: status.bg }}
                                >
                                    {status.label}
                                </span>
                            </div>

                            <div className="rh-card-address">
                                {report.address || "Адрес не определён"}
                            </div>

                            <div className="rh-card-footer">
                                <span>
                                    {report.createdAt?.toDate?.().toLocaleDateString("ru-RU")}
                                </span>
                                <span className="rh-card-more">Подробнее →</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedReport && (
                <ReportDetailModal
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                    isCompany={isCompany}
                    onStatusChange={handleStatusChange}
                />
            )}
        </div>
    );
}

export default ReportsHistory;
