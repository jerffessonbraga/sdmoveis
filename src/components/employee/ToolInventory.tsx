import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Wrench, AlertTriangle, Plus, Send } from 'lucide-react';

interface ToolInventoryProps {
  employeeId: string;
}

export default function ToolInventory({ employeeId }: ToolInventoryProps) {
  const { toast } = useToast();
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportToolId, setReportToolId] = useState<string | null>(null);
  const [reportDesc, setReportDesc] = useState('');
  const [reportType, setReportType] = useState('Defeito');

  useEffect(() => {
    fetchTools();
  }, [employeeId]);

  const fetchTools = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('tool_inventory')
      .select('*')
      .eq('employee_id', employeeId)
      .order('tool_name');
    if (data) setTools(data);
    setLoading(false);
  };

  const submitReport = async () => {
    if (!reportToolId || !reportDesc.trim()) return;
    const { error } = await supabase.from('tool_reports').insert({
      tool_id: reportToolId,
      employee_id: employeeId,
      issue_type: reportType,
      description: reportDesc.trim(),
    });
    if (error) {
      toast({ title: '❌ Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅ Reporte enviado!', description: 'O administrador será notificado.' });
      // Update tool condition
      await supabase.from('tool_inventory').update({ condition: 'Com Defeito' }).eq('id', reportToolId);
      setReportToolId(null);
      setReportDesc('');
      fetchTools();
    }
  };

  const conditionColor = (cond: string) => {
    if (cond === 'Bom') return 'bg-green-100 text-green-700';
    if (cond === 'Regular') return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-900 flex items-center gap-2">
        <Wrench className="w-5 h-5 text-blue-500" /> Minhas Ferramentas
      </h3>

      {tools.length === 0 ? (
        <p className="text-center text-gray-400 py-6 text-sm">Nenhuma ferramenta atribuída ao seu nome.</p>
      ) : (
        <div className="space-y-2">
          {tools.map(tool => (
            <div key={tool.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">{tool.tool_name}</p>
                  {tool.serial_number && <p className="text-xs text-gray-400">S/N: {tool.serial_number}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${conditionColor(tool.condition)}`}>
                    {tool.condition}
                  </span>
                  <button
                    onClick={() => setReportToolId(reportToolId === tool.id ? null : tool.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Reportar problema"
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {reportToolId === tool.id && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <select
                    value={reportType}
                    onChange={e => setReportType(e.target.value)}
                    className="w-full p-2 rounded-lg border text-sm"
                  >
                    <option>Defeito</option>
                    <option>Desgaste</option>
                    <option>Perda</option>
                    <option>Troca necessária</option>
                  </select>
                  <textarea
                    value={reportDesc}
                    onChange={e => setReportDesc(e.target.value)}
                    placeholder="Descreva o problema..."
                    className="w-full p-2 rounded-lg border text-sm resize-none h-16"
                  />
                  <button
                    onClick={submitReport}
                    disabled={!reportDesc.trim()}
                    className="w-full bg-red-500 text-white py-2 rounded-lg font-bold text-sm hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <Send className="w-4 h-4" /> Reportar Problema
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
