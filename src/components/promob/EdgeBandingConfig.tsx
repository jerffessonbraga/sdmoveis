import React, { useState } from 'react';
import { FurnitureModule } from '@/types';
import { X, Check, Layers } from 'lucide-react';

interface EdgeBandingConfigProps {
  module: FurnitureModule;
  onSave: (config: EdgeConfig) => void;
  onClose: () => void;
}

interface EdgeConfig {
  front: EdgeType;
  back: EdgeType;
  left: EdgeType;
  right: EdgeType;
  top: EdgeType;
  bottom: EdgeType;
}

type EdgeType = 'none' | 'pvc_1mm' | 'pvc_2mm' | 'abs_1mm' | 'abs_2mm' | 'wood_veneer' | 'aluminum';

const EDGE_TYPES: { value: EdgeType; label: string; price: number; color: string }[] = [
  { value: 'none', label: 'Sem borda', price: 0, color: '#e5e5e5' },
  { value: 'pvc_1mm', label: 'PVC 1mm', price: 1.50, color: '#f0f0f0' },
  { value: 'pvc_2mm', label: 'PVC 2mm', price: 2.50, color: '#f5f5f5' },
  { value: 'abs_1mm', label: 'ABS 1mm', price: 2.00, color: '#fafafa' },
  { value: 'abs_2mm', label: 'ABS 2mm', price: 3.50, color: '#ffffff' },
  { value: 'wood_veneer', label: 'Lâmina Natural', price: 8.00, color: '#d4a574' },
  { value: 'aluminum', label: 'Alumínio', price: 12.00, color: '#c0c0c0' },
];

const EdgeBandingConfig: React.FC<EdgeBandingConfigProps> = ({ module, onSave, onClose }) => {
  const [config, setConfig] = useState<EdgeConfig>({
    front: 'pvc_2mm',
    back: 'none',
    left: 'pvc_1mm',
    right: 'pvc_1mm',
    top: 'pvc_2mm',
    bottom: 'none',
  });
  
  const [selectedFace, setSelectedFace] = useState<keyof EdgeConfig>('front');
  
  // Calculate total edge length and cost
  const calculateEdgeCost = () => {
    const edges = {
      front: { length: module.width + module.height * 2 },
      back: { length: module.width + module.height * 2 },
      left: { length: module.depth + module.height * 2 },
      right: { length: module.depth + module.height * 2 },
      top: { length: module.width * 2 + module.depth * 2 },
      bottom: { length: module.width * 2 + module.depth * 2 },
    };
    
    let totalLength = 0;
    let totalCost = 0;
    
    Object.entries(config).forEach(([face, edgeType]) => {
      const length = edges[face as keyof typeof edges].length / 1000; // Convert to meters
      const edgeInfo = EDGE_TYPES.find(e => e.value === edgeType);
      if (edgeInfo && edgeType !== 'none') {
        totalLength += length;
        totalCost += length * edgeInfo.price;
      }
    });
    
    return { totalLength: totalLength.toFixed(2), totalCost: totalCost.toFixed(2) };
  };
  
  const { totalLength, totalCost } = calculateEdgeCost();
  
  const handleEdgeChange = (edgeType: EdgeType) => {
    setConfig(prev => ({ ...prev, [selectedFace]: edgeType }));
  };
  
  const applyToAll = (edgeType: EdgeType) => {
    setConfig({
      front: edgeType,
      back: edgeType,
      left: edgeType,
      right: edgeType,
      top: edgeType,
      bottom: edgeType,
    });
  };
  
  const applyToVisible = () => {
    setConfig(prev => ({
      ...prev,
      front: 'pvc_2mm',
      top: 'pvc_2mm',
      left: 'pvc_1mm',
      right: 'pvc_1mm',
      back: 'none',
      bottom: 'none',
    }));
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-3 flex items-center justify-between">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Layers size={18} />
            Configurador de Bordas - {module.type}
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 flex gap-4">
          {/* 3D Preview */}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-700 mb-3">Visualização</h3>
            <div className="bg-gray-100 rounded-lg p-4 h-64 flex items-center justify-center">
              {/* Simplified 3D box representation */}
              <svg width="200" height="200" viewBox="0 0 200 200">
                {/* Isometric box */}
                <g transform="translate(100, 100)">
                  {/* Top face */}
                  <polygon
                    points="0,-60 60,-30 0,0 -60,-30"
                    fill={EDGE_TYPES.find(e => e.value === config.top)?.color || '#e5e5e5'}
                    stroke={config.top !== 'none' ? '#8b7355' : '#ccc'}
                    strokeWidth={selectedFace === 'top' ? 3 : 1}
                    onClick={() => setSelectedFace('top')}
                    style={{ cursor: 'pointer' }}
                  />
                  
                  {/* Front face */}
                  <polygon
                    points="0,0 60,-30 60,30 0,60"
                    fill={EDGE_TYPES.find(e => e.value === config.front)?.color || '#e5e5e5'}
                    stroke={config.front !== 'none' ? '#8b7355' : '#ccc'}
                    strokeWidth={selectedFace === 'front' ? 3 : 1}
                    onClick={() => setSelectedFace('front')}
                    style={{ cursor: 'pointer' }}
                  />
                  
                  {/* Left face */}
                  <polygon
                    points="0,0 -60,-30 -60,30 0,60"
                    fill={EDGE_TYPES.find(e => e.value === config.left)?.color || '#e5e5e5'}
                    stroke={config.left !== 'none' ? '#8b7355' : '#ccc'}
                    strokeWidth={selectedFace === 'left' ? 3 : 1}
                    onClick={() => setSelectedFace('left')}
                    style={{ cursor: 'pointer' }}
                  />
                  
                  {/* Labels */}
                  <text x="30" y="-10" fontSize="10" fill="#666" textAnchor="middle">Frente</text>
                  <text x="-30" y="-10" fontSize="10" fill="#666" textAnchor="middle">Esq</text>
                  <text x="0" y="-45" fontSize="10" fill="#666" textAnchor="middle">Topo</text>
                </g>
              </svg>
            </div>
            
            {/* Face selection buttons */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {(['front', 'back', 'left', 'right', 'top', 'bottom'] as const).map(face => (
                <button
                  key={face}
                  onClick={() => setSelectedFace(face)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    selectedFace === face
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {face === 'front' ? 'Frente' : 
                   face === 'back' ? 'Fundo' : 
                   face === 'left' ? 'Esquerda' : 
                   face === 'right' ? 'Direita' :
                   face === 'top' ? 'Topo' : 'Base'}
                  <span className="block text-xs opacity-70">
                    {EDGE_TYPES.find(e => e.value === config[face])?.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Edge Type Selection */}
          <div className="w-64">
            <h3 className="font-semibold text-gray-700 mb-3">
              Tipo de Borda - {selectedFace === 'front' ? 'Frente' : 
                             selectedFace === 'back' ? 'Fundo' : 
                             selectedFace === 'left' ? 'Esquerda' : 
                             selectedFace === 'right' ? 'Direita' :
                             selectedFace === 'top' ? 'Topo' : 'Base'}
            </h3>
            
            <div className="space-y-2">
              {EDGE_TYPES.map(edge => (
                <button
                  key={edge.value}
                  onClick={() => handleEdgeChange(edge.value)}
                  className={`w-full flex items-center gap-3 p-2 rounded border transition-colors ${
                    config[selectedFace] === edge.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: edge.color }}
                  />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{edge.label}</p>
                    {edge.price > 0 && (
                      <p className="text-xs text-gray-500">R$ {edge.price.toFixed(2)}/m</p>
                    )}
                  </div>
                  {config[selectedFace] === edge.value && (
                    <Check size={16} className="text-purple-600" />
                  )}
                </button>
              ))}
            </div>
            
            <hr className="my-4" />
            
            {/* Quick actions */}
            <div className="space-y-2">
              <button
                onClick={applyToVisible}
                className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                Aplicar padrão (visíveis)
              </button>
              <button
                onClick={() => applyToAll('pvc_1mm')}
                className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
              >
                PVC 1mm em todas
              </button>
            </div>
            
            <hr className="my-4" />
            
            {/* Summary */}
            <div className="bg-gray-50 rounded p-3">
              <h4 className="font-medium text-gray-700 mb-2">Resumo</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Comprimento total: {totalLength}m</p>
                <p className="font-bold text-purple-600">Custo: R$ {totalCost}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={() => { onSave(config); onClose(); }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-sm font-medium"
          >
            Salvar Configuração
          </button>
        </div>
      </div>
    </div>
  );
};

export default EdgeBandingConfig;
