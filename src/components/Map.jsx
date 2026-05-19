import { MapContainer, TileLayer, useMap, useMapEvents, Marker } from 'react-leaflet';
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import L from 'leaflet';
import { getLevelInfo } from '../constants/levels';
import { toast } from 'react-toastify';
import './Map.css';
import 'leaflet/dist/leaflet.css';
import ReportForm from './ReportForm';
import ReportCard from './ReportCard';

const getMarkerIcon = (level) => {
    const info = getLevelInfo(level);
    return L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-pin" style="background-color: ${info.color};"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
    });
}

const containerIcon = L.divIcon({
    className: 'container-marker',
    html: `<span class="container-emoji">🗑️</span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
});

function MapPanes() {
    const map = useMap();
    useEffect(() => {
        map.createPane('containersPane');
        map.getPane('containersPane').style.zIndex = 400;
        map.createPane('reportsPane');
        map.getPane('reportsPane').style.zIndex = 650;
    }, [map]);
    return null;
}

function MapBound() {
    const map = useMap();
    useEffect(() => {
        const bounds = [[56.196918, 43.898289], [56.336481, 44.120180]];
        map.setMaxBounds(bounds);
        map.on('moveend', function() {
            if (!map.getBounds().intersects(bounds)) map.fitBounds(bounds);
        });
    }, [map]);
    return null;
}

function MapClickHandler({ onClick }) {
    useMapEvents({ click: (e) => onClick(e) });
    return null;
}

// Модалка для компании с кнопкой "Выполнить"
function CompanyReportModal({ report, onClose, onComplete }) {
    const level = getLevelInfo(report.trashLevel);

    const handleComplete = async () => {
        try {
            await updateDoc(doc(db, "reports", report.id), { status: "completed" });
            toast.success("Заявка выполнена!", { position: "top-center" });
            onComplete();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Ошибка при выполнении", { position: "bottom-center" });
        }
    };

    return (
        <div className="report-card-overlay" onClick={onClose}>
            <div className="report-card" onClick={(e) => e.stopPropagation()}>
                <button className="report-card-close" onClick={onClose}>×</button>

                <div className="rh-modal-header">
                    <div className="rh-modal-dot" style={{ backgroundColor: level.color }} />
                    <h3>Заявка №{report.id.slice(0, 6).toUpperCase()}</h3>
                </div>

                <div className="rh-modal-status" style={{ color: level.color, background: '#e8f5ee' }}>
                    {level.text}
                </div>

                {report.address && (
                    <div className="rh-modal-address">📍 {report.address}</div>
                )}

                <div className="rh-modal-meta">
                    <span>📅 {report.createdAt?.toDate?.().toLocaleDateString('ru-RU') || '—'}</span>
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

                <div className="rh-modal-actions">
                    <button className="rh-btn rh-btn--complete" onClick={handleComplete}>
                        ✓ Выполнить
                    </button>
                </div>
            </div>
        </div>
    );
}

function Map({ user, userData, onRequireAuth }) {
    const center = [56.3269, 44.0075];
    const [showForm, setShowForm] = useState(false);
    const [selectedCoords, setSelectedCoords] = useState(null);
    const [reports, setReports] = useState([]);
    const [containers, setContainers] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);

    const isCompany = userData?.role === "company";

    // Компания видит одобренные, пользователь — одобренные (для просмотра)
    useEffect(() => {
        const q = query(
            collection(db, "reports"),
            where("status", "==", "approved")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reportsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setReports(reportsData);
        });

        return () => unsubscribe();
    }, []);

    // Загрузка контейнеров
    useEffect(() => {
        const fetchContainers = async () => {
            const queryStr = `
                [out:json];
                (
                  node["amenity"="waste_disposal"](56.196918,43.898289,56.336481,44.120180);
                  node["amenity"="recycling"](56.196918,43.898289,56.336481,44.120180);
                );
                out body;
            `;
            try {
                const response = await fetch('https://overpass-api.de/api/interpreter', {
                    method: 'POST',
                    body: queryStr
                });
                const data = await response.json();
                const containerData = data.elements
                    .filter(el => el.type === 'node')
                    .map(el => ({ id: el.id, lat: el.lat, lng: el.lon }));
                setContainers(containerData);
            } catch (err) {
                console.error("Ошибка загрузки контейнеров:", err);
            }
        };
        fetchContainers();
    }, []);

    const handleMapClick = (e) => {
        if (selectedReport) {
            setSelectedReport(null);
            return;
        }
        if (!user) {
            if (onRequireAuth) onRequireAuth();
            return;
        }
        // Компания не создаёт заявки
        if (isCompany) return;
        setSelectedCoords(e.latlng);
        setShowForm(true);
    };

    const handleFormClose = () => { setShowForm(false); setSelectedCoords(null); }
    const handleFormSuccess = () => console.log("Отметка добавлена");

    return (
        <div className='map-container'>
            <MapContainer 
                center={center} 
                zoom={13} 
                minZoom={13}
                maxZoom={18}
                zoomSnap={0.5} 
                zoomDelta={0.5} 
                style={{height: '500px', width: '80%'}} 
                className='map'>
                <TileLayer 
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <MapPanes />
                <MapBound />
                <MapClickHandler onClick={handleMapClick} />

                {containers.map((container) => (
                    <Marker
                        key={`container-${container.id}`}
                        position={[container.lat, container.lng]}
                        icon={containerIcon}
                        pane="containersPane"
                    />
                ))}

                {reports.map((report) => (
                    report.coordinates && (
                        <Marker
                            key={report.id}
                            position={[report.coordinates.lat, report.coordinates.lng]}
                            icon={getMarkerIcon(report.trashLevel)}
                            pane="reportsPane"
                            eventHandlers={{
                                click: (e) => {
                                    e.originalEvent.stopPropagation();
                                    setSelectedReport(report);
                                }
                            }}
                        />
                    )
                ))}
            </MapContainer>

            {/* Форма создания заявки — только для пользователей */}
            {showForm && selectedCoords && !isCompany && (
                <ReportForm coords={selectedCoords} onClose={handleFormClose} onSuccess={handleFormSuccess} />
            )}

            {/* Модалка для компании */}
            {selectedReport && isCompany && (
                <CompanyReportModal
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                    onComplete={() => { /* метка пропадёт автоматически через onSnapshot */ }}
                />
            )}

            {/* Обычная карточка для пользователей */}
            {selectedReport && !isCompany && (
                <ReportCard report={selectedReport} onClose={() => setSelectedReport(null)} />
            )}
        </div>
    );
}

export default Map;
