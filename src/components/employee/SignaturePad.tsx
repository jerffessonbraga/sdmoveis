import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PenTool, RotateCcw, Check } from 'lucide-react';

interface SignaturePadProps {
  tripId: string;
  onSigned?: () => void;
}

export default function SignaturePad({ tripId, onSigned }: SignaturePadProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [clientName, setClientName] = useState('');
  const [saving, setSaving] = useState(false);
  const [existingSignature, setExistingSignature] = useState<string | null>(null);

  useEffect(() => {
    const fetchExisting = async () => {
      const { data } = await supabase
        .from('delivery_signatures')
        .select('*')
        .eq('trip_id', tripId)
        .maybeSingle();
      if (data) setExistingSignature(data.signature_url);
    };
    fetchExisting();
  }, [tripId]);

  const getCtx = () => canvasRef.current?.getContext('2d');

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const ctx = getCtx();
    if (!ctx) return;
    setDrawing(true);
    setHasSignature(true);
    const rect = canvasRef.current!.getBoundingClientRect();
    const pos = 'touches' in e ? e.touches[0] : e;
    ctx.beginPath();
    ctx.moveTo(pos.clientX - rect.left, pos.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    const ctx = getCtx();
    if (!ctx) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const pos = 'touches' in e ? e.touches[0] : e;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineTo(pos.clientX - rect.left, pos.clientY - rect.top);
    ctx.stroke();
  };

  const stopDraw = () => setDrawing(false);

  const clearCanvas = () => {
    const ctx = getCtx();
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasSignature(false);
  };

  const saveSignature = async () => {
    if (!canvasRef.current || !clientName.trim()) {
      toast({ title: '⚠️ Informe o nome do cliente', variant: 'destructive' });
      return;
    }
    setSaving(true);

    canvasRef.current.toBlob(async (blob) => {
      if (!blob) { setSaving(false); return; }
      const path = `${tripId}/${Date.now()}.png`;
      const { error: upErr } = await supabase.storage.from('signatures').upload(path, blob, { contentType: 'image/png' });
      if (upErr) {
        toast({ title: '❌ Erro no upload', description: upErr.message, variant: 'destructive' });
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage.from('signatures').getPublicUrl(path);
      const { error } = await supabase.from('delivery_signatures').insert({
        trip_id: tripId,
        client_name: clientName.trim(),
        signature_url: urlData.publicUrl,
      });

      setSaving(false);
      if (error) {
        toast({ title: '❌ Erro', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: '✅ Assinatura salva!', description: 'Entrega registrada com sucesso.' });
        setExistingSignature(urlData.publicUrl);
        onSigned?.();
      }
    }, 'image/png');
  };

  if (existingSignature) {
    return (
      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
        <p className="font-bold text-green-800 text-sm mb-2 flex items-center gap-1">
          <Check className="w-4 h-4" /> Assinatura de Entrega Registrada
        </p>
        <img src={existingSignature} alt="Assinatura" className="w-full h-24 object-contain bg-white rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
      <p className="font-bold text-gray-800 text-sm flex items-center gap-1">
        <PenTool className="w-4 h-4 text-amber-500" /> Assinatura do Cliente
      </p>
      <input
        value={clientName}
        onChange={e => setClientName(e.target.value)}
        placeholder="Nome completo do cliente"
        className="w-full p-2 rounded-lg border border-gray-200 text-sm bg-white"
      />
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={320}
          height={120}
          className="w-full bg-white rounded-lg border-2 border-dashed border-gray-300 cursor-crosshair touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        {!hasSignature && (
          <p className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm pointer-events-none">
            Assine aqui ✍️
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={clearCanvas}
          className="flex-1 py-2 bg-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-300 flex items-center justify-center gap-1"
        >
          <RotateCcw className="w-4 h-4" /> Limpar
        </button>
        <button
          onClick={saveSignature}
          disabled={saving || !hasSignature}
          className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-1"
        >
          <Check className="w-4 h-4" /> {saving ? 'Salvando...' : 'Confirmar'}
        </button>
      </div>
    </div>
  );
}
