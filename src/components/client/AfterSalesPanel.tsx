import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, Wrench, Camera, Send, ChevronRight, 
  Droplets, Sun, ThermometerSun, AlertTriangle, 
  CheckCircle, Upload, MessageCircle
} from 'lucide-react';

const CONSERVATION_TIPS = [
  {
    icon: <Droplets className="w-5 h-5 text-blue-500" />,
    title: 'Limpeza do MDF',
    desc: 'Use pano úmido com detergente neutro. Nunca use produtos abrasivos, álcool ou água em excesso. Seque imediatamente após a limpeza.',
  },
  {
    icon: <Sun className="w-5 h-5 text-amber-500" />,
    title: 'Exposição Solar',
    desc: 'Evite exposição direta e prolongada ao sol. Isso pode causar descoloração e ressecamento do material ao longo do tempo.',
  },
  {
    icon: <ThermometerSun className="w-5 h-5 text-red-500" />,
    title: 'Temperatura e Umidade',
    desc: 'Mantenha o ambiente ventilado. Umidade excessiva pode causar inchaço no MDF. Ideal: entre 40% e 60% de umidade relativa.',
  },
  {
    icon: <Wrench className="w-5 h-5 text-green-500" />,
    title: 'Regulagem de Dobradiças',
    desc: 'Se as portas ficarem desalinhadas, ajuste os parafusos das dobradiças (lateral, altura e profundidade) com chave Phillips.',
  },
  {
    icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
    title: 'Peso nas Prateleiras',
    desc: 'Respeite a capacidade de carga. Prateleiras longas (acima de 80cm) devem ter suporte central para evitar deformação.',
  },
];

interface ServiceRequest {
  subject: string;
  description: string;
  photos: string[];
}

const AfterSalesPanel: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'manual' | 'service'>('manual');
  const [serviceForm, setServiceForm] = useState<ServiceRequest>({
    subject: '',
    description: '',
    photos: [],
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitService = () => {
    if (!serviceForm.subject || !serviceForm.description) {
      toast({ title: "⚠️ Preencha todos os campos", variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ 
      title: "✅ Chamado Aberto!", 
      description: `Protocolo #${Date.now().toString().slice(-6)} - Responderemos em até 24h.` 
    });
  };

  return (
    <div className="p-8 space-y-6 overflow-auto h-full bg-gradient-to-br from-gray-50 to-gray-100">
      <header>
        <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-amber-500" />
          Pós-Venda SD
        </h1>
        <p className="text-gray-500 mt-1">Conservação, garantia e assistência técnica</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'manual'
              ? 'bg-amber-500 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-100 shadow'
          }`}
        >
          <BookOpen className="w-4 h-4 inline mr-2" />
          Manual de Conservação
        </button>
        <button
          onClick={() => setActiveTab('service')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'service'
              ? 'bg-amber-500 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-100 shadow'
          }`}
        >
          <Wrench className="w-4 h-4 inline mr-2" />
          Solicitar Assistência
        </button>
      </div>

      {activeTab === 'manual' && (
        <div className="space-y-4">
          {/* Warranty Card */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-black text-green-800">Garantia Ativa — 5 Anos</h3>
            </div>
            <p className="text-green-700 text-sm">
              Seus móveis possuem garantia contra defeitos de fabricação até <strong>Fevereiro 2029</strong>. 
              Em caso de problemas, abra um chamado na aba "Solicitar Assistência".
            </p>
          </div>

          {/* Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CONSERVATION_TIPS.map((tip, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  {tip.icon}
                  <h3 className="font-bold text-gray-900">{tip.title}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>

          {/* Video tip */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white">
            <h3 className="text-xl font-black mb-2 flex items-center gap-2">
              🎬 Dica em Vídeo
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Assista como regular as dobradiças dos seus móveis planejados em 3 passos simples.
            </p>
            <div className="bg-white/10 rounded-2xl aspect-video flex items-center justify-center">
              <p className="text-gray-400 text-sm">Vídeo em breve</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'service' && (
        <div className="space-y-4">
          {submitted ? (
            <div className="bg-white rounded-3xl p-12 shadow-xl text-center">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-black text-gray-900 mb-2">Chamado Registrado!</h2>
              <p className="text-gray-500 mb-6">
                Nossa equipe analisará sua solicitação e retornará em até 24 horas úteis.
              </p>
              <div className="bg-gray-50 rounded-2xl p-4 inline-block">
                <p className="text-sm text-gray-500">Protocolo</p>
                <p className="text-2xl font-black text-amber-600">#{Date.now().toString().slice(-6)}</p>
              </div>
              <button
                onClick={() => { setSubmitted(false); setServiceForm({ subject: '', description: '', photos: [] }); }}
                className="block mx-auto mt-6 text-amber-600 font-bold text-sm hover:underline"
              >
                Abrir novo chamado
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 shadow-xl space-y-6">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-amber-500" />
                Abrir Chamado de Assistência
              </h3>

              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Assunto</label>
                <select
                  value={serviceForm.subject}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full h-12 border border-gray-200 rounded-xl px-4 text-gray-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                >
                  <option value="">Selecione o tipo de problema</option>
                  <option value="porta_desalinhada">Porta desalinhada</option>
                  <option value="gaveta_travando">Gaveta travando</option>
                  <option value="defeito_acabamento">Defeito no acabamento</option>
                  <option value="ferragem_quebrada">Ferragem quebrada</option>
                  <option value="outro">Outro problema</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Descreva o problema</label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detalhe o que está acontecendo, em qual móvel, quando começou..."
                  className="w-full h-32 border border-gray-200 rounded-xl p-4 text-gray-900 resize-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Anexar Fotos (opcional)</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-amber-400 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Clique ou arraste fotos do problema</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG — máx 5MB</p>
                </div>
              </div>

              <button
                onClick={handleSubmitService}
                className="w-full bg-amber-600 text-white py-4 rounded-xl font-bold hover:bg-amber-500 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <Send className="w-5 h-5" />
                Enviar Chamado
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AfterSalesPanel;
