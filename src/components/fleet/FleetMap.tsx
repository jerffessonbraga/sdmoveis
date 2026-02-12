import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
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

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions.map(p => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [positions, map]);
  return null;
}

export default function FleetMap({ locations, activeTrips, employees, selectedTripId }: FleetMapProps) {
  const getEmployeeName = (empId: string) =>
    employees.find(e => e.id === empId)?.name || 'Motorista';

  // Group locations by trip
  const tripRoutes = useMemo(() => {
    const groups: Record<string, TripLocation[]> = {};
    locations.forEach(loc => {
      if (!groups[loc.trip_id]) groups[loc.trip_id] = [];
      groups[loc.trip_id].push(loc);
    });
    // Sort each group by time
    Object.values(groups).forEach(arr => arr.sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()));
    return groups;
  }, [locations]);

  // Latest position per trip (for markers)
  const latestPositions = useMemo(() => {
    return Object.entries(tripRoutes).map(([tripId, locs]) => {
      const last = locs[locs.length - 1];
      const trip = activeTrips.find(t => t.id === tripId);
      return {
        tripId,
        lat: last.latitude,
        lng: last.longitude,
        employeeName: trip ? getEmployeeName(trip.employee_id) : 'Motorista',
        time: last.recorded_at,
      };
    });
  }, [tripRoutes, activeTrips, employees]);

  // All positions for fitting bounds
  const allPositions: [number, number][] = useMemo(() => {
    return locations.map(l => [l.latitude, l.longitude] as [number, number]);
  }, [locations]);

  // Default center (São Paulo)
  const center: [number, number] = allPositions.length > 0
    ? allPositions[allPositions.length - 1]
    : [-23.55, -46.63];

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {allPositions.length > 0 && <FitBounds positions={allPositions} />}

      {Object.entries(tripRoutes).map(([tripId, locs], idx) => {
        const positions: [number, number][] = locs.map(l => [l.latitude, l.longitude]);
        const isSelected = selectedTripId === tripId;
        return (
          <Polyline
            key={tripId}
            positions={positions}
            color={colors[idx % colors.length]}
            weight={isSelected ? 5 : 3}
            opacity={isSelected ? 1 : 0.7}
          />
        );
      })}

      {latestPositions.map((pos, idx) => (
        <Marker key={pos.tripId} position={[pos.lat, pos.lng]} icon={driverIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-bold">{pos.employeeName}</p>
              <p className="text-xs text-gray-500">
                {new Date(pos.time).toLocaleString('pt-BR')}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
