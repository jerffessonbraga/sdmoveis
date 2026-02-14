import React, { useState, useEffect } from 'react';
import { ViewMode, Contract } from '@/types';
import { generateRealisticRender } from '@/services/geminiService';
import AfterSalesPanel from '@/components/client/AfterSalesPanel';
import TimeTrackingPanel from '@/components/timetracking/TimeTrackingPanel';
import EmployeePortal from '@/components/timetracking/EmployeePortal';
import DriverTripPanel from '@/components/fleet/DriverTripPanel';
import FleetAdminPanel from '@/components/fleet/FleetAdminPanel';
import { SelectionCard } from '@/components/ui/selection-card';
import { NavIcon } from '@/components/ui/nav-icon';
import { DashboardStat } from '@/components/ui/dashboard-stat';
import { WhatsAppCRMReal } from '@/components/crm/WhatsAppCRMReal';
import PromobEditor from '@/components/promob/PromobEditor';
import { useToast } from '@/hooks/use-toast';
import logoSD from '@/assets/logo-sd.jpeg';
import { WorshipPlayer } from '@/components/WorshipPlayer';
import { supabase } from '@/integrations/supabase/client';
import { 
  LogOut, 
  Download,
  Share2,
  X,
  Eye,
  Edit,
  Loader2,
  Heart,
  Star,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Camera,
  Play,
  ChevronRight,
  Settings,
  Bell,
  User,
  TrendingUp,
  BarChart3,
  PieChart,
  DollarSign,
  Users,
  Package,
  Truck,
  Wrench,
  Home,
  Building,
  ArrowRight,
  MessageCircle,
  Sparkles,
  Award,
  Gift,
  Zap,
  Shield,
  Target,
  Layers,
  RefreshCw,
  ExternalLink,
  BookOpen,
  ThumbsUp,
  Timer,
} from 'lucide-react';

const INITIAL_CONTRACTS: Contract[] = [
  { id: '1', clientName: 'Ricardo Almeida', document: '123.456.789-00', projectName: 'Cozinha Gourmet Lux', value: 45000, status: 'Produção', date: '10/02/2024', email: 'ricardo@email.com', phone: '(11) 98888-7777', paymentStatus: 'Parcial' },
  { id: '2', clientName: 'Juliana Silva', document: '987.654.321-11', projectName: 'Apartamento Integrado', value: 82000, status: 'Assinado', date: '15/02/2024', email: 'juliana@email.com', phone: '(11) 97777-6666', paymentStatus: 'Pago' },
  { id: '3', clientName: 'Marcos Oliveira', document: '444.555.666-22', projectName: 'Closet Master SD', value: 15200, status: 'Em Negociação', date: '20/02/2024', email: 'marcos@email.com', phone: '(11) 95555-4444', paymentStatus: 'Pendente' },
  { id: '4', clientName: 'Ana Paula Costa', document: '777.888.999-33', projectName: 'Home Office Premium', value: 28500, status: 'Produção', date: '25/02/2024', email: 'ana@email.com', phone: '(11) 94444-3333', paymentStatus: 'Pago' },
  { id: '5', clientName: 'Carlos Eduardo', document: '111.222.333-44', projectName: 'Dormitório Casal', value: 35000, status: 'Instalação', date: '01/03/2024', email: 'carlos@email.com', phone: '(11) 93333-2222', paymentStatus: 'Parcial' },
];

// Louvor principal - Kemily Santos
const LOUVORES = [
  { 
    title: "Deus de Obras Completas", 
    artist: "Kemily Santos", 
    audioUrl: "/audio/deus-de-obras-completas.mp3",
    verse: "Colossenses 3:23 - E tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor."
  },
];

const App: React.FC = () => {
  const { toast } = useToast();
  const [authState, setAuthState] = useState<'SELECT' | 'LOGIN' | 'ADMIN' | 'CLIENT' | 'EMPLOYEE'>('SELECT');
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'CLIENT' | 'EMPLOYEE'>('ADMIN');
  const [employeeName, setEmployeeName] = useState('');
  const [password, setPassword] = useState("");
  const [view, setView] = useState(ViewMode.DASHBOARD);
  const [contracts, setContracts] = useState(INITIAL_CONTRACTS);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiLoadingMessage, setAiLoadingMessage] = useState("");
  const [renderResult, setRenderResult] = useState<string | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [currentLouvor, setCurrentLouvor] = useState(LOUVORES[Math.floor(Math.random() * LOUVORES.length)]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [showClientContract, setShowClientContract] = useState(false);
  const [showClientFinanceiro, setShowClientFinanceiro] = useState(false);
  const [galleryFullscreen, setGalleryFullscreen] = useState<{title: string; url: string} | null>(null);
  const [galleryItems, setGalleryItems] = useState<{title: string; desc: string; url: string}[]>([]);
  const [projectApproved, setProjectApproved] = useState(false);

  // Fetch gallery images from database when client logs in
  useEffect(() => {
    if (authState === 'CLIENT') {
      const fetchGallery = async () => {
        // Try to find client by access code first
        const { data: clients } = await supabase
          .from('clients')
          .select('id')
          .eq('access_code', password.trim() || 'SD2024')
          .limit(1);
        
        const clientId = clients && clients.length > 0 ? clients[0].id : null;
        
        if (clientId) {
          const { data: projects } = await supabase
            .from('client_projects')
            .select('id')
            .eq('client_id', clientId)
            .limit(1);
          
          if (projects && projects.length > 0) {
            const { data: gallery } = await supabase
              .from('project_gallery')
              .select('*')
              .eq('project_id', projects[0].id)
              .order('created_at');
            
            if (gallery && gallery.length > 0) {
              setGalleryItems(gallery.map(g => ({
                title: g.title,
                desc: g.description || '',
                url: g.image_url
              })));
              return;
            }
          }
        }
        
        // Fallback: fetch all gallery images
        const { data: allGallery } = await supabase
          .from('project_gallery')
          .select('*')
          .order('created_at');
        
        if (allGallery && allGallery.length > 0) {
          setGalleryItems(allGallery.map(g => ({
            title: g.title,
            desc: g.description || '',
            url: g.image_url
          })));
        }
      };
      fetchGallery();
    }
  }, [authState, password]);

  // Função para tocar o louvor
  const playLouvor = () => {
    // Criar o elemento de áudio dentro do clique do usuário (gesture)
    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = 0.3;
    audio.src = currentLouvor.audioUrl;
    
    audio.play().then(() => {
      setIsPlaying(true);
      setAudioElement(audio);
      toast({ 
        title: "🎵 Tocando Louvor", 
        description: `${currentLouvor.title} - ${currentLouvor.artist}` 
      });
    }).catch((err) => {
      console.error("Erro ao tocar:", err);
      toast({ 
        title: "⚠️ Clique para tocar", 
        description: "Clique no botão ▶ para iniciar o louvor",
        variant: "destructive"
      });
    });

    audio.onended = () => {
      setIsPlaying(false);
      // Próxima música
      const nextIndex = (LOUVORES.findIndex(l => l.title === currentLouvor.title) + 1) % LOUVORES.length;
      setCurrentLouvor(LOUVORES[nextIndex]);
    };
  };

  const stopLouvor = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const nextLouvor = () => {
    stopLouvor();
    const nextIndex = (LOUVORES.findIndex(l => l.title === currentLouvor.title) + 1) % LOUVORES.length;
    setCurrentLouvor(LOUVORES[nextIndex]);
  };

  const handleLogin = () => {
    if (selectedRole === 'ADMIN') {
      setAuthState('ADMIN');
      setView(ViewMode.DASHBOARD);
      toast({ title: "✅ Bem-vindo!", description: "Acesso administrativo liberado" });
    } else if (selectedRole === 'EMPLOYEE') {
      if (!employeeName.trim()) {
        toast({ title: "⚠️ Informe seu nome", description: "Digite seu nome cadastrado pelo administrador", variant: "destructive" });
        return;
      }
      setAuthState('EMPLOYEE');
      setView(ViewMode.TIME_TRACKING);
      toast({ title: "✅ Bem-vindo!", description: `Área do funcionário - ${employeeName}` });
    } else {
      setAuthState('CLIENT');
      setView(ViewMode.CLIENT_PORTAL);
      toast({ title: "✅ Bem-vindo!", description: "Área do cliente" });
    }
  };

  const handleRender = async () => {
    setAiLoadingMessage("Gerando renderização fotorrealista com IA...");
    setIsAiLoading(true);
    
    const result = await generateRealisticRender({
      room: "Ambiente Projetado",
      finish: "Premium",
      modules: []
    });
    
    if (result) {
      setRenderResult(result);
      toast({
        title: "🎨 Renderização concluída!",
        description: "Sua imagem fotorrealista foi gerada com sucesso."
      });
    } else {
      toast({
        title: "❌ Erro na renderização",
        description: "Não foi possível gerar a imagem. Tente novamente.",
        variant: "destructive"
      });
    }
    setIsAiLoading(false);
  };

  const updateContractStatus = (id: string, status: Contract['status']) => {
    setContracts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    toast({ title: "✅ Status atualizado", description: `Contrato movido para ${status}` });
  };

  const totalRevenue = contracts.reduce((sum, c) => sum + c.value, 0);
  const paidContracts = contracts.filter(c => c.paymentStatus === 'Pago').length;
  const inProduction = contracts.filter(c => c.status === 'Produção').length;

  return (
    <div className="h-screen w-screen flex bg-gray-100 overflow-hidden">
      {/* SIDEBAR */}
      {(authState === 'ADMIN' || authState === 'CLIENT' || authState === 'EMPLOYEE') && (
        <aside className="w-24 bg-gradient-to-b from-gray-900 to-gray-950 flex flex-col items-center py-4 gap-2 shadow-xl min-h-0 overflow-y-auto">
          <button 
            onClick={() => setView(authState === 'ADMIN' ? ViewMode.DASHBOARD : authState === 'EMPLOYEE' ? ViewMode.TIME_TRACKING : ViewMode.CLIENT_PORTAL)}
            className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-500 shadow-lg hover:scale-105 transition-transform"
          >
            <img src={logoSD} alt="SD" className="w-full h-full object-cover" />
          </button>

          <nav className="flex-1 flex flex-col items-center gap-2 mt-6">
            {authState === 'ADMIN' ? (
              <>
                <NavIcon icon="layout-dashboard" label="Início" active={view === ViewMode.DASHBOARD} onClick={() => setView(ViewMode.DASHBOARD)} />
                <NavIcon icon="box" label="Promob SD" active={view === ViewMode.PROMOB} onClick={() => setView(ViewMode.PROMOB)} />
                <NavIcon icon="file-text" label="Vendas" active={view === ViewMode.CONTRACTS} onClick={() => setView(ViewMode.CONTRACTS)} />
                <NavIcon icon="clock" label="Ponto" active={view === ViewMode.TIME_TRACKING} onClick={() => setView(ViewMode.TIME_TRACKING)} />
                <NavIcon icon="navigation" label="Frota" active={view === ViewMode.FLEET} onClick={() => setView(ViewMode.FLEET)} />
                <NavIcon icon="message-square" label="CRM" active={view === ViewMode.CRM} onClick={() => setView(ViewMode.CRM)} isFab />
              </>
            ) : authState === 'EMPLOYEE' ? (
              <>
                <NavIcon icon="clock" label="Meu Ponto" active={view === ViewMode.TIME_TRACKING} onClick={() => setView(ViewMode.TIME_TRACKING)} />
                <NavIcon icon="navigation" label="Viagens" active={view === ViewMode.FLEET} onClick={() => setView(ViewMode.FLEET)} />
              </>
            ) : (
              <>
                <NavIcon icon="home" label="Painel" active={view === ViewMode.CLIENT_PORTAL} onClick={() => setView(ViewMode.CLIENT_PORTAL)} />
                <NavIcon icon="image" label="Galeria" active={view === ViewMode.PORTFOLIO} onClick={() => setView(ViewMode.PORTFOLIO)} />
                <NavIcon icon="message-square" label="Chat" active={view === ViewMode.CRM} onClick={() => setView(ViewMode.CRM)} />
                <NavIcon icon="book-open" label="Pós-Venda" active={view === ViewMode.AFTER_SALES} onClick={() => setView(ViewMode.AFTER_SALES)} />
              </>
            )}
          </nav>

          <div className="mt-auto space-y-2 flex flex-col items-center">
            <button className="p-3 text-gray-400 hover:text-amber-500 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-3 text-gray-400 hover:text-amber-500 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setAuthState('SELECT')} 
              className="p-3 text-gray-400 hover:text-amber-400 transition-colors flex flex-col items-center gap-1"
              title="Voltar à seleção"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
              <span className="text-[10px] font-bold">Voltar</span>
            </button>
            <button onClick={() => setAuthState('SELECT')} className="p-3 text-gray-400 hover:text-red-500 transition-colors flex flex-col items-center gap-1" title="Sair">
              <LogOut className="w-5 h-5" />
              <span className="text-[10px] font-bold">Sair</span>
            </button>
          </div>
        </aside>
      )}

      {/* WORSHIP PLAYER GLOBAL - Aparece em todas as áreas logadas */}
      {(authState === 'ADMIN' || authState === 'CLIENT' || authState === 'EMPLOYEE') && (
        <WorshipPlayer
          currentLouvor={currentLouvor}
          isPlaying={isPlaying}
          onPlay={playLouvor}
          onStop={stopLouvor}
          onNext={nextLouvor}
        />
      )}

      <main className="flex-1 overflow-hidden">
        {/* DASHBOARD ADMIN */}
        {view === ViewMode.DASHBOARD && authState === 'ADMIN' && (
          <div className="p-8 space-y-6 overflow-auto h-full bg-gradient-to-br from-gray-50 to-gray-100">
            <header className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-amber-500" />
                  Gestão SD Móveis
                </h1>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  Gratidão e Performance Comercial
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-3 shadow-sm">
                  <p className="text-xs font-bold text-green-600 uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Status IA
                  </p>
                  <p className="text-green-700 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Sistema 100% Online
                  </p>
                </div>
              </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              <DashboardStat 
                title="Projetos Ativos" 
                value={contracts.length.toString()} 
                icon="📁" 
                trend="+2 este mês"
                color="bg-blue-50"
              />
              <DashboardStat 
                title="Faturamento Total" 
                value={`R$ ${(totalRevenue / 1000).toFixed(0)}K`} 
                icon="💰" 
                trend="+15% vs mês anterior"
                color="bg-green-50" 
              />
              <DashboardStat 
                title="Em Produção" 
                value={inProduction.toString()} 
                icon="🏭" 
                trend="Meta: 10"
                color="bg-amber-50" 
              />
              <DashboardStat 
                title="Conversão" 
                value={`${Math.round((paidContracts / contracts.length) * 100)}%`} 
                icon="📈" 
                trend="Excelente!"
                color="bg-purple-50" 
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-3 gap-6">
              {/* Sabedoria do Dia */}
              <div className="col-span-2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-[32px] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-400 text-sm font-bold uppercase tracking-wider">Sabedoria do Dia</span>
                  </div>
                  <p className="text-gray-300 text-lg mb-8 italic leading-relaxed">
                    "Consagre ao Senhor tudo o que você faz, e os seus planos serão bem-sucedidos." 
                    <span className="block text-amber-400 text-sm mt-2 not-italic">(Provérbios 16:3)</span>
                  </p>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setView(ViewMode.PROMOB)} 
                      className="bg-amber-600 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-amber-500 transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
                    >
                      <Layers className="w-4 h-4" />
                      Novo Projeto 3D
                    </button>
                    <button 
                      onClick={() => setView(ViewMode.CONTRACTS)} 
                      className="bg-white/10 px-8 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-white/20 transition-all flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Ver Contratos
                    </button>
                  </div>
                </div>
              </div>

              {/* Contratos Recentes */}
              <div className="bg-white rounded-[32px] p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                    Últimos Contratos
                  </h3>
                  <button onClick={() => setView(ViewMode.CONTRACTS)} className="text-xs text-amber-600 font-bold hover:underline flex items-center gap-1">
                    Ver todos <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-3">
                  {contracts.slice(0, 3).map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => { setSelectedContract(c); setShowContractModal(true); }}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div>
                        <p className="font-bold text-gray-900">{c.clientName}</p>
                        <p className="text-xs text-gray-500">{c.projectName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-amber-600">R$ {c.value.toLocaleString()}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          c.status === 'Produção' ? 'bg-blue-100 text-blue-700' :
                          c.status === 'Assinado' ? 'bg-green-100 text-green-700' :
                          c.status === 'Instalação' ? 'bg-purple-100 text-purple-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-4">
              <button 
                onClick={() => setView(ViewMode.PROMOB)}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-left group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-bold text-gray-900">Editor 3D</h4>
                <p className="text-xs text-gray-500 mt-1">Criar projetos profissionais</p>
              </button>
              <button 
                onClick={() => setView(ViewMode.CRM)}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-left group"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-bold text-gray-900">CRM WhatsApp</h4>
                <p className="text-xs text-gray-500 mt-1">Atender clientes</p>
              </button>
              <button 
                onClick={() => setView(ViewMode.CONTRACTS)}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-left group"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-amber-600" />
                </div>
                <h4 className="font-bold text-gray-900">Contratos</h4>
                <p className="text-xs text-gray-500 mt-1">Gerenciar vendas</p>
              </button>
              <button 
                onClick={handleRender}
                className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-left group text-white"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold">Render IA</h4>
                <p className="text-xs text-white/80 mt-1">Imagens fotorrealistas</p>
              </button>
            </div>
          </div>
        )}

        {/* PROMOB 3D EDITOR */}
        {view === ViewMode.PROMOB && authState === 'ADMIN' && (
          <PromobEditor onRender={handleRender} isRendering={isAiLoading} />
        )}

        {/* CRM - WhatsApp Real */}
        {view === ViewMode.CRM && (
          <div className="h-full p-6 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
            <header className="mb-6">
              <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <MessageCircle className="w-8 h-8 text-green-500" />
                CRM WhatsApp
              </h1>
              <p className="text-gray-500 mt-1">Gerencie suas conversas e leads</p>
            </header>
            <WhatsAppCRMReal />
          </div>
        )}

        {/* CONTRACTS */}
        {view === ViewMode.CONTRACTS && authState === 'ADMIN' && (
          <div className="p-8 space-y-6 overflow-auto h-full bg-gradient-to-br from-gray-50 to-gray-100">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                  <FileText className="w-8 h-8 text-amber-500" />
                  Negócios SD
                </h1>
                <p className="text-gray-500 mt-1">Acompanhamento de Vendas e Produção</p>
              </div>
              <button className="bg-amber-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-amber-700 transition-colors flex items-center gap-2 shadow-lg">
                <FileText className="w-5 h-5" />
                + Novo Contrato
              </button>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <p className="text-xs text-gray-500 uppercase font-bold">Total em Contratos</p>
                <p className="text-2xl font-black text-gray-900 mt-1">R$ {totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <p className="text-xs text-gray-500 uppercase font-bold">Pagos</p>
                <p className="text-2xl font-black text-green-600 mt-1">{paidContracts} contratos</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <p className="text-xs text-gray-500 uppercase font-bold">Em Produção</p>
                <p className="text-2xl font-black text-blue-600 mt-1">{inProduction} projetos</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <p className="text-xs text-gray-500 uppercase font-bold">Taxa de Conversão</p>
                <p className="text-2xl font-black text-purple-600 mt-1">{Math.round((paidContracts / contracts.length) * 100)}%</p>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-6 text-xs font-black text-gray-500 uppercase">Cliente / Projeto</th>
                    <th className="text-left p-6 text-xs font-black text-gray-500 uppercase">Contato</th>
                    <th className="text-left p-6 text-xs font-black text-gray-500 uppercase">Valor Total</th>
                    <th className="text-left p-6 text-xs font-black text-gray-500 uppercase">Status</th>
                    <th className="text-left p-6 text-xs font-black text-gray-500 uppercase">Pagamento</th>
                    <th className="text-left p-6 text-xs font-black text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map(contract => (
                    <tr key={contract.id} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="p-6">
                        <p className="font-bold text-gray-900">{contract.clientName}</p>
                        <p className="text-sm text-gray-500">{contract.projectName}</p>
                        <p className="text-xs text-gray-400 mt-1">{contract.date}</p>
                      </td>
                      <td className="p-6">
                        <p className="text-sm text-gray-600 flex items-center gap-1"><Phone className="w-3 h-3" /> {contract.phone}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1"><Mail className="w-3 h-3" /> {contract.email}</p>
                      </td>
                      <td className="p-6 font-bold text-gray-900 text-lg">R$ {contract.value.toLocaleString('pt-BR')}</td>
                      <td className="p-6">
                        <select
                          value={contract.status}
                          onChange={(e) => updateContractStatus(contract.id, e.target.value as Contract['status'])}
                          className={`px-4 py-2 rounded-full text-xs font-bold border-0 cursor-pointer ${
                            contract.status === 'Produção' ? 'bg-blue-100 text-blue-700' :
                            contract.status === 'Assinado' ? 'bg-green-100 text-green-700' :
                            contract.status === 'Instalação' ? 'bg-purple-100 text-purple-700' :
                            contract.status === 'Concluído' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-amber-100 text-amber-700'
                          }`}
                        >
                          <option value="Em Negociação">Em Negociação</option>
                          <option value="Assinado">Assinado</option>
                          <option value="Produção">Produção</option>
                          <option value="Instalação">Instalação</option>
                          <option value="Concluído">Concluído</option>
                        </select>
                      </td>
                      <td className="p-6">
                        <span className={`font-bold ${
                          contract.paymentStatus === 'Pago' ? 'text-green-600' :
                          contract.paymentStatus === 'Parcial' ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          {contract.paymentStatus}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => { setSelectedContract(contract); setShowContractModal(true); }}
                            className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors">
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CLIENT PORTAL */}
        {view === ViewMode.CLIENT_PORTAL && (
          <div className="p-8 space-y-6 overflow-auto h-full bg-gradient-to-br from-gray-50 to-gray-100">
            <header className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                  <Home className="w-8 h-8 text-amber-500" />
                  Minha Casa SD
                </h1>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  Acompanhando cada detalhe do seu sonho
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-3 shadow-sm">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Previsão de Instalação
                </p>
                <p className="text-amber-700 font-bold text-lg">15 Março, 2024</p>
                <div className="flex items-center gap-2 mt-2 bg-amber-100 rounded-xl px-3 py-1.5">
                  <Timer className="w-4 h-4 text-amber-600" />
                  <p className="text-amber-700 font-black text-sm">
                    Faltam {Math.max(0, Math.ceil((new Date('2024-03-15').getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} dias para seu sonho! ✨
                  </p>
                </div>
              </div>
            </header>

            {/* Status Cards */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-8 shadow-xl">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl mb-4">🏭</div>
                <p className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Status: Produção
                </p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Corte e Borda</span>
                      <span className="font-bold text-green-600">Concluído ✓</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full w-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 flex items-center gap-1"><Wrench className="w-4 h-4 text-blue-500" /> Montagem em Fábrica</span>
                      <span className="font-bold text-blue-600">85% Pronto</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full w-[85%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 flex items-center gap-1"><Truck className="w-4 h-4 text-gray-400" /> Expedição</span>
                      <span className="font-bold text-gray-400">Aguardando</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gray-300 h-3 rounded-full w-0" />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setView(ViewMode.PORTFOLIO)}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white text-left hover:scale-[1.02] transition-transform shadow-xl group"
              >
                <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-2xl font-black flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                  Galeria de Renders 4K
                </h3>
                <p className="text-gray-400 mt-2 text-sm">Veja como ficará seu ambiente projetado com nossa tecnologia de fotorrealismo.</p>
                <span className="inline-flex items-center gap-1 mt-4 text-amber-500 font-bold text-sm group-hover:gap-2 transition-all">
                  Abrir Portfolio <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-3 gap-6">
              <button onClick={() => setShowClientFinanceiro(true)} className="bg-white rounded-3xl p-6 shadow-xl text-center hover:shadow-2xl transition-shadow cursor-pointer w-full">
                <span className="text-4xl mb-4 block">💳</span>
                <p className="text-xs text-gray-400 uppercase font-bold mb-2">Financeiro</p>
                <p className="text-xl font-black text-gray-900">3/5 Parcelas</p>
                <p className="text-sm text-green-600 font-bold mt-1">Em dia ✓</p>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">Próxima parcela</p>
                  <p className="text-sm font-bold text-amber-600">01/05 — R$ 9.000</p>
                </div>
              </button>
              <div className="bg-white rounded-3xl p-6 shadow-xl text-center hover:shadow-2xl transition-shadow">
                <span className="text-4xl mb-4 block">💬</span>
                <p className="text-xs text-gray-400 uppercase font-bold mb-2">Suporte</p>
                <button onClick={() => setView(ViewMode.CRM)} className="text-xl font-bold text-gray-900 hover:text-amber-600 transition-colors">
                  Falar com Projetista
                </button>
                <p className="text-sm text-gray-500 mt-1">Resposta em 2h</p>
              </div>
              <button onClick={() => setShowClientContract(true)} className="bg-white rounded-3xl p-6 shadow-xl text-center hover:shadow-2xl transition-shadow cursor-pointer w-full">
                <span className="text-4xl mb-4 block">📝</span>
                <p className="text-xs text-gray-400 uppercase font-bold mb-2">Contrato</p>
                <p className="text-xl font-black text-gray-900">Assinado</p>
                <p className="text-sm text-green-600 font-bold mt-1 flex items-center justify-center gap-1">
                  <Shield className="w-4 h-4" /> Ver Detalhes
                </p>
              </button>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Linha do Tempo do Projeto
              </h3>
              <div className="flex items-center justify-between relative">
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 z-0">
                  <div className="h-1 bg-green-500 w-[60%]" />
                </div>
                {[
                  { label: 'Assinatura', date: '01/02', done: true, icon: '✍️' },
                  { label: 'Projeto 3D', date: '05/02', done: true, icon: '🖥️' },
                  { label: 'Produção', date: '10/02', done: true, icon: '🏭' },
                  { label: 'Expedição', date: '10/03', done: false, icon: '📦' },
                  { label: 'Instalação', date: '15/03', done: false, icon: '🔧' },
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl mb-2 ${
                      step.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step.done ? '✓' : step.icon}
                    </div>
                    <p className={`text-xs font-bold ${step.done ? 'text-green-600' : 'text-gray-500'}`}>{step.label}</p>
                    <p className="text-xs text-gray-400">{step.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PORTFOLIO */}
        {view === ViewMode.PORTFOLIO && (
          <div className="p-8 space-y-6 overflow-auto h-full bg-gradient-to-br from-gray-50 to-gray-100">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                  <Camera className="w-8 h-8 text-amber-500" />
                  Minha Galeria SD
                </h1>
                <p className="text-gray-500 mt-1">Arquivos em Ultra-Alta Definição</p>
              </div>
              <button 
                onClick={() => setView(ViewMode.CLIENT_PORTAL)} 
                className="text-amber-600 font-black uppercase text-xs tracking-widest border-2 border-amber-200 px-8 py-4 rounded-full hover:bg-amber-50 transition-all flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Voltar ao Painel
              </button>
            </header>

            <div className="grid grid-cols-2 gap-8">
              {galleryItems.map((item, i) => (
                <div key={i} className="bg-white rounded-3xl shadow-xl overflow-hidden group">
                  <div className="aspect-video overflow-hidden relative">
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button 
                        onClick={() => setGalleryFullscreen({ title: item.title, url: item.url })}
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-900 hover:scale-110 transition-transform"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = item.url;
                          a.download = `${item.title.replace(/\s/g, '-')}.jpg`;
                          a.target = '_blank';
                          a.click();
                          toast({ title: "📥 Download iniciado", description: item.title });
                        }}
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-900 hover:scale-110 transition-transform"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="font-black text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                    <div className="flex gap-3 mt-4">
                      <button 
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = item.url;
                          a.download = `${item.title.replace(/\s/g, '-')}-4K.jpg`;
                          a.target = '_blank';
                          a.click();
                          toast({ title: "📥 Download 4K iniciado", description: item.title });
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download 4K
                      </button>
                      <button 
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({ title: item.title, text: `Veja o render: ${item.title}`, url: item.url });
                          } else {
                            navigator.clipboard.writeText(item.url);
                            toast({ title: "🔗 Link copiado!", description: "Cole onde quiser compartilhar" });
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        Compartilhar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Approve Project Button */}
            {!projectApproved ? (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-8 shadow-lg text-center">
                <ThumbsUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-black text-gray-900 mb-2">Aprovar Projeto</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                  Revise todos os renders e, se estiver satisfeito, aprove o projeto para iniciarmos a produção.
                </p>
                <button
                  onClick={() => {
                    setProjectApproved(true);
                    toast({ title: "✅ Projeto Aprovado!", description: "Obrigado! A produção será iniciada em breve." });
                  }}
                  className="bg-green-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-green-500 transition-colors shadow-lg inline-flex items-center gap-2"
                >
                  <ThumbsUp className="w-5 h-5" />
                  Aprovar Projeto
                </button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-3xl p-6 text-center">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="font-black text-green-700">Projeto Aprovado ✓</p>
                <p className="text-sm text-green-600 mt-1">Sua produção está em andamento!</p>
              </div>
            )}
          </div>
        )}

        {/* AFTER SALES */}
        {view === ViewMode.AFTER_SALES && authState === 'CLIENT' && (
          <AfterSalesPanel />
        )}
      </main>

      {/* LOGIN SCREENS */}
      {authState === 'SELECT' && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-black flex flex-col items-center justify-center overflow-hidden">
          {/* Efeitos de fundo - Dark Premium */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-amber-500/8 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[100px]" />
            <div className="absolute top-1/3 right-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl" />
          </div>
          
          {/* Linhas decorativas douradas */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            <div className="absolute bottom-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/15 to-transparent" />
            <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-500/10 to-transparent" />
            <div className="absolute right-1/4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-500/10 to-transparent" />
          </div>

          {/* Versículo no topo */}
          <div className="absolute top-8 text-center px-4 z-10">
            <div className="inline-flex items-center gap-3 bg-black/50 backdrop-blur-xl px-6 py-3 rounded-2xl border border-amber-500/20 shadow-xl">
              <Star className="w-4 h-4 text-amber-400" />
              <p className="text-gray-300 text-sm italic font-light">
                "Tudo o que fizerem, façam de todo o coração, como para o Senhor"
              </p>
              <span className="text-amber-400 text-xs font-medium">— Colossenses 3:23</span>
            </div>
          </div>

          {/* Conteúdo Central */}
          <div className="relative z-10 flex flex-col items-center mt-16">

            {/* Título */}
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
              SD Móveis <span className="text-amber-400">Projetados</span>
            </h1>
            <p className="text-gray-400 text-sm mb-12">Selecione seu tipo de acesso</p>

            {/* Cards de seleção */}
            <div className="flex gap-8 relative">
              {/* Card Administrador - Preto com borda dourada */}
              <button 
                onClick={() => { setSelectedRole('ADMIN'); setAuthState('LOGIN'); }}
                className="group relative w-72 h-72 rounded-[32px] p-6 flex flex-col items-center justify-center transition-all duration-500 hover:scale-105 hover:-translate-y-3 overflow-hidden"
              >
                {/* Fundo preto elegante */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black rounded-[32px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-[32px]" />
                
                {/* Brilho dourado no hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-transparent group-hover:from-amber-400/15 rounded-[32px] transition-all duration-500" />
                
                {/* Borda dourada */}
                <div className="absolute inset-0 rounded-[32px] border-2 border-amber-500/40 group-hover:border-amber-400 transition-colors shadow-2xl shadow-amber-500/10" />
                
                {/* Efeito de luz dourado */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl group-hover:bg-amber-300/40 transition-all" />
                
                {/* Conteúdo */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-2xl border-2 border-amber-400/60 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform bg-amber-500/10 backdrop-blur-sm shadow-xl overflow-hidden">
                    <img src={logoSD} alt="SD" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-amber-400" />
                    <h3 className="text-white text-xl font-black tracking-wide uppercase">Administrador</h3>
                  </div>
                  <p className="text-gray-400 text-sm">Acesso completo ao sistema</p>
                  <div className="mt-4 flex items-center gap-2 text-amber-400/70 text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Dashboard • Projetos • CRM</span>
                  </div>
                </div>
              </button>

              {/* Card Cliente - Dourado/Branco Elegante */}
              <button 
                onClick={() => { setSelectedRole('CLIENT'); setAuthState('LOGIN'); }}
                className="group relative w-72 h-72 rounded-[32px] p-6 flex flex-col items-center justify-center transition-all duration-500 hover:scale-105 hover:-translate-y-3 overflow-hidden"
              >
                {/* Fundo com gradiente dourado sutil */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 rounded-[32px]" />
                
                {/* Overlay dourado sutil */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-600/5 rounded-[32px]" />
                
                {/* Brilho dourado no hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/0 to-transparent group-hover:from-amber-400/10 rounded-[32px] transition-all duration-500" />
                
                {/* Borda branca/dourada elegante */}
                <div className="absolute inset-0 rounded-[32px] border-2 border-white/20 group-hover:border-amber-400/60 transition-colors shadow-2xl" />
                
                {/* Efeito de luz */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-amber-400/20 transition-all" />
                
                {/* Conteúdo */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-2xl border-2 border-white/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform bg-white/10 backdrop-blur-sm shadow-xl overflow-hidden group-hover:border-amber-400/60">
                    <img src={logoSD} alt="SD" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-white/80 group-hover:text-amber-400 transition-colors" />
                    <h3 className="text-white text-xl font-black tracking-wide uppercase">Cliente</h3>
                  </div>
                  <p className="text-gray-400 text-sm">Acompanhe seu projeto</p>
                  <div className="mt-4 flex items-center gap-2 text-white/50 text-xs group-hover:text-amber-400/70 transition-colors">
                    <Home className="w-3.5 h-3.5" />
                    <span>Galeria • Status • Chat</span>
                  </div>
                </div>
              </button>

              {/* Card Funcionário */}
              <button 
                onClick={() => { setSelectedRole('EMPLOYEE'); setAuthState('LOGIN'); }}
                className="group relative w-72 h-72 rounded-[32px] p-6 flex flex-col items-center justify-center transition-all duration-500 hover:scale-105 hover:-translate-y-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 rounded-[32px]" />
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-600/5 rounded-[32px]" />
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/0 to-transparent group-hover:from-green-400/10 rounded-[32px] transition-all duration-500" />
                <div className="absolute inset-0 rounded-[32px] border-2 border-green-500/30 group-hover:border-green-400/60 transition-colors shadow-2xl" />
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-400/20 transition-all" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-2xl border-2 border-green-500/40 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform bg-green-500/10 backdrop-blur-sm shadow-xl overflow-hidden group-hover:border-green-400/60">
                    <img src={logoSD} alt="SD" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-green-400/80 group-hover:text-green-400 transition-colors" />
                    <h3 className="text-white text-xl font-black tracking-wide uppercase">Funcionário</h3>
                  </div>
                  <p className="text-gray-400 text-sm">Registre seu ponto</p>
                  <div className="mt-4 flex items-center gap-2 text-green-400/50 text-xs group-hover:text-green-400/70 transition-colors">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Ponto • Horas • Pagamento</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Player de Louvor na tela de seleção */}
          <WorshipPlayer
            currentLouvor={currentLouvor}
            isPlaying={isPlaying}
            onPlay={playLouvor}
            onStop={stopLouvor}
            onNext={nextLouvor}
          />

          {/* Footer - Canto inferior esquerdo */}
          <div className="absolute bottom-8 left-8 z-10">
            <div className="flex items-center gap-3 bg-black/50 backdrop-blur-xl px-4 py-2.5 rounded-xl border border-white/10">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-amber-500/50 shadow">
                <img src={logoSD} alt="SD" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">SD Móveis Projetados</p>
                <p className="text-gray-500 text-xs">Sistema PRO AI v2.0</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {authState === 'LOGIN' && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center overflow-hidden">
          {/* Efeitos de fundo premium escuro */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/8 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 right-0 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl" />
          </div>

          {/* Linhas decorativas douradas */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            <div className="absolute bottom-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/15 to-transparent" />
          </div>

          {/* Card de Login - Design Premium Dark */}
          <div className="relative z-10 w-[420px]">
            {/* Glow atrás do card */}
            <div className="absolute -inset-4 bg-gradient-to-b from-amber-500/20 via-amber-600/10 to-transparent rounded-[50px] blur-xl" />
            
            <div className="relative bg-gradient-to-b from-gray-900/95 to-gray-950/98 backdrop-blur-xl rounded-[36px] p-10 text-center border border-amber-500/20 shadow-2xl">
              {/* Linha dourada no topo */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full" />
              
              {/* Badge do tipo de acesso */}
              <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8 ${
                selectedRole === 'ADMIN' 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                  : selectedRole === 'EMPLOYEE'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-white/10 text-white border border-white/20'
              }`}>
                {selectedRole === 'ADMIN' ? <Shield className="w-3.5 h-3.5" /> : selectedRole === 'EMPLOYEE' ? <Clock className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                {selectedRole === 'ADMIN' ? 'Administrador' : selectedRole === 'EMPLOYEE' ? 'Funcionário' : 'Cliente'}
              </div>

              {/* Logo estável - sem tremor */}
              <div className="relative mx-auto mb-6 w-24 h-24">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-400/30 to-amber-600/20 rounded-2xl blur-xl" />
                <div className={`relative w-24 h-24 rounded-2xl overflow-hidden ring-2 ${
                  selectedRole === 'ADMIN' ? 'ring-amber-500' : selectedRole === 'EMPLOYEE' ? 'ring-green-500' : 'ring-white/50'
                } shadow-xl`} style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}>
                  <img 
                    src={logoSD} 
                    alt="SD Móveis" 
                    className="w-full h-full object-cover" 
                    style={{ imageRendering: 'auto', transform: 'translateZ(0)' }}
                  />
                </div>
              </div>
              
              <h2 className="text-2xl font-black text-white mb-2">
                SD Móveis <span className="text-amber-400">Projetados</span>
              </h2>
              <p className="text-gray-400 text-sm mb-8">
                {selectedRole === 'EMPLOYEE' ? 'Digite seu nome cadastrado' : 'Digite sua senha para continuar'}
              </p>
              
              <div className="space-y-4">
                {selectedRole === 'EMPLOYEE' && (
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Seu nome completo" 
                      className="w-full h-14 bg-white/5 hover:bg-white/8 rounded-xl px-6 border border-white/10 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 text-center text-lg text-white placeholder:text-gray-600 transition-all outline-none"
                      value={employeeName} 
                      onChange={(e) => setEmployeeName(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    />
                  </div>
                )}
                <div className="relative">
                  <input
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full h-14 bg-white/5 hover:bg-white/8 rounded-xl px-6 border border-white/10 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 text-center text-lg tracking-[0.3em] text-white placeholder:text-gray-600 transition-all outline-none"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
                
                <button 
                  onClick={handleLogin}
                  className={`w-full h-14 rounded-xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl ${
                    selectedRole === 'ADMIN'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black'
                      : 'bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-gray-900'
                  }`}
                >
                  <ArrowRight className="w-5 h-5" />
                  Entrar no Sistema
                </button>
              </div>
              
              <button 
                onClick={() => setAuthState('SELECT')} 
                className="mt-8 text-gray-500 text-sm font-medium hover:text-amber-400 transition-colors flex items-center justify-center gap-2 mx-auto group"
              >
                <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                Voltar à seleção
              </button>
              
              {/* Versículo */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-gray-500 text-xs italic">
                  "Tudo o que fizerem, façam de todo coração"
                </p>
                <p className="text-amber-500/60 text-[10px] mt-1">Colossenses 3:23</p>
              </div>
            </div>
          </div>

          {/* Player de Louvor na tela de Login */}
          <WorshipPlayer
            currentLouvor={currentLouvor}
            isPlaying={isPlaying}
            onPlay={playLouvor}
            onStop={stopLouvor}
            onNext={nextLouvor}
          />

          {/* Footer */}
          <div className="absolute bottom-6 left-6">
            <p className="text-gray-600 text-xs">SD Móveis © 2024</p>
          </div>
        </div>
      )}

      {/* MODALS */}
      {renderResult && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-10">
          <button onClick={() => setRenderResult(null)} className="absolute top-6 right-6 text-white hover:text-amber-500 transition-colors">
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-5xl w-full">
            <img src={renderResult} alt="Render 4K" className="w-full rounded-3xl shadow-2xl" />
            <div className="flex gap-4 justify-center mt-6">
              <button className="bg-amber-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-700 transition-colors flex items-center gap-2">
                <Download className="w-5 h-5" />
                Download 4K
              </button>
              <button className="bg-white/10 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Compartilhar
              </button>
            </div>
          </div>
        </div>
      )}

      {showContractModal && selectedContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-10">
          <div className="bg-white rounded-3xl w-[600px] max-h-[80vh] overflow-auto shadow-2xl">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 rounded-t-3xl flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">{selectedContract.projectName}</h3>
                <p className="text-gray-400 text-sm">{selectedContract.clientName}</p>
              </div>
              <button onClick={() => setShowContractModal(false)} className="text-white/60 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold">Valor Total</p>
                  <p className="text-2xl font-black text-amber-600">R$ {selectedContract.value.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold">Status</p>
                  <p className="text-xl font-bold text-gray-900">{selectedContract.status}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Contato</p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> {selectedContract.phone}</p>
                <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> {selectedContract.email}</p>
                <p className="flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" /> {selectedContract.document}</p>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </button>
                <button className="flex-1 bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2">
                  <Edit className="w-5 h-5" />
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CLIENT CONTRACT MODAL */}
      {showClientContract && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl w-[550px] max-h-[85vh] overflow-auto shadow-2xl">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 rounded-t-3xl flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2"><FileText className="w-5 h-5 text-amber-400" /> Meu Contrato</h3>
                <p className="text-gray-400 text-sm">Cozinha Gourmet Lux</p>
              </div>
              <button onClick={() => setShowClientContract(false)} className="text-white/60 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold">Valor Total</p>
                  <p className="text-2xl font-black text-amber-600">R$ 45.000</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold">Status</p>
                  <p className="text-xl font-bold text-blue-600">Em Produção</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                <p className="text-xs text-gray-500 uppercase font-bold">Detalhes do Contrato</p>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Data de Assinatura:</span><span className="font-bold">01/02/2024</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Previsão de Entrega:</span><span className="font-bold">15/03/2024</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Tipo de Projeto:</span><span className="font-bold">Cozinha Planejada</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Material:</span><span className="font-bold">MDF Premium + Granito</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Garantia:</span><span className="font-bold">5 Anos</span></div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <p className="text-xs text-green-600 uppercase font-bold mb-1">✅ Contrato Assinado Digitalmente</p>
                <p className="text-sm text-green-700">Assinado em 01/02/2024 às 14:32</p>
              </div>
              <button 
                onClick={() => {
                  toast({ title: "📄 PDF Gerado", description: "Seu contrato está sendo baixado" });
                }}
                className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Baixar Contrato PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLIENT FINANCEIRO MODAL */}
      {showClientFinanceiro && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl w-[550px] max-h-[85vh] overflow-auto shadow-2xl">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 rounded-t-3xl flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-400" /> Financeiro</h3>
                <p className="text-gray-400 text-sm">Acompanhamento de pagamentos</p>
              </div>
              <button onClick={() => setShowClientFinanceiro(false)} className="text-white/60 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <p className="text-xs text-green-600 uppercase font-bold">Pago</p>
                  <p className="text-2xl font-black text-green-600">R$ 27.000</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                  <p className="text-xs text-amber-600 uppercase font-bold">Restante</p>
                  <p className="text-2xl font-black text-amber-600">R$ 18.000</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-bold mb-3">Parcelas</p>
                {[
                  { num: 1, valor: 9000, data: '01/02/2024', status: 'Pago' },
                  { num: 2, valor: 9000, data: '01/03/2024', status: 'Pago' },
                  { num: 3, valor: 9000, data: '01/04/2024', status: 'Pago' },
                  { num: 4, valor: 9000, data: '01/05/2024', status: 'Pendente' },
                  { num: 5, valor: 9000, data: '01/06/2024', status: 'Pendente' },
                ].map(p => (
                  <div key={p.num} className="flex justify-between items-center py-3 border-b last:border-0">
                    <div>
                      <p className="font-bold text-gray-900">Parcela {p.num}/5</p>
                      <p className="text-xs text-gray-500">{p.data}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">R$ {p.valor.toLocaleString()}</p>
                      <span className={`text-xs font-bold ${p.status === 'Pago' ? 'text-green-600' : 'text-amber-600'}`}>
                        {p.status === 'Pago' ? '✅ Pago' : '⏳ Pendente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Próximo vencimento: <span className="font-bold">01/05/2024</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GALLERY FULLSCREEN */}
      {galleryFullscreen && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-6">
          <button onClick={() => setGalleryFullscreen(null)} className="absolute top-6 right-6 text-white hover:text-amber-500 transition-colors">
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-5xl w-full text-center">
            <img src={galleryFullscreen.url} alt={galleryFullscreen.title} className="w-full rounded-3xl shadow-2xl" />
            <p className="text-white text-xl font-black mt-6">{galleryFullscreen.title}</p>
            <div className="flex gap-4 justify-center mt-4">
              <button 
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = galleryFullscreen.url;
                  a.download = `${galleryFullscreen.title.replace(/\s/g, '-')}-4K.jpg`;
                  a.target = '_blank';
                  a.click();
                  toast({ title: "📥 Download iniciado" });
                }}
                className="bg-amber-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download 4K
              </button>
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: galleryFullscreen.title, url: galleryFullscreen.url });
                  } else {
                    navigator.clipboard.writeText(galleryFullscreen.url);
                    toast({ title: "🔗 Link copiado!" });
                  }
                }}
                className="bg-white/10 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Compartilhar
              </button>
            </div>
          </div>
        </div>
      )}

      {isAiLoading && (
        <div className="fixed inset-0 bg-gray-900/95 flex flex-col items-center justify-center z-50">
          <div className="relative">
            <Loader2 className="w-20 h-20 text-amber-500 animate-spin" />
            <Sparkles className="w-8 h-8 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-white text-2xl font-bold mt-8">{aiLoadingMessage}</p>
          <p className="text-gray-500 text-sm mt-2">SD PRO IA SYSTEM</p>
          <div className="mt-8 flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      )}

        {/* TIME TRACKING */}
        {view === ViewMode.TIME_TRACKING && authState === 'ADMIN' && (
          <TimeTrackingPanel />
        )}

        {/* EMPLOYEE PORTAL */}
        {view === ViewMode.TIME_TRACKING && authState === 'EMPLOYEE' && (
          <EmployeePortal employeeName={employeeName} />
        )}

        {/* FLEET - ADMIN */}
        {view === ViewMode.FLEET && authState === 'ADMIN' && (
          <FleetAdminPanel />
        )}

        {/* FLEET - EMPLOYEE */}
        {view === ViewMode.FLEET && authState === 'EMPLOYEE' && (
          <div className="p-8 space-y-6 overflow-auto h-full bg-gradient-to-br from-gray-50 to-gray-100">
            <DriverTripPanel employeeId="" employeeName={employeeName} />
          </div>
        )}
    </div>
  );
};

export default App;
