import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, MapPin, Navigation, CheckCircle } from 'lucide-react';

// Sede SD Móveis Projetados — Rua Jorge Figueiredo 740, CEP 61880-000, Caucaia-CE
const HQ_LAT = -3.7366;
const HQ_LNG = -38.6531;
const DEVIATION_THRESHOLD = 15; // percent

interface TripAnalysis {
  tripId: string;
  employeeName: string;
  date: string;
  gpsDistanceKm: number;
  estimatedRoundTripKm: number;
  odometerDistanceKm: number | null;
  deviationPercent: number;
  flagged: boolean;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function gpsTrackDistance(locations: { latitude: number; longitude: number }[]): number {
  let total = 0;
  for (let i = 1; i < locations.length; i++) {
    total += haversineKm(locations[i - 1].latitude, locations[i - 1].longitude, locations[i].latitude, locations[i].longitude);
  }
  return total;
}

function farthestPointFromHQ(locations: { latitude: number; longitude: number }[]): number {
  let max = 0;
  for (const loc of locations) {
    const d = haversineKm(HQ_LAT, HQ_LNG, loc.latitude, loc.longitude);
    if (d > max) max = d;
  }
  return max;
}

export default function RouteEfficiencyPanel() {
  const [analyses, setAnalyses] = useState<TripAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    setLoading(true);

    // Fetch completed trips with locations
    const { data: trips } = await supabase
      .from('trips')
      .select('id, employee_id, started_at, ended_at, status')
      .eq('status', 'completed')
      .order('ended_at', { ascending: false })
      .limit(50);

    if (!trips || trips.length === 0) {
      setAnalyses([]);
      setLoading(false);
      return;
    }

    const tripIds = trips.map(t => t.id);
    const empIds = [...new Set(trips.map(t => t.employee_id))];

    // Parallel fetches
    const [locsRes, empsRes, fuelRes] = await Promise.all([
      supabase.from('trip_locations').select('trip_id, latitude, longitude, recorded_at').in('trip_id', tripIds).order('recorded_at', { ascending: true }),
      supabase.from('employees').select('id, name').in('id', empIds),
      supabase.from('fuel_records').select('trip_id, odometer_km').in('trip_id', tripIds).order('created_at', { ascending: true }),
    ]);

    const locations = locsRes.data || [];
    const employees = empsRes.data || [];
    const fuelRecords = fuelRes.data || [];

    const empMap: Record<string, string> = {};
    employees.forEach(e => { empMap[e.id] = e.name; });

    // Group locations by trip
    const locsByTrip: Record<string, { latitude: number; longitude: number }[]> = {};
    locations.forEach(l => {
      if (!locsByTrip[l.trip_id]) locsByTrip[l.trip_id] = [];
      locsByTrip[l.trip_id].push({ latitude: l.latitude, longitude: l.longitude });
    });

    // Group fuel records by trip
    const fuelByTrip: Record<string, number[]> = {};
    fuelRecords.forEach(f => {
      if (f.trip_id) {
        if (!fuelByTrip[f.trip_id]) fuelByTrip[f.trip_id] = [];
        fuelByTrip[f.trip_id].push(Number(f.odometer_km));
      }
    });

    const results: TripAnalysis[] = [];

    for (const trip of trips) {
      const tripLocs = locsByTrip[trip.id];
      if (!tripLocs || tripLocs.length < 2) continue;

      const gpsKm = gpsTrackDistance(tripLocs);
      const farthest = farthestPointFromHQ(tripLocs);
      // Estimated round-trip: straight-line to farthest point × 2, with 1.3 road factor
      const estimatedKm = farthest * 2 * 1.3;

      // Odometer distance from fuel records (if available)
      let odometerKm: number | null = null;
      const tripFuel = fuelByTrip[trip.id];
      if (tripFuel && tripFuel.length >= 2) {
        odometerKm = Math.max(...tripFuel) - Math.min(...tripFuel);
      }

      // Use GPS distance as the "actual" reference
      const actualKm = odometerKm && odometerKm > 0 ? odometerKm : gpsKm;
      const deviationPercent = estimatedKm > 0 ? ((actualKm - estimatedKm) / estimatedKm) * 100 : 0;
      const flagged = deviationPercent > DEVIATION_THRESHOLD;

      results.push({
        tripId: trip.id,
        employeeName: empMap[trip.employee_id] || 'Desconhecido',
        date: new Date(trip.started_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }),
        gpsDistanceKm: gpsKm,
        estimatedRoundTripKm: estimatedKm,
        odometerDistanceKm: odometerKm,
        deviationPercent,
        flagged,
      });
    }

    setAnalyses(results);
    setLoading(false);
  };

  const flaggedCount = analyses.filter(a => a.flagged).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24">
        <Navigation className="w-5 h-5 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 text-center text-gray-400">
        Nenhuma viagem com dados de GPS suficientes para análise.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-500" />
          Comparativo: Rota Real vs Estimada (Sede ↔ Destino)
        </h3>
        {flaggedCount > 0 ? (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> {flaggedCount} desvio(s)
          </span>
        ) : (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Sem desvios
          </span>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Sede: Rua Jorge Figueiredo 740, Caucaia-CE • Alerta se rota real &gt; {DEVIATION_THRESHOLD}% da estimada
      </p>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="max-h-80 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left font-bold text-gray-600">Data</th>
                <th className="px-4 py-2 text-left font-bold text-gray-600">Motorista</th>
                <th className="px-4 py-2 text-right font-bold text-gray-600">GPS (km)</th>
                <th className="px-4 py-2 text-right font-bold text-gray-600">Odômetro</th>
                <th className="px-4 py-2 text-right font-bold text-gray-600">Estimada</th>
                <th className="px-4 py-2 text-right font-bold text-gray-600">Desvio</th>
              </tr>
            </thead>
            <tbody>
              {analyses.map(a => (
                <tr key={a.tripId} className={`border-t border-gray-50 hover:bg-gray-50 ${a.flagged ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3">{a.date}</td>
                  <td className="px-4 py-3 font-bold">{a.employeeName}</td>
                  <td className="px-4 py-3 text-right">{a.gpsDistanceKm.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {a.odometerDistanceKm ? `${a.odometerDistanceKm.toFixed(1)} km` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-blue-600 font-bold">{a.estimatedRoundTripKm.toFixed(1)} km</td>
                  <td className={`px-4 py-3 text-right font-bold ${a.flagged ? 'text-red-600' : 'text-green-600'}`}>
                    {a.deviationPercent > 0 ? '+' : ''}{a.deviationPercent.toFixed(0)}%
                    {a.flagged && ' ⚠️'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
