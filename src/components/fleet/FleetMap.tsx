import React, { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const driverIcon = new L.DivIcon({
  html: `<div style="background:#3b82f6;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">🚗</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface TripLocation {
  id: string;
  trip_id: string;
  latitude: number;
  longitude: number;
  recorded_at: string;
}

interface Trip {
  id: string;
  employee_id: string;
  started_at: string;
}

interface Employee {
  id: string;
  name: string;
}

interface FleetMapProps {
  locations: TripLocation[];
  activeTrips: Trip[];
  employees: Employee[];
  selectedTripId: string | null;
}

const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function FleetMap({ locations, activeTrips, employees, selectedTripId }: FleetMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);

  const getEmployeeName = (empId: string) =>
    employees.find(e => e.id === empId)?.name || 'Motorista';

  // Group locations by trip
  const tripRoutes = useMemo(() => {
    const groups: Record<string, TripLocation[]> = {};
    locations.forEach(loc => {
      if (!groups[loc.trip_id]) groups[loc.trip_id] = [];
      groups[loc.trip_id].push(loc);
    });
    Object.values(groups).forEach(arr =>
      arr.sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    );
    return groups;
  }, [locations]);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [-23.55, -46.63],
      zoom: 13,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    layersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers and routes
  useEffect(() => {
    const map = mapRef.current;
    const layers = layersRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    const allPositions: L.LatLng[] = [];

    Object.entries(tripRoutes).forEach(([tripId, locs], idx) => {
      const positions = locs.map(l => L.latLng(l.latitude, l.longitude));
      allPositions.push(...positions);

      const isSelected = selectedTripId === tripId;

      // Draw route polyline
      const polyline = L.polyline(positions, {
        color: colors[idx % colors.length],
        weight: isSelected ? 5 : 3,
        opacity: isSelected ? 1 : 0.7,
      });
      layers.addLayer(polyline);

      // Add marker at latest position
      const last = locs[locs.length - 1];
      const trip = activeTrips.find(t => t.id === tripId);
      const name = trip ? getEmployeeName(trip.employee_id) : 'Motorista';

      const marker = L.marker([last.latitude, last.longitude], { icon: driverIcon });
      marker.bindPopup(`
        <div style="text-align:center">
          <p style="font-weight:bold;margin:0">${name}</p>
          <p style="font-size:12px;color:#666;margin:4px 0 0">${new Date(last.recorded_at).toLocaleString('pt-BR')}</p>
        </div>
      `);
      layers.addLayer(marker);
    });

    // Fit bounds
    if (allPositions.length > 0) {
      const bounds = L.latLngBounds(allPositions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [tripRoutes, activeTrips, employees, selectedTripId]);

  return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />;
}
