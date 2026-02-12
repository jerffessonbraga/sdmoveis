import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Navigation, Play, Square, MapPin, Clock, Route } from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';

interface Trip {
  id: string;
  started_at: string;
  ended_at: string | null;
  status: string;
  description: string | null;
}

interface DriverTripPanelProps {
  employeeId: string;
  employeeName: string;
}

export default function DriverTripPanel({ employeeId, employeeName }: DriverTripPanelProps) {
  const { toast } = useToast();
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationCount, setLocationCount] = useState(0);
  const [resolvedEmployeeId, setResolvedEmployeeId] = useState(employeeId);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    fetchEmployeeAndTrips();
    return () => stopTracking();
  }, [employeeId, employeeName]);

  // Resume tracking if there's an active trip
  useEffect(() => {
    if (activeTrip && activeTrip.status === 'active') {
      startTracking(activeTrip.id);
    }
  }, [activeTrip?.id]);

  const fetchEmployeeAndTrips = async () => {
    setLoading(true);
    let resolvedId = employeeId;

    // If no ID provided, resolve from name
    if (!resolvedId) {
      const { data: empData } = await supabase
        .from('employees')
        .select('id')
        .eq('name', employeeName)
        .eq('active', true)
        .maybeSingle();
      if (empData) resolvedId = empData.id;
      else { setLoading(false); return; }
    }

    await fetchTrips(resolvedId);
  };

  const fetchTrips = async (empId: string) => {
    const { data: active } = await supabase
      .from('trips')
      .select('*')
      .eq('employee_id', empId)
      .eq('status', 'active')
      .maybeSingle();

    if (active) {
      setActiveTrip(active);
      const { count } = await supabase
        .from('trip_locations')
        .select('*', { count: 'exact', head: true })
        .eq('trip_id', active.id);
      setLocationCount(count || 0);
    } else {
      setActiveTrip(null);
    }

    const { data: recent } = await supabase
      .from('trips')
      .select('*')
      .eq('employee_id', empId)
      .eq('status', 'completed')
      .order('ended_at', { ascending: false })
      .limit(10);

    if (recent) setRecentTrips(recent);
    setResolvedEmployeeId(empId);
    setLoading(false);
  };

  const sendLocation = useCallback(async (tripId: string) => {
    try {
      // Try Capacitor Geolocation first (works in native apps), falls back to browser
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      const { error } = await supabase.from('trip_locations').insert({
        trip_id: tripId,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        speed: pos.coords.speed,
      });
      if (!error) setLocationCount(prev => prev + 1);
    } catch (err) {
      console.error('GPS error:', err);
    }
  }, []);

  const startTracking = useCallback((tripId: string) => {
    stopTracking();
    // Send immediately
    sendLocation(tripId);
    // Then every 30 seconds
    intervalRef.current = setInterval(() => sendLocation(tripId), 30000);
  }, [sendLocation]);

  const stopTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const startTrip = async (description?: string) => {
    // Request GPS permission
    try {
      await Geolocation.requestPermissions();
    } catch (e) {
      // Browser fallback - permissions handled by getCurrentPosition
    }

    const { data, error } = await supabase
      .from('trips')
      .insert({ employee_id: resolvedEmployeeId || employeeId, description: description || null })
      .select()
      .single();

    if (error) {
      toast({ title: '❌ Erro ao iniciar viagem', description: error.message, variant: 'destructive' });
      return;
    }

    setActiveTrip(data);
    setLocationCount(0);
    startTracking(data.id);
    toast({ title: '🚗 Viagem iniciada!', description: 'GPS rastreando a cada 30s' });
  };

  const endTrip = async () => {
    if (!activeTrip) return;
    stopTracking();
    // Send final location
    await sendLocation(activeTrip.id);

    const { error } = await supabase
      .from('trips')
      .update({ status: 'completed', ended_at: new Date().toISOString() })
      .eq('id', activeTrip.id);

    if (error) {
      toast({ title: '❌ Erro ao finalizar', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: '✅ Viagem finalizada!' });
    setActiveTrip(null);
    setLocationCount(0);
    fetchEmployeeAndTrips();
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  const calcDuration = (start: string, end: string | null) => {
    const s = new Date(start).getTime();
    const e = end ? new Date(end).getTime() : Date.now();
    const mins = Math.round((e - s) / 60000);
    if (mins < 60) return `${mins}min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}min`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Navigation className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Navigation className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-black text-gray-900">Minhas Viagens</h2>
      </div>

      {/* Active Trip Card */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <span className={`w-4 h-4 rounded-full ${activeTrip ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
          <span className="font-bold text-gray-900 text-lg">
            {activeTrip ? 'Viagem em andamento' : 'Nenhuma viagem ativa'}
          </span>
        </div>

        {activeTrip ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-xs text-blue-600 font-bold uppercase mb-1">Duração</p>
                <p className="text-xl font-black text-blue-700">{calcDuration(activeTrip.started_at, null)}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-xs text-green-600 font-bold uppercase mb-1">Pontos GPS</p>
                <p className="text-xl font-black text-green-700">{locationCount}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              <MapPin className="w-4 h-4 inline mr-1" />
              Início: {formatTime(activeTrip.started_at)}
            </p>
            <button
              onClick={endTrip}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-lg"
            >
              <Square className="w-5 h-5" /> Finalizar Viagem
            </button>
          </div>
        ) : (
          <button
            onClick={() => startTrip()}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-lg"
          >
            <Play className="w-5 h-5" /> Iniciar Viagem
          </button>
        )}
      </div>

      {/* Recent Trips */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Route className="w-5 h-5 text-blue-500" /> Viagens Recentes
        </h3>
        <div className="space-y-2 max-h-64 overflow-auto">
          {recentTrips.map(trip => (
            <div key={trip.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{formatTime(trip.started_at)}</span>
              </div>
              <div className="flex items-center gap-4 text-gray-500">
                <span className="font-bold text-gray-700">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {calcDuration(trip.started_at, trip.ended_at)}
                </span>
              </div>
            </div>
          ))}
          {recentTrips.length === 0 && (
            <p className="text-center text-gray-400 py-6">Nenhuma viagem registrada</p>
          )}
        </div>
      </div>
    </div>
  );
}
