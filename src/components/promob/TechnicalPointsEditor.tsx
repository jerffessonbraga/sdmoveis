import React, { useState } from 'react';
import { X, Plus, Trash2, Lightbulb, Droplets, Flame, Zap, MapPin, Save } from 'lucide-react';

interface TechnicalPointsEditorProps {
  floorWidth: number;
  floorDepth: number;
  points: TechnicalPoint[];
  onSave: (points: TechnicalPoint[]) => void;
  onClose: () => void;
}

export interface TechnicalPoint {
  id: string;
  type: 'electrical' | 'water' | 'gas' | 'drain' | 'switch' | 'outlet';
  x: number; // mm from left
  z: number; // mm from back
  y: number; // height from floor
  label: string;
  voltage?: number; // for electrical
  amperage?: number;
  diameter?: number; // for pipes
}

const POINT_TYPES = [
  { type: 'outlet', label: 'Tomada', icon: Zap, color: '#f59e0b', defaultY: 400 },
  { type: 'switch', label: 'Interruptor', icon: Lightbulb, color: '#eab308', defaultY: 1100 },
  { type: 'electrical', label: 'Ponto Elétrico', icon: Zap, color: '#ef4444', defaultY: 2200 },
  { type: 'water', label: 'Água Fria', icon: Droplets, color: '#3b82f6', defaultY: 600 },
  { type: 'drain', label: 'Esgoto', icon: Droplets, color: '#6b7280', defaultY: 0 },
  { type: 'gas', label: 'Gás', icon: Flame, color: '#f97316', defaultY: 400 },
] as const;

const TechnicalPointsEditor: React.FC<TechnicalPointsEditorProps> = ({
  floorWidth,
  floorDepth,
  points,
  onSave,
  onClose,
}) => {
  const [localPoints, setLocalPoints] = useState<TechnicalPoint[]>(points);
  const [selectedType, setSelectedType] = useState<TechnicalPoint['type']>('outlet');
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [isAddingMode, setIsAddingMode] = useState(false);

  const addPoint = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isAddingMode) return;
    
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * floorWidth;
    const z = ((e.clientY - rect.top) / rect.height) * floorDepth;
    
    const typeConfig = POINT_TYPES.find(t => t.type === selectedType);
    
    const newPoint: TechnicalPoint = {
      id: `point_${Date.now()}`,
      type: selectedType,
      x: Math.round(x),
      z: Math.round(z),
      y: typeConfig?.defaultY || 400,
      label: typeConfig?.label || 'Ponto',
    };
    
    setLocalPoints(prev => [...prev, newPoint]);
    setIsAddingMode(false);
  };

  const updatePoint = (id: string, updates: Partial<TechnicalPoint>) => {
    setLocalPoints(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const deletePoint = (id: string) => {
    setLocalPoints(prev => prev.filter(p => p.id !== id));
    if (selectedPoint === id) setSelectedPoint(null);
  };

  const getPointIcon = (type: TechnicalPoint['type']) => {
    const config = POINT_TYPES.find(t => t.type === type);
    return config?.icon || MapPin;
  };

  const getPointColor = (type: TechnicalPoint['type']) => {
    const config = POINT_TYPES.find(t => t.type === type);
    return config?.color || '#888';
  };

  const handleSave = () => {
    onSave(localPoints);
    onClose();
  };

  // SVG scale
  const svgWidth = 500;
  const svgHeight = (floorDepth / floorWidth) * svgWidth;
  const scale = svgWidth / floorWidth;

  const selected = localPoints.find(p => p.id === selectedPoint);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] border border-amber-500/30 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 px-4 py-3 flex items-center justify-between">
          <h2 className="text-white font-bold flex items-center gap-2">
            <MapPin size={18} />
            Pontos Técnicos (Elétrica, Hidráulica, Gás)
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 flex gap-4">
          {/* Left: Tools */}
          <div className="w-56 space-y-3">
            {/* Point Type Selector */}
            <div className="bg-[#16213e] p-3 rounded border border-amber-500/20">
              <h3 className="text-amber-400 text-sm font-bold mb-2">Tipo de Ponto</h3>
              <div className="grid grid-cols-2 gap-1">
                {POINT_TYPES.map(pt => {
                  const Icon = pt.icon;
                  return (
                    <button
                      key={pt.type}
                      onClick={() => setSelectedType(pt.type)}
                      className={`p-2 rounded text-xs flex flex-col items-center gap-1 transition-colors ${
                        selectedType === pt.type
                          ? 'bg-amber-500/30 border border-amber-500'
                          : 'bg-[#0f0f23] border border-transparent hover:border-amber-500/30'
                      }`}
                    >
                      <Icon size={16} style={{ color: pt.color }} />
                      <span className="text-amber-100">{pt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Point Button */}
            <button
              onClick={() => setIsAddingMode(!isAddingMode)}
              className={`w-full py-2 rounded text-sm font-bold flex items-center justify-center gap-2 ${
                isAddingMode
                  ? 'bg-green-600 text-white'
                  : 'bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/30 text-cyan-400'
              }`}
            >
              <Plus size={14} />
              {isAddingMode ? 'Clique no mapa...' : 'Adicionar Ponto'}
            </button>

            {/* Selected Point Properties */}
            {selected && (
              <div className="bg-[#16213e] p-3 rounded border border-amber-500/20">
                <h3 className="text-amber-400 text-sm font-bold mb-2 flex items-center justify-between">
                  Propriedades
                  <button
                    onClick={() => deletePoint(selected.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={14} />
                  </button>
                </h3>
                
                <div className="space-y-2">
                  <div>
                    <label className="text-amber-300/70 text-[10px]">Descrição</label>
                    <input
                      type="text"
                      value={selected.label}
                      onChange={(e) => updatePoint(selected.id, { label: e.target.value })}
                      className="w-full bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-2 py-1.5 rounded"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-amber-300/70 text-[10px]">X (mm)</label>
                      <input
                        type="number"
                        value={selected.x}
                        onChange={(e) => updatePoint(selected.id, { x: Number(e.target.value) })}
                        className="w-full bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-2 py-1.5 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-amber-300/70 text-[10px]">Z (mm)</label>
                      <input
                        type="number"
                        value={selected.z}
                        onChange={(e) => updatePoint(selected.id, { z: Number(e.target.value) })}
                        className="w-full bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-2 py-1.5 rounded"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-amber-300/70 text-[10px]">Altura do piso (mm)</label>
                    <input
                      type="number"
                      value={selected.y}
                      onChange={(e) => updatePoint(selected.id, { y: Number(e.target.value) })}
                      className="w-full bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-2 py-1.5 rounded"
                    />
                  </div>

                  {(selected.type === 'outlet' || selected.type === 'electrical') && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-amber-300/70 text-[10px]">Voltagem</label>
                        <select
                          value={selected.voltage || 220}
                          onChange={(e) => updatePoint(selected.id, { voltage: Number(e.target.value) })}
                          className="w-full bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-2 py-1.5 rounded"
                        >
                          <option value={110}>110V</option>
                          <option value={220}>220V</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-amber-300/70 text-[10px]">Amperagem</label>
                        <select
                          value={selected.amperage || 10}
                          onChange={(e) => updatePoint(selected.id, { amperage: Number(e.target.value) })}
                          className="w-full bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-2 py-1.5 rounded"
                        >
                          <option value={10}>10A</option>
                          <option value={20}>20A</option>
                          <option value={32}>32A</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {(selected.type === 'water' || selected.type === 'drain' || selected.type === 'gas') && (
                    <div>
                      <label className="text-amber-300/70 text-[10px]">Diâmetro (mm)</label>
                      <select
                        value={selected.diameter || 25}
                        onChange={(e) => updatePoint(selected.id, { diameter: Number(e.target.value) })}
                        className="w-full bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-2 py-1.5 rounded"
                      >
                        <option value={20}>20mm (1/2")</option>
                        <option value={25}>25mm (3/4")</option>
                        <option value={32}>32mm (1")</option>
                        <option value={40}>40mm</option>
                        <option value={50}>50mm</option>
                        <option value={100}>100mm</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Points List */}
            <div className="bg-[#16213e] p-3 rounded border border-amber-500/20">
              <h3 className="text-amber-400 text-sm font-bold mb-2">
                Pontos ({localPoints.length})
              </h3>
              <div className="space-y-1 max-h-40 overflow-auto">
                {localPoints.map(point => {
                  const Icon = getPointIcon(point.type);
                  return (
                    <button
                      key={point.id}
                      onClick={() => setSelectedPoint(point.id)}
                      className={`w-full p-1.5 rounded text-xs flex items-center gap-2 ${
                        selectedPoint === point.id
                          ? 'bg-amber-500/20'
                          : 'bg-[#0f0f23] hover:bg-amber-500/10'
                      }`}
                    >
                      <Icon size={12} style={{ color: getPointColor(point.type) }} />
                      <span className="text-amber-100 truncate flex-1 text-left">{point.label}</span>
                      <span className="text-amber-300/50">{point.y}mm</span>
                    </button>
                  );
                })}
                {localPoints.length === 0 && (
                  <p className="text-amber-300/50 text-xs text-center py-2">Nenhum ponto</p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Floor Plan View */}
          <div className="flex-1 bg-[#0f0f23] rounded-lg p-3 border border-amber-500/10">
            <h3 className="text-amber-400 text-sm font-bold mb-2">
              Vista Superior ({(floorWidth / 1000).toFixed(1)}m × {(floorDepth / 1000).toFixed(1)}m)
            </h3>
            
            <svg
              width={svgWidth}
              height={svgHeight}
              className={`bg-white rounded ${isAddingMode ? 'cursor-crosshair' : 'cursor-pointer'}`}
              onClick={addPoint}
            >
              {/* Grid */}
              <defs>
                <pattern id="techGrid" width={scale * 500} height={scale * 500} patternUnits="userSpaceOnUse">
                  <path 
                    d={`M ${scale * 500} 0 L 0 0 0 ${scale * 500}`} 
                    fill="none" 
                    stroke="#e5e5e5" 
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width={svgWidth} height={svgHeight} fill="url(#techGrid)" />

              {/* Room outline */}
              <rect
                x={1}
                y={1}
                width={svgWidth - 2}
                height={svgHeight - 2}
                fill="none"
                stroke="#333"
                strokeWidth="2"
              />

              {/* Points */}
              {localPoints.map(point => {
                const Icon = getPointIcon(point.type);
                const color = getPointColor(point.type);
                const px = point.x * scale;
                const py = point.z * scale;
                const isSelected = selectedPoint === point.id;
                
                return (
                  <g
                    key={point.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedPoint(point.id); }}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Selection ring */}
                    {isSelected && (
                      <circle
                        cx={px}
                        cy={py}
                        r={16}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeDasharray="4,2"
                      />
                    )}
                    
                    {/* Point marker */}
                    <circle
                      cx={px}
                      cy={py}
                      r={10}
                      fill={color}
                      fillOpacity={0.3}
                      stroke={color}
                      strokeWidth="2"
                    />
                    
                    {/* Icon placeholder (text) */}
                    <text
                      x={px}
                      y={py + 4}
                      textAnchor="middle"
                      fontSize="10"
                      fill={color}
                      fontWeight="bold"
                    >
                      {point.type === 'outlet' ? '⚡' : 
                       point.type === 'water' ? '💧' :
                       point.type === 'gas' ? '🔥' :
                       point.type === 'drain' ? '○' :
                       point.type === 'switch' ? '💡' : '•'}
                    </text>
                    
                    {/* Label */}
                    <text
                      x={px}
                      y={py + 22}
                      textAnchor="middle"
                      fontSize="8"
                      fill="#666"
                    >
                      {point.label}
                    </text>
                  </g>
                );
              })}

              {/* Dimension labels */}
              <text x={svgWidth / 2} y={svgHeight + 15} textAnchor="middle" fontSize="10" fill="#666">
                {(floorWidth / 1000).toFixed(2)}m
              </text>
            </svg>

            {isAddingMode && (
              <p className="text-green-400 text-xs mt-2 animate-pulse">
                ✓ Clique no mapa para adicionar um ponto de {POINT_TYPES.find(t => t.type === selectedType)?.label}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#16213e] border-t border-amber-500/20 flex justify-between items-center">
          <p className="text-amber-300/70 text-xs">
            {localPoints.filter(p => p.type === 'outlet' || p.type === 'switch' || p.type === 'electrical').length} pontos elétricos, {' '}
            {localPoints.filter(p => p.type === 'water' || p.type === 'drain').length} hidráulicos, {' '}
            {localPoints.filter(p => p.type === 'gas').length} gás
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-sm font-bold flex items-center gap-2"
            >
              <Save size={14} />
              Salvar Pontos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalPointsEditor;
