import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { getLevelInfo } from "../constants/levels";
import "./ReportsHistory.css";

const STATUS_MAP = {
    pending:   { label: "На рассмотрении", color: "#ff8800", bg: "#fff4e6" },
    approved:  { label: "Одобрена",        color: "#2d7a4f", bg: "#e8f5ee" },
    rejected:  { label: "Отклонена",       color: "#c44",    bg: "#fff0f0" },
    completed: { label: "Выполнена",       color: "#1a472a", bg: "#d4e6d9" },
};

function ReportDetailModal({ report, onClose }) {
    const level = getLevelInfo(report.trashLevel);
    const status = STATUS_MAP[report.status] || STATUS_MAP.pending;

    return (
        <div className="rh-modal-overlay" onClick={onClose}>
            <div className="rh-modal" onClick={(e) => e.stopPropagation()}>
                <button className="rh-modal-close" onClick={onClose}>×</button>

                <div className="rh-modal-header">
                    <div className="rh-modal-dot" style={{ backgroundColor: level.color }} />
                    <h3>Заявка №{report.id.slice(0, 5).toUpperCase()}</h3>
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
            </div>
        </div>
    );
}

function ReportsHistory() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);

    useEffect(() => {
        if (!auth.currentUser) return;

        const q = query(
            collection(db, "reports"),
            where("userId", "==", auth.currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            // Сортировка: новые сверху
            data.sort((a, b) => {
                const da = a.createdAt?.toDate?.() || 0;
                const db = b.createdAt?.toDate?.() || 0;
                return db - da;
            });
            setReports(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="rh-loading">Загрузка заявок…</div>;
    }

    if (reports.length === 0) {
        return (
            <div className="rh-empty">
                <h3>У вас пока нет заявок</h3>
                <p>Нажмите на карту, чтобы создать первую отметку</p>
            </div>
        );
    }

    return (
        <div className="rh-container">
            <h2 className="rh-title">Мои заявки</h2>

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
                                <span className="rh-card-badge"
                                    style={{ color: status.color, background: status.bg }}>
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
                />
            )}
        </div>
    );
}

export default ReportsHistory;