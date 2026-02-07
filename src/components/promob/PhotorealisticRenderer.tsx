import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment,
  ContactShadows,
  AccumulativeShadows,
  RandomizedLight,
  BakeShadows,
  useProgress,
  Html
} from '@react-three/drei';
import * as THREE from 'three';
import { FurnitureModule } from '@/types';
import { 
  X, 
  Camera, 
  Download, 
  Settings, 
  Sun, 
  Moon, 
  Loader2,
  Sparkles,
  Image,
  Sliders,
  RefreshCw
} from 'lucide-react';

interface PhotorealisticRendererProps {
  modules: FurnitureModule[];
  floorWidth: number;
  floorDepth: number;
  wallHeight: number;
  onClose: () => void;
}

interface RenderSettings {
  quality: 'draft' | 'medium' | 'high' | 'ultra';
  timeOfDay: 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';
  exposure: number;
  shadows: boolean;
  reflections: boolean;
  ambientOcclusion: boolean;
  antialiasing: boolean;
  bloom: boolean;
  environmentMap: string;
}

const QUALITY_SETTINGS = {
  draft: { samples: 4, resolution: 1 },
  medium: { samples: 16, resolution: 1.5 },
  high: { samples: 64, resolution: 2 },
  ultra: { samples: 256, resolution: 2 },
};

const TIME_SETTINGS = {
  morning: { sunPosition: [50, 20, 30], intensity: 0.8, color: '#ffe4c4' },
  noon: { sunPosition: [0, 100, 0], intensity: 1.2, color: '#ffffff' },
  afternoon: { sunPosition: [-50, 40, -30], intensity: 1, color: '#fff5e6' },
  evening: { sunPosition: [-80, 10, -50], intensity: 0.5, color: '#ffb366' },
  night: { sunPosition: [0, -50, 0], intensity: 0.1, color: '#4477aa' },
};

const ENVIRONMENT_MAPS = [
  { id: 'apartment', name: 'Apartamento', preset: 'apartment' },
  { id: 'studio', name: 'Estúdio', preset: 'studio' },
  { id: 'city', name: 'Cidade', preset: 'city' },
  { id: 'sunset', name: 'Pôr do Sol', preset: 'sunset' },
  { id: 'dawn', name: 'Amanhecer', preset: 'dawn' },
  { id: 'night', name: 'Noite', preset: 'night' },
  { id: 'warehouse', name: 'Galpão', preset: 'warehouse' },
  { id: 'forest', name: 'Floresta', preset: 'forest' },
];

// Loading indicator
const Loader: React.FC = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
        <p className="text-white text-sm">{progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
};

// Room with realistic materials
const RealisticRoom: React.FC<{
  floorWidth: number;
  floorDepth: number;
  wallHeight: number;
  settings: RenderSettings;
}> = ({ floorWidth, floorDepth, wallHeight, settings }) => {
  const w = floorWidth / 1000;
  const d = floorDepth / 1000;
  const h = wallHeight / 1000;
  
  return (
    <group>
      {/* Floor with realistic material */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial 
          color="#8b7355" 
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      
      {/* Walls */}
      {[
        { pos: [0, h/2, -d/2] as [number, number, number], rot: [0, 0, 0] as [number, number, number], size: [w, h] as [number, number] },
        { pos: [0, h/2, d/2] as [number, number, number], rot: [0, Math.PI, 0] as [number, number, number], size: [w, h] as [number, number] },
        { pos: [-w/2, h/2, 0] as [number, number, number], rot: [0, Math.PI/2, 0] as [number, number, number], size: [d, h] as [number, number] },
        { pos: [w/2, h/2, 0] as [number, number, number], rot: [0, -Math.PI/2, 0] as [number, number, number], size: [d, h] as [number, number] },
      ].map((wall, i) => (
        <mesh key={i} position={wall.pos} rotation={wall.rot} receiveShadow>
          <planeGeometry args={wall.size} />
          <meshStandardMaterial 
            color="#f5f5f0" 
            roughness={0.9}
            metalness={0}
          />
        </mesh>
      ))}
      
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, h, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} />
      </mesh>
      
      {/* Baseboard */}
      <mesh position={[0, 0.05, -d/2 + 0.01]}>
        <boxGeometry args={[w, 0.1, 0.02]} />
        <meshStandardMaterial color="#ffffff" roughness={0.7} />
      </mesh>
    </group>
  );
};

// Module with realistic material
const RealisticModule: React.FC<{ 
  module: FurnitureModule; 
  settings: RenderSettings;
}> = ({ module, settings }) => {
  const w = module.width / 1000;
  const h = module.height / 1000;
  const d = module.depth / 1000;
  
  // Generate wood-like color based on finish
  const getWoodColor = (finish: string) => {
    const colors: Record<string, string> = {
      'Branco Tx': '#f5f5f0',
      'Preto Tx': '#1a1a1a',
      'Carvalho Hanover': '#c4a77d',
      'Nogueira': '#5c4033',
      'Cinza Urbano': '#6b6b6b',
      'Amadeirado': '#b8956b',
      'Freijó': '#9b7b5c',
      'Rústico': '#8b6914',
      'Champagne': '#f7e7ce',
      'Off White': '#faf9f6',
      'Grafite': '#383838',
    };
    return colors[finish] || '#c4a77d';
  };
  
  return (
    <group
      position={[module.x / 1000, module.y / 1000 + h / 2, module.z / 1000]}
      rotation={[0, (module.rotation * Math.PI) / 180, 0]}
    >
      {/* Main body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={getWoodColor(module.finish)}
          roughness={0.5}
          metalness={0.05}
          envMapIntensity={settings.reflections ? 0.5 : 0}
        />
      </mesh>
      
      {/* Edge highlight */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(w, h, d)]} />
        <lineBasicMaterial color="#4a3520" linewidth={1} />
      </lineSegments>
    </group>
  );
};

// Accumulative shadow ground
const ShadowGround: React.FC<{
  floorWidth: number;
  floorDepth: number;
  settings: RenderSettings;
}> = ({ floorWidth, floorDepth, settings }) => {
  if (!settings.shadows) return null;
  
  const timeConfig = TIME_SETTINGS[settings.timeOfDay];
  
  return (
    <AccumulativeShadows
      temporal
      frames={QUALITY_SETTINGS[settings.quality].samples}
      color="#000000"
      colorBlend={0.5}
      toneMapped={true}
      alphaTest={0.7}
      opacity={0.6}
      scale={Math.max(floorWidth, floorDepth) / 500}
      position={[0, 0.01, 0]}
    >
      <RandomizedLight
        amount={8}
        radius={5}
        ambient={0.5}
        intensity={1}
        position={timeConfig.sunPosition as [number, number, number]}
        bias={0.001}
      />
    </AccumulativeShadows>
  );
};

// Post-processing effects manager
const EffectsManager: React.FC<{ settings: RenderSettings }> = ({ settings }) => {
  const { gl } = useThree();
  
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = settings.exposure;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [gl, settings.exposure]);
  
  return null;
};

const PhotorealisticRenderer: React.FC<PhotorealisticRendererProps> = ({
  modules,
  floorWidth,
  floorDepth,
  wallHeight,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [settings, setSettings] = useState<RenderSettings>({
    quality: 'high',
    timeOfDay: 'afternoon',
    exposure: 1,
    shadows: true,
    reflections: true,
    ambientOcclusion: true,
    antialiasing: true,
    bloom: false,
    environmentMap: 'apartment',
  });
  const [isRendering, setIsRendering] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [renderProgress, setRenderProgress] = useState(0);
  
  const timeConfig = TIME_SETTINGS[settings.timeOfDay];
  
  const captureImage = () => {
    setIsRendering(true);
    setRenderProgress(0);
    
    // Simulate render progress
    const interval = setInterval(() => {
      setRenderProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Capture canvas
          const canvas = document.querySelector('canvas');
          if (canvas) {
            const link = document.createElement('a');
            link.download = `render_${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
          }
          
          setIsRendering(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };
  
  return (
    <div className="fixed inset-0 bg-black flex z-50">
      {/* Settings Panel */}
      {showSettings && (
        <div className="w-72 bg-[#1a1a2e] border-r border-amber-500/20 p-4 overflow-auto">
          <h3 className="text-amber-400 font-bold mb-4 flex items-center gap-2">
            <Sliders size={16} />
            Configurações de Render
          </h3>
          
          {/* Quality */}
          <div className="mb-4">
            <label className="text-amber-300/70 text-xs block mb-1">Qualidade</label>
            <select
              value={settings.quality}
              onChange={(e) => setSettings(s => ({ ...s, quality: e.target.value as RenderSettings['quality'] }))}
              className="w-full bg-[#16213e] border border-amber-500/20 text-amber-100 text-sm px-2 py-1.5 rounded"
            >
              <option value="draft">Rascunho (Rápido)</option>
              <option value="medium">Médio</option>
              <option value="high">Alto</option>
              <option value="ultra">Ultra (Lento)</option>
            </select>
          </div>
          
          {/* Time of day */}
          <div className="mb-4">
            <label className="text-amber-300/70 text-xs block mb-1">Hora do Dia</label>
            <div className="grid grid-cols-5 gap-1">
              {Object.keys(TIME_SETTINGS).map(time => (
                <button
                  key={time}
                  onClick={() => setSettings(s => ({ ...s, timeOfDay: time as RenderSettings['timeOfDay'] }))}
                  className={`p-2 rounded text-center transition-colors ${
                    settings.timeOfDay === time
                      ? 'bg-amber-500 text-amber-950'
                      : 'bg-[#16213e] text-amber-300/70 hover:bg-amber-500/20'
                  }`}
                  title={time}
                >
                  {time === 'night' ? <Moon size={14} /> : <Sun size={14} />}
                </button>
              ))}
            </div>
          </div>
          
          {/* Exposure */}
          <div className="mb-4">
            <label className="text-amber-300/70 text-xs block mb-1">
              Exposição: {settings.exposure.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.2"
              max="3"
              step="0.1"
              value={settings.exposure}
              onChange={(e) => setSettings(s => ({ ...s, exposure: parseFloat(e.target.value) }))}
              className="w-full accent-amber-500"
            />
          </div>
          
          {/* Environment */}
          <div className="mb-4">
            <label className="text-amber-300/70 text-xs block mb-1">Ambiente (HDRI)</label>
            <select
              value={settings.environmentMap}
              onChange={(e) => setSettings(s => ({ ...s, environmentMap: e.target.value }))}
              className="w-full bg-[#16213e] border border-amber-500/20 text-amber-100 text-sm px-2 py-1.5 rounded"
            >
              {ENVIRONMENT_MAPS.map(env => (
                <option key={env.id} value={env.id}>{env.name}</option>
              ))}
            </select>
          </div>
          
          {/* Toggles */}
          <div className="space-y-2 mb-4">
            {[
              { key: 'shadows', label: 'Sombras Suaves' },
              { key: 'reflections', label: 'Reflexos' },
              { key: 'ambientOcclusion', label: 'Oclusão Ambiente' },
              { key: 'antialiasing', label: 'Antialiasing' },
              { key: 'bloom', label: 'Bloom/Brilho' },
            ].map(opt => (
              <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[opt.key as keyof RenderSettings] as boolean}
                  onChange={(e) => setSettings(s => ({ ...s, [opt.key]: e.target.checked }))}
                  className="w-4 h-4 accent-amber-500"
                />
                <span className="text-amber-100 text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
          
          <hr className="border-amber-500/20 my-4" />
          
          {/* Render button */}
          <button
            onClick={captureImage}
            disabled={isRendering}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isRendering ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Renderizando... {renderProgress}%
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Renderizar Imagem
              </>
            )}
          </button>
          
          {/* Progress bar */}
          {isRendering && (
            <div className="mt-2 w-full h-2 bg-[#16213e] rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 transition-all duration-200"
                style={{ width: `${renderProgress}%` }}
              />
            </div>
          )}
        </div>
      )}
      
      {/* 3D View */}
      <div className="flex-1 relative">
        <Canvas
          ref={canvasRef}
          shadows
          dpr={QUALITY_SETTINGS[settings.quality].resolution}
          gl={{ 
            preserveDrawingBuffer: true,
            antialias: settings.antialiasing,
          }}
          className="bg-gradient-to-br from-gray-200 to-gray-400"
        >
          <PerspectiveCamera makeDefault position={[4, 3, 6]} fov={50} />
          <OrbitControls 
            enablePan 
            enableZoom 
            enableRotate
            minDistance={1}
            maxDistance={15}
          />
          
          <EffectsManager settings={settings} />
          
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight
            position={timeConfig.sunPosition as [number, number, number]}
            intensity={timeConfig.intensity}
            color={timeConfig.color}
            castShadow={settings.shadows}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <hemisphereLight args={['#f0f5ff', '#d0c8b0', 0.3]} />
          
          <Suspense fallback={<Loader />}>
            {/* Environment map */}
            <Environment 
              preset={settings.environmentMap as any}
              background={false}
            />
            
            {/* Room */}
            <RealisticRoom
              floorWidth={floorWidth}
              floorDepth={floorDepth}
              wallHeight={wallHeight}
              settings={settings}
            />
            
            {/* Shadows */}
            <ShadowGround
              floorWidth={floorWidth}
              floorDepth={floorDepth}
              settings={settings}
            />
            
            {/* Modules */}
            {modules.map(mod => (
              <RealisticModule 
                key={mod.id} 
                module={mod}
                settings={settings}
              />
            ))}
            
            <BakeShadows />
          </Suspense>
        </Canvas>
        
        {/* Toggle settings button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white"
        >
          <Settings size={20} />
        </button>
        
        {/* Quick actions */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            onClick={captureImage}
            disabled={isRendering}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-lg flex items-center gap-2"
          >
            <Camera size={16} />
            Capturar
          </button>
        </div>
        
        {/* Header */}
        <div className="absolute top-0 right-0 p-4">
          <button onClick={onClose} className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white">
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotorealisticRenderer;
