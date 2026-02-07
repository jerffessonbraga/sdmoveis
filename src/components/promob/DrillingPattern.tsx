import React from 'react';
import { FurnitureModule } from '@/types';
import { X, Printer, Download, Circle } from 'lucide-react';

interface DrillingPatternProps {
  module: FurnitureModule;
  onClose: () => void;
}

interface DrillHole {
  x: number;
  y: number;
  diameter: number;
  depth: number;
  type: 'hinge' | 'shelf' | 'minifix' | 'dowel' | 'handle';
  face: 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
}

const DrillingPattern: React.FC<DrillingPatternProps> = ({ module, onClose }) => {
  const [selectedFace, setSelectedFace] = React.useState<'front' | 'back' | 'left' | 'right'>('front');
  
  // Generate drilling pattern based on module type
  const generateDrillHoles = (): DrillHole[] => {
    const holes: DrillHole[] = [];
    const type = module.type.toLowerCase();
    const w = module.width;
    const h = module.height;
    const d = module.depth;
    
    // Hinge holes (35mm diameter, 12mm depth)
    if (type.includes('1p') || type.includes('2p') || type.includes('3p')) {
      const numDoors = type.includes('3p') ? 3 : type.includes('2p') ? 2 : 1;
      const doorWidth = w / numDoors;
      
      for (let door = 0; door < numDoors; door++) {
        const isLeftHinge = door % 2 === 0;
        const hingeX = isLeftHinge 
          ? door * doorWidth + 22 
          : (door + 1) * doorWidth - 22;
        
        // 2-3 hinges per door depending on height
        const numHinges = h > 1200 ? 3 : 2;
        const hingeSpacing = (h - 200) / (numHinges - 1);
        
        for (let i = 0; i < numHinges; i++) {
          holes.push({
            x: hingeX,
            y: 100 + i * hingeSpacing,
            diameter: 35,
            depth: 12,
            type: 'hinge',
            face: 'front',
          });
        }
      }
    }
    
    // Drawer slide holes
    if (type.includes('gaveta')) {
      const numDrawers = parseInt(type.match(/\d/)?.[0] || '4');
      const drawerHeight = (h - 40) / numDrawers;
      
      for (let i = 0; i < numDrawers; i++) {
        const slideY = 20 + i * drawerHeight + drawerHeight / 2;
        
        // Left side holes
        holes.push(
          { x: 37, y: slideY, diameter: 5, depth: 12, type: 'shelf', face: 'left' },
          { x: d - 37, y: slideY, diameter: 5, depth: 12, type: 'shelf', face: 'left' },
        );
        
        // Right side holes
        holes.push(
          { x: 37, y: slideY, diameter: 5, depth: 12, type: 'shelf', face: 'right' },
          { x: d - 37, y: slideY, diameter: 5, depth: 12, type: 'shelf', face: 'right' },
        );
      }
    }
    
    // Shelf support holes (5mm diameter, 12mm depth) - standard 32mm system
    const shelfRows = Math.floor((h - 100) / 32);
    for (let row = 0; row < shelfRows; row++) {
      const y = 50 + row * 32;
      
      // Left side
      holes.push(
        { x: 37, y, diameter: 5, depth: 12, type: 'shelf', face: 'left' },
        { x: d - 37, y, diameter: 5, depth: 12, type: 'shelf', face: 'left' },
      );
      
      // Right side
      holes.push(
        { x: 37, y, diameter: 5, depth: 12, type: 'shelf', face: 'right' },
        { x: d - 37, y, diameter: 5, depth: 12, type: 'shelf', face: 'right' },
      );
    }
    
    // Minifix holes for panel connections (15mm diameter, 12.5mm depth)
    // Top panel
    holes.push(
      { x: 37, y: 9, diameter: 15, depth: 12.5, type: 'minifix', face: 'top' },
      { x: w - 37, y: 9, diameter: 15, depth: 12.5, type: 'minifix', face: 'top' },
      { x: w / 2, y: 9, diameter: 15, depth: 12.5, type: 'minifix', face: 'top' },
    );
    
    // Bottom panel
    holes.push(
      { x: 37, y: 9, diameter: 15, depth: 12.5, type: 'minifix', face: 'bottom' },
      { x: w - 37, y: 9, diameter: 15, depth: 12.5, type: 'minifix', face: 'bottom' },
      { x: w / 2, y: 9, diameter: 15, depth: 12.5, type: 'minifix', face: 'bottom' },
    );
    
    // Dowel holes (8mm diameter, 30mm depth)
    const dowelSpacing = Math.min(200, w / 4);
    for (let x = 50; x < w - 50; x += dowelSpacing) {
      holes.push({ x, y: 9, diameter: 8, depth: 30, type: 'dowel', face: 'top' });
      holes.push({ x, y: 9, diameter: 8, depth: 30, type: 'dowel', face: 'bottom' });
    }
    
    // Handle holes
    if (type.includes('1p') || type.includes('2p') || type.includes('3p')) {
      const numDoors = type.includes('3p') ? 3 : type.includes('2p') ? 2 : 1;
      const doorWidth = w / numDoors;
      
      for (let door = 0; door < numDoors; door++) {
        const handleX = door * doorWidth + doorWidth / 2;
        holes.push(
          { x: handleX - 64, y: h / 2, diameter: 5, depth: 20, type: 'handle', face: 'front' },
          { x: handleX + 64, y: h / 2, diameter: 5, depth: 20, type: 'handle', face: 'front' },
        );
      }
    }
    
    return holes;
  };
  
  const holes = generateDrillHoles();
  const faceHoles = holes.filter(h => h.face === selectedFace);
  
  // Get dimensions for selected face
  const getFaceDimensions = () => {
    switch (selectedFace) {
      case 'front':
      case 'back':
        return { width: module.width, height: module.height };
      case 'left':
      case 'right':
        return { width: module.depth, height: module.height };
    }
  };
  
  const faceDims = getFaceDimensions();
  const scale = Math.min(500 / faceDims.width, 400 / faceDims.height);
  const svgWidth = faceDims.width * scale + 100;
  const svgHeight = faceDims.height * scale + 100;
  
  const holeColors = {
    hinge: '#e74c3c',
    shelf: '#3498db',
    minifix: '#9b59b6',
    dowel: '#2ecc71',
    handle: '#f39c12',
  };
  
  const handlePrint = () => window.print();
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-white font-bold flex items-center gap-2">
              <Circle size={16} />
              Furação - {module.type}
            </h2>
            <div className="flex gap-1">
              {(['front', 'back', 'left', 'right'] as const).map(face => (
                <button
                  key={face}
                  onClick={() => setSelectedFace(face)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    selectedFace === face 
                      ? 'bg-white text-green-600' 
                      : 'bg-green-500/50 text-white hover:bg-green-400/50'
                  }`}
                >
                  {face === 'front' ? 'Frente' : face === 'back' ? 'Fundo' : face === 'left' ? 'Esquerda' : 'Direita'}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50 flex gap-4">
          {/* SVG Panel */}
          <div className="flex-1 bg-white rounded-lg shadow p-4">
            <svg width={svgWidth} height={svgHeight} className="mx-auto">
              {/* Panel outline */}
              <rect
                x={50}
                y={50}
                width={faceDims.width * scale}
                height={faceDims.height * scale}
                fill="#f5f0e6"
                stroke="#8b7355"
                strokeWidth="2"
              />
              
              {/* Grid (32mm system) */}
              {Array.from({ length: Math.floor(faceDims.width / 32) + 1 }).map((_, i) => (
                <line
                  key={`grid-v-${i}`}
                  x1={50 + i * 32 * scale}
                  y1={50}
                  x2={50 + i * 32 * scale}
                  y2={50 + faceDims.height * scale}
                  stroke="#ddd"
                  strokeWidth="0.5"
                  strokeDasharray="2,4"
                />
              ))}
              
              {/* Holes */}
              {faceHoles.map((hole, i) => (
                <g key={i}>
                  <circle
                    cx={50 + hole.x * scale}
                    cy={50 + (faceDims.height - hole.y) * scale}
                    r={hole.diameter * scale / 2}
                    fill={holeColors[hole.type]}
                    fillOpacity={0.3}
                    stroke={holeColors[hole.type]}
                    strokeWidth="1.5"
                  />
                  {hole.diameter >= 15 && (
                    <text
                      x={50 + hole.x * scale}
                      y={50 + (faceDims.height - hole.y) * scale + 3}
                      fontSize="8"
                      textAnchor="middle"
                      fill={holeColors[hole.type]}
                    >
                      Ø{hole.diameter}
                    </text>
                  )}
                </g>
              ))}
              
              {/* Dimensions */}
              <text x={50 + faceDims.width * scale / 2} y={40} fontSize="12" textAnchor="middle" fill="#333">
                {faceDims.width}mm
              </text>
              <text 
                x={30} 
                y={50 + faceDims.height * scale / 2} 
                fontSize="12" 
                textAnchor="middle" 
                fill="#333"
                transform={`rotate(-90, 30, ${50 + faceDims.height * scale / 2})`}
              >
                {faceDims.height}mm
              </text>
            </svg>
          </div>
          
          {/* Legend */}
          <div className="w-64 bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-gray-700 mb-3">Legenda</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(holeColors).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border-2" 
                    style={{ borderColor: color, backgroundColor: `${color}33` }}
                  />
                  <span className="capitalize">
                    {type === 'hinge' ? 'Dobradiça (Ø35)' : 
                     type === 'shelf' ? 'Prateleira (Ø5)' :
                     type === 'minifix' ? 'Minifix (Ø15)' :
                     type === 'dowel' ? 'Cavilha (Ø8)' :
                     'Puxador (Ø5)'}
                  </span>
                </div>
              ))}
            </div>
            
            <hr className="my-4" />
            
            <h3 className="font-bold text-gray-700 mb-3">Resumo</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Face: {selectedFace === 'front' ? 'Frente' : selectedFace === 'back' ? 'Fundo' : selectedFace === 'left' ? 'Esquerda' : 'Direita'}</p>
              <p>Total de furos: {faceHoles.length}</p>
              <p>Dobradiças: {faceHoles.filter(h => h.type === 'hinge').length}</p>
              <p>Prateleiras: {faceHoles.filter(h => h.type === 'shelf').length}</p>
              <p>Minifix: {faceHoles.filter(h => h.type === 'minifix').length}</p>
              <p>Cavilhas: {faceHoles.filter(h => h.type === 'dowel').length}</p>
            </div>
            
            <hr className="my-4" />
            
            <h3 className="font-bold text-gray-700 mb-3">Módulo</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>{module.type}</strong></p>
              <p>{module.width} × {module.height} × {module.depth}mm</p>
              <p>Acabamento: {module.finish}</p>
            </div>
            
            <button 
              onClick={handlePrint}
              className="w-full mt-4 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded flex items-center justify-center gap-2"
            >
              <Printer size={16} />
              Imprimir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrillingPattern;
