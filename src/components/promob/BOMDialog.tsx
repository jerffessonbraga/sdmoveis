import React, { useMemo } from 'react';
import { FurnitureModule } from '@/types';
import { 
  Printer, 
  Download, 
  X, 
  Package, 
  Layers, 
  Wrench,
  DollarSign 
} from 'lucide-react';

interface BOMDialogProps {
  modules: FurnitureModule[];
  projectName: string;
  clientName: string;
  onClose: () => void;
}

interface BoardItem {
  material: string;
  thickness: number;
  quantity: number;
  totalArea: number; // m²
}

interface HardwareItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

const BOMDialog: React.FC<BOMDialogProps> = ({
  modules,
  projectName,
  clientName,
  onClose,
}) => {
  // Calcular lista de chapas
  const boards = useMemo(() => {
    const boardMap = new Map<string, BoardItem>();
    
    modules.forEach(module => {
      if (module.isAppliance) return;
      
      const material = module.finish || 'Branco Tx';
      const key = `${material}-18`;
      
      // Área aproximada do módulo (todas as faces)
      const areaM2 = (
        (module.width * module.height * 2) + // laterais
        (module.width * module.depth * 2) + // top/bottom
        (module.height * module.depth * 2)   // frente/fundo
      ) / 1000000;
      
      if (boardMap.has(key)) {
        const item = boardMap.get(key)!;
        item.quantity += 1;
        item.totalArea += areaM2;
      } else {
        boardMap.set(key, {
          material,
          thickness: 18,
          quantity: 1,
          totalArea: areaM2,
        });
      }
    });
    
    return Array.from(boardMap.values());
  }, [modules]);
  
  // Calcular ferragens
  const hardware = useMemo(() => {
    const items: HardwareItem[] = [];
    let totalHinges = 0;
    let totalSlides = 0;
    let totalHandles = 0;
    let totalShelves = 0;
    
    modules.forEach(module => {
      if (module.isAppliance) return;
      
      const type = module.type.toLowerCase();
      const w = module.width;
      
      // Dobradiças (2 por porta)
      if (type.includes('1p')) { totalHinges += 2; totalHandles += 1; }
      else if (type.includes('2p')) { totalHinges += 4; totalHandles += 2; }
      else if (type.includes('3p')) { totalHinges += 6; totalHandles += 3; }
      else if (type.includes('4p')) { totalHinges += 8; totalHandles += 4; }
      
      // Corrediças (2 por gaveta)
      if (type.includes('gaveta')) {
        const numDrawers = parseInt(type.match(/\d/)?.[0] || '4');
        totalSlides += numDrawers * 2;
        totalHandles += numDrawers;
      }
      
      // Prateleiras (estimativa)
      if (!type.includes('gaveta') && !type.includes('criado')) {
        totalShelves += Math.max(1, Math.floor(module.height / 400) - 1);
      }
    });
    
    if (totalHinges > 0) {
      items.push({ name: 'Dobradiça Caneco 35mm', quantity: totalHinges, unitPrice: 8.50 });
    }
    if (totalSlides > 0) {
      items.push({ name: 'Corrediça Telescópica 400mm', quantity: totalSlides, unitPrice: 35.00 });
    }
    if (totalHandles > 0) {
      items.push({ name: 'Puxador Alumínio 160mm', quantity: totalHandles, unitPrice: 15.00 });
    }
    if (totalShelves > 0) {
      items.push({ name: 'Suporte Prateleira (kit 4un)', quantity: Math.ceil(totalShelves), unitPrice: 6.00 });
    }
    
    // Itens fixos
    items.push({ name: 'Parafuso 4x40mm (cx 100un)', quantity: Math.ceil(modules.length / 3), unitPrice: 25.00 });
    items.push({ name: 'Minifix (kit 10un)', quantity: Math.ceil(modules.length / 2), unitPrice: 18.00 });
    items.push({ name: 'Cavilha 8x30mm (cx 100un)', quantity: 1, unitPrice: 12.00 });
    
    return items;
  }, [modules]);
  
  // Calcular fita de borda
  const edgeBanding = useMemo(() => {
    let totalMeters = 0;
    
    modules.forEach(module => {
      if (module.isAppliance) return;
      
      // Perímetro de todas as peças visíveis (estimativa)
      const perimeter = (
        (module.width * 2 + module.height * 2) * 2 + // frente/fundo
        (module.width * 2 + module.depth * 2) * 2    // top/bottom
      ) / 1000;
      
      totalMeters += perimeter * 0.4; // 40% das bordas são visíveis
    });
    
    return Math.ceil(totalMeters);
  }, [modules]);
  
  // Totais
  const totalModulesValue = modules.reduce((sum, m) => sum + m.price, 0);
  const totalHardwareValue = hardware.reduce((sum, h) => sum + (h.quantity * h.unitPrice), 0);
  const boardCost = boards.reduce((sum, b) => sum + (Math.ceil(b.totalArea / 2.75) * 180), 0); // R$180/chapa
  const edgeCost = edgeBanding * 2.5; // R$2.50/metro
  
  const grandTotal = totalModulesValue; // já inclui tudo no preço do módulo
  
  const handlePrint = () => window.print();
  
  const handleExport = () => {
    const data = {
      project: projectName,
      client: clientName,
      date: new Date().toLocaleDateString('pt-BR'),
      modules: modules.map(m => ({
        type: m.type,
        dimensions: `${m.width}x${m.height}x${m.depth}mm`,
        finish: m.finish,
        price: m.price,
      })),
      boards,
      hardware,
      edgeBanding,
      totals: {
        modules: totalModulesValue,
        estimated: grandTotal,
      },
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BOM_${projectName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] border border-amber-500/30 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-3 flex items-center justify-between">
          <h2 className="text-amber-950 font-bold flex items-center gap-2">
            <Package size={18} />
            Lista de Materiais (BOM)
          </h2>
          <button onClick={onClose} className="text-amber-900 hover:text-amber-950">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 overflow-auto max-h-[calc(90vh-120px)]">
          {/* Project Info */}
          <div className="bg-[#16213e] p-3 rounded mb-4 border border-amber-500/20">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-amber-100">{projectName}</h3>
                <p className="text-amber-300/70 text-sm">Cliente: {clientName}</p>
              </div>
              <p className="text-amber-400/60 text-sm">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
          
          {/* Módulos */}
          <div className="mb-4">
            <h4 className="font-bold text-amber-400 mb-2 flex items-center gap-2">
              <Layers size={16} />
              Módulos ({modules.length})
            </h4>
            <div className="overflow-x-auto">
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
                  {modules.filter(m => !m.isAppliance).map(m => (
                    <tr key={m.id} className="border-b border-amber-500/10">
                      <td className="p-2 text-amber-100">{m.type}</td>
                      <td className="p-2 text-amber-300/70">{m.width}×{m.height}×{m.depth}mm</td>
                      <td className="p-2 text-amber-300/70">{m.finish}</td>
                      <td className="p-2 text-right font-medium text-amber-100">R$ {m.price.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-amber-500/10">
                  <tr>
                    <td colSpan={3} className="p-2 font-bold text-amber-100">Subtotal Módulos</td>
                    <td className="p-2 text-right font-bold text-amber-400">R$ {totalModulesValue.toLocaleString('pt-BR')}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          {/* Chapas */}
          <div className="mb-4">
            <h4 className="font-bold text-amber-400 mb-2 flex items-center gap-2">
              <Package size={16} />
              Chapas Necessárias (estimativa)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#16213e]">
                  <tr>
                    <th className="p-2 text-left text-amber-300">Material</th>
                    <th className="p-2 text-left text-amber-300">Espessura</th>
                    <th className="p-2 text-right text-amber-300">Área Total</th>
                    <th className="p-2 text-right text-amber-300">Chapas (2,75m²)</th>
                  </tr>
                </thead>
                <tbody>
                  {boards.map((b, i) => (
                    <tr key={i} className="border-b border-amber-500/10">
                      <td className="p-2 text-amber-100">{b.material}</td>
                      <td className="p-2 text-amber-300/70">{b.thickness}mm</td>
                      <td className="p-2 text-right text-amber-300/70">{b.totalArea.toFixed(2)} m²</td>
                      <td className="p-2 text-right font-medium text-amber-100">{Math.ceil(b.totalArea / 2.75)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Ferragens */}
          <div className="mb-4">
            <h4 className="font-bold text-amber-400 mb-2 flex items-center gap-2">
              <Wrench size={16} />
              Ferragens e Acessórios
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#16213e]">
                  <tr>
                    <th className="p-2 text-left text-amber-300">Item</th>
                    <th className="p-2 text-right text-amber-300">Qtd</th>
                    <th className="p-2 text-right text-amber-300">Unit.</th>
                    <th className="p-2 text-right text-amber-300">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {hardware.map((h, i) => (
                    <tr key={i} className="border-b border-amber-500/10">
                      <td className="p-2 text-amber-100">{h.name}</td>
                      <td className="p-2 text-right text-amber-300/70">{h.quantity}</td>
                      <td className="p-2 text-right text-amber-300/70">R$ {h.unitPrice.toFixed(2)}</td>
                      <td className="p-2 text-right font-medium text-amber-100">R$ {(h.quantity * h.unitPrice).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="border-b border-amber-500/10">
                    <td className="p-2 text-amber-100">Fita de Borda 22mm</td>
                    <td className="p-2 text-right text-amber-300/70">{edgeBanding}m</td>
                    <td className="p-2 text-right text-amber-300/70">R$ 2,50</td>
                    <td className="p-2 text-right font-medium text-amber-100">R$ {edgeCost.toFixed(2)}</td>
                  </tr>
                </tbody>
                <tfoot className="bg-amber-500/10">
                  <tr>
                    <td colSpan={3} className="p-2 font-bold text-amber-100">Subtotal Ferragens</td>
                    <td className="p-2 text-right font-bold text-amber-400">R$ {(totalHardwareValue + edgeCost).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          {/* Total Geral */}
          <div className="bg-gradient-to-r from-amber-600/20 to-amber-500/20 p-4 rounded-lg border border-amber-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign size={24} className="text-amber-400" />
                <div>
                  <p className="text-amber-300/70 text-sm">Valor Total do Projeto</p>
                  <p className="text-2xl font-bold text-amber-400">R$ {grandTotal.toLocaleString('pt-BR')}</p>
                </div>
              </div>
              <div className="text-right text-sm text-amber-300/60">
                <p>Módulos: R$ {totalModulesValue.toLocaleString()}</p>
                <p className="text-xs">(valores inclusos no preço dos módulos)</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-[#16213e] border-t border-amber-500/20 flex justify-end gap-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
          >
            Fechar
          </button>
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-amber-950 rounded text-sm font-bold flex items-center gap-2"
          >
            <Download size={14} />
            Exportar
          </button>
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-amber-950 rounded text-sm font-bold flex items-center gap-2"
          >
            <Printer size={14} />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};

export default BOMDialog;
