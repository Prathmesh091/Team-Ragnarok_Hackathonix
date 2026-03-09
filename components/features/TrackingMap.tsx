'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapLocation {
    lat: number;
    lng: number;
    label: string;
    role: string;
    timestamp: string;
    isActive: boolean;
}

interface TrackingMapProps {
    locations: MapLocation[];
}

export function TrackingMap({ locations }: TrackingMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current || locations.length === 0) return;

        // Clean up previous map
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }

        // Create map
        const map = L.map(mapRef.current, {
            scrollWheelZoom: false,
            zoomControl: true,
        });
        mapInstanceRef.current = map;

        // Dark tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
            maxZoom: 19,
        }).addTo(map);

        const latLngs: L.LatLngExpression[] = [];

        locations.forEach((loc, index) => {
            const latLng: L.LatLngExpression = [loc.lat, loc.lng];
            latLngs.push(latLng);

            // Custom marker icon
            const iconColor = loc.isActive ? '#10b981' : '#6b7280';
            const iconSize = loc.isActive ? 14 : 10;

            const icon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="
                    width: ${iconSize}px;
                    height: ${iconSize}px;
                    background: ${iconColor};
                    border: 2px solid white;
                    border-radius: 50%;
                    box-shadow: 0 0 ${loc.isActive ? '12px' : '6px'} ${iconColor};
                "></div>`,
                iconSize: [iconSize, iconSize],
                iconAnchor: [iconSize / 2, iconSize / 2],
            });

            const marker = L.marker(latLng, { icon }).addTo(map);

            marker.bindPopup(`
                <div style="color: #111; font-size: 13px; line-height: 1.5;">
                    <strong>${loc.role}</strong><br/>
                    <span style="color: #555;">${loc.label}</span><br/>
                    <span style="color: #888; font-size: 11px;">${new Date(loc.timestamp).toLocaleString()}</span>
                </div>
            `);
        });

        // Draw route line
        if (latLngs.length > 1) {
            L.polyline(latLngs, {
                color: '#10b981',
                weight: 2,
                opacity: 0.7,
                dashArray: '8, 8',
            }).addTo(map);
        }

        // Fit bounds
        if (latLngs.length > 0) {
            const bounds = L.latLngBounds(latLngs);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [locations]);

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700/50">
                <h2 className="text-base font-semibold text-gray-200">Supply Chain Map</h2>
            </div>
            <div ref={mapRef} className="w-full h-[400px]" />
        </div>
    );
}
