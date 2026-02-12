import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Clock, Play, Square, DollarSign, Calendar, User } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  role: string | null;
  hourly_rate: number;
}

interface TimeEntry {
  id: string;
  employee_id: string;
  clock_in: string;
  clock_out: string | null;
}

type Period = 'week' | 'biweekly' | 'month';

interface EmployeePortalProps {
  employeeName: string;
}

export default function EmployeePortal({ employeeName }: EmployeePortalProps) {
  const { toast } = useToast();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [period, setPeriod] = useState<Period>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployee();
  }, [employeeName]);

  const fetchEmployee = async () => {
    setLoading(true);
    const { data: empData } = await supabase
      .from('employees')
      .select('*')
      .eq('name', employeeName)
      .eq('active', true)
      .limit(1)
      .single();

    if (empData) {
      setEmployee(empData);
      const { data: entriesData } = await supabase
        .from('time_entries')
        .select('*')
        .eq('employee_id', empData.id)
        .order('clock_in', { ascending: false })
        .limit(200);
      if (entriesData) setEntries(entriesData);
    }
    setLoading(false);
  };

  const clockIn = async () => {
    if (!employee) return;
    const { error } = await supabase.from('time_entries').insert({ employee_id: employee.id });
    if (error) {
      toast({ title: '❌ Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅ Entrada registrada!' });
      fetchEmployee();
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
      fetchEmployee();
    }
  };

  const openEntry = entries.find(e => !e.clock_out);

  const getPeriodDates = (): { start: Date; end: Date } => {
    const now = new Date();
    const start = new Date(now);
    if (period === 'week') start.setDate(now.getDate() - 7);
    else if (period === 'biweekly') start.setDate(now.getDate() - 15);
    else start.setDate(now.getDate() - 30);
    return { start, end: now };
  };

  const calcHours = (): number => {
    const { start, end } = getPeriodDates();
    return entries
      .filter(e => e.clock_out && new Date(e.clock_in) >= start && new Date(e.clock_in) <= end)
      .reduce((sum, e) => {
        const diff = (new Date(e.clock_out!).getTime() - new Date(e.clock_in).getTime()) / 3600000;
        return sum + diff;
      }, 0);
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Clock className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
        <User className="w-16 h-16 opacity-50" />
        <p className="text-lg font-bold">Funcionário "{employeeName}" não encontrado</p>
        <p className="text-sm">Verifique com o administrador se seu cadastro está ativo.</p>
      </div>
    );
  }

  const hours = calcHours();
  const total = hours * employee.hourly_rate;

  return (
    <div className="p-8 space-y-6 overflow-auto h-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <Clock className="w-8 h-8 text-amber-500" />
          Meu Ponto
        </h1>
        <p className="text-gray-500 mt-1">Olá, <span className="font-bold text-gray-700">{employee.name}</span> • {employee.role || 'Funcionário'}</p>
      </header>

      {/* Clock In/Out Card */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <span className={`w-4 h-4 rounded-full ${openEntry ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
          <span className="font-bold text-gray-900 text-lg">
            {openEntry ? 'Trabalhando agora' : 'Fora do expediente'}
          </span>
        </div>

        {openEntry ? (
          <div>
            <p className="text-sm text-green-600 mb-4">⏱️ Entrada: {formatTime(openEntry.clock_in)}</p>
            <button
              onClick={() => clockOut(openEntry.id)}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-lg"
            >
              <Square className="w-5 h-5" /> Registrar Saída
            </button>
          </div>
        ) : (
          <button
            onClick={clockIn}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-lg"
          >
            <Play className="w-5 h-5" /> Registrar Entrada
          </button>
        )}
      </div>

      {/* Payment Summary */}
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-500" /> Resumo de Pagamento
        </h3>

        <div className="flex gap-3 mb-6">
          {(['week', 'biweekly', 'month'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                period === p ? 'bg-amber-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p === 'week' ? 'Semana' : p === 'biweekly' ? 'Quinzena' : 'Mês'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-5 text-center">
            <p className="text-xs text-blue-600 font-bold uppercase mb-1">Horas Trabalhadas</p>
            <p className="text-2xl font-black text-blue-700">{hours.toFixed(1)}h</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-5 text-center">
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Valor/Hora</p>
            <p className="text-2xl font-black text-gray-700">R$ {employee.hourly_rate.toFixed(2)}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 text-center">
            <p className="text-xs text-green-600 font-bold uppercase mb-1">Total a Receber</p>
            <p className="text-2xl font-black text-green-700">R$ {total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-500" /> Meus Registros Recentes
        </h3>
        <div className="space-y-2 max-h-64 overflow-auto">
          {entries.slice(0, 15).map(entry => (
            <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${entry.clock_out ? 'bg-gray-300' : 'bg-green-500 animate-pulse'}`} />
                <span>🟢 {formatTime(entry.clock_in)}</span>
              </div>
              <div className="text-gray-500">
                {entry.clock_out ? (
                  <span>🔴 {formatTime(entry.clock_out)} — <span className="font-bold text-gray-700">
                    {((new Date(entry.clock_out).getTime() - new Date(entry.clock_in).getTime()) / 3600000).toFixed(1)}h
                  </span></span>
                ) : (
                  <span className="text-green-600 font-bold">Em andamento...</span>
                )}
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <p className="text-center text-gray-400 py-6">Nenhum registro ainda</p>
          )}
        </div>
      </div>
    </div>
  );
}
