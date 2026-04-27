import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Marker } from 'react-leaflet/Marker';
import { useState } from "react";
import { useEffect } from 'react';
import './Map.css';
import 'leaflet/dist/leaflet.css';

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

function Map() {
    const center = [56.3269,  44.0075];

    const handleMapClick = (e) => {
        console.log("Клик по координатам", e.latlng);

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
                onclick={handleMapClick}
                className='map'>
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"/>
                <MapBound />
            </MapContainer>
        </div>
    );
}

export default Map;
