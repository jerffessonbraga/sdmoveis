import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ToolMode, FurnitureModule, ModuleTemplate, ViewportMode } from '@/types';
import ThreePreview from '@/components/ThreePreview';
import { useToast } from '@/hooks/use-toast';
import { generateAiChatResponse } from '@/services/geminiService';
import { 
  ChevronDown,
  ChevronLeft, 
  ChevronRight, 
  ChevronUp,
  RotateCcw, 
  Trash2, 
  Sparkles,
  MousePointer,
  Move,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  Save,
  Undo,
  Redo,
  Copy,
  Layers,
  Settings,
  Box,
  FileText,
  Printer,
  FolderOpen,
  Magnet,
  Ruler,
  RotateCw,
  FlipHorizontal,
  Image,
  X,
  Maximize2,
  Minus,
  Square,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Scissors,
  ClipboardPaste,
  Calculator,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  MoveVertical,
  FileImage,
  FilePlus,
  PanelLeftOpen,
  PanelRightOpen,
  MessageSquare,
  Send,
  Bot,
  Lightbulb,
  Loader2,
} from 'lucide-react';

// Biblioteca expandida de móveis
const MODULE_LIBRARY: ModuleTemplate[] = [
  // COZINHA - Balcões Base
  { id: 'k_base_1p', type: 'Balcão Base 1P', category: 'Cozinha', price: 850, icon: '🗄️', w: 400, h: 720, d: 580, z: 0 },
  { id: 'k_base_2p', type: 'Balcão Base 2P', category: 'Cozinha', price: 1250, icon: '📦', w: 800, h: 720, d: 580, z: 0 },
  { id: 'k_base_3p', type: 'Balcão Base 3P', category: 'Cozinha', price: 1650, icon: '📦', w: 1200, h: 720, d: 580, z: 0 },
  { id: 'k_base_gav', type: 'Balcão 4 Gavetas', category: 'Cozinha', price: 1450, icon: '📋', w: 400, h: 720, d: 580, z: 0 },
  { id: 'k_base_pia', type: 'Balcão Pia 2P', category: 'Cozinha', price: 1300, icon: '🚰', w: 1200, h: 720, d: 580, z: 0 },
  { id: 'k_base_pia_3p', type: 'Balcão Pia 3P', category: 'Cozinha', price: 1600, icon: '🚰', w: 1600, h: 720, d: 580, z: 0 },
  { id: 'k_base_canto', type: 'Balcão Canto L', category: 'Cozinha', price: 1100, icon: '📐', w: 580, h: 720, d: 580, z: 0 },
  { id: 'k_base_canto_curvo', type: 'Balcão Canto Curvo', category: 'Cozinha', price: 1400, icon: '📐', w: 900, h: 720, d: 900, z: 0 },
  { id: 'k_base_cooktop', type: 'Balcão Cooktop', category: 'Cozinha', price: 1350, icon: '🔥', w: 800, h: 720, d: 580, z: 0 },
  { id: 'k_base_forno', type: 'Balcão Forno Embutir', category: 'Cozinha', price: 1500, icon: '🔲', w: 600, h: 720, d: 580, z: 0 },
  
  // COZINHA - Aéreos
  { id: 'k_sup_1p', type: 'Aéreo 1P', category: 'Cozinha', price: 650, icon: '🗄️', w: 400, h: 600, d: 350, z: 1500 },
  { id: 'k_sup_2p', type: 'Aéreo 2P', category: 'Cozinha', price: 850, icon: '🗄️', w: 800, h: 600, d: 350, z: 1500 },
  { id: 'k_sup_3p', type: 'Aéreo 3P', category: 'Cozinha', price: 1050, icon: '🗄️', w: 1200, h: 600, d: 350, z: 1500 },
  { id: 'k_sup_basc', type: 'Aéreo Basculante', category: 'Cozinha', price: 980, icon: '🪟', w: 800, h: 400, d: 350, z: 1700 },
  { id: 'k_sup_basc_2', type: 'Aéreo 2 Basculantes', category: 'Cozinha', price: 1280, icon: '🪟', w: 1200, h: 400, d: 350, z: 1700 },
  { id: 'k_sup_vidro', type: 'Aéreo Vidro 2P', category: 'Cozinha', price: 1150, icon: '🪟', w: 800, h: 600, d: 350, z: 1500 },
  { id: 'k_sup_adega', type: 'Aéreo Adega', category: 'Cozinha', price: 950, icon: '🍷', w: 400, h: 600, d: 350, z: 1500 },
  { id: 'k_sup_canto', type: 'Aéreo Canto', category: 'Cozinha', price: 850, icon: '📐', w: 350, h: 600, d: 350, z: 1500 },
  
  // COZINHA - Torres e Paneleiros
  { id: 'k_torre', type: 'Torre Forno/Micro', category: 'Cozinha', price: 2200, icon: '🔲', w: 600, h: 2100, d: 580, z: 0 },
  { id: 'k_torre_geladeira', type: 'Torre Geladeira', category: 'Cozinha', price: 1800, icon: '🧊', w: 700, h: 2100, d: 580, z: 0 },
  { id: 'k_paneleiro_1p', type: 'Paneleiro 1P', category: 'Cozinha', price: 1600, icon: '🚪', w: 400, h: 2100, d: 580, z: 0 },
  { id: 'k_paneleiro_2p', type: 'Paneleiro 2P', category: 'Cozinha', price: 2100, icon: '🚪', w: 600, h: 2100, d: 580, z: 0 },
  { id: 'k_despensa', type: 'Despensa Multiuso', category: 'Cozinha', price: 2400, icon: '🗄️', w: 800, h: 2100, d: 400, z: 0 },
  
  // COZINHA - Ilhas e Bancadas
  { id: 'k_ilha', type: 'Ilha Central', category: 'Cozinha', price: 3500, icon: '🏝️', w: 1500, h: 900, d: 800, z: 0 },
  { id: 'k_ilha_cooktop', type: 'Ilha c/ Cooktop', category: 'Cozinha', price: 4200, icon: '🏝️', w: 1800, h: 900, d: 900, z: 0 },
  { id: 'k_bancada', type: 'Bancada Suspensa', category: 'Cozinha', price: 1200, icon: '📏', w: 1200, h: 50, d: 400, z: 900 },
  
  // DORMITÓRIO - Roupeiros
  { id: 'b_wardrobe_2p', type: 'Roupeiro 2P Abrir', category: 'Dormitório', price: 3200, icon: '🚪', w: 900, h: 2400, d: 600, z: 0 },
  { id: 'b_wardrobe_3p', type: 'Roupeiro 3P Correr', category: 'Dormitório', price: 4500, icon: '🚪', w: 2000, h: 2400, d: 600, z: 0 },
  { id: 'b_wardrobe_4p', type: 'Roupeiro 4P Correr', category: 'Dormitório', price: 5800, icon: '🚪', w: 2700, h: 2400, d: 600, z: 0 },
  { id: 'b_wardrobe_6p', type: 'Roupeiro 6P Correr', category: 'Dormitório', price: 7200, icon: '🚪', w: 3600, h: 2400, d: 600, z: 0 },
  { id: 'b_wardrobe_canto', type: 'Roupeiro Canto L', category: 'Dormitório', price: 5500, icon: '📐', w: 1200, h: 2400, d: 1200, z: 0 },
  { id: 'b_wardrobe_casal', type: 'Closet Casal', category: 'Dormitório', price: 8500, icon: '👔', w: 3000, h: 2400, d: 600, z: 0 },
  
  // DORMITÓRIO - Cômodas e Criados
  { id: 'b_comoda', type: 'Cômoda 5 Gavetas', category: 'Dormitório', price: 1800, icon: '📋', w: 1000, h: 900, d: 450, z: 0 },
  { id: 'b_comoda_3g', type: 'Cômoda 3 Gavetas', category: 'Dormitório', price: 1400, icon: '📋', w: 800, h: 700, d: 450, z: 0 },
  { id: 'b_comoda_espelho', type: 'Cômoda c/ Espelho', category: 'Dormitório', price: 2200, icon: '🪞', w: 1000, h: 900, d: 450, z: 0 },
  { id: 'b_criado', type: 'Criado-Mudo', category: 'Dormitório', price: 650, icon: '🛏️', w: 400, h: 500, d: 400, z: 0 },
  { id: 'b_criado_2g', type: 'Criado 2 Gavetas', category: 'Dormitório', price: 750, icon: '🛏️', w: 450, h: 550, d: 400, z: 0 },
  { id: 'b_criado_suspenso', type: 'Criado Suspenso', category: 'Dormitório', price: 580, icon: '🛏️', w: 400, h: 300, d: 350, z: 500 },
  
  // DORMITÓRIO - Cabeceiras e Painéis
  { id: 'b_cabeceira', type: 'Cabeceira Casal', category: 'Dormitório', price: 1200, icon: '🛏️', w: 1400, h: 1200, d: 50, z: 500 },
  { id: 'b_cabeceira_estof', type: 'Cabeceira Estofada', category: 'Dormitório', price: 1800, icon: '🛋️', w: 1600, h: 1400, d: 100, z: 400 },
  { id: 'b_painel_quarto', type: 'Painel Ripado', category: 'Dormitório', price: 1600, icon: '📺', w: 2000, h: 1600, d: 45, z: 400 },
  
  // DORMITÓRIO - Penteadeiras
  { id: 'b_penteadeira', type: 'Penteadeira', category: 'Dormitório', price: 1400, icon: '💄', w: 1000, h: 1400, d: 400, z: 0 },
  { id: 'b_penteadeira_susp', type: 'Penteadeira Suspensa', category: 'Dormitório', price: 1200, icon: '💄', w: 900, h: 300, d: 400, z: 750 },
  
  // SALA - Painéis TV
  { id: 'l_panel', type: 'Painel TV Ripado', category: 'Sala', price: 2100, icon: '📺', w: 2200, h: 1800, d: 45, z: 600 },
  { id: 'l_panel_led', type: 'Painel TV c/ LED', category: 'Sala', price: 2800, icon: '📺', w: 2400, h: 1600, d: 50, z: 600 },
  { id: 'l_panel_nicho', type: 'Painel TV c/ Nichos', category: 'Sala', price: 2400, icon: '📺', w: 2000, h: 2000, d: 350, z: 0 },
  { id: 'l_panel_giro', type: 'Painel TV Giratório', category: 'Sala', price: 3200, icon: '📺', w: 1200, h: 1800, d: 100, z: 0 },
  
  // SALA - Racks e Home
  { id: 'l_rack', type: 'Rack TV Suspenso', category: 'Sala', price: 1600, icon: '📺', w: 1800, h: 400, d: 400, z: 400 },
  { id: 'l_rack_grande', type: 'Rack TV Grande', category: 'Sala', price: 2200, icon: '📺', w: 2400, h: 500, d: 450, z: 0 },
  { id: 'l_home', type: 'Home Theater', category: 'Sala', price: 4500, icon: '🎬', w: 2600, h: 2100, d: 450, z: 0 },
  { id: 'l_home_canto', type: 'Home Canto', category: 'Sala', price: 3800, icon: '🎬', w: 2200, h: 2100, d: 450, z: 0 },
  
  // SALA - Estantes e Bufês
  { id: 'l_estante', type: 'Estante Nichos', category: 'Sala', price: 1400, icon: '📚', w: 800, h: 1800, d: 350, z: 0 },
  { id: 'l_estante_grande', type: 'Estante Grande', category: 'Sala', price: 2200, icon: '📚', w: 1600, h: 2100, d: 350, z: 0 },
  { id: 'l_buffet', type: 'Buffet 3P', category: 'Sala', price: 1800, icon: '🗄️', w: 1400, h: 800, d: 400, z: 0 },
  { id: 'l_buffet_adega', type: 'Buffet c/ Adega', category: 'Sala', price: 2400, icon: '🍷', w: 1600, h: 900, d: 450, z: 0 },
  { id: 'l_cristaleira', type: 'Cristaleira', category: 'Sala', price: 2800, icon: '🪟', w: 900, h: 2000, d: 400, z: 0 },
  
  // SALA - Aparadores
  { id: 'l_aparador', type: 'Aparador', category: 'Sala', price: 1200, icon: '🏠', w: 1200, h: 800, d: 350, z: 0 },
  { id: 'l_aparador_suspenso', type: 'Aparador Suspenso', category: 'Sala', price: 980, icon: '🏠', w: 1000, h: 300, d: 300, z: 800 },
  { id: 'l_console', type: 'Console Entrada', category: 'Sala', price: 850, icon: '🚪', w: 800, h: 850, d: 300, z: 0 },
  
  // ESCRITÓRIO - Mesas
  { id: 'o_mesa', type: 'Mesa Escritório', category: 'Escritório', price: 1200, icon: '🖥️', w: 1400, h: 750, d: 600, z: 0 },
  { id: 'o_mesa_canto', type: 'Mesa Canto L', category: 'Escritório', price: 1800, icon: '🖥️', w: 1600, h: 750, d: 1400, z: 0 },
  { id: 'o_mesa_exec', type: 'Mesa Executiva', category: 'Escritório', price: 2400, icon: '💼', w: 1800, h: 750, d: 800, z: 0 },
  { id: 'o_mesa_reuniao', type: 'Mesa Reunião', category: 'Escritório', price: 3500, icon: '👥', w: 2400, h: 750, d: 1200, z: 0 },
  { id: 'o_bancada', type: 'Bancada Trabalho', category: 'Escritório', price: 1400, icon: '📏', w: 2000, h: 750, d: 600, z: 0 },
  
  // ESCRITÓRIO - Armários
  { id: 'o_armario', type: 'Armário 2P', category: 'Escritório', price: 1800, icon: '🗄️', w: 800, h: 2100, d: 400, z: 0 },
  { id: 'o_armario_vidro', type: 'Armário c/ Vidro', category: 'Escritório', price: 2200, icon: '🪟', w: 800, h: 2100, d: 400, z: 0 },
  { id: 'o_armario_baixo', type: 'Armário Baixo', category: 'Escritório', price: 1200, icon: '🗄️', w: 800, h: 800, d: 400, z: 0 },
  { id: 'o_gaveteiro', type: 'Gaveteiro Volante', category: 'Escritório', price: 650, icon: '📋', w: 400, h: 600, d: 500, z: 0 },
  
  // ESCRITÓRIO - Estantes
  { id: 'o_estante', type: 'Estante Livros', category: 'Escritório', price: 1600, icon: '📚', w: 1000, h: 2100, d: 350, z: 0 },
  { id: 'o_estante_porta', type: 'Estante c/ Portas', category: 'Escritório', price: 2000, icon: '📚', w: 1200, h: 2100, d: 400, z: 0 },
  { id: 'o_prateleira', type: 'Prateleira Suspensa', category: 'Escritório', price: 350, icon: '📏', w: 1000, h: 30, d: 250, z: 1200 },
  { id: 'o_nichos', type: 'Módulo Nichos', category: 'Escritório', price: 580, icon: '🔲', w: 600, h: 600, d: 300, z: 1000 },
  
  // BANHEIRO
  { id: 'bh_gabinete', type: 'Gabinete Banheiro', category: 'Banheiro', price: 1400, icon: '🚿', w: 800, h: 600, d: 450, z: 0 },
  { id: 'bh_gabinete_susp', type: 'Gabinete Suspenso', category: 'Banheiro', price: 1200, icon: '🚿', w: 600, h: 400, d: 400, z: 700 },
  { id: 'bh_espelheira', type: 'Espelheira', category: 'Banheiro', price: 950, icon: '🪞', w: 800, h: 600, d: 150, z: 1200 },
  { id: 'bh_armario', type: 'Armário Banheiro', category: 'Banheiro', price: 1100, icon: '🗄️', w: 400, h: 1600, d: 350, z: 0 },
  
  // ÁREA DE SERVIÇO
  { id: 'as_armario', type: 'Armário Lavanderia', category: 'Área Serviço', price: 1600, icon: '🧺', w: 800, h: 2100, d: 500, z: 0 },
  { id: 'as_armario_tanque', type: 'Armário Tanque', category: 'Área Serviço', price: 1200, icon: '🧺', w: 700, h: 900, d: 500, z: 0 },
  { id: 'as_aereo', type: 'Aéreo Lavanderia', category: 'Área Serviço', price: 750, icon: '🗄️', w: 800, h: 500, d: 350, z: 1500 },
  { id: 'as_bancada', type: 'Bancada Passar', category: 'Área Serviço', price: 600, icon: '📏', w: 1000, h: 900, d: 400, z: 0 },
];

const CATEGORIES = ['Todos', 'Cozinha', 'Dormitório', 'Sala', 'Escritório', 'Banheiro', 'Área Serviço'];
const FINISHES = ['Branco Tx', 'Preto Tx', 'Carvalho Hanover', 'Nogueira', 'Cinza Urbano', 'Amadeirado', 'Freijó', 'Rústico', 'Champagne', 'Off White', 'Grafite'];

interface PromobEditorProps {
  onRender: () => void;
  isRendering?: boolean;
}

const PromobEditor: React.FC<PromobEditorProps> = ({ onRender, isRendering }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tool, setTool] = useState(ToolMode.SELECT);
  const [viewportMode, setViewportMode] = useState(ViewportMode.PERSPECTIVE);
  const [cameraRotation, setCameraRotation] = useState({ x: -15, y: -30 });
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [showLibrary, setShowLibrary] = useState(true);
  const [showProperties, setShowProperties] = useState(true);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [history, setHistory] = useState<FurnitureModule[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [renderTime, setRenderTime] = useState('00:00:00');
  const [totalTime, setTotalTime] = useState('00:00:00');
  const [startTime] = useState(Date.now());
  const [clipboard, setClipboard] = useState<FurnitureModule | null>(null);
  const [isProjectModified, setIsProjectModified] = useState(false);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  
  // AI Assistant State
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Olá! Sou o assistente de design da SD Móveis. Posso ajudar você a:\n\n• Sugerir layouts para seu ambiente\n• Recomendar combinações de módulos\n• Calcular dimensões ideais\n• Escolher acabamentos\n\nComo posso ajudar?' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const aiScrollRef = useRef<HTMLDivElement>(null);
  
  const [project, setProject] = useState({
    id: '1', 
    name: 'Novo Projeto', 
    clientName: 'Cliente',
    modules: [] as FurnitureModule[], 
    floorWidth: 4000, 
    floorDepth: 3500, 
    wallHeight: 2700,
  });
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedModule = useMemo(() => project.modules.find(m => m.id === selectedId), [project.modules, selectedId]);

  // Timer para tempo total
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
      const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
      const s = String(elapsed % 60).padStart(2, '0');
      setTotalTime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Scroll AI messages
  useEffect(() => {
    if (aiScrollRef.current) {
      aiScrollRef.current.scrollTop = aiScrollRef.current.scrollHeight;
    }
  }, [aiMessages]);

  const filteredLibrary = useMemo(() => {
    if (activeCategory === 'Todos') return MODULE_LIBRARY;
    return MODULE_LIBRARY.filter(m => m.category === activeCategory);
  }, [activeCategory]);

  const totalValue = useMemo(() => 
    project.modules.reduce((sum, m) => sum + m.price, 0), 
    [project.modules]
  );

  const saveHistory = useCallback((newModules: FurnitureModule[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newModules]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setIsProjectModified(true);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setProject(p => ({ ...p, modules: history[historyIndex - 1] }));
      toast({ title: "↩️ Desfazer", description: "Ação desfeita" });
    }
  }, [history, historyIndex, toast]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setProject(p => ({ ...p, modules: history[historyIndex + 1] }));
      toast({ title: "↪️ Refazer", description: "Ação refeita" });
    }
  }, [history, historyIndex, toast]);

  const clampPosition = (axis: 'x' | 'y' | 'z', value: number, mod: FurnitureModule) => {
    if (axis === 'x') return Math.max(-project.floorWidth / 2 + mod.width / 2, Math.min(project.floorWidth / 2 - mod.width / 2, value));
    if (axis === 'y') return Math.max(0, Math.min(project.wallHeight - mod.height, value));
    if (axis === 'z') return Math.max(-project.floorDepth / 2 + mod.depth / 2, Math.min(project.floorDepth / 2 - mod.depth / 2, value));
    return value;
  };

  const addModule = (template: ModuleTemplate) => {
    const mod: FurnitureModule = {
      id: Math.random().toString(36).substr(2, 9),
      type: template.type, 
      category: template.category, 
      price: template.price,
      width: template.w, 
      height: template.h, 
      depth: template.d, 
      x: 0, 
      y: 0, 
      z: template.z || 0,
      finish: 'Branco Tx', 
      isRipado: template.type.includes('Ripado'), 
      rotation: 0
    };
    const newModules = [...project.modules, mod];
    saveHistory(newModules);
    setProject(p => ({ ...p, modules: newModules }));
    setSelectedId(mod.id);
    toast({ title: "✓ Módulo inserido", description: template.type });
  };

  const updateModule = useCallback((updates: Partial<FurnitureModule>) => {
    if (!selectedId) return;
    const newModules = project.modules.map(m => m.id === selectedId ? { ...m, ...updates } : m);
    setProject(p => ({ ...p, modules: newModules }));
    setIsProjectModified(true);
    // Salva no histórico para mudanças de acabamento e outras propriedades
    saveHistory(newModules);
  }, [selectedId, project.modules, saveHistory]);

  const deleteModule = () => {
    if (!selectedId) return;
    const newModules = project.modules.filter(m => m.id !== selectedId);
    saveHistory(newModules);
    setProject(p => ({ ...p, modules: newModules }));
    setSelectedId(null);
    toast({ title: "🗑️ Excluído", description: "Módulo removido" });
  };

  const duplicateModule = () => {
    if (!selectedModule) return;
    const dup: FurnitureModule = { 
      ...selectedModule, 
      id: Math.random().toString(36).substr(2, 9), 
      x: selectedModule.x + selectedModule.width + 50 
    };
    const newModules = [...project.modules, dup];
    saveHistory(newModules);
    setProject(p => ({ ...p, modules: newModules }));
    setSelectedId(dup.id);
    toast({ title: "📋 Duplicado", description: selectedModule.type });
  };

  const rotateModule = (degrees: number) => {
    if (!selectedModule) return;
    updateModule({ rotation: (selectedModule.rotation + degrees) % 360 });
    toast({ title: "🔄 Rotacionado", description: `${degrees}°` });
  };

  const flipModule = () => {
    if (!selectedModule) return;
    updateModule({ x: -selectedModule.x });
    toast({ title: "↔️ Espelhado", description: "Módulo espelhado" });
  };

  const alignModule = (alignment: 'left' | 'center' | 'right') => {
    if (!selectedModule) return;
    let newX = 0;
    if (alignment === 'left') newX = -project.floorWidth / 2 + selectedModule.width / 2;
    else if (alignment === 'right') newX = project.floorWidth / 2 - selectedModule.width / 2;
    updateModule({ x: newX });
    toast({ title: "📐 Alinhado", description: alignment === 'left' ? 'Esquerda' : alignment === 'right' ? 'Direita' : 'Centro' });
  };

  const copyModule = () => {
    if (!selectedModule) return;
    setClipboard({ ...selectedModule });
    toast({ title: "📋 Copiado", description: selectedModule.type });
  };

  const cutModule = () => {
    if (!selectedModule) return;
    setClipboard({ ...selectedModule });
    deleteModule();
    toast({ title: "✂️ Recortado", description: "Módulo recortado" });
  };

  const pasteModule = () => {
    if (!clipboard) return;
    const pasted: FurnitureModule = { 
      ...clipboard, 
      id: Math.random().toString(36).substr(2, 9), 
      x: clipboard.x + 100, 
      z: clipboard.z + 100 
    };
    const newModules = [...project.modules, pasted];
    saveHistory(newModules);
    setProject(p => ({ ...p, modules: newModules }));
    setSelectedId(pasted.id);
    toast({ title: "📋 Colado", description: clipboard.type });
  };

  const selectAll = () => {
    if (project.modules.length > 0) {
      setSelectedId(project.modules[0].id);
      toast({ title: "✓ Selecionado", description: `${project.modules.length} módulo(s)` });
    }
  };

  const clearProject = () => {
    saveHistory([]);
    setProject(p => ({ ...p, modules: [], name: 'Novo Projeto' }));
    setSelectedId(null);
    setShowNewProjectDialog(false);
    toast({ title: "📄 Novo Projeto", description: "Área de trabalho limpa" });
  };

  const saveProject = () => {
    const data = JSON.stringify(project, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}.sdproj`;
    a.click();
    URL.revokeObjectURL(url);
    setIsProjectModified(false);
    toast({ title: "💾 Salvo", description: `${project.name}.sdproj` });
  };

  const loadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        setProject(data);
        setHistory([data.modules]);
        setHistoryIndex(0);
        setIsProjectModified(false);
        toast({ title: "📂 Carregado", description: data.name });
      } catch {
        toast({ title: "❌ Erro", description: "Arquivo inválido", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };

  const exportImage = () => {
    toast({ title: "📸 Exportar Imagem", description: "Use o botão Render para gerar imagem HD" });
    setShowExportDialog(false);
  };

  const printProject = () => {
    window.print();
    toast({ title: "🖨️ Imprimir", description: "Preparando impressão..." });
  };

  const moveModule = (dx: number, dy: number, dz: number) => {
    if (!selectedModule) return;
    updateModule({ 
      x: clampPosition('x', selectedModule.x + dx, selectedModule),
      y: clampPosition('y', selectedModule.y + dy, selectedModule),
      z: clampPosition('z', selectedModule.z + dz, selectedModule)
    });
  };

  const generateBudget = () => {
    setShowBudgetDialog(true);
  };

  const handleDragStart = (e: React.DragEvent, template: ModuleTemplate) => {
    e.dataTransfer.setData('template', JSON.stringify(template));
    e.dataTransfer.effectAllowed = 'copy';
  };

  // AI Assistant Functions
  const sendAiMessage = async () => {
    if (!aiInput.trim() || isAiLoading) return;
    
    const userMessage = aiInput.trim();
    setAiInput('');
    setAiMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsAiLoading(true);
    
    try {
      // Construir contexto do projeto para a IA
      const projectContext = `
Contexto do projeto atual:
- Nome: ${project.name}
- Cliente: ${project.clientName}
- Ambiente: ${project.floorWidth}mm x ${project.floorDepth}mm (altura ${project.wallHeight}mm)
- Módulos no projeto: ${project.modules.length}
- Valor total: R$ ${totalValue.toLocaleString('pt-BR')}
${project.modules.length > 0 ? `\nMódulos atuais:\n${project.modules.map(m => `- ${m.type} (${m.width}x${m.height}x${m.depth}mm) - ${m.finish}`).join('\n')}` : ''}
      `.trim();

      const response = await generateAiChatResponse([
        ...aiMessages.slice(-10), // Últimas 10 mensagens para contexto
        { role: 'user', content: `${projectContext}\n\nPergunta do usuário: ${userMessage}` }
      ]);
      
      setAiMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('AI error:', error);
      setAiMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.' 
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const getAiSuggestion = async (type: 'layout' | 'modules' | 'finish') => {
    setIsAiLoading(true);
    
    const prompts = {
      layout: `Sugira um layout otimizado para uma ${activeCategory !== 'Todos' ? activeCategory.toLowerCase() : 'cozinha'} de ${project.floorWidth}mm x ${project.floorDepth}mm. Inclua módulos específicos com dimensões.`,
      modules: `Quais módulos você recomenda para completar este projeto de ${activeCategory !== 'Todos' ? activeCategory.toLowerCase() : 'ambiente'}? Considere os módulos já adicionados.`,
      finish: `Sugira combinações de acabamentos harmoniosas para os módulos deste projeto, considerando tendências atuais de design de interiores.`
    };

    setAiMessages(prev => [...prev, { role: 'user', content: prompts[type] }]);
    
    try {
      const response = await generateAiChatResponse([
        { role: 'user', content: `Projeto: ${project.floorWidth}mm x ${project.floorDepth}mm, ${project.modules.length} módulos. ${prompts[type]}` }
      ]);
      setAiMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setAiMessages(prev => [...prev, { role: 'assistant', content: 'Erro ao gerar sugestão.' }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z': e.preventDefault(); undo(); break;
          case 'y': e.preventDefault(); redo(); break;
          case 'c': e.preventDefault(); copyModule(); break;
          case 'x': e.preventDefault(); cutModule(); break;
          case 'v': e.preventDefault(); pasteModule(); break;
          case 's': e.preventDefault(); saveProject(); break;
          case 'n': e.preventDefault(); setShowNewProjectDialog(true); break;
          case 'o': e.preventDefault(); fileInputRef.current?.click(); break;
          case 'a': e.preventDefault(); selectAll(); break;
          case 'd': e.preventDefault(); duplicateModule(); break;
        }
      } else {
        switch (e.key) {
          case 'Delete': case 'Backspace': deleteModule(); break;
          case 'Escape': setSelectedId(null); break;
          case 'r': case 'R': rotateModule(90); break;
          case 'ArrowLeft': moveModule(-50, 0, 0); break;
          case 'ArrowRight': moveModule(50, 0, 0); break;
          case 'ArrowUp': moveModule(0, 0, -50); break;
          case 'ArrowDown': moveModule(0, 0, 50); break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedModule, clipboard, historyIndex]);

  return (
    <div className="h-full flex flex-col bg-[#1a1a2e] text-white overflow-hidden font-['Segoe_UI',Tahoma,sans-serif] text-[11px]">
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".sdproj,.json" onChange={loadProject} className="hidden" />
      
      {/* WINDOW TITLE BAR */}
      <div className="h-7 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 flex items-center px-1 select-none">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-5 h-5 bg-gradient-to-br from-amber-300 to-amber-500 rounded flex items-center justify-center shadow-lg">
            <span className="text-[9px] font-black text-amber-900">SD</span>
          </div>
          <span className="text-amber-950 text-[11px] font-bold">
            SD Projetista - [{project.name}]{isProjectModified ? ' *' : ''}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button className="w-6 h-5 bg-amber-400/50 hover:bg-amber-300 rounded flex items-center justify-center transition-colors">
            <Minus size={10} className="text-amber-900" />
          </button>
          <button className="w-6 h-5 bg-amber-400/50 hover:bg-amber-300 rounded flex items-center justify-center transition-colors">
            <Square size={8} className="text-amber-900" />
          </button>
          <button className="w-6 h-5 bg-red-500/80 hover:bg-red-500 rounded flex items-center justify-center transition-colors">
            <X size={10} className="text-white" />
          </button>
        </div>
      </div>

      {/* MENU BAR */}
      <div className="h-6 bg-[#16213e] flex items-center px-0.5 border-b border-amber-500/20">
        <MenuBarItem label="Arquivo" items={[
          { label: 'Novo Projeto', shortcut: 'Ctrl+N', action: () => setShowNewProjectDialog(true) },
          { label: 'Abrir...', shortcut: 'Ctrl+O', action: () => fileInputRef.current?.click() },
          { label: 'Salvar', shortcut: 'Ctrl+S', action: saveProject },
          { label: 'Salvar Como...', action: () => setShowSaveDialog(true) },
          { label: '-' },
          { label: 'Exportar Imagem', action: exportImage },
          { label: 'Gerar Orçamento', action: generateBudget },
          { label: '-' },
          { label: 'Imprimir...', shortcut: 'Ctrl+P', action: printProject },
        ]} />
        <MenuBarItem label="Editar" items={[
          { label: 'Desfazer', shortcut: 'Ctrl+Z', action: undo, disabled: historyIndex <= 0 },
          { label: 'Refazer', shortcut: 'Ctrl+Y', action: redo, disabled: historyIndex >= history.length - 1 },
          { label: '-' },
          { label: 'Recortar', shortcut: 'Ctrl+X', action: cutModule, disabled: !selectedId },
          { label: 'Copiar', shortcut: 'Ctrl+C', action: copyModule, disabled: !selectedId },
          { label: 'Colar', shortcut: 'Ctrl+V', action: pasteModule, disabled: !clipboard },
          { label: 'Duplicar', shortcut: 'Ctrl+D', action: duplicateModule, disabled: !selectedId },
          { label: '-' },
          { label: 'Selecionar Tudo', shortcut: 'Ctrl+A', action: selectAll },
          { label: 'Excluir', shortcut: 'Del', action: deleteModule, disabled: !selectedId },
        ]} />
        <MenuBarItem label="Exibir" items={[
          { label: 'Perspectiva', action: () => { setViewportMode(ViewportMode.PERSPECTIVE); setCameraRotation({ x: -15, y: -30 }); } },
          { label: 'Vista Superior', action: () => { setViewportMode(ViewportMode.TOP); setCameraRotation({ x: -90, y: 0 }); } },
          { label: 'Vista Frontal', action: () => { setViewportMode(ViewportMode.FRONT); setCameraRotation({ x: 0, y: 0 }); } },
          { label: 'Vista Lateral', action: () => { setViewportMode(ViewportMode.SIDE); setCameraRotation({ x: 0, y: -90 }); } },
          { label: '-' },
          { label: showGrid ? '✓ Mostrar Grade' : 'Mostrar Grade', action: () => setShowGrid(!showGrid) },
          { label: showDimensions ? '✓ Mostrar Cotas' : 'Mostrar Cotas', action: () => setShowDimensions(!showDimensions) },
          { label: '-' },
          { label: showLibrary ? '✓ Painel Biblioteca' : 'Painel Biblioteca', action: () => setShowLibrary(!showLibrary) },
          { label: showProperties ? '✓ Painel Propriedades' : 'Painel Propriedades', action: () => setShowProperties(!showProperties) },
          { label: showAIAssistant ? '✓ Assistente IA' : 'Assistente IA', action: () => setShowAIAssistant(!showAIAssistant) },
        ]} />
        <MenuBarItem label="Ferramentas" items={[
          { label: 'Selecionar', shortcut: 'V', action: () => setTool(ToolMode.SELECT) },
          { label: 'Mover', shortcut: 'M', action: () => setTool(ToolMode.MOVE) },
          { label: 'Rotacionar', shortcut: 'R', action: () => setTool(ToolMode.ROTATE) },
          { label: '-' },
          { label: 'Rotacionar 90°', action: () => rotateModule(90), disabled: !selectedId },
          { label: 'Espelhar', action: flipModule, disabled: !selectedId },
          { label: '-' },
          { label: 'Alinhar Esquerda', action: () => alignModule('left'), disabled: !selectedId },
          { label: 'Centralizar', action: () => alignModule('center'), disabled: !selectedId },
          { label: 'Alinhar Direita', action: () => alignModule('right'), disabled: !selectedId },
          { label: '-' },
          { label: snapEnabled ? '✓ Snap Magnético' : 'Snap Magnético', action: () => setSnapEnabled(!snapEnabled) },
        ]} />
        <MenuBarItem label="Ambiente" items={[
          { label: 'Dimensões do Ambiente', action: () => toast({ title: "📐 Dimensões", description: `${project.floorWidth}x${project.floorDepth}x${project.wallHeight}mm` }) },
          { label: '-' },
          { label: 'Largura +500mm', action: () => setProject(p => ({ ...p, floorWidth: p.floorWidth + 500 })) },
          { label: 'Largura -500mm', action: () => setProject(p => ({ ...p, floorWidth: Math.max(1000, p.floorWidth - 500) })) },
          { label: '-' },
          { label: 'Profundidade +500mm', action: () => setProject(p => ({ ...p, floorDepth: p.floorDepth + 500 })) },
          { label: 'Profundidade -500mm', action: () => setProject(p => ({ ...p, floorDepth: Math.max(1000, p.floorDepth - 500) })) },
          { label: '-' },
          { label: 'Altura +100mm', action: () => setProject(p => ({ ...p, wallHeight: p.wallHeight + 100 })) },
          { label: 'Altura -100mm', action: () => setProject(p => ({ ...p, wallHeight: Math.max(2000, p.wallHeight - 100) })) },
        ]} />
        <MenuBarItem label="Ajuda" items={[
          { label: 'Atalhos do Teclado', action: () => setShowHelpDialog(true) },
          { label: 'Tutorial', action: () => toast({ title: "📚 Tutorial", description: "Arraste módulos da biblioteca para o ambiente 3D" }) },
          { label: '-' },
          { label: 'Sobre SD Projetista', action: () => setShowAboutDialog(true) },
        ]} />
        <div className="flex-1" />
        <div className="flex items-center gap-1 mr-2">
          <span className="text-[10px] text-amber-300/70">SD Móveis</span>
          <div className="w-5 h-5 bg-gradient-to-br from-amber-400 to-amber-600 rounded text-amber-900 flex items-center justify-center text-[8px] font-bold">SD</div>
        </div>
      </div>

      {/* TOOLBAR PRINCIPAL */}
      <div className="h-8 bg-[#16213e] border-b border-amber-500/20 flex items-center px-1 gap-0.5 flex-wrap">
        <PromobToolButton icon={<FilePlus size={14} />} tooltip="Novo (Ctrl+N)" onClick={() => setShowNewProjectDialog(true)} />
        <PromobToolButton icon={<FolderOpen size={14} />} tooltip="Abrir (Ctrl+O)" onClick={() => fileInputRef.current?.click()} />
        <PromobToolButton icon={<Save size={14} />} tooltip="Salvar (Ctrl+S)" onClick={saveProject} active={isProjectModified} />
        <ToolbarDivider />
        <PromobToolButton icon={<Printer size={14} />} tooltip="Imprimir" onClick={printProject} />
        <PromobToolButton icon={<FileImage size={14} />} tooltip="Exportar Imagem" onClick={exportImage} />
        <ToolbarDivider />
        <PromobToolButton icon={<Undo size={14} />} tooltip="Desfazer (Ctrl+Z)" onClick={undo} disabled={historyIndex <= 0} />
        <PromobToolButton icon={<Redo size={14} />} tooltip="Refazer (Ctrl+Y)" onClick={redo} disabled={historyIndex >= history.length - 1} />
        <ToolbarDivider />
        <PromobToolButton icon={<Scissors size={14} />} tooltip="Recortar (Ctrl+X)" onClick={cutModule} disabled={!selectedId} />
        <PromobToolButton icon={<Copy size={14} />} tooltip="Copiar (Ctrl+C)" onClick={copyModule} disabled={!selectedId} />
        <PromobToolButton icon={<ClipboardPaste size={14} />} tooltip="Colar (Ctrl+V)" onClick={pasteModule} disabled={!clipboard} />
        <PromobToolButton icon={<Trash2 size={14} />} tooltip="Excluir (Del)" onClick={deleteModule} disabled={!selectedId} />
        <ToolbarDivider />
        <PromobToolButton icon={<MousePointer size={14} />} tooltip="Selecionar (V)" active={tool === ToolMode.SELECT} onClick={() => setTool(ToolMode.SELECT)} />
        <PromobToolButton icon={<Move size={14} />} tooltip="Mover (M)" active={tool === ToolMode.MOVE} onClick={() => setTool(ToolMode.MOVE)} />
        <PromobToolButton icon={<RotateCcw size={14} />} tooltip="Rotacionar (R)" active={tool === ToolMode.ROTATE} onClick={() => setTool(ToolMode.ROTATE)} />
        <ToolbarDivider />
        <PromobToolButton icon={<RotateCw size={14} />} tooltip="Rotacionar 90°" onClick={() => rotateModule(90)} disabled={!selectedId} />
        <PromobToolButton icon={<FlipHorizontal size={14} />} tooltip="Espelhar" onClick={flipModule} disabled={!selectedId} />
        <ToolbarDivider />
        <PromobToolButton icon={<AlignLeft size={14} />} tooltip="Alinhar Esquerda" onClick={() => alignModule('left')} disabled={!selectedId} />
        <PromobToolButton icon={<AlignCenter size={14} />} tooltip="Centralizar" onClick={() => alignModule('center')} disabled={!selectedId} />
        <PromobToolButton icon={<AlignRight size={14} />} tooltip="Alinhar Direita" onClick={() => alignModule('right')} disabled={!selectedId} />
        <ToolbarDivider />
        <PromobToolButton icon={<Grid3X3 size={14} />} tooltip="Mostrar Grade" active={showGrid} onClick={() => setShowGrid(!showGrid)} />
        <PromobToolButton icon={<Ruler size={14} />} tooltip="Mostrar Cotas" active={showDimensions} onClick={() => setShowDimensions(!showDimensions)} />
        <PromobToolButton icon={<Magnet size={14} />} tooltip="Snap Magnético" active={snapEnabled} onClick={() => setSnapEnabled(!snapEnabled)} />
        <ToolbarDivider />
        <PromobToolButton icon={<PanelLeftOpen size={14} />} tooltip="Painel Biblioteca" active={showLibrary} onClick={() => setShowLibrary(!showLibrary)} />
        <PromobToolButton icon={<PanelRightOpen size={14} />} tooltip="Painel Propriedades" active={showProperties} onClick={() => setShowProperties(!showProperties)} />
        <PromobToolButton icon={<Bot size={14} />} tooltip="Assistente IA" active={showAIAssistant} onClick={() => setShowAIAssistant(!showAIAssistant)} />
        <ToolbarDivider />
        <PromobToolButton icon={<Calculator size={14} />} tooltip="Orçamento" onClick={generateBudget} />

        <div className="flex-1" />

        {/* Botão Render */}
        <button
          onClick={onRender}
          disabled={isRendering || project.modules.length === 0}
          className="px-4 py-1 bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-bold text-[11px] border border-amber-400 rounded flex items-center gap-1.5 disabled:opacity-50 shadow-lg shadow-amber-500/20"
        >
          <Sparkles size={12} />
          Render IA
        </button>
      </div>

      {/* SECONDARY TOOLBAR - Navegação de vistas */}
      <div className="h-6 bg-[#0f0f23] border-b border-amber-500/10 flex items-center px-1 gap-0.5">
        <span className="text-[9px] text-amber-400/60 mr-1">Vista:</span>
        <PromobToolButton icon={<Box size={12} />} tooltip="Perspectiva" active={viewportMode === ViewportMode.PERSPECTIVE} onClick={() => { setViewportMode(ViewportMode.PERSPECTIVE); setCameraRotation({ x: -15, y: -30 }); }} />
        <PromobToolButton icon={<ArrowDown size={12} />} tooltip="Superior" active={viewportMode === ViewportMode.TOP} onClick={() => { setViewportMode(ViewportMode.TOP); setCameraRotation({ x: -90, y: 0 }); }} />
        <PromobToolButton icon={<ArrowUp size={12} />} tooltip="Frontal" active={viewportMode === ViewportMode.FRONT} onClick={() => { setViewportMode(ViewportMode.FRONT); setCameraRotation({ x: 0, y: 0 }); }} />
        <PromobToolButton icon={<ArrowRight size={12} />} tooltip="Lateral" active={viewportMode === ViewportMode.SIDE} onClick={() => { setViewportMode(ViewportMode.SIDE); setCameraRotation({ x: 0, y: -90 }); }} />
        <ToolbarDivider />
        <span className="text-[9px] text-amber-400/60 mr-1">Zoom:</span>
        <PromobToolButton icon={<ZoomOut size={12} />} tooltip="Zoom -" onClick={() => setZoom(z => Math.max(25, z - 25))} />
        <span className="text-[9px] w-8 text-center text-amber-300">{zoom}%</span>
        <PromobToolButton icon={<ZoomIn size={12} />} tooltip="Zoom +" onClick={() => setZoom(z => Math.min(200, z + 25))} />
        <PromobToolButton icon={<Maximize2 size={12} />} tooltip="Ajustar" onClick={() => setZoom(100)} />
        <ToolbarDivider />
        <span className="text-[9px] text-amber-400/60 mr-1">Mover:</span>
        <PromobToolButton icon={<ArrowLeft size={12} />} tooltip="← Mover Esquerda" onClick={() => moveModule(-50, 0, 0)} disabled={!selectedId} />
        <PromobToolButton icon={<ArrowRight size={12} />} tooltip="→ Mover Direita" onClick={() => moveModule(50, 0, 0)} disabled={!selectedId} />
        <PromobToolButton icon={<ArrowUp size={12} />} tooltip="↑ Mover Frente" onClick={() => moveModule(0, 0, -50)} disabled={!selectedId} />
        <PromobToolButton icon={<ArrowDown size={12} />} tooltip="↓ Mover Trás" onClick={() => moveModule(0, 0, 50)} disabled={!selectedId} />
        <PromobToolButton icon={<MoveVertical size={12} />} tooltip="↕ Subir/Descer" onClick={() => moveModule(0, 50, 0)} disabled={!selectedId} />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL - Biblioteca */}
        {showLibrary && (
          <div className="w-56 bg-[#0f0f23] border-r border-amber-500/20 flex flex-col">
            <div className="h-6 bg-gradient-to-r from-amber-600 to-amber-500 flex items-center justify-between px-2">
              <span className="text-amber-950 text-[10px] font-bold flex items-center gap-1">
                <Layers size={11} />
                Biblioteca de Módulos
              </span>
              <button onClick={() => setShowLibrary(false)} className="text-amber-900/80 hover:text-amber-900">
                <X size={12} />
              </button>
            </div>
            
            {/* Categorias */}
            <div className="p-1.5 border-b border-amber-500/10 bg-[#16213e]">
              <div className="flex flex-wrap gap-0.5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-1.5 py-0.5 text-[9px] font-medium rounded transition-all ${
                      activeCategory === cat 
                        ? 'bg-amber-500 text-amber-950' 
                        : 'bg-[#1a1a2e] border border-amber-500/20 text-amber-300/70 hover:bg-amber-500/10 hover:text-amber-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Módulos */}
            <div className="flex-1 overflow-auto p-1 bg-[#0a0a1a]">
              <div className="grid grid-cols-2 gap-1">
                {filteredLibrary.map(item => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={() => addModule(item)}
                    className="p-1.5 bg-[#16213e] hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/40 cursor-grab active:cursor-grabbing text-center transition-all rounded"
                  >
                    <span className="text-lg block">{item.icon}</span>
                    <p className="text-[8px] font-medium text-amber-100/80 leading-tight mt-0.5 truncate">{item.type}</p>
                    <p className="text-[8px] text-amber-400 font-bold">R${item.price}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo */}
            <div className="p-2 bg-[#16213e] border-t border-amber-500/10">
              <div className="text-[9px] space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-amber-300/60">Módulos:</span>
                  <span className="font-bold text-amber-300">{project.modules.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-300/60">Total:</span>
                  <span className="font-bold text-amber-400">R$ {totalValue.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CENTER - 3D Viewport */}
        <div className="flex-1 relative bg-[#0a0a1a]">
          <div 
            className="absolute inset-0"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const templateData = e.dataTransfer.getData('template');
              if (templateData) {
                const template = JSON.parse(templateData);
                addModule(template);
              }
            }}
          >
            <ThreePreview
              modules={project.modules}
              floorWidth={project.floorWidth}
              floorDepth={project.floorDepth}
              wallHeight={project.wallHeight}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onUpdateModule={(id, updates) => {
                setProject(p => ({
                  ...p,
                  modules: p.modules.map(m => {
                    if (m.id !== id) return m;
                    const merged = { ...m, ...updates };
                    return {
                      ...merged,
                      x: clampPosition('x', merged.x, merged),
                      y: clampPosition('y', merged.y, merged),
                      z: clampPosition('z', merged.z, merged),
                    };
                  })
                }));
                setIsProjectModified(true);
              }}
              customRotation={cameraRotation}
              showDimensions={showDimensions}
            />

            {/* Empty State */}
            {project.modules.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center bg-[#16213e]/95 p-6 rounded-lg shadow-xl border border-amber-500/20">
                  <Box size={48} className="mx-auto mb-3 text-amber-400" />
                  <p className="text-amber-100 text-sm font-bold">Arraste módulos para a cena</p>
                  <p className="text-amber-300/60 text-xs mt-1">ou clique para inserir</p>
                  <p className="text-amber-400/40 text-[10px] mt-3">Atalhos: Ctrl+Z desfaz | R rotaciona | Del exclui</p>
                </div>
              </div>
            )}

            {/* Viewport Controls */}
            <div className="absolute top-2 right-2 flex flex-col gap-1 bg-[#16213e]/90 p-1 rounded border border-amber-500/20">
              <div className="flex gap-0.5">
                <button onClick={() => setCameraRotation(prev => ({ ...prev, y: prev.y - 15 }))} className="w-5 h-5 bg-[#0f0f23] border border-amber-500/20 flex items-center justify-center hover:bg-amber-500/10 text-[10px] text-amber-300 rounded">◀</button>
                <button onClick={() => setCameraRotation(prev => ({ ...prev, x: prev.x + 10 }))} className="w-5 h-5 bg-[#0f0f23] border border-amber-500/20 flex items-center justify-center hover:bg-amber-500/10 text-[10px] text-amber-300 rounded">▲</button>
                <button onClick={() => setCameraRotation(prev => ({ ...prev, y: prev.y + 15 }))} className="w-5 h-5 bg-[#0f0f23] border border-amber-500/20 flex items-center justify-center hover:bg-amber-500/10 text-[10px] text-amber-300 rounded">▶</button>
              </div>
              <div className="flex gap-0.5 justify-center">
                <button onClick={() => setCameraRotation(prev => ({ ...prev, x: prev.x - 10 }))} className="w-5 h-5 bg-[#0f0f23] border border-amber-500/20 flex items-center justify-center hover:bg-amber-500/10 text-[10px] text-amber-300 rounded">▼</button>
                <button onClick={() => setCameraRotation({ x: -15, y: -30 })} className="w-5 h-5 bg-[#0f0f23] border border-amber-500/20 flex items-center justify-center hover:bg-amber-500/10 text-[8px] text-amber-300 rounded">⌂</button>
              </div>
              <div className="border-t border-amber-500/20 pt-1 mt-0.5 flex gap-0.5">
                <button onClick={() => setZoom(z => Math.max(25, z - 25))} className="w-5 h-5 bg-[#0f0f23] border border-amber-500/20 flex items-center justify-center hover:bg-amber-500/10 rounded">
                  <ZoomOut size={10} className="text-amber-300" />
                </button>
                <button onClick={() => setZoom(z => Math.min(200, z + 25))} className="w-5 h-5 bg-[#0f0f23] border border-amber-500/20 flex items-center justify-center hover:bg-amber-500/10 rounded">
                  <ZoomIn size={10} className="text-amber-300" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Propriedades */}
        {showProperties && (
          <div className="w-52 bg-[#0f0f23] border-l border-amber-500/20 flex flex-col">
            <div className="h-6 bg-gradient-to-r from-amber-600 to-amber-500 flex items-center justify-between px-2">
              <span className="text-amber-950 text-[10px] font-bold flex items-center gap-1">
                <Settings size={11} />
                Propriedades
              </span>
              <button onClick={() => setShowProperties(false)} className="text-amber-900/80 hover:text-amber-900">
                <X size={12} />
              </button>
            </div>

            {selectedModule ? (
              <div className="flex-1 overflow-auto p-1.5 bg-[#0a0a1a] text-[10px]">
                {/* Módulo Info */}
                <div className="border border-amber-500/20 p-1.5 mb-2 bg-[#16213e] rounded">
                  <p className="font-bold text-amber-100">{selectedModule.type}</p>
                  <p className="text-amber-400/60 text-[9px]">{selectedModule.category}</p>
                  <p className="text-amber-400 font-bold mt-0.5">R$ {selectedModule.price.toLocaleString()}</p>
                </div>

                {/* Dimensões */}
                <fieldset className="border border-amber-500/20 p-1.5 mb-2 rounded">
                  <legend className="text-[9px] font-bold text-amber-400 px-1">Dimensões (mm)</legend>
                  <PropRow label="L" value={selectedModule.width} onChange={(v) => updateModule({ width: v })} />
                  <PropRow label="A" value={selectedModule.height} onChange={(v) => updateModule({ height: v })} />
                  <PropRow label="P" value={selectedModule.depth} onChange={(v) => updateModule({ depth: v })} />
                </fieldset>

                {/* Posição */}
                <fieldset className="border border-amber-500/20 p-1.5 mb-2 rounded">
                  <legend className="text-[9px] font-bold text-amber-400 px-1">Posição (mm)</legend>
                  <PropRow label="X" value={Math.round(selectedModule.x)} onChange={(v) => updateModule({ x: v })} />
                  <PropRow label="Y" value={Math.round(selectedModule.y)} onChange={(v) => updateModule({ y: v })} />
                  <PropRow label="Z" value={Math.round(selectedModule.z)} onChange={(v) => updateModule({ z: v })} />
                  <PropRow label="R°" value={selectedModule.rotation} onChange={(v) => updateModule({ rotation: v })} max={360} />
                </fieldset>

                {/* Acabamento */}
                <fieldset className="border border-amber-500/20 p-1.5 mb-2 rounded">
                  <legend className="text-[9px] font-bold text-amber-400 px-1">Acabamento</legend>
                  <select 
                    value={selectedModule.finish}
                    onChange={(e) => updateModule({ finish: e.target.value })}
                    className="w-full bg-[#16213e] border border-amber-500/20 px-1 py-0.5 text-[10px] text-amber-100 rounded"
                  >
                    {FINISHES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </fieldset>

                {/* Ações Rápidas */}
                <fieldset className="border border-amber-500/20 p-1.5 mb-2 rounded">
                  <legend className="text-[9px] font-bold text-amber-400 px-1">Transformar</legend>
                  <div className="grid grid-cols-2 gap-1">
                    <button onClick={() => rotateModule(90)} className="py-1 bg-[#16213e] border border-amber-500/20 text-[9px] hover:bg-amber-500/10 flex items-center justify-center gap-0.5 text-amber-300 rounded">
                      <RotateCw size={10} /> 90°
                    </button>
                    <button onClick={() => rotateModule(-90)} className="py-1 bg-[#16213e] border border-amber-500/20 text-[9px] hover:bg-amber-500/10 flex items-center justify-center gap-0.5 text-amber-300 rounded">
                      <RotateCcw size={10} /> -90°
                    </button>
                    <button onClick={flipModule} className="py-1 bg-[#16213e] border border-amber-500/20 text-[9px] hover:bg-amber-500/10 flex items-center justify-center gap-0.5 text-amber-300 rounded">
                      <FlipHorizontal size={10} /> Espelhar
                    </button>
                    <button onClick={duplicateModule} className="py-1 bg-[#16213e] border border-amber-500/20 text-[9px] hover:bg-amber-500/10 flex items-center justify-center gap-0.5 text-amber-300 rounded">
                      <Copy size={10} /> Duplicar
                    </button>
                  </div>
                </fieldset>

                {/* Alinhamento */}
                <fieldset className="border border-amber-500/20 p-1.5 mb-2 rounded">
                  <legend className="text-[9px] font-bold text-amber-400 px-1">Alinhar</legend>
                  <div className="flex gap-1">
                    <button onClick={() => alignModule('left')} className="flex-1 py-1 bg-[#16213e] border border-amber-500/20 text-[9px] hover:bg-amber-500/10 flex items-center justify-center rounded">
                      <AlignLeft size={10} className="text-amber-300" />
                    </button>
                    <button onClick={() => alignModule('center')} className="flex-1 py-1 bg-[#16213e] border border-amber-500/20 text-[9px] hover:bg-amber-500/10 flex items-center justify-center rounded">
                      <AlignCenter size={10} className="text-amber-300" />
                    </button>
                    <button onClick={() => alignModule('right')} className="flex-1 py-1 bg-[#16213e] border border-amber-500/20 text-[9px] hover:bg-amber-500/10 flex items-center justify-center rounded">
                      <AlignRight size={10} className="text-amber-300" />
                    </button>
                  </div>
                </fieldset>

                {/* Excluir */}
                <button onClick={deleteModule} className="w-full py-1.5 bg-red-900/30 border border-red-500/30 text-[10px] font-medium hover:bg-red-900/50 text-red-400 flex items-center justify-center gap-1 rounded">
                  <Trash2 size={12} /> Excluir Módulo
                </button>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center text-amber-400/50">
                  <MousePointer size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-[10px]">Selecione um módulo</p>
                  <p className="text-[9px] mt-1">para editar propriedades</p>
                </div>
              </div>
            )}

            {/* Ambiente */}
            <div className="p-2 bg-[#16213e] border-t border-amber-500/10">
              <p className="text-[9px] font-bold text-amber-400 mb-1">Ambiente</p>
              <div className="text-[9px] space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-amber-300/60">Largura:</span>
                  <span className="font-medium text-amber-300">{project.floorWidth}mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-300/60">Profundidade:</span>
                  <span className="font-medium text-amber-300">{project.floorDepth}mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-300/60">Altura:</span>
                  <span className="font-medium text-amber-300">{project.wallHeight}mm</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI ASSISTANT PANEL */}
        {showAIAssistant && (
          <div className="w-72 bg-[#0f0f23] border-l border-amber-500/20 flex flex-col">
            <div className="h-6 bg-gradient-to-r from-purple-600 to-purple-500 flex items-center justify-between px-2">
              <span className="text-white text-[10px] font-bold flex items-center gap-1">
                <Bot size={11} />
                Assistente IA
              </span>
              <button onClick={() => setShowAIAssistant(false)} className="text-white/80 hover:text-white">
                <X size={12} />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="p-2 bg-[#16213e] border-b border-purple-500/20">
              <p className="text-[9px] text-purple-300/70 mb-1.5">Sugestões Rápidas:</p>
              <div className="flex flex-wrap gap-1">
                <button 
                  onClick={() => getAiSuggestion('layout')}
                  disabled={isAiLoading}
                  className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-[9px] text-purple-300 hover:bg-purple-500/30 flex items-center gap-1"
                >
                  <Lightbulb size={10} /> Layout
                </button>
                <button 
                  onClick={() => getAiSuggestion('modules')}
                  disabled={isAiLoading}
                  className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-[9px] text-purple-300 hover:bg-purple-500/30 flex items-center gap-1"
                >
                  <Box size={10} /> Módulos
                </button>
                <button 
                  onClick={() => getAiSuggestion('finish')}
                  disabled={isAiLoading}
                  className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-[9px] text-purple-300 hover:bg-purple-500/30 flex items-center gap-1"
                >
                  <Sparkles size={10} /> Acabamento
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div ref={aiScrollRef} className="flex-1 overflow-auto p-2 space-y-2 bg-[#0a0a1a]">
              {aiMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-2 rounded-lg text-[10px] ${
                    msg.role === 'user' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-[#16213e] border border-purple-500/20 text-purple-100'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#16213e] border border-purple-500/20 p-2 rounded-lg">
                    <Loader2 size={14} className="animate-spin text-purple-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-2 bg-[#16213e] border-t border-purple-500/20">
              <div className="flex gap-1">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendAiMessage()}
                  placeholder="Pergunte sobre o projeto..."
                  className="flex-1 bg-[#0a0a1a] border border-purple-500/20 rounded px-2 py-1 text-[10px] text-purple-100 placeholder:text-purple-400/40"
                />
                <button 
                  onClick={sendAiMessage}
                  disabled={isAiLoading || !aiInput.trim()}
                  className="px-2 bg-purple-600 hover:bg-purple-500 rounded disabled:opacity-50"
                >
                  <Send size={12} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STATUS BAR */}
      <div className="h-6 bg-[#16213e] border-t border-amber-500/20 flex items-center text-[10px]">
        <StatusSection className="border-r border-amber-500/10 px-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400 font-medium">Online</span>
          </div>
        </StatusSection>
        <StatusSection className="border-r border-amber-500/10 px-2">
          <span className="text-amber-400">SD Projetista</span>
        </StatusSection>
        <StatusSection className="border-r border-amber-500/10 px-2 flex items-center gap-1">
          <div className="w-3 h-3 bg-amber-500 rounded flex items-center justify-center">
            <Box size={8} className="text-amber-950" />
          </div>
          <span className="text-amber-300 font-medium">{project.name}</span>
        </StatusSection>
        <StatusSection className="flex-1 border-r border-amber-500/10 px-2">
          <span className="text-amber-300/60">
            {selectedModule ? `${selectedModule.type} - ${selectedModule.width}×${selectedModule.height}×${selectedModule.depth}mm` : 'Nenhum módulo selecionado'}
          </span>
        </StatusSection>
        <StatusSection className="border-r border-amber-500/10 px-2">
          <span className="text-amber-300/60">{viewportMode}</span>
        </StatusSection>
        <StatusSection className="px-2 flex items-center gap-1">
          <div className="px-1.5 py-0.5 bg-gradient-to-b from-amber-500 to-amber-600 text-amber-950 rounded text-[9px] font-bold flex items-center gap-1">
            <Image size={9} />
            Render [{project.modules.length}]
          </div>
        </StatusSection>
      </div>

      {/* BOTTOM INFO BAR */}
      <div className="h-5 bg-[#0f0f23] border-t border-amber-500/10 flex items-center justify-between px-2 text-[9px] text-amber-300/60">
        <span>⏱️ Tempo: {totalTime}</span>
        <span>📦 Módulos: {project.modules.length} | 💰 Total: R$ {totalValue.toLocaleString('pt-BR')}</span>
        <span>📐 Ambiente: {project.floorWidth}×{project.floorDepth}mm</span>
      </div>

      {/* DIALOGS */}
      {showNewProjectDialog && (
        <Dialog title="Novo Projeto" onClose={() => setShowNewProjectDialog(false)}>
          <p className="text-sm mb-4 text-amber-100">Criar um novo projeto irá limpar o projeto atual. Deseja continuar?</p>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowNewProjectDialog(false)} className="px-4 py-1.5 bg-gray-700 rounded text-sm hover:bg-gray-600 text-white">Cancelar</button>
            <button onClick={clearProject} className="px-4 py-1.5 bg-amber-600 text-amber-950 rounded text-sm hover:bg-amber-500 font-bold">Novo Projeto</button>
          </div>
        </Dialog>
      )}

      {showBudgetDialog && (
        <Dialog title="Orçamento do Projeto" onClose={() => setShowBudgetDialog(false)} wide>
          <div className="space-y-3">
            <div className="bg-[#16213e] p-3 rounded border border-amber-500/20">
              <p className="font-bold text-lg text-amber-100">{project.name}</p>
              <p className="text-sm text-amber-300/70">Cliente: {project.clientName}</p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-[#16213e]">
                <tr>
                  <th className="p-2 text-left text-amber-300">Módulo</th>
                  <th className="p-2 text-left text-amber-300">Dimensões</th>
                  <th className="p-2 text-left text-amber-300">Acabamento</th>
                  <th className="p-2 text-right text-amber-300">Valor</th>
                </tr>
              </thead>
              <tbody>
                {project.modules.map(m => (
                  <tr key={m.id} className="border-b border-amber-500/10">
                    <td className="p-2 text-amber-100">{m.type}</td>
                    <td className="p-2 text-amber-300/70">{m.width}×{m.height}×{m.depth}mm</td>
                    <td className="p-2 text-amber-300/70">{m.finish}</td>
                    <td className="p-2 text-right font-medium text-amber-100">R$ {m.price.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-amber-500/20">
                <tr>
                  <td colSpan={3} className="p-2 font-bold text-amber-100">TOTAL</td>
                  <td className="p-2 text-right font-bold text-amber-400">R$ {totalValue.toLocaleString('pt-BR')}</td>
                </tr>
              </tfoot>
            </table>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowBudgetDialog(false)} className="px-4 py-1.5 bg-gray-700 rounded text-sm hover:bg-gray-600 text-white">Fechar</button>
              <button onClick={() => { window.print(); }} className="px-4 py-1.5 bg-amber-600 text-amber-950 rounded text-sm hover:bg-amber-500 flex items-center gap-1 font-bold">
                <Printer size={14} /> Imprimir
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {showHelpDialog && (
        <Dialog title="Atalhos do Teclado" onClose={() => setShowHelpDialog(false)}>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-[#16213e] p-2 rounded text-amber-100"><kbd className="bg-[#0a0a1a] px-1 rounded text-amber-300">Ctrl+N</kbd> Novo</div>
            <div className="bg-[#16213e] p-2 rounded text-amber-100"><kbd className="bg-[#0a0a1a] px-1 rounded text-amber-300">Ctrl+O</kbd> Abrir</div>
            <div className="bg-[#16213e] p-2 rounded text-amber-100"><kbd className="bg-[#0a0a1a] px-1 rounded text-amber-300">Ctrl+S</kbd> Salvar</div>
            <div className="bg-[#16213e] p-2 rounded text-amber-100"><kbd className="bg-[#0a0a1a] px-1 rounded text-amber-300">Ctrl+Z</kbd> Desfazer</div>
            <div className="bg-[#16213e] p-2 rounded text-amber-100"><kbd className="bg-[#0a0a1a] px-1 rounded text-amber-300">Ctrl+Y</kbd> Refazer</div>
            <div className="bg-[#16213e] p-2 rounded text-amber-100"><kbd className="bg-[#0a0a1a] px-1 rounded text-amber-300">Ctrl+C</kbd> Copiar</div>
            <div className="bg-[#16213e] p-2 rounded text-amber-100"><kbd className="bg-[#0a0a1a] px-1 rounded text-amber-300">Ctrl+V</kbd> Colar</div>
            <div className="bg-[#16213e] p-2 rounded text-amber-100"><kbd className="bg-[#0a0a1a] px-1 rounded text-amber-300">Ctrl+D</kbd> Duplicar</div>
            <div className="bg-[#16213e] p-2 rounded text-amber-100"><kbd className="bg-[#0a0a1a] px-1 rounded text-amber-300">Del</kbd> Excluir</div>
            <div className="bg-[#16213e] p-2 rounded text-amber-100"><kbd className="bg-[#0a0a1a] px-1 rounded text-amber-300">R</kbd> Rotacionar</div>
            <div className="bg-[#16213e] p-2 rounded text-amber-100"><kbd className="bg-[#0a0a1a] px-1 rounded text-amber-300">Setas</kbd> Mover</div>
            <div className="bg-[#16213e] p-2 rounded text-amber-100"><kbd className="bg-[#0a0a1a] px-1 rounded text-amber-300">Esc</kbd> Desselecionar</div>
          </div>
        </Dialog>
      )}

      {showAboutDialog && (
        <Dialog title="Sobre" onClose={() => setShowAboutDialog(false)}>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg mx-auto mb-3 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <span className="text-2xl font-black text-amber-950">SD</span>
            </div>
            <h3 className="font-bold text-lg text-amber-100">SD Projetista</h3>
            <p className="text-amber-300/70 text-sm">Sistema de Projetos 3D</p>
            <p className="text-amber-400/50 text-xs mt-2">Versão 2.0 | SD Móveis Projetados</p>
            <p className="text-amber-500 text-xs mt-4 italic">"Consagre ao Senhor tudo o que você faz"</p>
          </div>
        </Dialog>
      )}
    </div>
  );
};

// Sub-Components
interface MenuItem {
  label: string;
  shortcut?: string;
  action?: () => void;
  disabled?: boolean;
}

const MenuBarItem: React.FC<{ 
  label: string; 
  items: MenuItem[];
}> = ({ label, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative" onMouseLeave={() => setIsOpen(false)}>
      <button 
        onMouseEnter={() => setIsOpen(true)}
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 py-0.5 hover:bg-amber-500 hover:text-amber-950 text-amber-300 text-[11px] transition-colors"
      >
        {label}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 bg-[#16213e] border border-amber-500/30 shadow-xl min-w-44 py-0.5 z-50 rounded">
          {items.map((item, i) => (
            item.label === '-' ? (
              <div key={i} className="border-t border-amber-500/20 my-0.5" />
            ) : (
              <button 
                key={i} 
                onClick={() => { item.action?.(); setIsOpen(false); }}
                disabled={item.disabled}
                className="w-full text-left px-4 py-1 text-[11px] hover:bg-amber-500 hover:text-amber-950 text-amber-100 flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{item.label}</span>
                {item.shortcut && <span className="text-amber-400/60 text-[10px]">{item.shortcut}</span>}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
};

const PromobToolButton: React.FC<{
  icon: React.ReactNode;
  tooltip?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}> = ({ icon, tooltip, active, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={tooltip}
    className={`w-6 h-6 flex items-center justify-center transition-all rounded ${
      active 
        ? 'bg-amber-500 text-amber-950' 
        : 'bg-[#1a1a2e] border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 hover:text-amber-200'
    } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
  >
    {icon}
  </button>
);

const ToolbarDivider: React.FC = () => (
  <div className="w-px h-5 bg-amber-500/20 mx-0.5" />
);

const PropRow: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
}> = ({ label, value, onChange, max = 10000 }) => (
  <div className="flex items-center gap-1 mb-0.5">
    <span className="w-4 text-[9px] font-medium text-amber-400">{label}:</span>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Math.min(max, Math.max(0, parseInt(e.target.value) || 0)))}
      className="flex-1 bg-[#16213e] border border-amber-500/20 px-1 py-0 text-[9px] text-right text-amber-100 rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  </div>
);

const StatusSection: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`h-full flex items-center ${className || ''}`}>{children}</div>
);

const Dialog: React.FC<{ title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }> = ({ title, children, onClose, wide }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className={`bg-[#0f0f23] rounded-lg shadow-2xl ${wide ? 'w-[600px]' : 'w-96'} max-h-[80vh] overflow-auto border border-amber-500/30`}>
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-amber-950 px-4 py-2 flex justify-between items-center rounded-t-lg">
        <span className="font-bold">{title}</span>
        <button onClick={onClose} className="hover:bg-amber-400/50 rounded p-0.5"><X size={16} /></button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  </div>
);

export default PromobEditor;
