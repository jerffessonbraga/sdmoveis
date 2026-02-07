import React, { useState, useMemo } from 'react';
import { X, Search, ShoppingCart, Package, Filter, Check, ExternalLink } from 'lucide-react';

interface HardwareCatalogProps {
  onSelect: (hardware: HardwareItem) => void;
  onClose: () => void;
}

export interface HardwareItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  unit: string;
  description: string;
  specifications: Record<string, string>;
  image?: string;
}

const HARDWARE_CATALOG: HardwareItem[] = [
  // Dobradiças
  { id: 'hinge_blum_clip', name: 'Dobradiça Clip Top 110°', brand: 'Blum', category: 'Dobradiças', subcategory: 'Caneco 35mm', price: 28.50, unit: 'un', description: 'Dobradiça com sistema de clique, abertura 110°', specifications: { 'Abertura': '110°', 'Tipo': 'Clip-on', 'Sobreposição': 'Total' } },
  { id: 'hinge_blum_soft', name: 'Dobradiça Blumotion', brand: 'Blum', category: 'Dobradiças', subcategory: 'Caneco 35mm', price: 45.00, unit: 'un', description: 'Dobradiça com fechamento suave integrado', specifications: { 'Abertura': '110°', 'Amortecimento': 'Integrado', 'Sobreposição': 'Total' } },
  { id: 'hinge_hettich_soft', name: 'Sensys 8645i', brand: 'Hettich', category: 'Dobradiças', subcategory: 'Caneco 35mm', price: 42.00, unit: 'un', description: 'Dobradiça com fechamento suave Silent System', specifications: { 'Abertura': '110°', 'Sistema': 'Silent System', 'Sobreposição': 'Total' } },
  { id: 'hinge_hafele_155', name: 'Dobradiça 155°', brand: 'Häfele', category: 'Dobradiças', subcategory: 'Caneco 35mm', price: 55.00, unit: 'un', description: 'Dobradiça de grande abertura 155°', specifications: { 'Abertura': '155°', 'Tipo': 'Clip-on', 'Aplicação': 'Portas largas' } },
  
  // Corrediças
  { id: 'slide_blum_tandem', name: 'Tandem 550H', brand: 'Blum', category: 'Corrediças', subcategory: 'Gaveta', price: 185.00, unit: 'par', description: 'Corrediça de extração total com Blumotion', specifications: { 'Extração': 'Total', 'Capacidade': '50kg', 'Blumotion': 'Sim' } },
  { id: 'slide_blum_movento', name: 'Movento 760H', brand: 'Blum', category: 'Corrediças', subcategory: 'Gaveta', price: 245.00, unit: 'par', description: 'Corrediça premium extração total', specifications: { 'Extração': 'Total', 'Capacidade': '60kg', 'Tip-On': 'Compatível' } },
  { id: 'slide_hettich_actro', name: 'Actro 5D', brand: 'Hettich', category: 'Corrediças', subcategory: 'Gaveta', price: 195.00, unit: 'par', description: 'Corrediça 3D com ajuste fino', specifications: { 'Extração': 'Total', 'Ajuste': '3D', 'Capacidade': '40kg' } },
  { id: 'slide_hafele_tele', name: 'Corrediça Telescópica 400mm', brand: 'Häfele', category: 'Corrediças', subcategory: 'Gaveta', price: 45.00, unit: 'par', description: 'Corrediça telescópica standard', specifications: { 'Comprimento': '400mm', 'Capacidade': '35kg', 'Extração': 'Total' } },
  
  // Sistemas de Abertura
  { id: 'lift_blum_aventos', name: 'Aventos HF', brand: 'Blum', category: 'Sistemas de Abertura', subcategory: 'Basculante', price: 320.00, unit: 'kit', description: 'Sistema bi-fold para portas basculantes', specifications: { 'Tipo': 'Bi-fold', 'Altura porta': 'até 1040mm', 'Largura': 'até 1800mm' } },
  { id: 'lift_blum_hk', name: 'Aventos HK-S', brand: 'Blum', category: 'Sistemas de Abertura', subcategory: 'Basculante', price: 185.00, unit: 'kit', description: 'Sistema para portas pequenas basculantes', specifications: { 'Tipo': 'Lift', 'Altura porta': 'até 400mm', 'Softclose': 'Sim' } },
  { id: 'servo_blum', name: 'Servo-Drive', brand: 'Blum', category: 'Sistemas de Abertura', subcategory: 'Elétrico', price: 890.00, unit: 'kit', description: 'Sistema de abertura elétrica por toque', specifications: { 'Tipo': 'Elétrico', 'Acionamento': 'Toque', 'Voltagem': '24V' } },
  
  // Puxadores
  { id: 'handle_bar_160', name: 'Puxador Barra 160mm', brand: 'Häfele', category: 'Puxadores', subcategory: 'Barra', price: 18.00, unit: 'un', description: 'Puxador barra alumínio escovado', specifications: { 'Comprimento': '160mm', 'Material': 'Alumínio', 'Acabamento': 'Escovado' } },
  { id: 'handle_bar_256', name: 'Puxador Barra 256mm', brand: 'Häfele', category: 'Puxadores', subcategory: 'Barra', price: 24.00, unit: 'un', description: 'Puxador barra alumínio escovado', specifications: { 'Comprimento': '256mm', 'Material': 'Alumínio', 'Acabamento': 'Escovado' } },
  { id: 'handle_shell', name: 'Puxador Concha', brand: 'Häfele', category: 'Puxadores', subcategory: 'Concha', price: 12.00, unit: 'un', description: 'Puxador concha embutido', specifications: { 'Tipo': 'Embutido', 'Material': 'Zamak', 'Cor': 'Cromado' } },
  { id: 'handle_gola', name: 'Perfil Gola Alumínio', brand: 'Rehau', category: 'Puxadores', subcategory: 'Perfil', price: 65.00, unit: 'm', description: 'Perfil gola para portas sem puxador', specifications: { 'Material': 'Alumínio', 'Altura': '18mm', 'Cor': 'Anodizado' } },
  
  // Organizadores
  { id: 'org_cutlery', name: 'Organizador Talheres', brand: 'Blum', category: 'Organizadores', subcategory: 'Gaveta', price: 145.00, unit: 'un', description: 'Divisor de talheres para gaveta', specifications: { 'Largura': '450-600mm', 'Material': 'Plástico ABS', 'Compartimentos': '6' } },
  { id: 'org_spice', name: 'Porta Temperos', brand: 'Häfele', category: 'Organizadores', subcategory: 'Interno', price: 85.00, unit: 'un', description: 'Organizador de temperos para porta', specifications: { 'Largura': '300mm', 'Níveis': '3', 'Capacidade': '15 potes' } },
  { id: 'org_waste', name: 'Lixeira Dupla', brand: 'Blum', category: 'Organizadores', subcategory: 'Lixeira', price: 320.00, unit: 'un', description: 'Sistema de lixeira para reciclagem', specifications: { 'Capacidade': '2x15L', 'Extração': 'Com gaveta', 'Material': 'Plástico' } },
  
  // Iluminação
  { id: 'led_strip', name: 'Fita LED 5m', brand: 'Häfele', category: 'Iluminação', subcategory: 'Fita LED', price: 120.00, unit: 'rolo', description: 'Fita LED branco quente 12V', specifications: { 'Comprimento': '5m', 'Cor': '3000K', 'Potência': '14.4W/m' } },
  { id: 'led_spot', name: 'Spot LED Embutir', brand: 'Häfele', category: 'Iluminação', subcategory: 'Spot', price: 45.00, unit: 'un', description: 'Spot LED para embutir em prateleira', specifications: { 'Diâmetro': '68mm', 'Potência': '3W', 'Cor': '4000K' } },
  { id: 'sensor_door', name: 'Sensor Porta LED', brand: 'Häfele', category: 'Iluminação', subcategory: 'Sensor', price: 28.00, unit: 'un', description: 'Sensor magnético para acionar LED ao abrir', specifications: { 'Tipo': 'Magnético', 'Voltagem': '12V', 'Corrente': '2A' } },
  
  // Prateleiras
  { id: 'shelf_support', name: 'Suporte Prateleira', brand: 'Häfele', category: 'Prateleiras', subcategory: 'Suporte', price: 1.50, unit: 'un', description: 'Pino suporte para prateleira 5mm', specifications: { 'Diâmetro': '5mm', 'Material': 'Aço niquelado', 'Capacidade': '15kg' } },
  { id: 'shelf_glass', name: 'Suporte Vidro', brand: 'Häfele', category: 'Prateleiras', subcategory: 'Suporte', price: 8.00, unit: 'un', description: 'Suporte para prateleira de vidro', specifications: { 'Espessura vidro': '6-8mm', 'Material': 'Zamak', 'Acabamento': 'Cromado' } },
  { id: 'shelf_rail', name: 'Trilho Cremalheira', brand: 'Häfele', category: 'Prateleiras', subcategory: 'Sistema', price: 35.00, unit: 'm', description: 'Trilho cremalheira para prateleiras ajustáveis', specifications: { 'Passo': '32mm', 'Material': 'Aço', 'Cor': 'Branco' } },
];

const CATEGORIES = ['Todos', 'Dobradiças', 'Corrediças', 'Sistemas de Abertura', 'Puxadores', 'Organizadores', 'Iluminação', 'Prateleiras'];
const BRANDS = ['Todas', 'Blum', 'Hettich', 'Häfele', 'Rehau'];

const HardwareCatalog: React.FC<HardwareCatalogProps> = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedBrand, setSelectedBrand] = useState('Todas');
  const [cart, setCart] = useState<Map<string, number>>(new Map());

  const filteredItems = useMemo(() => {
    return HARDWARE_CATALOG.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
      const matchesBrand = selectedBrand === 'Todas' || item.brand === selectedBrand;
      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [searchTerm, selectedCategory, selectedBrand]);

  const addToCart = (item: HardwareItem) => {
    setCart(prev => {
      const newCart = new Map(prev);
      newCart.set(item.id, (prev.get(item.id) || 0) + 1);
      return newCart;
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = new Map(prev);
      const qty = prev.get(itemId) || 0;
      if (qty > 1) {
        newCart.set(itemId, qty - 1);
      } else {
        newCart.delete(itemId);
      }
      return newCart;
    });
  };

  const cartTotal = useMemo(() => {
    let total = 0;
    cart.forEach((qty, id) => {
      const item = HARDWARE_CATALOG.find(i => i.id === id);
      if (item) total += item.price * qty;
    });
    return total;
  }, [cart]);

  const cartItemCount = useMemo(() => {
    let count = 0;
    cart.forEach(qty => count += qty);
    return count;
  }, [cart]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] border border-amber-500/30 rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 flex items-center justify-between">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Package size={18} />
            Catálogo de Ferragens
          </h2>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 px-3 py-1 rounded flex items-center gap-2">
              <ShoppingCart size={14} className="text-white" />
              <span className="text-white text-sm font-bold">{cartItemCount} itens</span>
              <span className="text-white/70 text-sm">R$ {cartTotal.toFixed(2)}</span>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-3 bg-[#16213e] border-b border-amber-500/20 flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/50" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar ferragens..."
              className="w-full bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs pl-9 pr-3 py-2 rounded"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={12} className="text-amber-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-2 py-2 rounded"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-2 py-2 rounded"
            >
              {BRANDS.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredItems.map(item => {
              const inCart = cart.get(item.id) || 0;
              
              return (
                <div
                  key={item.id}
                  className={`bg-[#16213e] border rounded-lg p-3 transition-colors ${
                    inCart > 0 ? 'border-green-500/50' : 'border-amber-500/20 hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[9px] text-blue-400 font-bold">{item.brand}</span>
                      <h4 className="text-amber-100 text-sm font-medium">{item.name}</h4>
                      <span className="text-[10px] text-amber-400/60">{item.category} › {item.subcategory}</span>
                    </div>
                    <span className="text-green-400 font-bold text-sm">
                      R$ {item.price.toFixed(2)}
                      <span className="text-[9px] text-amber-300/50">/{item.unit}</span>
                    </span>
                  </div>
                  
                  <p className="text-[10px] text-amber-300/70 mb-2">{item.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {Object.entries(item.specifications).slice(0, 3).map(([key, value]) => (
                      <span key={key} className="text-[9px] bg-[#0f0f23] px-1.5 py-0.5 rounded text-amber-300/80">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {inCart > 0 ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-6 h-6 bg-red-500/20 hover:bg-red-500/40 rounded text-red-400 text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="text-amber-100 font-bold text-sm w-6 text-center">{inCart}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-6 h-6 bg-green-500/20 hover:bg-green-500/40 rounded text-green-400 text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded text-blue-400 text-xs flex items-center gap-1"
                      >
                        <ShoppingCart size={10} />
                        Adicionar
                      </button>
                    )}
                    
                    <button
                      onClick={() => onSelect(item)}
                      className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/30 rounded text-amber-400 text-xs flex items-center gap-1"
                    >
                      <Check size={10} />
                      Aplicar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-amber-300/50">
              <Package size={48} className="mx-auto mb-3 opacity-50" />
              <p>Nenhuma ferragem encontrada</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#16213e] border-t border-amber-500/20 flex justify-between items-center">
          <div className="text-xs text-amber-300/70">
            <p>{filteredItems.length} itens encontrados</p>
            <p className="text-[10px]">Preços de referência - consulte seu fornecedor</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
            >
              Fechar
            </button>
            {cartItemCount > 0 && (
              <button
                onClick={() => {
                  // Export cart
                  const cartItems = Array.from(cart.entries()).map(([id, qty]) => {
                    const item = HARDWARE_CATALOG.find(i => i.id === id);
                    return { ...item, quantity: qty };
                  });
                  const blob = new Blob([JSON.stringify(cartItems, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'lista_ferragens.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded text-sm font-bold flex items-center gap-2"
              >
                <ExternalLink size={14} />
                Exportar Lista
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HardwareCatalog;
