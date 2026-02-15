import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Navigation, Play, Square, MapPin, Clock, Route, AlertTriangle, Camera, CheckSquare, Send, X, Image, PackageCheck, Fuel } from 'lucide-react';
import SignaturePad from '@/components/employee/SignaturePad';
import ToolInventory from '@/components/employee/ToolInventory';
import FuelLogForm from '@/components/fleet/FuelLogForm';
import { Geolocation } from '@capacitor/geolocation';

interface Trip {
  id: string;
  started_at: string;
  ended_at: string | null;
  status: string;
  description: string | null;
  montagem_status: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  sort_order: number;
  checklist_type: string;
}

interface Vehicle {
  id: string;
  plate: string;
  model: string;
}

interface DriverTripPanelProps {
  employeeId: string;
  employeeName: string;
}

const DAILY_CHECKLIST = [
  'Ferramentas organizadas',
  'Área de trabalho limpa',
  'Progresso do dia registrado',
];

const DELIVERY_CHECKLIST = [
  'Puxadores instalados corretamente',
  'Portas alinhadas e reguladas',
  'Limpeza do ambiente concluída',
  'Cliente conferiu e assinou',
  'Ferramentas recolhidas',
];

export default function DriverTripPanel({ employeeId, employeeName }: DriverTripPanelProps) {
  const { toast } = useToast();
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationCount, setLocationCount] = useState(0);
  const [resolvedEmployeeId, setResolvedEmployeeId] = useState(employeeId);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Checklists
  const [dailyChecklist, setDailyChecklist] = useState<ChecklistItem[]>([]);
  const [deliveryChecklist, setDeliveryChecklist] = useState<ChecklistItem[]>([]);
  const [showDailyChecklist, setShowDailyChecklist] = useState(false);
  const [showDeliveryChecklist, setShowDeliveryChecklist] = useState(false);

  // SOS
  const [showSOS, setShowSOS] = useState(false);
  const [sosType, setSosType] = useState('Peça danificada');
  const [sosDesc, setSosDesc] = useState('');
  const [sosSending, setSosSending] = useState(false);

  // Photo Gallery
  const [tripPhotos, setTripPhotos] = useState<{ id: string; image_url: string; description: string | null }[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fuel
  const [showFuel, setShowFuel] = useState(false);

  // Vehicles
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');

  const isDeliveryMode = activeTrip?.montagem_status === 'concluida';

  useEffect(() => {
    fetchEmployeeAndTrips();
    fetchVehicles();
    return () => stopTracking();
  }, [employeeId, employeeName]);

  useEffect(() => {
    if (activeTrip && activeTrip.status === 'active') {
      startTracking(activeTrip.id);
      fetchChecklists(activeTrip.id);
      fetchPhotos(activeTrip.id);
    }
  }, [activeTrip?.id]);

  const fetchVehicles = async () => {
    const { data } = await supabase.from('vehicles').select('id, plate, model').eq('active', true);
    if (data) setVehicles(data);
  };

  const fetchEmployeeAndTrips = async () => {
    setLoading(true);
    let resolvedId = employeeId;
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
      setActiveTrip(active as Trip);
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

    if (recent) setRecentTrips(recent as Trip[]);
    setResolvedEmployeeId(empId);
    setLoading(false);
  };

  const fetchChecklists = async (tripId: string) => {
    const { data } = await supabase
      .from('trip_checklists')
      .select('*')
      .eq('trip_id', tripId)
      .order('sort_order');

    if (data && data.length > 0) {
      setDailyChecklist(data.filter((c: any) => c.checklist_type === 'daily'));
      setDeliveryChecklist(data.filter((c: any) => c.checklist_type === 'delivery'));
    } else {
      // Create default checklists
      const dailyItems = DAILY_CHECKLIST.map((label, i) => ({
        trip_id: tripId, label, checked: false, sort_order: i, checklist_type: 'daily' as string,
      }));
      const deliveryItems = DELIVERY_CHECKLIST.map((label, i) => ({
        trip_id: tripId, label, checked: false, sort_order: i + 100, checklist_type: 'delivery' as string,
      }));
      const allItems = [...dailyItems, ...deliveryItems];
      const { data: created } = await supabase.from('trip_checklists').insert(allItems).select();
      if (created) {
        setDailyChecklist(created.filter((c: any) => c.checklist_type === 'daily'));
        setDeliveryChecklist(created.filter((c: any) => c.checklist_type === 'delivery'));
      }
    }
  };

  const fetchPhotos = async (tripId: string) => {
    const { data } = await supabase
      .from('trip_photos')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at');
    if (data) setTripPhotos(data);
  };

  const toggleCheckItem = async (item: ChecklistItem) => {
    const { error } = await supabase
      .from('trip_checklists')
      .update({ checked: !item.checked })
      .eq('id', item.id);
    if (!error) {
      const updater = (prev: ChecklistItem[]) =>
        prev.map(c => c.id === item.id ? { ...c, checked: !c.checked } : c);
      if (item.checklist_type === 'daily') setDailyChecklist(updater);
      else setDeliveryChecklist(updater);
    }
  };

  const sendLocation = useCallback(async (tripId: string) => {
    try {
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
    sendLocation(tripId);
    intervalRef.current = setInterval(() => sendLocation(tripId), 30000);
  }, [sendLocation]);

  const stopTracking = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (watchIdRef.current !== null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
  };

  const startTrip = async (description?: string) => {
    try { await Geolocation.requestPermissions(); } catch (e) {}

    if (!selectedVehicleId) {
      toast({ title: '⚠️ Selecione um veículo', variant: 'destructive' });
      return;
    }

    const { data, error } = await supabase
      .from('trips')
      .insert({ employee_id: resolvedEmployeeId || employeeId, description: description || null, vehicle_id: selectedVehicleId })
      .select()
      .single();

    if (error) {
      toast({ title: '❌ Erro ao iniciar viagem', description: error.message, variant: 'destructive' });
      return;
    }

    setActiveTrip(data as Trip);
    setLocationCount(0);
    startTracking(data.id);
    toast({ title: '🚗 Viagem iniciada!', description: 'GPS rastreando a cada 30s' });
  };

  const setMontagemConcluida = async () => {
    if (!activeTrip) return;

    const uncheckedDelivery = deliveryChecklist.filter(c => !c.checked);
    if (uncheckedDelivery.length > 0) {
      setShowDeliveryChecklist(true);
      toast({ title: '⚠️ Complete o checklist de entrega', description: `${uncheckedDelivery.length} item(ns) pendente(s)`, variant: 'destructive' });
      return;
    }

    const { error } = await supabase
      .from('trips')
      .update({ montagem_status: 'concluida' })
      .eq('id', activeTrip.id);

    if (!error) {
      setActiveTrip(prev => prev ? { ...prev, montagem_status: 'concluida' } : null);
      toast({ title: '✅ Montagem marcada como concluída!', description: 'Agora colete a assinatura do cliente.' });
    }
  };

  const endTrip = async () => {
    if (!activeTrip) return;

    stopTracking();
    await sendLocation(activeTrip.id);

    const { error } = await supabase
      .from('trips')
      .update({ status: 'completed', ended_at: new Date().toISOString() })
      .eq('id', activeTrip.id);

    if (error) {
      toast({ title: '❌ Erro ao finalizar', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: '✅ Viagem do dia finalizada!' });
    setActiveTrip(null);
    setLocationCount(0);
    setDailyChecklist([]);
    setDeliveryChecklist([]);
    setTripPhotos([]);
    fetchEmployeeAndTrips();
  };

  const sendSOS = async () => {
    if (!activeTrip || !sosDesc.trim()) return;
    setSosSending(true);
    const { error } = await supabase.from('trip_incidents').insert({
      trip_id: activeTrip.id,
      employee_id: resolvedEmployeeId || employeeId,
      type: sosType,
      description: sosDesc.trim(),
    });
    setSosSending(false);
    if (error) {
      toast({ title: '❌ Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '🆘 Imprevisto reportado!', description: 'O administrador será notificado.' });
      setSosDesc('');
      setShowSOS(false);
    }
  };

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeTrip || !e.target.files?.length) return;
    setUploading(true);
    const file = e.target.files[0];
    const ext = file.name.split('.').pop();
    const path = `${activeTrip.id}/${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage.from('trip-photos').upload(path, file);
    if (uploadErr) {
      toast({ title: '❌ Erro no upload', description: uploadErr.message, variant: 'destructive' });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('trip-photos').getPublicUrl(path);
    await supabase.from('trip_photos').insert({
      trip_id: activeTrip.id,
      image_url: urlData.publicUrl,
    });

    await fetchPhotos(activeTrip.id);
    setUploading(false);
    toast({ title: '📸 Foto salva!' });
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  const dailyChecked = dailyChecklist.filter(c => c.checked).length;
  const deliveryChecked = deliveryChecklist.filter(c => c.checked).length;

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
          {activeTrip && (
            <span className={`ml-auto text-xs font-bold px-2 py-1 rounded-full ${
              isDeliveryMode ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {isDeliveryMode ? '✅ Entrega' : '🔧 Em montagem'}
            </span>
          )}
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

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowDailyChecklist(!showDailyChecklist)}
                className="flex flex-col items-center gap-1 p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
              >
                <CheckSquare className="w-5 h-5 text-amber-600" />
                <span className="text-xs font-bold text-amber-700">Diário</span>
                <span className="text-[10px] text-amber-500">{dailyChecked}/{dailyChecklist.length}</span>
              </button>
              <button
                onClick={() => setShowDeliveryChecklist(!showDeliveryChecklist)}
                className="flex flex-col items-center gap-1 p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
              >
                <PackageCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700">Entrega</span>
                <span className="text-[10px] text-emerald-500">{deliveryChecked}/{deliveryChecklist.length}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-1 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <Camera className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-bold text-blue-700">{uploading ? 'Enviando...' : 'Foto'}</span>
                <span className="text-[10px] text-blue-500">{tripPhotos.length} foto(s)</span>
              </button>
              <button
                onClick={() => setShowFuel(!showFuel)}
                className="flex flex-col items-center gap-1 p-3 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
              >
                <Fuel className="w-5 h-5 text-orange-600" />
                <span className="text-xs font-bold text-orange-700">Abastecer</span>
                <span className="text-[10px] text-orange-500">Combustível</span>
              </button>
              <button
                onClick={() => setShowSOS(!showSOS)}
                className="flex flex-col items-center gap-1 p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
              >
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-xs font-bold text-red-700">SOS</span>
                <span className="text-[10px] text-red-500">Imprevisto</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={uploadPhoto}
            />

            {/* Daily Checklist Panel */}
            {showDailyChecklist && (
              <div className="bg-amber-50 rounded-xl p-4 space-y-2 border border-amber-200">
                <p className="font-bold text-amber-800 text-sm mb-2">📋 Checklist Diário</p>
                <p className="text-xs text-amber-600 mb-2">Progresso do dia — não bloqueia a finalização da viagem.</p>
                {dailyChecklist.map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggleCheckItem(item)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm transition-all ${
                      item.checked ? 'bg-green-100 text-green-800' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${
                      item.checked ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                    }`}>
                      {item.checked && '✓'}
                    </span>
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {/* Delivery Checklist Panel */}
            {showDeliveryChecklist && (
              <div className="bg-emerald-50 rounded-xl p-4 space-y-2 border border-emerald-200">
                <p className="font-bold text-emerald-800 text-sm mb-2">📦 Checklist de Entrega</p>
                <p className="text-xs text-emerald-600 mb-2">Obrigatório para marcar montagem como concluída.</p>
                {deliveryChecklist.map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggleCheckItem(item)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm transition-all ${
                      item.checked ? 'bg-green-100 text-green-800' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${
                      item.checked ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                    }`}>
                      {item.checked && '✓'}
                    </span>
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {/* Fuel Log Panel */}
            {showFuel && (
              <FuelLogForm
                employeeId={resolvedEmployeeId || employeeId}
                tripId={activeTrip.id}
                onSaved={() => setShowFuel(false)}
              />
            )}

            {/* SOS Panel */}
            {showSOS && (
              <div className="bg-red-50 rounded-xl p-4 space-y-3 border border-red-200">
                <p className="font-bold text-red-800 text-sm">🆘 Reportar Imprevisto</p>
                <select
                  value={sosType}
                  onChange={e => setSosType(e.target.value)}
                  className="w-full p-2 rounded-lg border border-red-200 text-sm bg-white"
                >
                  <option>Peça danificada</option>
                  <option>Falta de material</option>
                  <option>Medida incorreta</option>
                  <option>Problema no local</option>
                  <option>Outro</option>
                </select>
                <textarea
                  value={sosDesc}
                  onChange={e => setSosDesc(e.target.value)}
                  placeholder="Descreva o problema..."
                  className="w-full p-2 rounded-lg border border-red-200 text-sm bg-white resize-none h-20"
                />
                <button
                  onClick={sendSOS}
                  disabled={sosSending || !sosDesc.trim()}
                  className="w-full bg-red-500 text-white py-2 rounded-lg font-bold text-sm hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {sosSending ? 'Enviando...' : 'Enviar Alerta'}
                </button>
              </div>
            )}

            {/* Trip Photos */}
            {tripPhotos.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-700 flex items-center gap-1">
                  <Image className="w-4 h-4" /> Fotos da Montagem
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {tripPhotos.map(photo => (
                    <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img src={photo.image_url} alt="Foto" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Signature — only when montagem is complete */}
            {isDeliveryMode && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="font-bold text-green-800 text-sm mb-3">✍️ Assinatura do Cliente (Entrega Final)</p>
                <SignaturePad tripId={activeTrip.id} />
              </div>
            )}

            {/* Mark as complete button */}
            {!isDeliveryMode && (
              <button
                onClick={setMontagemConcluida}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <PackageCheck className="w-5 h-5" /> Marcar Montagem Concluída
              </button>
            )}

            {/* End trip — always available */}
            <button
              onClick={endTrip}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-lg"
            >
              <Square className="w-5 h-5" /> Finalizar Viagem do Dia
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">🚗 Selecione o Veículo</label>
              <select
                value={selectedVehicleId}
                onChange={e => setSelectedVehicleId(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 text-sm font-bold bg-white"
              >
                <option value="">Escolha um veículo...</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.plate} — {v.model}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => startTrip()}
              disabled={!selectedVehicleId}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-lg disabled:opacity-50"
            >
              <Play className="w-5 h-5" /> Iniciar Viagem
            </button>
          </div>
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
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  trip.montagem_status === 'concluida' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {trip.montagem_status === 'concluida' ? 'Entregue' : 'Parcial'}
                </span>
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

      {/* Tool Inventory */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <ToolInventory employeeId={resolvedEmployeeId || employeeId} />
      </div>
    </div>
  );
}
