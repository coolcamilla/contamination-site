import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { useState, useEffect } from "react";
import './Map.css';
import 'leaflet/dist/leaflet.css';
import ReportForm from './ReportForm';

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
