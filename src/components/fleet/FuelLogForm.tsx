import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Fuel, Camera, Send } from 'lucide-react';

interface Vehicle {
  id: string;
  plate: string;
  model: string;
}

interface FuelLogFormProps {
  employeeId: string;
  tripId?: string;
  onSaved?: () => void;
}

export default function FuelLogForm({ employeeId, tripId, onSaved }: FuelLogFormProps) {
  const { toast } = useToast();
  const [odometerKm, setOdometerKm] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('');
  const [totalPaid, setTotalPaid] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');

  useEffect(() => {
    supabase.from('vehicles').select('id, plate, model').eq('active', true).then(({ data }) => {
      if (data) setVehicles(data);
    });
  }, []);

  const liters = Number(pricePerLiter) > 0 ? Number(totalPaid) / Number(pricePerLiter) : 0;

  const uploadReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    const file = e.target.files[0];
    const ext = file.name.split('.').pop();
    const path = `fuel-receipts/${employeeId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from('trip-photos').upload(path, file);
    if (error) {
      toast({ title: '❌ Erro no upload', description: error.message, variant: 'destructive' });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('trip-photos').getPublicUrl(path);
    setReceiptUrl(urlData.publicUrl);
    setUploading(false);
    toast({ title: '📎 Comprovante anexado!' });
  };

  const handleSubmit = async () => {
    if (!odometerKm || !pricePerLiter || !totalPaid || !selectedVehicleId) {
      toast({ title: '⚠️ Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }
    setSaving(true);

    const { error } = await supabase.from('fuel_records').insert({
      employee_id: employeeId,
      trip_id: tripId || null,
      vehicle_id: selectedVehicleId,
      odometer_km: Number(odometerKm),
      price_per_liter: Number(pricePerLiter),
      total_paid: Number(totalPaid),
      receipt_url: receiptUrl,
      notes: notes.trim() || null,
    });

    setSaving(false);
    if (error) {
      toast({ title: '❌ Erro ao salvar', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: '⛽ Abastecimento registrado!' });
    setOdometerKm('');
    setPricePerLiter('');
    setTotalPaid('');
    setNotes('');
    setReceiptUrl(null);
    onSaved?.();
  };

  return (
    <div className="bg-orange-50 rounded-xl p-4 space-y-3 border border-orange-200">
      <p className="font-bold text-orange-800 text-sm flex items-center gap-2">
        <Fuel className="w-4 h-4" /> Registrar Abastecimento
      </p>

      <div>
        <label className="text-xs text-orange-700 font-bold">Veículo *</label>
        <select
          value={selectedVehicleId}
          onChange={e => setSelectedVehicleId(e.target.value)}
          className="w-full p-2 rounded-lg border border-orange-200 text-sm bg-white mt-1 font-bold"
        >
          <option value="">Selecione o veículo...</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>{v.plate} — {v.model}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-orange-700 font-bold">KM Atual (Odômetro) *</label>
          <input
            type="number"
            inputMode="decimal"
            value={odometerKm}
            onChange={e => setOdometerKm(e.target.value)}
            placeholder="Ex: 45230"
            className="w-full p-2 rounded-lg border border-orange-200 text-sm bg-white mt-1"
          />
        </div>
        <div>
          <label className="text-xs text-orange-700 font-bold">Valor/Litro (R$) *</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={pricePerLiter}
            onChange={e => setPricePerLiter(e.target.value)}
            placeholder="Ex: 5.89"
            className="w-full p-2 rounded-lg border border-orange-200 text-sm bg-white mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-orange-700 font-bold">Valor Total (R$) *</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={totalPaid}
            onChange={e => setTotalPaid(e.target.value)}
            placeholder="Ex: 200.00"
            className="w-full p-2 rounded-lg border border-orange-200 text-sm bg-white mt-1"
          />
        </div>
        <div className="flex flex-col justify-end">
          <label className="text-xs text-orange-700 font-bold">Litros (auto)</label>
          <div className="p-2 rounded-lg bg-orange-100 text-sm font-bold text-orange-800 mt-1 text-center">
            {liters > 0 ? `${liters.toFixed(2)} L` : '—'}
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs text-orange-700 font-bold">Observações</label>
        <input
          type="text"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Posto, tipo de combustível..."
          className="w-full p-2 rounded-lg border border-orange-200 text-sm bg-white mt-1"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1 px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-xs font-bold transition-colors"
        >
          <Camera className="w-4 h-4" />
          {uploading ? 'Enviando...' : receiptUrl ? '✅ Comprovante' : 'Foto Comprovante'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={uploadReceipt} />
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving || !odometerKm || !pricePerLiter || !totalPaid || !selectedVehicleId}
        className="w-full bg-orange-500 text-white py-2 rounded-lg font-bold text-sm hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Send className="w-4 h-4" />
        {saving ? 'Salvando...' : 'Registrar Abastecimento'}
      </button>
    </div>
  );
}
