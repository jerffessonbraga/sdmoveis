import React, { useState, useMemo } from 'react';
import { FurnitureModule } from '@/types';
import { X, Download, Printer, Calculator, Scissors, RefreshCw, Package } from 'lucide-react';

interface CuttingPlanOptimizerProps {
  modules: FurnitureModule[];
  projectName: string;
  onClose: () => void;
}

interface CutPiece {
  id: string;
  moduleId: string;
  moduleName: string;
  partName: string;
  width: number;
  height: number;
  quantity: number;
  material: string;
  edgeBanding: string;
  grainDirection: 'horizontal' | 'vertical' | 'none';
}

interface PlacedPiece {
  piece: CutPiece;
  x: number;
  y: number;
  rotated: boolean;
}

interface CuttingSheet {
  id: number;
  material: string;
  sheetWidth: number;
  sheetHeight: number;
  pieces: PlacedPiece[];
  usedArea: number;
  wastePercentage: number;
}

const SHEET_WIDTH = 2750; // Standard MDF sheet width (mm)
const SHEET_HEIGHT = 1850; // Standard MDF sheet height (mm)
const SAW_KERF = 4; // Blade thickness (mm)

const CuttingPlanOptimizer: React.FC<CuttingPlanOptimizerProps> = ({
  modules,
  projectName,
  onClose,
}) => {
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [algorithm, setAlgorithm] = useState<'guillotine' | 'maxrects'>('guillotine');

  // Generate cut pieces from modules
  const cutPieces = useMemo((): CutPiece[] => {
    const pieces: CutPiece[] = [];
    
    modules.forEach((mod) => {
      if (mod.isAppliance) return;
      
      const material = mod.finish || 'Branco Tx';
      const w = mod.width;
      const h = mod.height;
      const d = mod.depth;
      const thickness = 18;
      
      // Side panels (2x)
      pieces.push({
        id: `${mod.id}_side`,
        moduleId: mod.id,
        moduleName: mod.type,
        partName: 'Lateral',
        width: d - thickness,
        height: h,
        quantity: 2,
        material,
        edgeBanding: 'F-F-V-V',
        grainDirection: 'vertical',
      });
      
      // Top panel
      pieces.push({
        id: `${mod.id}_top`,
        moduleId: mod.id,
        moduleName: mod.type,
        partName: 'Tampo',
        width: w,
        height: d - thickness,
        quantity: 1,
        material,
        edgeBanding: 'F-V-V-V',
        grainDirection: 'horizontal',
      });
      
      // Bottom panel
      pieces.push({
        id: `${mod.id}_bottom`,
        moduleId: mod.id,
        moduleName: mod.type,
        partName: 'Base',
        width: w - thickness * 2,
        height: d - thickness,
        quantity: 1,
        material,
        edgeBanding: 'F-V-V-V',
        grainDirection: 'horizontal',
      });
      
      // Back panel (3mm)
      pieces.push({
        id: `${mod.id}_back`,
        moduleId: mod.id,
        moduleName: mod.type,
        partName: 'Fundo',
        width: w - 6,
        height: h - 6,
        quantity: 1,
        material: 'Eucatex 3mm',
        edgeBanding: '-',
        grainDirection: 'none',
      });
      
      // Shelves (estimate based on height)
      const numShelves = Math.max(1, Math.floor(h / 400) - 1);
      if (numShelves > 0) {
        pieces.push({
          id: `${mod.id}_shelf`,
          moduleId: mod.id,
          moduleName: mod.type,
          partName: 'Prateleira',
          width: w - thickness * 2 - 6,
          height: d - thickness - 20,
          quantity: numShelves,
          material,
          edgeBanding: 'F-V-V-V',
          grainDirection: 'horizontal',
        });
      }
      
      // Doors (if applicable)
      const type = mod.type.toLowerCase();
      if (type.includes('1p')) {
        pieces.push({
          id: `${mod.id}_door`,
          moduleId: mod.id,
          moduleName: mod.type,
          partName: 'Porta',
          width: w - 4,
          height: h - 4,
          quantity: 1,
          material,
          edgeBanding: 'F-F-F-F',
          grainDirection: 'vertical',
        });
      } else if (type.includes('2p')) {
        pieces.push({
          id: `${mod.id}_door`,
          moduleId: mod.id,
          moduleName: mod.type,
          partName: 'Porta',
          width: (w / 2) - 4,
          height: h - 4,
          quantity: 2,
          material,
          edgeBanding: 'F-F-F-F',
          grainDirection: 'vertical',
        });
      }
    });
    
    return pieces;
  }, [modules]);

  // Bin packing algorithm (simplified guillotine)
  const cuttingSheets = useMemo((): CuttingSheet[] => {
    const sheets: CuttingSheet[] = [];
    const materialGroups = new Map<string, CutPiece[]>();
    
    // Group pieces by material
    cutPieces.forEach(piece => {
      const key = piece.material;
      if (!materialGroups.has(key)) {
        materialGroups.set(key, []);
      }
      // Expand quantity
      for (let i = 0; i < piece.quantity; i++) {
        materialGroups.get(key)!.push({ ...piece, quantity: 1 });
      }
    });
    
    materialGroups.forEach((pieces, material) => {
      // Sort pieces by area (largest first)
      const sortedPieces = [...pieces].sort((a, b) => 
        (b.width * b.height) - (a.width * a.height)
      );
      
      let currentSheet: CuttingSheet | null = null;
      let freeRects: { x: number; y: number; w: number; h: number }[] = [];
      
      sortedPieces.forEach(piece => {
        let placed = false;
        
        // Try to place in existing sheet
        if (currentSheet) {
          for (let i = 0; i < freeRects.length; i++) {
            const rect = freeRects[i];
            
            // Try normal orientation
            if (piece.width + SAW_KERF <= rect.w && piece.height + SAW_KERF <= rect.h) {
              currentSheet.pieces.push({
                piece,
                x: rect.x,
                y: rect.y,
                rotated: false,
              });
              
              // Split free rectangle (guillotine cut)
              freeRects.splice(i, 1);
              if (rect.w - piece.width - SAW_KERF > 50) {
                freeRects.push({
                  x: rect.x + piece.width + SAW_KERF,
                  y: rect.y,
                  w: rect.w - piece.width - SAW_KERF,
                  h: piece.height,
                });
              }
              if (rect.h - piece.height - SAW_KERF > 50) {
                freeRects.push({
                  x: rect.x,
                  y: rect.y + piece.height + SAW_KERF,
                  w: rect.w,
                  h: rect.h - piece.height - SAW_KERF,
                });
              }
              placed = true;
              break;
            }
            
            // Try rotated (if grain allows)
            if (piece.grainDirection === 'none' || piece.grainDirection === 'horizontal') {
              if (piece.height + SAW_KERF <= rect.w && piece.width + SAW_KERF <= rect.h) {
                currentSheet.pieces.push({
                  piece,
                  x: rect.x,
                  y: rect.y,
                  rotated: true,
                });
                
                freeRects.splice(i, 1);
                if (rect.w - piece.height - SAW_KERF > 50) {
                  freeRects.push({
                    x: rect.x + piece.height + SAW_KERF,
                    y: rect.y,
                    w: rect.w - piece.height - SAW_KERF,
                    h: piece.width,
                  });
                }
                if (rect.h - piece.width - SAW_KERF > 50) {
                  freeRects.push({
                    x: rect.x,
                    y: rect.y + piece.width + SAW_KERF,
                    w: rect.w,
                    h: rect.h - piece.width - SAW_KERF,
                  });
                }
                placed = true;
                break;
              }
            }
          }
        }
        
        // Need new sheet
        if (!placed) {
          if (currentSheet) {
            const usedArea = currentSheet.pieces.reduce((sum, p) => 
              sum + (p.rotated ? p.piece.height * p.piece.width : p.piece.width * p.piece.height), 0
            );
            currentSheet.usedArea = usedArea;
            currentSheet.wastePercentage = 100 - (usedArea / (SHEET_WIDTH * SHEET_HEIGHT)) * 100;
            sheets.push(currentSheet);
          }
          
          currentSheet = {
            id: sheets.length + 1,
            material,
            sheetWidth: SHEET_WIDTH,
            sheetHeight: SHEET_HEIGHT,
            pieces: [],
            usedArea: 0,
            wastePercentage: 0,
          };
          
          freeRects = [{ x: 0, y: 0, w: SHEET_WIDTH, h: SHEET_HEIGHT }];
          
          // Place piece in new sheet
          currentSheet.pieces.push({
            piece,
            x: 0,
            y: 0,
            rotated: false,
          });
          
          freeRects = [];
          if (SHEET_WIDTH - piece.width - SAW_KERF > 50) {
            freeRects.push({
              x: piece.width + SAW_KERF,
              y: 0,
              w: SHEET_WIDTH - piece.width - SAW_KERF,
              h: piece.height,
            });
          }
          if (SHEET_HEIGHT - piece.height - SAW_KERF > 50) {
            freeRects.push({
              x: 0,
              y: piece.height + SAW_KERF,
              w: SHEET_WIDTH,
              h: SHEET_HEIGHT - piece.height - SAW_KERF,
            });
          }
        }
      });
      
      // Finalize last sheet
      if (currentSheet && currentSheet.pieces.length > 0) {
        const usedArea = currentSheet.pieces.reduce((sum, p) => 
          sum + (p.rotated ? p.piece.height * p.piece.width : p.piece.width * p.piece.height), 0
        );
        currentSheet.usedArea = usedArea;
        currentSheet.wastePercentage = 100 - (usedArea / (SHEET_WIDTH * SHEET_HEIGHT)) * 100;
        sheets.push(currentSheet);
      }
    });
    
    return sheets;
  }, [cutPieces, algorithm]);

  // Statistics
  const stats = useMemo(() => {
    const totalPieces = cutPieces.reduce((sum, p) => sum + p.quantity, 0);
    const totalSheets = cuttingSheets.length;
    const avgWaste = cuttingSheets.reduce((sum, s) => sum + s.wastePercentage, 0) / Math.max(1, totalSheets);
    const totalSheetArea = totalSheets * SHEET_WIDTH * SHEET_HEIGHT / 1000000; // m²
    const usedArea = cuttingSheets.reduce((sum, s) => sum + s.usedArea, 0) / 1000000; // m²
    
    return {
      totalPieces,
      totalSheets,
      avgWaste: avgWaste.toFixed(1),
      totalSheetArea: totalSheetArea.toFixed(2),
      usedArea: usedArea.toFixed(2),
      sheetCost: totalSheets * 180, // R$180 per sheet
    };
  }, [cutPieces, cuttingSheets]);

  const currentSheet = cuttingSheets[selectedSheet];

  const handleExport = () => {
    const data = {
      project: projectName,
      date: new Date().toLocaleDateString('pt-BR'),
      pieces: cutPieces,
      sheets: cuttingSheets.map(s => ({
        id: s.id,
        material: s.material,
        dimensions: `${s.sheetWidth}x${s.sheetHeight}mm`,
        pieces: s.pieces.map(p => ({
          part: `${p.piece.moduleName} - ${p.piece.partName}`,
          dimensions: `${p.piece.width}x${p.piece.height}mm`,
          position: `X:${p.x} Y:${p.y}`,
          rotated: p.rotated,
        })),
        waste: `${s.wastePercentage.toFixed(1)}%`,
      })),
      stats,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PlanoCorte_${projectName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] border border-amber-500/30 rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 px-4 py-3 flex items-center justify-between">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Scissors size={18} />
            Plano de Corte Otimizado
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex">
          {/* Left: Sheet visualization */}
          <div className="flex-1 p-4 border-r border-amber-500/20">
            {/* Sheet selector */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-amber-400 text-xs font-bold">Chapa:</span>
              <div className="flex gap-1 flex-wrap">
                {cuttingSheets.map((sheet, idx) => (
                  <button
                    key={sheet.id}
                    onClick={() => setSelectedSheet(idx)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      selectedSheet === idx
                        ? 'bg-amber-500 text-amber-950'
                        : 'bg-[#16213e] text-amber-300/70 hover:bg-amber-500/20'
                    }`}
                  >
                    #{sheet.id} - {sheet.material.slice(0, 12)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sheet preview */}
            {currentSheet && (
              <div className="bg-[#0f0f23] rounded-lg p-3 border border-amber-500/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-amber-100 text-sm font-bold">{currentSheet.material}</span>
                  <span className="text-green-400 text-xs">
                    Aproveitamento: {(100 - currentSheet.wastePercentage).toFixed(1)}%
                  </span>
                </div>
                
                <div className="bg-[#f5f0e6] rounded relative" style={{ paddingBottom: `${(SHEET_HEIGHT / SHEET_WIDTH) * 100}%` }}>
                  <svg 
                    viewBox={`0 0 ${SHEET_WIDTH} ${SHEET_HEIGHT}`} 
                    className="absolute inset-0 w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Sheet outline */}
                    <rect
                      x={0}
                      y={0}
                      width={SHEET_WIDTH}
                      height={SHEET_HEIGHT}
                      fill="#f5f0e6"
                      stroke="#8b7355"
                      strokeWidth="4"
                    />
                    
                    {/* Placed pieces */}
                    {currentSheet.pieces.map((placed, idx) => {
                      const w = placed.rotated ? placed.piece.height : placed.piece.width;
                      const h = placed.rotated ? placed.piece.width : placed.piece.height;
                      
                      return (
                        <g key={idx}>
                          <rect
                            x={placed.x}
                            y={placed.y}
                            width={w}
                            height={h}
                            fill="#d4a574"
                            stroke="#8b5a2b"
                            strokeWidth="2"
                          />
                          <text
                            x={placed.x + w / 2}
                            y={placed.y + h / 2 - 15}
                            fontSize="24"
                            textAnchor="middle"
                            fill="#4a3520"
                            fontWeight="bold"
                          >
                            {placed.piece.partName}
                          </text>
                          <text
                            x={placed.x + w / 2}
                            y={placed.y + h / 2 + 15}
                            fontSize="18"
                            textAnchor="middle"
                            fill="#6b4a30"
                          >
                            {w}×{h}
                          </text>
                          {placed.rotated && (
                            <text
                              x={placed.x + 10}
                              y={placed.y + 25}
                              fontSize="14"
                              fill="#c00"
                            >
                              ↻
                            </text>
                          )}
                        </g>
                      );
                    })}
                    
                    {/* Dimension labels */}
                    <text x={SHEET_WIDTH / 2} y={-10} fontSize="20" textAnchor="middle" fill="#666">
                      {SHEET_WIDTH}mm
                    </text>
                  </svg>
                </div>
                
                <div className="mt-2 text-xs text-amber-300/70">
                  Dimensões da chapa: {SHEET_WIDTH} × {SHEET_HEIGHT}mm | Corte: {SAW_KERF}mm
                </div>
              </div>
            )}
          </div>

          {/* Right: Statistics and piece list */}
          <div className="w-80 p-4 overflow-auto max-h-[calc(90vh-60px)]">
            {/* Stats */}
            <div className="bg-[#16213e] rounded-lg p-3 border border-amber-500/10 mb-3">
              <h3 className="text-amber-400 text-sm font-bold mb-2 flex items-center gap-1">
                <Calculator size={14} />
                Resumo
              </h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-amber-300/70">Total de peças:</span>
                  <span className="text-amber-100 font-bold">{stats.totalPieces}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-300/70">Chapas necessárias:</span>
                  <span className="text-amber-100 font-bold">{stats.totalSheets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-300/70">Desperdício médio:</span>
                  <span className={`font-bold ${parseFloat(stats.avgWaste) < 20 ? 'text-green-400' : parseFloat(stats.avgWaste) < 35 ? 'text-amber-400' : 'text-red-400'}`}>
                    {stats.avgWaste}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-300/70">Área útil:</span>
                  <span className="text-amber-100">{stats.usedArea} m²</span>
                </div>
                <hr className="border-amber-500/20 my-1" />
                <div className="flex justify-between">
                  <span className="text-amber-300/70">Custo estimado:</span>
                  <span className="text-green-400 font-bold">R$ {stats.sheetCost.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Piece list */}
            <div className="bg-[#16213e] rounded-lg p-3 border border-amber-500/10">
              <h3 className="text-amber-400 text-sm font-bold mb-2 flex items-center gap-1">
                <Package size={14} />
                Lista de Peças
              </h3>
              <div className="space-y-1 text-xs max-h-60 overflow-auto">
                {cutPieces.filter(p => p.material !== 'Eucatex 3mm').slice(0, 20).map((piece, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b border-amber-500/10">
                    <div>
                      <p className="text-amber-100">{piece.partName}</p>
                      <p className="text-amber-300/50 text-[10px]">{piece.moduleName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-300">{piece.width}×{piece.height}</p>
                      <p className="text-amber-400/60">×{piece.quantity}</p>
                    </div>
                  </div>
                ))}
                {cutPieces.length > 20 && (
                  <p className="text-amber-300/50 text-center py-1">
                    +{cutPieces.length - 20} peças...
                  </p>
                )}
              </div>
            </div>

            {/* Algorithm */}
            <div className="mt-3">
              <p className="text-amber-400 text-xs font-bold mb-1">Algoritmo:</p>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as 'guillotine' | 'maxrects')}
                className="w-full bg-[#16213e] border border-amber-500/20 text-amber-100 text-xs px-2 py-1 rounded"
              >
                <option value="guillotine">Guillotine (Cortes retos)</option>
                <option value="maxrects">MaxRects (Melhor aproveitamento)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#16213e] border-t border-amber-500/20 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white">
            Fechar
          </button>
          <button onClick={() => window.print()} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-amber-950 rounded text-sm font-bold flex items-center gap-2">
            <Printer size={14} />
            Imprimir
          </button>
          <button onClick={handleExport} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded text-sm font-bold flex items-center gap-2">
            <Download size={14} />
            Exportar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CuttingPlanOptimizer;
