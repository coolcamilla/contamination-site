import { MapContainer, TileLayer, useMap, useMapEvents, Marker, Popup } from 'react-leaflet';
import { useState, useEffect } from "react";
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import L from 'leaflet';
import './Map.css';
import 'leaflet/dist/leaflet.css';
import ReportForm from './ReportForm';

const getLevelInfo = (level) => {
    const levels = {
        1: { color: "#00ff00", text: "Очень чисто" },
        2: { color: "#88ff00", text: "Чисто" },
        3: { color: "#ffff00", text: "Средне" },
        4: { color: "#ff8800", text: "Грязно" },
        5: { color: "#ff0000", text: "Очень грязно" }
    };
    return levels[level] || levels[3];
};

const getMarkerIcon = (level) => {
    const info = getLevelInfo(level);

    return L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-pin" style="background-color: ${info.color};"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16],
    });
}

function MapBound() {
    const map = useMap();

    useEffect(() => {
        const bounds = [
            [56.157007, 44.149545],
            [56.388477, 43.744734]
        ];
    
        map.setMaxBounds(bounds);

        map.on('moveend', function() {
            if (!map.getBounds().intersects(bounds)) {
                map.fitBounds(bounds);
            }
        });
    }, [map]);

    return null;
}

function MapClickHandler({ onClick }) {
    useMapEvents({
        click: (e) => {
            onClick(e);
        },
    });
    return null;
}

function Map({ user, onRequireAuth }) {
    const center = [56.3269, 44.0075];

    const [showForm, setShowForm] = useState(false);
    const [selectedCoords, setSelectedCoords] = useState(null);
    const [reports, setReports] = useState([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "reports"), (snapshot) => {
            const reportsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setReports(reportsData);
        });

        return () => unsubscribe();
    }, []);

    const handleMapClick = (e) => {
        if (!user) {
            if (onRequireAuth) onRequireAuth();
            return;
        }

        console.log("Клик по координатам", e.latlng);
        setSelectedCoords(e.latlng);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setSelectedCoords(null);
    }

    const handleFormSuccess = () => {
        console.log("Отметка добавлена, можно обновить карту");
    };

    return (
        <div className='map-container'>
            <MapContainer 
                center={center} 
                zoom={13} 
                minZoom={13} 
                zoomSnap={0.5} 
                zoomDelta={0.5} 
                style={{height: '750px', width: '80%'}} 
                className='map'>
                <TileLayer 
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                <MapBound />
                <MapClickHandler onClick={handleMapClick} />

                {reports.map((report) => (
                    report.coordinates && (
                        <Marker
                            key={report.id}
                            position={[report.coordinates.lat, report.coordinates.lng]}
                            icon={getMarkerIcon(report.trashLevel)}>
                            <Popup>
                                <div className='marker-popup'>
                                    <div className="popup-level" style={{ color: getLevelInfo(report.trashLevel).color }}>
                                        {getLevelInfo(report.trashLevel).text}
                                    </div>
                                    
                                    {report.photoUrl && (
                                        <div className="popup-photo">
                                            <img src={report.photoUrl} alt="Фото загрязнения" />
                                        </div>
                                    )}
                                    
                                    {report.comment && (
                                        <div className="popup-comment">{report.comment}</div>
                                    )}
                                    
                                    <div className="popup-date">
                                        {report.createdAt?.toDate 
                                            ? report.createdAt.toDate().toLocaleDateString('ru-RU') 
                                            : ''}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>

            {showForm && selectedCoords && (
                <ReportForm
                    coords={selectedCoords}
                    onClose={handleFormClose}
                    onSuccess={handleFormSuccess}
                />
            )} 
        </div>
    );
}

export default Map;
