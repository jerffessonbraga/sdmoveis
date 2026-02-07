import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';
import { FurnitureModule } from '@/types';
import { X, Play, Pause, RotateCcw, Download, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

interface ExplodedViewDialogProps {
  module: FurnitureModule;
  onClose: () => void;
}

interface PartData {
  name: string;
  position: [number, number, number];
  explodedPosition: [number, number, number];
  dimensions: [number, number, number];
  color: string;
  order: number;
}

// Component for a single exploded part
const ExplodedPart: React.FC<{
  part: PartData;
  explosionFactor: number;
  isHighlighted: boolean;
  showLabels: boolean;
}> = ({ part, explosionFactor, isHighlighted, showLabels }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Interpolate position
  const currentPos: [number, number, number] = [
    part.position[0] + (part.explodedPosition[0] - part.position[0]) * explosionFactor,
    part.position[1] + (part.explodedPosition[1] - part.position[1]) * explosionFactor,
    part.position[2] + (part.explodedPosition[2] - part.position[2]) * explosionFactor,
  ];
  
  return (
    <group position={currentPos}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={part.dimensions} />
        <meshStandardMaterial 
          color={part.color} 
          transparent={isHighlighted}
          opacity={isHighlighted ? 1 : 0.85}
          emissive={isHighlighted ? part.color : '#000'}
          emissiveIntensity={isHighlighted ? 0.2 : 0}
        />
      </mesh>
      
      {/* Edge lines */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(...part.dimensions)]} />
        <lineBasicMaterial color="#4a3520" linewidth={1} />
      </lineSegments>
      
      {/* Part label */}
      {showLabels && explosionFactor > 0.3 && (
        <Text
          position={[0, part.dimensions[1] / 2 + 0.1, 0]}
          fontSize={0.08}
          color="#333"
          anchorX="center"
          anchorY="bottom"
        >
          {part.name}
        </Text>
      )}
    </group>
  );
};

// Connection lines between parts
const ConnectionLines: React.FC<{
  parts: PartData[];
  explosionFactor: number;
}> = ({ parts, explosionFactor }) => {
  if (explosionFactor < 0.1) return null;
  
  const points: THREE.Vector3[] = [];
  
  parts.forEach(part => {
    const start = new THREE.Vector3(...part.position);
    const end = new THREE.Vector3(
      part.position[0] + (part.explodedPosition[0] - part.position[0]) * explosionFactor,
      part.position[1] + (part.explodedPosition[1] - part.position[1]) * explosionFactor,
      part.position[2] + (part.explodedPosition[2] - part.position[2]) * explosionFactor,
    );
    points.push(start, end);
  });
  
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  
  return (
    <lineSegments geometry={geometry}>
      <lineDashedMaterial 
        color="#888" 
        dashSize={0.05} 
        gapSize={0.03}
        linewidth={1}
      />
    </lineSegments>
  );
};

// Main 3D scene
const ExplodedScene: React.FC<{
  module: FurnitureModule;
  explosionFactor: number;
  highlightedPart: number | null;
  showLabels: boolean;
  autoRotate: boolean;
}> = ({ module, explosionFactor, highlightedPart, showLabels, autoRotate }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Generate parts based on module
  const parts = React.useMemo((): PartData[] => {
    const w = module.width / 1000;
    const h = module.height / 1000;
    const d = module.depth / 1000;
    const t = 0.018; // 18mm thickness
    const woodColor = '#c4a77d';
    const backColor = '#8b7355';
    
    const partsData: PartData[] = [
      // Left side panel
      {
        name: 'Lateral Esq',
        position: [-w/2 + t/2, 0, 0],
        explodedPosition: [-w/2 - 0.15, 0, 0],
        dimensions: [t, h, d],
        color: woodColor,
        order: 1,
      },
      // Right side panel
      {
        name: 'Lateral Dir',
        position: [w/2 - t/2, 0, 0],
        explodedPosition: [w/2 + 0.15, 0, 0],
        dimensions: [t, h, d],
        color: woodColor,
        order: 2,
      },
      // Top panel
      {
        name: 'Tampo',
        position: [0, h/2 - t/2, 0],
        explodedPosition: [0, h/2 + 0.2, 0],
        dimensions: [w - t*2, t, d],
        color: woodColor,
        order: 3,
      },
      // Bottom panel
      {
        name: 'Base',
        position: [0, -h/2 + t/2, 0],
        explodedPosition: [0, -h/2 - 0.2, 0],
        dimensions: [w - t*2, t, d],
        color: woodColor,
        order: 4,
      },
      // Back panel
      {
        name: 'Fundo',
        position: [0, 0, -d/2 + 0.003],
        explodedPosition: [0, 0, -d/2 - 0.2],
        dimensions: [w - 0.01, h - 0.01, 0.003],
        color: backColor,
        order: 5,
      },
    ];
    
    // Add shelves
    const numShelves = Math.max(1, Math.floor(h * 1000 / 400) - 1);
    for (let i = 0; i < numShelves; i++) {
      const shelfY = -h/2 + (h / (numShelves + 1)) * (i + 1);
      partsData.push({
        name: `Prateleira ${i + 1}`,
        position: [0, shelfY, 0.01],
        explodedPosition: [0.2 + i * 0.1, shelfY + 0.15 * (i + 1), 0.15],
        dimensions: [w - t*2 - 0.01, t, d - t - 0.02],
        color: woodColor,
        order: 6 + i,
      });
    }
    
    // Add doors if applicable
    const type = module.type.toLowerCase();
    if (type.includes('1p') || type.includes('2p')) {
      const numDoors = type.includes('2p') ? 2 : 1;
      const doorWidth = (w - 0.008) / numDoors;
      
      for (let i = 0; i < numDoors; i++) {
        partsData.push({
          name: `Porta ${i + 1}`,
          position: [-w/2 + doorWidth/2 + 0.002 + i * doorWidth, 0, d/2 + 0.002],
          explodedPosition: [-w/2 + doorWidth/2 + 0.002 + i * doorWidth, 0, d/2 + 0.35],
          dimensions: [doorWidth - 0.004, h - 0.004, t],
          color: woodColor,
          order: 10 + i,
        });
      }
    }
    
    return partsData;
  }, [module]);
  
  useFrame(() => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += 0.003;
    }
  });
  
  return (
    <group ref={groupRef}>
      <ConnectionLines parts={parts} explosionFactor={explosionFactor} />
      {parts.map((part, idx) => (
        <ExplodedPart
          key={idx}
          part={part}
          explosionFactor={explosionFactor}
          isHighlighted={highlightedPart === idx}
          showLabels={showLabels}
        />
      ))}
    </group>
  );
};

const ExplodedViewDialog: React.FC<ExplodedViewDialogProps> = ({ module, onClose }) => {
  const [explosionFactor, setExplosionFactor] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlightedPart, setHighlightedPart] = useState<number | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Animation
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setExplosionFactor(prev => {
        if (prev >= 1) {
          setIsPlaying(false);
          return 1;
        }
        return prev + 0.02;
      });
    }, 30);
    
    return () => clearInterval(interval);
  }, [isPlaying]);
  
  const resetAnimation = () => {
    setExplosionFactor(0);
    setIsPlaying(false);
    setCurrentStep(0);
  };
  
  const steps = [
    { name: 'Montado', factor: 0 },
    { name: 'Parcial', factor: 0.5 },
    { name: 'Explodido', factor: 1 },
  ];
  
  const goToStep = (idx: number) => {
    setCurrentStep(idx);
    setExplosionFactor(steps[idx].factor);
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] border border-amber-500/30 rounded-lg shadow-2xl w-[900px] h-[700px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-3 flex items-center justify-between">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Layers size={18} />
            Vista Explodida - {module.type}
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* 3D View */}
        <div className="flex-1 relative">
          <Canvas shadows className="bg-gradient-to-br from-gray-100 to-gray-300">
            <PerspectiveCamera makeDefault position={[2, 1.5, 2]} fov={45} />
            <OrbitControls enablePan enableZoom enableRotate />
            
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
            <directionalLight position={[-3, 5, -3]} intensity={0.3} />
            
            <Suspense fallback={null}>
              <ExplodedScene
                module={module}
                explosionFactor={explosionFactor}
                highlightedPart={highlightedPart}
                showLabels={showLabels}
                autoRotate={autoRotate}
              />
            </Suspense>
            
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -module.height / 2000 - 0.01, 0]} receiveShadow>
              <planeGeometry args={[3, 3]} />
              <shadowMaterial opacity={0.3} />
            </mesh>
          </Canvas>
          
          {/* Overlay controls */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4">
            {/* Explosion slider */}
            <div className="flex-1 bg-black/50 rounded-lg px-4 py-2 flex items-center gap-3">
              <span className="text-white text-xs">Explosão:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={explosionFactor * 100}
                onChange={(e) => setExplosionFactor(parseInt(e.target.value) / 100)}
                className="flex-1 accent-amber-500"
              />
              <span className="text-amber-400 text-xs w-12">{Math.round(explosionFactor * 100)}%</span>
            </div>
            
            {/* Playback controls */}
            <div className="flex gap-1">
              <button
                onClick={resetAnimation}
                className="w-8 h-8 bg-black/50 hover:bg-black/70 rounded flex items-center justify-center text-white"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 bg-amber-500 hover:bg-amber-400 rounded flex items-center justify-center text-amber-950"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </div>
          </div>
          
          {/* Step navigation */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <button
              onClick={() => goToStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="w-8 h-8 bg-black/50 hover:bg-black/70 rounded flex items-center justify-center text-white disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex gap-1">
              {steps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => goToStep(idx)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    currentStep === idx
                      ? 'bg-amber-500 text-amber-950'
                      : 'bg-black/50 text-white hover:bg-black/70'
                  }`}
                >
                  {step.name}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => goToStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep === steps.length - 1}
              className="w-8 h-8 bg-black/50 hover:bg-black/70 rounded flex items-center justify-center text-white disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#16213e] border-t border-amber-500/20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="w-3 h-3 accent-amber-500"
              />
              <span className="text-amber-100 text-xs">Etiquetas</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRotate}
                onChange={(e) => setAutoRotate(e.target.checked)}
                className="w-3 h-3 accent-amber-500"
              />
              <span className="text-amber-100 text-xs">Auto-rotação</span>
            </label>
          </div>
          
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white">
              Fechar
            </button>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-sm font-bold flex items-center gap-2">
              <Download size={14} />
              Exportar Imagem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplodedViewDialog;
