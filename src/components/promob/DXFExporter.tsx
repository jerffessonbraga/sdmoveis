import React, { useState } from 'react';
import { FurnitureModule } from '@/types';
import { X, Download, FileCode, Settings, Check, Layers } from 'lucide-react';

interface DXFExporterProps {
  modules: FurnitureModule[];
  projectName: string;
  floorWidth: number;
  floorDepth: number;
  onClose: () => void;
}

interface ExportSettings {
  includeHiddenLines: boolean;
  includeDimensions: boolean;
  includeLabels: boolean;
  scale: '1:1' | '1:10' | '1:20' | '1:50' | '1:100';
  units: 'mm' | 'cm' | 'm';
  layers: {
    modules: boolean;
    dimensions: boolean;
    labels: boolean;
    hardware: boolean;
  };
}

const DXFExporter: React.FC<DXFExporterProps> = ({
  modules,
  projectName,
  floorWidth,
  floorDepth,
  onClose,
}) => {
  const [settings, setSettings] = useState<ExportSettings>({
    includeHiddenLines: false,
    includeDimensions: true,
    includeLabels: true,
    scale: '1:1',
    units: 'mm',
    layers: {
      modules: true,
      dimensions: true,
      labels: true,
      hardware: true,
    },
  });
  
  const [exportView, setExportView] = useState<'top' | 'front' | 'side' | 'all'>('all');
  const [isExporting, setIsExporting] = useState(false);

  const generateDXFContent = (): string => {
    const scaleFactors: Record<string, number> = {
      '1:1': 1, '1:10': 0.1, '1:20': 0.05, '1:50': 0.02, '1:100': 0.01
    };
    const scale = scaleFactors[settings.scale];
    
    let dxf = '';
    
    // DXF Header
    dxf += '0\nSECTION\n2\nHEADER\n';
    dxf += '9\n$ACADVER\n1\nAC1015\n'; // AutoCAD 2000
    dxf += '9\n$INSUNITS\n70\n4\n'; // mm
    dxf += '0\nENDSEC\n';
    
    // Tables section (layers)
    dxf += '0\nSECTION\n2\nTABLES\n';
    dxf += '0\nTABLE\n2\nLAYER\n';
    
    // Define layers
    const layers = [
      { name: 'MODULES', color: 7 },
      { name: 'DIMENSIONS', color: 3 },
      { name: 'LABELS', color: 5 },
      { name: 'HARDWARE', color: 1 },
      { name: 'HIDDEN', color: 8 },
    ];
    
    layers.forEach(layer => {
      dxf += `0\nLAYER\n2\n${layer.name}\n70\n0\n62\n${layer.color}\n6\nCONTINUOUS\n`;
    });
    
    dxf += '0\nENDTAB\n0\nENDSEC\n';
    
    // Entities section
    dxf += '0\nSECTION\n2\nENTITIES\n';
    
    // Draw room outline
    const roomW = floorWidth * scale;
    const roomD = floorDepth * scale;
    
    // Room boundary (LWPOLYLINE)
    dxf += '0\nLWPOLYLINE\n8\nMODULES\n90\n4\n70\n1\n';
    dxf += `10\n0\n20\n0\n`;
    dxf += `10\n${roomW}\n20\n0\n`;
    dxf += `10\n${roomW}\n20\n${roomD}\n`;
    dxf += `10\n0\n20\n${roomD}\n`;
    
    // Draw each module
    modules.forEach((mod, idx) => {
      if (mod.isAppliance && !settings.layers.modules) return;
      
      const x = (mod.x + floorWidth / 2 - mod.width / 2) * scale;
      const y = (mod.z + floorDepth / 2 - mod.depth / 2) * scale;
      const w = mod.width * scale;
      const d = mod.depth * scale;
      
      // Module outline
      if (settings.layers.modules) {
        dxf += '0\nLWPOLYLINE\n8\nMODULES\n90\n4\n70\n1\n';
        dxf += `10\n${x}\n20\n${y}\n`;
        dxf += `10\n${x + w}\n20\n${y}\n`;
        dxf += `10\n${x + w}\n20\n${y + d}\n`;
        dxf += `10\n${x}\n20\n${y + d}\n`;
      }
      
      // Module label
      if (settings.layers.labels && settings.includeLabels) {
        const labelX = x + w / 2;
        const labelY = y + d / 2;
        dxf += `0\nTEXT\n8\nLABELS\n10\n${labelX}\n20\n${labelY}\n40\n${50 * scale}\n1\n${mod.type}\n`;
      }
      
      // Dimensions
      if (settings.layers.dimensions && settings.includeDimensions) {
        // Width dimension line
        dxf += `0\nDIMENSION\n8\nDIMENSIONS\n70\n0\n`;
        dxf += `10\n${x}\n20\n${y - 100 * scale}\n`;
        dxf += `11\n${x + w / 2}\n21\n${y - 100 * scale}\n`;
        dxf += `13\n${x}\n23\n${y}\n`;
        dxf += `14\n${x + w}\n24\n${y}\n`;
      }
    });
    
    dxf += '0\nENDSEC\n0\nEOF\n';
    
    return dxf;
  };

  const handleExport = () => {
    setIsExporting(true);
    
    setTimeout(() => {
      const dxfContent = generateDXFContent();
      const blob = new Blob([dxfContent], { type: 'application/dxf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.replace(/\s+/g, '_')}_${exportView}.dxf`;
      a.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] border border-amber-500/30 rounded-lg shadow-2xl w-[600px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 flex items-center justify-between">
          <h2 className="text-white font-bold flex items-center gap-2">
            <FileCode size={18} />
            Exportar DXF/DWG
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Left: Preview */}
            <div className="bg-[#0f0f23] rounded-lg p-3 border border-amber-500/10">
              <h3 className="text-amber-400 text-sm font-bold mb-2">Prévia</h3>
              <div className="bg-white rounded h-48 flex items-center justify-center relative overflow-hidden">
                <svg viewBox={`0 0 ${floorWidth / 10} ${floorDepth / 10}`} className="w-full h-full p-4">
                  {/* Room outline */}
                  <rect
                    x={0}
                    y={0}
                    width={floorWidth / 10}
                    height={floorDepth / 10}
                    fill="none"
                    stroke="#333"
                    strokeWidth="2"
                  />
                  {/* Modules */}
                  {modules.map((mod) => (
                    <g key={mod.id}>
                      <rect
                        x={(mod.x + floorWidth / 2 - mod.width / 2) / 10}
                        y={(mod.z + floorDepth / 2 - mod.depth / 2) / 10}
                        width={mod.width / 10}
                        height={mod.depth / 10}
                        fill="#e0e0e0"
                        stroke="#666"
                        strokeWidth="1"
                      />
                      {settings.includeLabels && (
                        <text
                          x={(mod.x + floorWidth / 2) / 10}
                          y={(mod.z + floorDepth / 2) / 10}
                          fontSize="8"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#333"
                        >
                          {mod.type.slice(0, 8)}
                        </text>
                      )}
                    </g>
                  ))}
                </svg>
              </div>
              
              {/* View selection */}
              <div className="mt-3">
                <p className="text-amber-300/70 text-xs mb-1">Vista para exportar:</p>
                <div className="grid grid-cols-4 gap-1">
                  {(['top', 'front', 'side', 'all'] as const).map(view => (
                    <button
                      key={view}
                      onClick={() => setExportView(view)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        exportView === view
                          ? 'bg-amber-500 text-amber-950'
                          : 'bg-[#16213e] text-amber-300/70 hover:bg-amber-500/20'
                      }`}
                    >
                      {view === 'top' ? 'Superior' : view === 'front' ? 'Frontal' : view === 'side' ? 'Lateral' : 'Todas'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Settings */}
            <div className="space-y-3">
              <div className="bg-[#0f0f23] rounded-lg p-3 border border-amber-500/10">
                <h3 className="text-amber-400 text-sm font-bold mb-2 flex items-center gap-1">
                  <Settings size={14} />
                  Configurações
                </h3>
                
                {/* Scale */}
                <div className="mb-2">
                  <p className="text-amber-300/70 text-xs mb-1">Escala:</p>
                  <select
                    value={settings.scale}
                    onChange={(e) => setSettings(s => ({ ...s, scale: e.target.value as ExportSettings['scale'] }))}
                    className="w-full bg-[#16213e] border border-amber-500/20 text-amber-100 text-xs px-2 py-1 rounded"
                  >
                    <option value="1:1">1:1 (Tamanho Real)</option>
                    <option value="1:10">1:10</option>
                    <option value="1:20">1:20</option>
                    <option value="1:50">1:50</option>
                    <option value="1:100">1:100</option>
                  </select>
                </div>

                {/* Units */}
                <div className="mb-2">
                  <p className="text-amber-300/70 text-xs mb-1">Unidades:</p>
                  <select
                    value={settings.units}
                    onChange={(e) => setSettings(s => ({ ...s, units: e.target.value as ExportSettings['units'] }))}
                    className="w-full bg-[#16213e] border border-amber-500/20 text-amber-100 text-xs px-2 py-1 rounded"
                  >
                    <option value="mm">Milímetros (mm)</option>
                    <option value="cm">Centímetros (cm)</option>
                    <option value="m">Metros (m)</option>
                  </select>
                </div>
              </div>

              {/* Layers */}
              <div className="bg-[#0f0f23] rounded-lg p-3 border border-amber-500/10">
                <h3 className="text-amber-400 text-sm font-bold mb-2 flex items-center gap-1">
                  <Layers size={14} />
                  Camadas (Layers)
                </h3>
                
                <div className="space-y-1">
                  {[
                    { key: 'modules', label: 'Módulos' },
                    { key: 'dimensions', label: 'Cotas' },
                    { key: 'labels', label: 'Etiquetas' },
                    { key: 'hardware', label: 'Ferragens' },
                  ].map(layer => (
                    <label key={layer.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.layers[layer.key as keyof typeof settings.layers]}
                        onChange={(e) => setSettings(s => ({
                          ...s,
                          layers: { ...s.layers, [layer.key]: e.target.checked }
                        }))}
                        className="w-3 h-3 accent-amber-500"
                      />
                      <span className="text-amber-100 text-xs">{layer.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="bg-[#0f0f23] rounded-lg p-3 border border-amber-500/10">
                <h3 className="text-amber-400 text-sm font-bold mb-2">Opções</h3>
                
                <div className="space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.includeDimensions}
                      onChange={(e) => setSettings(s => ({ ...s, includeDimensions: e.target.checked }))}
                      className="w-3 h-3 accent-amber-500"
                    />
                    <span className="text-amber-100 text-xs">Incluir cotas</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.includeLabels}
                      onChange={(e) => setSettings(s => ({ ...s, includeLabels: e.target.checked }))}
                      className="w-3 h-3 accent-amber-500"
                    />
                    <span className="text-amber-100 text-xs">Incluir etiquetas</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.includeHiddenLines}
                      onChange={(e) => setSettings(s => ({ ...s, includeHiddenLines: e.target.checked }))}
                      className="w-3 h-3 accent-amber-500"
                    />
                    <span className="text-amber-100 text-xs">Linhas ocultas (tracejado)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="mt-4 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-300">
            <strong>Dica:</strong> O arquivo DXF é compatível com AutoCAD, SolidWorks, SketchUp e outros programas CAD.
            Use para enviar para corte CNC ou compartilhar com engenheiros.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#16213e] border-t border-amber-500/20 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-bold flex items-center gap-2"
          >
            {isExporting ? (
              <>Exportando...</>
            ) : (
              <>
                <Download size={14} />
                Exportar DXF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DXFExporter;
