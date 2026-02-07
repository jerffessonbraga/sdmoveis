import React, { useRef } from 'react';
import { FurnitureModule } from '@/types';
import { X, Printer, Download, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface TechnicalPlan2DProps {
  modules: FurnitureModule[];
  floorWidth: number;
  floorDepth: number;
  wallHeight: number;
  projectName: string;
  clientName: string;
  onClose: () => void;
}

const TechnicalPlan2D: React.FC<TechnicalPlan2DProps> = ({
  modules,
  floorWidth,
  floorDepth,
  wallHeight,
  projectName,
  clientName,
  onClose,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = React.useState(1);
  const [viewMode, setViewMode] = React.useState<'top' | 'front' | 'side'>('top');
  
  // Scale: 1mm = 0.1px (1:10 for display, scaled by zoom)
  const scale = 0.08 * zoom;
  const padding = 80;
  
  // Dimensions based on view
  const getViewDimensions = () => {
    switch (viewMode) {
      case 'top':
        return { width: floorWidth, height: floorDepth, label1: 'Largura', label2: 'Profundidade' };
      case 'front':
        return { width: floorWidth, height: wallHeight, label1: 'Largura', label2: 'Altura' };
      case 'side':
        return { width: floorDepth, height: wallHeight, label1: 'Profundidade', label2: 'Altura' };
    }
  };
  
  const dims = getViewDimensions();
  const svgWidth = dims.width * scale + padding * 2;
  const svgHeight = dims.height * scale + padding * 2;
  
  // Get module position/size for current view
  const getModuleRect = (m: FurnitureModule) => {
    switch (viewMode) {
      case 'top':
        return {
          x: (m.x - m.width / 2 + floorWidth / 2) * scale + padding,
          y: (m.z - m.depth / 2 + floorDepth / 2) * scale + padding,
          w: m.width * scale,
          h: m.depth * scale,
          label: `${m.width}x${m.depth}`,
        };
      case 'front':
        return {
          x: (m.x - m.width / 2 + floorWidth / 2) * scale + padding,
          y: (wallHeight - m.y - m.height) * scale + padding,
          w: m.width * scale,
          h: m.height * scale,
          label: `${m.width}x${m.height}`,
        };
      case 'side':
        return {
          x: (m.z - m.depth / 2 + floorDepth / 2) * scale + padding,
          y: (wallHeight - m.y - m.height) * scale + padding,
          w: m.depth * scale,
          h: m.height * scale,
          label: `${m.depth}x${m.height}`,
        };
    }
  };
  
  // Dimension line component
  const DimensionLine: React.FC<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    value: number;
    offset?: number;
    vertical?: boolean;
  }> = ({ x1, y1, x2, y2, value, offset = 15, vertical = false }) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const arrowSize = 4;
    
    // Extension lines
    const ext1 = vertical 
      ? { x1: x1 - offset, y1, x2: x1 - 5, y2: y1 }
      : { x1, y1: y1 - offset, x2, y2: y1 - 5 };
    const ext2 = vertical
      ? { x1: x2 - offset, y1: y2, x2: x2 - 5, y2 }
      : { x1: x2, y1: y2 - offset, x2, y2: y2 - 5 };
    
    // Main line position
    const lineX1 = vertical ? x1 - offset : x1;
    const lineY1 = vertical ? y1 : y1 - offset;
    const lineX2 = vertical ? x2 - offset : x2;
    const lineY2 = vertical ? y2 : y2 - offset;
    
    return (
      <g className="dimension-line" stroke="#0066cc" strokeWidth="0.5" fill="#0066cc">
        {/* Extension lines */}
        <line x1={ext1.x1} y1={ext1.y1} x2={ext1.x2} y2={ext1.y2} strokeDasharray="2,2" />
        <line x1={ext2.x1} y1={ext2.y1} x2={ext2.x2} y2={ext2.y2} strokeDasharray="2,2" />
        
        {/* Main dimension line */}
        <line x1={lineX1} y1={lineY1} x2={lineX2} y2={lineY2} />
        
        {/* Arrows */}
        {vertical ? (
          <>
            <polygon points={`${lineX1},${lineY1} ${lineX1-arrowSize/2},${lineY1+arrowSize} ${lineX1+arrowSize/2},${lineY1+arrowSize}`} />
            <polygon points={`${lineX2},${lineY2} ${lineX2-arrowSize/2},${lineY2-arrowSize} ${lineX2+arrowSize/2},${lineY2-arrowSize}`} />
          </>
        ) : (
          <>
            <polygon points={`${lineX1},${lineY1} ${lineX1+arrowSize},${lineY1-arrowSize/2} ${lineX1+arrowSize},${lineY1+arrowSize/2}`} />
            <polygon points={`${lineX2},${lineY2} ${lineX2-arrowSize},${lineY2-arrowSize/2} ${lineX2-arrowSize},${lineY2+arrowSize/2}`} />
          </>
        )}
        
        {/* Label */}
        <rect 
          x={vertical ? lineX1 - 18 : midX - 15} 
          y={vertical ? midY - 6 : lineY1 - 12} 
          width="30" 
          height="12" 
          fill="white" 
          stroke="none"
        />
        <text 
          x={vertical ? lineX1 - 3 : midX} 
          y={vertical ? midY + 3 : lineY1 - 3}
          fontSize="8"
          textAnchor="middle"
          fill="#0066cc"
        >
          {value}
        </text>
      </g>
    );
  };
  
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && svgRef.current) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Planta 2D - ${projectName}</title>
            <style>
              body { margin: 20px; font-family: Arial, sans-serif; }
              .header { margin-bottom: 20px; }
              h1 { margin: 0; font-size: 18px; }
              p { margin: 5px 0; font-size: 12px; color: #666; }
              svg { max-width: 100%; height: auto; }
              @media print {
                body { margin: 10mm; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${projectName}</h1>
              <p>Cliente: ${clientName}</p>
              <p>Vista: ${viewMode === 'top' ? 'Superior' : viewMode === 'front' ? 'Frontal' : 'Lateral'}</p>
              <p>Ambiente: ${floorWidth}mm x ${floorDepth}mm x ${wallHeight}mm</p>
              <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            ${svgRef.current.outerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };
  
  const handleExportSVG = () => {
    if (svgRef.current) {
      const svgData = svgRef.current.outerHTML;
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.replace(/\s+/g, '_')}_${viewMode}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-white font-bold">Planta 2D Técnica</h2>
            <div className="flex gap-1">
              {(['top', 'front', 'side'] as const).map(view => (
                <button
                  key={view}
                  onClick={() => setViewMode(view)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    viewMode === view 
                      ? 'bg-white text-blue-600' 
                      : 'bg-blue-500/50 text-white hover:bg-blue-400/50'
                  }`}
                >
                  {view === 'top' ? 'Superior' : view === 'front' ? 'Frontal' : 'Lateral'}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        {/* Toolbar */}
        <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 border-b">
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-1 hover:bg-gray-200 rounded">
            <ZoomOut size={18} />
          </button>
          <span className="text-sm text-gray-600 w-16 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="p-1 hover:bg-gray-200 rounded">
            <ZoomIn size={18} />
          </button>
          <button onClick={() => setZoom(1)} className="p-1 hover:bg-gray-200 rounded">
            <Maximize2 size={18} />
          </button>
          <div className="flex-1" />
          <button 
            onClick={handleExportSVG}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded text-sm flex items-center gap-1"
          >
            <Download size={14} />
            SVG
          </button>
          <button 
            onClick={handlePrint}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm flex items-center gap-1"
          >
            <Printer size={14} />
            Imprimir
          </button>
        </div>
        
        {/* SVG Canvas */}
        <div className="flex-1 overflow-auto bg-gray-50 p-4">
          <svg 
            ref={svgRef}
            width={svgWidth} 
            height={svgHeight + 60}
            className="bg-white shadow-lg mx-auto"
            style={{ minWidth: 600 }}
          >
            {/* Title block */}
            <g transform={`translate(${padding}, 20)`}>
              <text fontSize="14" fontWeight="bold" fill="#333">{projectName}</text>
              <text fontSize="10" fill="#666" y="15">Cliente: {clientName}</text>
              <text fontSize="10" fill="#666" y="28">
                Vista {viewMode === 'top' ? 'Superior' : viewMode === 'front' ? 'Frontal' : 'Lateral'} | 
                Escala 1:{Math.round(10/zoom)} | {new Date().toLocaleDateString('pt-BR')}
              </text>
            </g>
            
            <g transform="translate(0, 50)">
              {/* Room outline */}
              <rect
                x={padding}
                y={padding}
                width={dims.width * scale}
                height={dims.height * scale}
                fill="#fafafa"
                stroke="#333"
                strokeWidth="1.5"
              />
              
              {/* Grid */}
              {Array.from({ length: Math.floor(dims.width / 500) + 1 }).map((_, i) => (
                <line
                  key={`grid-v-${i}`}
                  x1={padding + i * 500 * scale}
                  y1={padding}
                  x2={padding + i * 500 * scale}
                  y2={padding + dims.height * scale}
                  stroke="#eee"
                  strokeWidth="0.5"
                />
              ))}
              {Array.from({ length: Math.floor(dims.height / 500) + 1 }).map((_, i) => (
                <line
                  key={`grid-h-${i}`}
                  x1={padding}
                  y1={padding + i * 500 * scale}
                  x2={padding + dims.width * scale}
                  y2={padding + i * 500 * scale}
                  stroke="#eee"
                  strokeWidth="0.5"
                />
              ))}
              
              {/* Room dimensions */}
              <DimensionLine
                x1={padding}
                y1={padding}
                x2={padding + dims.width * scale}
                y2={padding}
                value={dims.width}
                offset={25}
              />
              <DimensionLine
                x1={padding}
                y1={padding}
                x2={padding}
                y2={padding + dims.height * scale}
                value={dims.height}
                offset={25}
                vertical
              />
              
              {/* Modules */}
              {modules.filter(m => !m.isAppliance).map(module => {
                const rect = getModuleRect(module);
                return (
                  <g key={module.id}>
                    {/* Module shape */}
                    <rect
                      x={rect.x}
                      y={rect.y}
                      width={rect.w}
                      height={rect.h}
                      fill="#e8e0d0"
                      stroke="#8b7355"
                      strokeWidth="1"
                    />
                    
                    {/* Hatch pattern for solid modules */}
                    {module.category !== 'Eletrodomésticos' && (
                      <pattern id={`hatch-${module.id}`} patternUnits="userSpaceOnUse" width="8" height="8">
                        <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#ccc" strokeWidth="0.5"/>
                      </pattern>
                    )}
                    
                    {/* Module label */}
                    <text
                      x={rect.x + rect.w / 2}
                      y={rect.y + rect.h / 2 - 4}
                      fontSize="7"
                      textAnchor="middle"
                      fill="#333"
                      fontWeight="500"
                    >
                      {module.type.length > 15 ? module.type.substring(0, 12) + '...' : module.type}
                    </text>
                    <text
                      x={rect.x + rect.w / 2}
                      y={rect.y + rect.h / 2 + 6}
                      fontSize="6"
                      textAnchor="middle"
                      fill="#666"
                    >
                      {rect.label}mm
                    </text>
                    
                    {/* Module dimensions if selected/large enough */}
                    {rect.w > 40 && (
                      <DimensionLine
                        x1={rect.x}
                        y1={rect.y + rect.h}
                        x2={rect.x + rect.w}
                        y2={rect.y + rect.h}
                        value={viewMode === 'top' ? module.width : viewMode === 'front' ? module.width : module.depth}
                        offset={-12}
                      />
                    )}
                  </g>
                );
              })}
              
              {/* Appliances (different style) */}
              {modules.filter(m => m.isAppliance).map(module => {
                const rect = getModuleRect(module);
                return (
                  <g key={module.id}>
                    <rect
                      x={rect.x}
                      y={rect.y}
                      width={rect.w}
                      height={rect.h}
                      fill="none"
                      stroke="#666"
                      strokeWidth="1"
                      strokeDasharray="4,2"
                    />
                    <text
                      x={rect.x + rect.w / 2}
                      y={rect.y + rect.h / 2}
                      fontSize="6"
                      textAnchor="middle"
                      fill="#666"
                    >
                      {module.type}
                    </text>
                  </g>
                );
              })}
              
              {/* North arrow for top view */}
              {viewMode === 'top' && (
                <g transform={`translate(${padding + dims.width * scale - 30}, ${padding + 30})`}>
                  <polygon points="0,-15 5,5 -5,5" fill="#333" />
                  <text x="0" y="15" fontSize="8" textAnchor="middle" fill="#333">N</text>
                </g>
              )}
            </g>
            
            {/* Legend */}
            <g transform={`translate(${padding}, ${svgHeight + 15})`}>
              <text fontSize="8" fill="#666">
                Módulos: {modules.filter(m => !m.isAppliance).length} | 
                Eletros: {modules.filter(m => m.isAppliance).length} | 
                Total: R$ {modules.reduce((s, m) => s + m.price, 0).toLocaleString('pt-BR')}
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default TechnicalPlan2D;
