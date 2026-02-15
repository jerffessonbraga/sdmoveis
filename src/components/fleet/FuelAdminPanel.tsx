import React, { useState, useEffect, lazy, Suspense } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Fuel, TrendingUp, AlertTriangle, BarChart3, Navigation } from 'lucide-react';

const RouteEfficiencyPanel = lazy(() => import('./RouteEfficiencyPanel'));

interface FuelRecord {
  id: string;
  employee_id: string;
  vehicle_id: string | null;
  trip_id: string | null;
  odometer_km: number;
  price_per_liter: number;
  total_paid: number;
  liters: number;
  receipt_url: string | null;
  notes: string | null;
  created_at: string;
}

interface Employee {
  id: string;
  name: string;
}

interface Vehicle {
  id: string;
  plate: string;
  model: string;
}

interface FuelWithEfficiency extends FuelRecord {
  kmL: number | null;
  distanceSinceLastFuel: number | null;
}

export default function FuelAdminPanel() {
  const [records, setRecords] = useState<FuelWithEfficiency[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const DEVIATION_THRESHOLD = 15; // percent

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [empRes, fuelRes, vehRes] = await Promise.all([
      supabase.from('employees').select('id, name').eq('active', true),
      supabase.from('fuel_records').select('*').order('created_at', { ascending: true }),
      supabase.from('vehicles').select('id, plate, model').eq('active', true),
    ]);

    const emps = empRes.data || [];
    const rawRecords = (fuelRes.data || []) as FuelRecord[];
    const vehs = vehRes.data || [];

    // Calculate efficiency per employee
    const byEmployee: Record<string, FuelRecord[]> = {};
    rawRecords.forEach(r => {
      if (!byEmployee[r.employee_id]) byEmployee[r.employee_id] = [];
      byEmployee[r.employee_id].push(r);
    });

    const enriched: FuelWithEfficiency[] = [];
    Object.values(byEmployee).forEach(empRecords => {
      empRecords.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      empRecords.forEach((rec, i) => {
        let kmL: number | null = null;
        let distanceSinceLastFuel: number | null = null;
        if (i > 0) {
          const prev = empRecords[i - 1];
          distanceSinceLastFuel = rec.odometer_km - prev.odometer_km;
          if (rec.liters > 0 && distanceSinceLastFuel > 0) {
            kmL = distanceSinceLastFuel / rec.liters;
          }
        }
        enriched.push({ ...rec, kmL, distanceSinceLastFuel });
      });
    });

    // Sort by most recent first for display
    enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setEmployees(emps);
    setVehicles(vehs);
    setRecords(enriched);
    setLoading(false);
  };

  const filtered = records.filter(r => {
    if (selectedEmployee !== 'all' && r.employee_id !== selectedEmployee) return false;
    if (selectedVehicle !== 'all' && r.vehicle_id !== selectedVehicle) return false;
    return true;
  });

  const getEmpName = (id: string) => employees.find(e => e.id === id)?.name || 'Desconhecido';
  const getVehicleName = (id: string | null) => {
    if (!id) return '—';
    const v = vehicles.find(v => v.id === id);
    return v ? `${v.plate}` : '—';
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });

  // Stats
  const withEfficiency = filtered.filter(r => r.kmL !== null);
  const avgKmL = withEfficiency.length > 0
    ? withEfficiency.reduce((s, r) => s + (r.kmL || 0), 0) / withEfficiency.length
    : null;
  const totalSpent = filtered.reduce((s, r) => s + r.total_paid, 0);
  const totalLiters = filtered.reduce((s, r) => s + r.liters, 0);
  const alerts = filtered.filter(r => {
    if (!r.kmL || !avgKmL) return false;
    return r.kmL < avgKmL * (1 - DEVIATION_THRESHOLD / 100);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Fuel className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Fuel className="w-7 h-7 text-orange-500" />
            Gestão de Abastecimento
          </h2>
          <p className="text-gray-500 text-sm mt-1">Controle de combustível e eficiência</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedEmployee}
            onChange={e => setSelectedEmployee(e.target.value)}
            className="p-2 rounded-xl border border-gray-200 text-sm font-bold bg-white"
          >
            <option value="all">Todos Motoristas</option>
            {employees.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
          <select
            value={selectedVehicle}
            onChange={e => setSelectedVehicle(e.target.value)}
            className="p-2 rounded-xl border border-gray-200 text-sm font-bold bg-white"
          >
            <option value="all">Todos Veículos</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.plate} — {v.model}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-xs text-orange-600 font-bold">Total Gasto</p>
          <p className="text-xl font-black text-orange-700">R$ {totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-600 font-bold">Total Litros</p>
          <p className="text-xl font-black text-blue-700">{totalLiters.toFixed(1)} L</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-xs text-green-600 font-bold">Média KM/L</p>
          <p className="text-xl font-black text-green-700">
            {avgKmL ? `${avgKmL.toFixed(1)} km/L` : '—'}
          </p>
        </div>
        <div className={`border rounded-xl p-4 ${alerts.length > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <p className={`text-xs font-bold ${alerts.length > 0 ? 'text-red-600' : 'text-gray-600'}`}>Alertas</p>
          <p className={`text-xl font-black ${alerts.length > 0 ? 'text-red-700' : 'text-gray-700'}`}>
            {alerts.length > 0 ? `⚠️ ${alerts.length}` : '✅ 0'}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
          <p className="font-bold text-red-800 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Consumo abaixo da média ({DEVIATION_THRESHOLD}%+ abaixo)
          </p>
          {alerts.map(r => (
            <div key={r.id} className="flex justify-between items-center text-sm bg-white p-2 rounded-lg">
              <span className="font-bold text-gray-800">{getEmpName(r.employee_id)}</span>
              <span className="text-red-600 font-bold">{r.kmL?.toFixed(1)} km/L</span>
              <span className="text-gray-500">{formatDate(r.created_at)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Records Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-500" /> Histórico de Abastecimentos ({filtered.length})
          </p>
        </div>
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left font-bold text-gray-600">Data</th>
                <th className="px-4 py-2 text-left font-bold text-gray-600">Motorista</th>
                <th className="px-4 py-2 text-left font-bold text-gray-600">Veículo</th>
                <th className="px-4 py-2 text-right font-bold text-gray-600">KM</th>
                <th className="px-4 py-2 text-right font-bold text-gray-600">Litros</th>
                <th className="px-4 py-2 text-right font-bold text-gray-600">R$</th>
                <th className="px-4 py-2 text-right font-bold text-gray-600">KM/L</th>
                <th className="px-4 py-2 text-right font-bold text-gray-600">Dist.</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const isLow = r.kmL !== null && avgKmL !== null && r.kmL < avgKmL * (1 - DEVIATION_THRESHOLD / 100);
                return (
                  <tr key={r.id} className={`border-t border-gray-50 hover:bg-gray-50 ${isLow ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3">{formatDate(r.created_at)}</td>
                    <td className="px-4 py-3 font-bold">{getEmpName(r.employee_id)}</td>
                    <td className="px-4 py-3 text-gray-600">{getVehicleName(r.vehicle_id)}</td>
                    <td className="px-4 py-3 text-right">{Number(r.odometer_km).toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 text-right">{Number(r.liters).toFixed(1)}</td>
                    <td className="px-4 py-3 text-right font-bold">R$ {Number(r.total_paid).toFixed(2)}</td>
                    <td className={`px-4 py-3 text-right font-bold ${isLow ? 'text-red-600' : r.kmL ? 'text-green-600' : 'text-gray-400'}`}>
                      {r.kmL ? `${r.kmL.toFixed(1)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {r.distanceSinceLastFuel ? `${Number(r.distanceSinceLastFuel).toLocaleString('pt-BR')} km` : '—'}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-gray-400 py-8">Nenhum abastecimento registrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Route Efficiency Comparison */}
      <Suspense fallback={<div className="flex items-center justify-center h-24"><Navigation className="w-5 h-5 text-blue-500 animate-spin" /></div>}>
        <RouteEfficiencyPanel />
      </Suspense>
    </div>
  );
}
