import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Clock, Play, Square, DollarSign, Calendar, User, Send, CheckCircle, XCircle, Loader2, Download, Fuel } from 'lucide-react';

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

interface Adjustment {
  id: string;
  employee_id: string;
  type: string;
  description: string | null;
  amount: number;
  hours: number;
  reference_date: string;
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

  // Vale/Adiantamento
  const [showVale, setShowVale] = useState(false);
  const [valeAmount, setValeAmount] = useState('');
  const [valeReason, setValeReason] = useState('');
  const [valeSending, setValeSending] = useState(false);
  const [valeRequests, setValeRequests] = useState<any[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);

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
      const [entriesRes, valeRes, adjRes] = await Promise.all([
        supabase.from('time_entries').select('*').eq('employee_id', empData.id).order('clock_in', { ascending: false }).limit(200),
        supabase.from('advance_requests').select('*').eq('employee_id', empData.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('employee_adjustments').select('*').eq('employee_id', empData.id).order('created_at', { ascending: false }).limit(200),
      ]);
      if (entriesRes.data) setEntries(entriesRes.data);
      if (valeRes.data) setValeRequests(valeRes.data);
      if (adjRes.data) setAdjustments(adjRes.data as Adjustment[]);
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

  const submitVale = async () => {
    if (!employee || !valeAmount) return;
    setValeSending(true);
    const { error } = await supabase.from('advance_requests').insert({
      employee_id: employee.id,
      amount: parseFloat(valeAmount),
      reason: valeReason.trim() || null,
    });
    setValeSending(false);
    if (error) {
      toast({ title: '❌ Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅ Solicitação enviada!', description: 'Aguarde a aprovação do administrador.' });
      setValeAmount('');
      setValeReason('');
      setShowVale(false);
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

  const getPeriodAdjustments = () => {
    if (!employee) return [];
    const { start, end } = getPeriodDates();
    return adjustments.filter(a =>
      a.employee_id === employee.id &&
      new Date(a.reference_date) >= start &&
      new Date(a.reference_date) <= end
    );
  };

  const calcOvertime = () => getPeriodAdjustments().filter(a => a.type === 'overtime').reduce((s, a) => s + Number(a.amount), 0);
  const calcFuelAllowance = () => getPeriodAdjustments().filter(a => a.type === 'fuel_allowance').reduce((s, a) => s + Number(a.amount), 0);
  const calcDeductions = () => getPeriodAdjustments().filter(a => a.type === 'advance').reduce((s, a) => s + Number(a.amount), 0);

  const downloadPayslip = () => {
    if (!employee) return;
    const hours = calcHours();
    const base = hours * employee.hourly_rate;
    const overtime = calcOvertime();
    const fuelAllowance = calcFuelAllowance();
    const deductions = calcDeductions();
    const total = base + overtime + fuelAllowance - deductions;
    const periodLabel = period === 'week' ? 'Semana' : period === 'biweekly' ? 'Quinzena' : 'Mês';

    const content = `
════════════════════════════════════════
     SD MÓVEIS PROJETADOS
     CONTRACHEQUE - ${periodLabel.toUpperCase()}
════════════════════════════════════════

Funcionário: ${employee.name}
Cargo:       ${employee.role || '-'}
Período:     ${periodLabel}
Data:        ${new Date().toLocaleDateString('pt-BR')}

────────────────────────────────────────
PROVENTOS
────────────────────────────────────────
Horas trabalhadas:   ${hours.toFixed(1)}h
Valor/hora:          R$ ${employee.hourly_rate.toFixed(2)}
Salário Base:        R$ ${base.toFixed(2)}
${overtime > 0 ? `Horas Extra:         +R$ ${overtime.toFixed(2)}\n` : ''}${fuelAllowance > 0 ? `Vale Combustível:    +R$ ${fuelAllowance.toFixed(2)}\n` : ''}
────────────────────────────────────────
DESCONTOS
────────────────────────────────────────
${deductions > 0 ? `Adiantamentos:       -R$ ${deductions.toFixed(2)}\n` : 'Nenhum desconto\n'}
════════════════════════════════════════
TOTAL LÍQUIDO:       R$ ${total.toFixed(2)}
════════════════════════════════════════
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contracheque-${employee.name.toLowerCase().replace(/\s+/g, '-')}-${periodLabel.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: '📄 Contracheque baixado!' });
  };

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
  const overtime = calcOvertime();
  const fuelAllowance = calcFuelAllowance();
  const deductions = calcDeductions();
  const total = hours * employee.hourly_rate + overtime + fuelAllowance - deductions;

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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-blue-50 rounded-xl p-5 text-center">
            <p className="text-xs text-blue-600 font-bold uppercase mb-1">Horas</p>
            <p className="text-2xl font-black text-blue-700">{hours.toFixed(1)}h</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-5 text-center">
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Valor/h</p>
            <p className="text-2xl font-black text-gray-700">R$ {employee.hourly_rate.toFixed(2)}</p>
          </div>
          {overtime > 0 && (
            <div className="bg-green-50 rounded-xl p-5 text-center">
              <p className="text-xs text-green-600 font-bold uppercase mb-1">H. Extra</p>
              <p className="text-2xl font-black text-green-700">+R$ {overtime.toFixed(2)}</p>
            </div>
          )}
          {fuelAllowance > 0 && (
            <div className="bg-orange-50 rounded-xl p-5 text-center">
              <p className="text-xs text-orange-600 font-bold uppercase mb-1">⛽ V. Combust.</p>
              <p className="text-2xl font-black text-orange-700">+R$ {fuelAllowance.toFixed(2)}</p>
            </div>
          )}
          {deductions > 0 && (
            <div className="bg-red-50 rounded-xl p-5 text-center">
              <p className="text-xs text-red-600 font-bold uppercase mb-1">Adiantamentos</p>
              <p className="text-2xl font-black text-red-700">-R$ {deductions.toFixed(2)}</p>
            </div>
          )}
          <div className="bg-green-50 rounded-xl p-5 text-center col-span-full md:col-span-1">
            <p className="text-xs text-green-600 font-bold uppercase mb-1">Total Líquido</p>
            <p className="text-2xl font-black text-green-700">R$ {total.toFixed(2)}</p>
          </div>
        </div>

        <button
          onClick={downloadPayslip}
          className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
        >
          <Download className="w-5 h-5" /> Baixar Contracheque
        </button>
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

      {/* Vale/Adiantamento */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-500" /> Solicitar Vale/Adiantamento
          </h3>
          <button
            onClick={() => setShowVale(!showVale)}
            className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors"
          >
            {showVale ? 'Cancelar' : 'Nova Solicitação'}
          </button>
        </div>

        {showVale && (
          <div className="bg-amber-50 rounded-xl p-4 space-y-3 border border-amber-200 mb-4">
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">Valor (R$)</label>
              <input
                type="number"
                value={valeAmount}
                onChange={e => setValeAmount(e.target.value)}
                placeholder="Ex: 200"
                className="w-full p-3 rounded-lg border border-amber-200 bg-white text-sm mt-1"
                min="1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">Motivo (opcional)</label>
              <input
                type="text"
                value={valeReason}
                onChange={e => setValeReason(e.target.value)}
                placeholder="Ex: Combustível para entrega"
                className="w-full p-3 rounded-lg border border-amber-200 bg-white text-sm mt-1"
              />
            </div>
            <button
              onClick={submitVale}
              disabled={valeSending || !valeAmount}
              className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {valeSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Enviar Solicitação
            </button>
          </div>
        )}

        <div className="space-y-2 max-h-48 overflow-auto">
          {valeRequests.map(req => (
            <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
              <div>
                <span className="font-bold text-gray-900">R$ {Number(req.amount).toFixed(2)}</span>
                {req.reason && <span className="text-gray-500 ml-2">— {req.reason}</span>}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                req.status === 'Aprovado' ? 'bg-green-100 text-green-700' :
                req.status === 'Recusado' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {req.status === 'Aprovado' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                {req.status === 'Recusado' && <XCircle className="w-3 h-3 inline mr-1" />}
                {req.status}
              </span>
            </div>
          ))}
          {valeRequests.length === 0 && (
            <p className="text-center text-gray-400 py-4 text-sm">Nenhuma solicitação ainda</p>
          )}
        </div>
      </div>
    </div>
  );
}
