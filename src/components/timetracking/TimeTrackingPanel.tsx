import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Clock, UserPlus, Play, Square, Calendar, DollarSign, Users, Trash2, Edit2, Save, X
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  role: string | null;
  phone: string | null;
  hourly_rate: number;
  active: boolean;
}

interface TimeEntry {
  id: string;
  employee_id: string;
  clock_in: string;
  clock_out: string | null;
  notes: string | null;
}

type Period = 'week' | 'biweekly' | 'month';

export default function TimeTrackingPanel() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [tab, setTab] = useState<'ponto' | 'funcionarios' | 'relatorio'>('ponto');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [hourlyRate, setHourlyRate] = useState('15.00');
  const [period, setPeriod] = useState<Period>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [empRes, teRes] = await Promise.all([
      supabase.from('employees').select('*').eq('active', true).order('name'),
      supabase.from('time_entries').select('*').order('clock_in', { ascending: false }).limit(500),
    ]);
    if (empRes.data) setEmployees(empRes.data);
    if (teRes.data) setTimeEntries(teRes.data);
    setLoading(false);
  };

  const addEmployee = async () => {
    if (!newName.trim()) return;
    const { error } = await supabase.from('employees').insert({
      name: newName.trim(),
      role: newRole.trim() || null,
      phone: newPhone.trim() || null,
      hourly_rate: parseFloat(hourlyRate) || 15,
    });
    if (error) {
      toast({ title: '❌ Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅ Funcionário adicionado' });
      setNewName(''); setNewRole(''); setNewPhone('');
      fetchData();
    }
  };

  const removeEmployee = async (id: string) => {
    await supabase.from('employees').update({ active: false }).eq('id', id);
    toast({ title: '🗑️ Funcionário desativado' });
    fetchData();
  };

  const clockIn = async (employeeId: string) => {
    const { error } = await supabase.from('time_entries').insert({
      employee_id: employeeId,
    });
    if (error) {
      toast({ title: '❌ Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅ Entrada registrada!' });
      fetchData();
    }
  };

  const clockOut = async (entryId: string) => {
    const { error } = await supabase.from('time_entries').update({
      clock_out: new Date().toISOString(),
    }).eq('id', entryId);
    if (error) {
      toast({ title: '❌ Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅ Saída registrada!' });
      fetchData();
    }
  };

  const getOpenEntry = (employeeId: string) =>
    timeEntries.find(e => e.employee_id === employeeId && !e.clock_out);

  const getPeriodDates = (): { start: Date; end: Date } => {
    const now = new Date();
    const end = new Date(now);
    const start = new Date(now);
    if (period === 'week') start.setDate(now.getDate() - 7);
    else if (period === 'biweekly') start.setDate(now.getDate() - 15);
    else start.setDate(now.getDate() - 30);
    return { start, end };
  };

  const calcHours = (employeeId: string): number => {
    const { start, end } = getPeriodDates();
    return timeEntries
      .filter(e => e.employee_id === employeeId && e.clock_out)
      .filter(e => new Date(e.clock_in) >= start && new Date(e.clock_in) <= end)
      .reduce((sum, e) => {
        const diff = (new Date(e.clock_out!).getTime() - new Date(e.clock_in).getTime()) / 3600000;
        return sum + diff;
      }, 0);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const tabClass = (t: string) =>
    `px-6 py-3 rounded-xl font-bold text-sm transition-all ${tab === t ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Clock className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 overflow-auto h-full bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Clock className="w-8 h-8 text-amber-500" />
            Ponto Eletrônico
          </h1>
          <p className="text-gray-500 mt-1">Controle de jornada dos funcionários</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-3">
        <button className={tabClass('ponto')} onClick={() => setTab('ponto')}>
          <Play className="w-4 h-4 inline mr-2" />Registrar Ponto
        </button>
        <button className={tabClass('funcionarios')} onClick={() => setTab('funcionarios')}>
          <Users className="w-4 h-4 inline mr-2" />Funcionários
        </button>
        <button className={tabClass('relatorio')} onClick={() => setTab('relatorio')}>
          <DollarSign className="w-4 h-4 inline mr-2" />Relatório / Pagamento
        </button>
      </div>

      {/* ===== PONTO ===== */}
      {tab === 'ponto' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map(emp => {
            const openEntry = getOpenEntry(emp.id);
            return (
              <div key={emp.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{emp.name}</h3>
                    {emp.role && <p className="text-sm text-gray-500">{emp.role}</p>}
                  </div>
                  <span className={`w-3 h-3 rounded-full ${openEntry ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                </div>

                {openEntry ? (
                  <div>
                    <p className="text-xs text-green-600 mb-3">
                      ⏱️ Entrada: {formatTime(openEntry.clock_in)}
                    </p>
                    <button
                      onClick={() => clockOut(openEntry.id)}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <Square className="w-4 h-4" /> Registrar Saída
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => clockIn(emp.id)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Play className="w-4 h-4" /> Registrar Entrada
                  </button>
                )}
              </div>
            );
          })}
          {employees.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum funcionário cadastrado. Vá na aba "Funcionários" para adicionar.</p>
            </div>
          )}
        </div>
      )}

      {/* ===== FUNCIONÁRIOS ===== */}
      {tab === 'funcionarios' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-500" /> Adicionar Funcionário
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                placeholder="Nome *"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <input
                placeholder="Cargo"
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                className="border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <input
                placeholder="Telefone"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                className="border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <button
                onClick={addEmployee}
                disabled={!newName.trim()}
                className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Adicionar
              </button>
            </div>
          </div>

          {/* Valor/hora global */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" /> Valor da Hora (todos)
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-gray-500">R$</span>
              <input
                type="number"
                value={hourlyRate}
                onChange={e => setHourlyRate(e.target.value)}
                className="border rounded-xl px-4 py-3 text-sm w-32 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                step="0.50"
              />
              <button
                onClick={async () => {
                  const rate = parseFloat(hourlyRate) || 15;
                  await supabase.from('employees').update({ hourly_rate: rate }).eq('active', true);
                  toast({ title: '✅ Valor/hora atualizado para todos' });
                  fetchData();
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all"
              >
                Aplicar a Todos
              </button>
            </div>
          </div>

          {/* Lista */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="font-bold text-gray-900 mb-4">Funcionários Ativos</h3>
            <div className="space-y-3">
              {employees.map(emp => (
                <div key={emp.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-900">{emp.name}</p>
                    <p className="text-xs text-gray-500">{emp.role || 'Sem cargo'} • {emp.phone || 'Sem telefone'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-green-600">R$ {emp.hourly_rate}/h</span>
                    <button onClick={() => removeEmployee(emp.id)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {employees.length === 0 && (
                <p className="text-center text-gray-400 py-6">Nenhum funcionário cadastrado</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== RELATÓRIO ===== */}
      {tab === 'relatorio' && (
        <div className="space-y-6">
          <div className="flex gap-3">
            {(['week', 'biweekly', 'month'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  period === p ? 'bg-amber-500 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p === 'week' ? 'Semana' : p === 'biweekly' ? 'Quinzena' : 'Mês'}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-600">Funcionário</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-600">Cargo</th>
                  <th className="text-right px-6 py-4 text-sm font-bold text-gray-600">Horas</th>
                  <th className="text-right px-6 py-4 text-sm font-bold text-gray-600">Valor/h</th>
                  <th className="text-right px-6 py-4 text-sm font-bold text-gray-600">Total a Receber</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => {
                  const hours = calcHours(emp.id);
                  const total = hours * emp.hourly_rate;
                  return (
                    <tr key={emp.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-gray-900">{emp.name}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{emp.role || '-'}</td>
                      <td className="px-6 py-4 text-right font-mono text-gray-700">{hours.toFixed(1)}h</td>
                      <td className="px-6 py-4 text-right text-gray-500">R$ {emp.hourly_rate.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-black text-green-600 text-lg">
                        R$ {total.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-900 text-white">
                <tr>
                  <td colSpan={2} className="px-6 py-4 font-bold">TOTAL</td>
                  <td className="px-6 py-4 text-right font-mono">
                    {employees.reduce((s, e) => s + calcHours(e.id), 0).toFixed(1)}h
                  </td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4 text-right font-black text-amber-400 text-xl">
                    R$ {employees.reduce((s, e) => s + calcHours(e.id) * e.hourly_rate, 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Histórico recente */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" /> Registros Recentes
            </h3>
            <div className="space-y-2 max-h-64 overflow-auto">
              {timeEntries.slice(0, 20).map(entry => {
                const emp = employees.find(e => e.id === entry.employee_id);
                return (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${entry.clock_out ? 'bg-gray-300' : 'bg-green-500 animate-pulse'}`} />
                      <span className="font-bold text-gray-900">{emp?.name || 'Desconhecido'}</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-500">
                      <span>🟢 {formatTime(entry.clock_in)}</span>
                      {entry.clock_out ? (
                        <span>🔴 {formatTime(entry.clock_out)}</span>
                      ) : (
                        <span className="text-green-600 font-bold">Em andamento...</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {timeEntries.length === 0 && (
                <p className="text-center text-gray-400 py-6">Nenhum registro ainda</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
