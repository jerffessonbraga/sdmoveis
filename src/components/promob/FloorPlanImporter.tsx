import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, Image, Maximize, Move, RotateCw, Trash2, Check, ZoomIn, ZoomOut } from 'lucide-react';

interface FloorPlanImporterProps {
  floorWidth: number;
  floorDepth: number;
  onImport: (config: FloorPlanConfig) => void;
  onClose: () => void;
}

export interface FloorPlanConfig {
  imageUrl: string;
  scale: number; // pixels per mm
  offsetX: number;
  offsetY: number;
  rotation: number;
  opacity: number;
}

const FloorPlanImporter: React.FC<FloorPlanImporterProps> = ({
  floorWidth,
  floorDepth,
  onImport,
  onClose,
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [config, setConfig] = useState<FloorPlanConfig>({
    imageUrl: '',
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    opacity: 0.5,
  });
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [calibrationPoints, setCalibrationPoints] = useState<{ x: number; y: number }[]>([]);
  const [realDistance, setRealDistance] = useState<number>(1000); // mm
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
        // Initial scale to fit the floor
        const scaleX = floorWidth / img.width;
        const scaleY = floorDepth / img.height;
        const initialScale = Math.min(scaleX, scaleY);
        setConfig(c => ({ ...c, scale: initialScale }));
      };
      const url = ev.target?.result as string;
      img.src = url;
      setImage(url);
      setConfig(c => ({ ...c, imageUrl: url }));
    };
    reader.readAsDataURL(file);
  };

  const handlePreviewClick = useCallback((e: React.MouseEvent) => {
    if (!calibrationMode || !previewRef.current) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (calibrationPoints.length < 2) {
      setCalibrationPoints(prev => [...prev, { x, y }]);
    }
  }, [calibrationMode, calibrationPoints]);

  const calculateScale = () => {
    if (calibrationPoints.length !== 2) return;
    
    const dx = calibrationPoints[1].x - calibrationPoints[0].x;
    const dy = calibrationPoints[1].y - calibrationPoints[0].y;
    const pixelDistance = Math.sqrt(dx * dx + dy * dy);
    
    // Scale = real distance / pixel distance
    const newScale = realDistance / pixelDistance;
    setConfig(c => ({ ...c, scale: newScale }));
    setCalibrationMode(false);
    setCalibrationPoints([]);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (calibrationMode) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - config.offsetX, y: e.clientY - config.offsetY });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setConfig(c => ({
      ...c,
      offsetX: e.clientX - dragStart.x,
      offsetY: e.clientY - dragStart.y,
    }));
  }, [isDragging, dragStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleConfirm = () => {
    if (image) {
      onImport(config);
      onClose();
    }
  };

  // Preview dimensions (scaled to fit dialog)
  const previewScale = 0.5;
  const previewWidth = floorWidth * previewScale / 10;
  const previewHeight = floorDepth * previewScale / 10;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] border border-amber-500/30 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-4 py-3 flex items-center justify-between">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Image size={18} />
            Importar Planta Baixa
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Left: Upload & Settings */}
            <div className="space-y-3">
              {/* Upload */}
              <div className="bg-[#16213e] p-3 rounded border border-amber-500/20">
                <h3 className="text-amber-400 text-sm font-bold mb-2 flex items-center gap-1">
                  <Upload size={14} />
                  Carregar Imagem
                </h3>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.dxf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 border-2 border-dashed border-amber-500/30 hover:border-amber-500/60 rounded-lg text-amber-300/70 hover:text-amber-300 transition-colors flex flex-col items-center gap-1"
                >
                  <Image size={24} />
                  <span className="text-xs">Clique para selecionar</span>
                  <span className="text-[10px] text-amber-300/50">JPG, PNG, DXF</span>
                </button>

                {image && (
                  <div className="mt-2 text-xs text-amber-300/70">
                    <p>Dimensões: {imageDimensions.width} × {imageDimensions.height}px</p>
                  </div>
                )}
              </div>

              {/* Calibration */}
              <div className="bg-[#16213e] p-3 rounded border border-amber-500/20">
                <h3 className="text-amber-400 text-sm font-bold mb-2 flex items-center gap-1">
                  <Maximize size={14} />
                  Calibrar Escala
                </h3>
                
                {calibrationMode ? (
                  <div className="space-y-2">
                    <p className="text-amber-300/70 text-[10px]">
                      Clique em dois pontos na imagem para definir uma distância conhecida
                    </p>
                    <div className="flex gap-1">
                      {[0, 1].map(i => (
                        <div
                          key={i}
                          className={`flex-1 h-8 rounded flex items-center justify-center text-xs ${
                            calibrationPoints.length > i
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-[#0f0f23] text-amber-300/50'
                          }`}
                        >
                          Ponto {i + 1} {calibrationPoints.length > i && '✓'}
                        </div>
                      ))}
                    </div>
                    
                    {calibrationPoints.length === 2 && (
                      <div className="space-y-2">
                        <div>
                          <label className="text-amber-300/70 text-[10px]">Distância real (mm)</label>
                          <input
                            type="number"
                            value={realDistance}
                            onChange={(e) => setRealDistance(Number(e.target.value))}
                            className="w-full bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-2 py-1.5 rounded"
                          />
                        </div>
                        <button
                          onClick={calculateScale}
                          className="w-full py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-bold"
                        >
                          Aplicar Escala
                        </button>
                      </div>
                    )}
                    
                    <button
                      onClick={() => { setCalibrationMode(false); setCalibrationPoints([]); }}
                      className="w-full py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setCalibrationMode(true)}
                    disabled={!image}
                    className="w-full py-2 bg-teal-600/20 hover:bg-teal-600/40 border border-teal-500/30 text-teal-400 rounded text-xs disabled:opacity-50"
                  >
                    Iniciar Calibração
                  </button>
                )}
              </div>

              {/* Manual Adjustments */}
              <div className="bg-[#16213e] p-3 rounded border border-amber-500/20">
                <h3 className="text-amber-400 text-sm font-bold mb-2 flex items-center gap-1">
                  <Move size={14} />
                  Ajustes Manuais
                </h3>
                
                <div className="space-y-2">
                  <div>
                    <label className="text-amber-300/70 text-[10px] flex justify-between">
                      <span>Escala</span>
                      <span>{config.scale.toFixed(3)}</span>
                    </label>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setConfig(c => ({ ...c, scale: c.scale * 0.9 }))}
                        className="flex-1 py-1 bg-[#0f0f23] hover:bg-amber-500/20 rounded text-amber-300"
                      >
                        <ZoomOut size={12} className="mx-auto" />
                      </button>
                      <button
                        onClick={() => setConfig(c => ({ ...c, scale: c.scale * 1.1 }))}
                        className="flex-1 py-1 bg-[#0f0f23] hover:bg-amber-500/20 rounded text-amber-300"
                      >
                        <ZoomIn size={12} className="mx-auto" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-amber-300/70 text-[10px] flex justify-between">
                      <span>Rotação</span>
                      <span>{config.rotation}°</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="1"
                      value={config.rotation}
                      onChange={(e) => setConfig(c => ({ ...c, rotation: Number(e.target.value) }))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-amber-300/70 text-[10px] flex justify-between">
                      <span>Opacidade</span>
                      <span>{Math.round(config.opacity * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={config.opacity}
                      onChange={(e) => setConfig(c => ({ ...c, opacity: Number(e.target.value) }))}
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Preview */}
            <div className="col-span-2 bg-[#0f0f23] rounded-lg p-3 border border-amber-500/10">
              <h3 className="text-amber-400 text-sm font-bold mb-2">
                Prévia do Ambiente ({(floorWidth / 1000).toFixed(1)}m × {(floorDepth / 1000).toFixed(1)}m)
              </h3>
              
              <div
                ref={previewRef}
                className="relative bg-white rounded overflow-hidden cursor-move"
                style={{ 
                  width: previewWidth, 
                  height: previewHeight,
                  maxWidth: '100%',
                }}
                onClick={handlePreviewClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Floor grid */}
                <svg 
                  className="absolute inset-0 w-full h-full" 
                  style={{ opacity: 0.2 }}
                >
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#999" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Imported image */}
                {image && (
                  <img
                    src={image}
                    alt="Planta baixa"
                    className="absolute"
                    style={{
                      opacity: config.opacity,
                      transform: `translate(${config.offsetX}px, ${config.offsetY}px) rotate(${config.rotation}deg) scale(${config.scale * previewScale})`,
                      transformOrigin: 'top left',
                    }}
                    draggable={false}
                  />
                )}

                {/* Calibration points */}
                {calibrationPoints.map((point, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-white"
                    style={{ left: point.x, top: point.y }}
                  />
                ))}

                {/* Calibration line */}
                {calibrationPoints.length === 2 && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line
                      x1={calibrationPoints[0].x}
                      y1={calibrationPoints[0].y}
                      x2={calibrationPoints[1].x}
                      y2={calibrationPoints[1].y}
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                    />
                  </svg>
                )}

                {!image && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Image size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Carregue uma planta baixa</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setConfig(c => ({ ...c, offsetX: 0, offsetY: 0 }))}
                  className="px-3 py-1.5 bg-[#16213e] hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 rounded text-xs flex items-center gap-1"
                >
                  <Move size={12} />
                  Centralizar
                </button>
                <button
                  onClick={() => setConfig(c => ({ ...c, rotation: 0 }))}
                  className="px-3 py-1.5 bg-[#16213e] hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 rounded text-xs flex items-center gap-1"
                >
                  <RotateCw size={12} />
                  Reset Rotação
                </button>
                <button
                  onClick={() => { setImage(null); setConfig(c => ({ ...c, imageUrl: '' })); }}
                  disabled={!image}
                  className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-400 rounded text-xs flex items-center gap-1 disabled:opacity-50"
                >
                  <Trash2 size={12} />
                  Remover
                </button>
              </div>

              <p className="text-amber-300/50 text-[10px] mt-2">
                💡 Dica: Arraste a imagem para posicionar. Use a calibração para definir a escala correta.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#16213e] border-t border-amber-500/20 flex justify-between items-center">
          <p className="text-amber-300/70 text-xs">
            Escala atual: 1px = {(1 / config.scale).toFixed(2)}mm
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!image}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded text-sm font-bold flex items-center gap-2 disabled:opacity-50"
            >
              <Check size={14} />
              Aplicar Planta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanImporter;
