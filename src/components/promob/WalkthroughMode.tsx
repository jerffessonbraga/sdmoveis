import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, PointerLockControls, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { FurnitureModule } from '@/types';
import { X, Play, Pause, RotateCcw, Camera, Settings, Footprints, Eye, Video } from 'lucide-react';

interface WalkthroughModeProps {
  modules: FurnitureModule[];
  floorWidth: number;
  floorDepth: number;
  wallHeight: number;
  onClose: () => void;
}

// First person camera controller
const FirstPersonController: React.FC<{
  speed: number;
  position: THREE.Vector3;
  onPositionChange: (pos: THREE.Vector3) => void;
}> = ({ speed, position, onPositionChange }) => {
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const keys = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    camera.position.copy(position);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current.add(e.code);
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current.delete(e.code);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [camera, position]);
  
  useFrame((_, delta) => {
    direction.current.set(0, 0, 0);
    
    if (keys.current.has('KeyW') || keys.current.has('ArrowUp')) {
      direction.current.z -= 1;
    }
    if (keys.current.has('KeyS') || keys.current.has('ArrowDown')) {
      direction.current.z += 1;
    }
    if (keys.current.has('KeyA') || keys.current.has('ArrowLeft')) {
      direction.current.x -= 1;
    }
    if (keys.current.has('KeyD') || keys.current.has('ArrowRight')) {
      direction.current.x += 1;
    }
    
    direction.current.normalize();
    
    // Apply camera rotation to movement direction
    const euler = new THREE.Euler(0, camera.rotation.y, 0, 'YXZ');
    direction.current.applyEuler(euler);
    
    velocity.current.lerp(direction.current.multiplyScalar(speed * delta), 0.1);
    camera.position.add(velocity.current);
    
    // Keep at eye level
    camera.position.y = 1.65; // 1.65m eye height
    
    onPositionChange(camera.position.clone());
  });
  
  return <PointerLockControls />;
};

// Room mesh
const Room: React.FC<{
  floorWidth: number;
  floorDepth: number;
  wallHeight: number;
}> = ({ floorWidth, floorDepth, wallHeight }) => {
  const w = floorWidth / 1000;
  const d = floorDepth / 1000;
  const h = wallHeight / 1000;
  
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#8b7355" roughness={0.8} />
      </mesh>
      
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, h, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      
      {/* Walls */}
      <mesh position={[0, h/2, -d/2]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color="#e8e4dc" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, h/2, d/2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color="#e8e4dc" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-w/2, h/2, 0]} rotation={[0, Math.PI/2, 0]}>
        <planeGeometry args={[d, h]} />
        <meshStandardMaterial color="#e8e4dc" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[w/2, h/2, 0]} rotation={[0, -Math.PI/2, 0]}>
        <planeGeometry args={[d, h]} />
        <meshStandardMaterial color="#e8e4dc" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// Module mesh (simplified)
const ModuleMesh: React.FC<{ module: FurnitureModule }> = ({ module }) => {
  const w = module.width / 1000;
  const h = module.height / 1000;
  const d = module.depth / 1000;
  
  return (
    <mesh
      position={[module.x / 1000, module.y / 1000 + h / 2, module.z / 1000]}
      rotation={[0, (module.rotation * Math.PI) / 180, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color="#c4a77d" roughness={0.5} />
    </mesh>
  );
};

// Mini-map component
const MiniMap: React.FC<{
  modules: FurnitureModule[];
  floorWidth: number;
  floorDepth: number;
  cameraPosition: THREE.Vector3;
}> = ({ modules, floorWidth, floorDepth, cameraPosition }) => {
  const scale = 100 / Math.max(floorWidth, floorDepth);
  
  return (
    <div className="absolute top-4 right-4 w-28 h-28 bg-black/70 rounded-lg overflow-hidden border border-amber-500/30">
      <svg viewBox={`${-floorWidth/2 * scale - 5} ${-floorDepth/2 * scale - 5} ${floorWidth * scale + 10} ${floorDepth * scale + 10}`} className="w-full h-full">
        {/* Room outline */}
        <rect
          x={-floorWidth/2 * scale}
          y={-floorDepth/2 * scale}
          width={floorWidth * scale}
          height={floorDepth * scale}
          fill="#333"
          stroke="#666"
          strokeWidth="1"
        />
        
        {/* Modules */}
        {modules.map(mod => (
          <rect
            key={mod.id}
            x={(mod.x - mod.width/2) * scale / 1000}
            y={(mod.z - mod.depth/2) * scale / 1000}
            width={mod.width * scale / 1000}
            height={mod.depth * scale / 1000}
            fill="#c4a77d"
            stroke="#8b5a2b"
            strokeWidth="0.5"
          />
        ))}
        
        {/* Camera position */}
        <g transform={`translate(${cameraPosition.x * scale * 1000}, ${cameraPosition.z * scale * 1000})`}>
          <polygon
            points="0,-4 3,3 -3,3"
            fill="#f59e0b"
            stroke="#f59e0b"
          />
          <circle r="2" fill="#f59e0b" />
        </g>
      </svg>
    </div>
  );
};

const WalkthroughMode: React.FC<WalkthroughModeProps> = ({
  modules,
  floorWidth,
  floorDepth,
  wallHeight,
  onClose,
}) => {
  const [isLocked, setIsLocked] = useState(false);
  const [cameraPosition, setCameraPosition] = useState(new THREE.Vector3(0, 1.65, floorDepth / 2000));
  const [walkSpeed, setWalkSpeed] = useState(2);
  const [isRecording, setIsRecording] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fov, setFov] = useState(75);
  
  const handlePositionChange = useCallback((pos: THREE.Vector3) => {
    setCameraPosition(pos);
  }, []);
  
  const startWalkthrough = () => {
    setIsLocked(true);
    // The PointerLockControls will request pointer lock on canvas click
  };
  
  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 px-4 py-2 flex items-center justify-between">
        <h2 className="text-white font-bold flex items-center gap-2">
          <Footprints size={18} />
          Walkthrough Virtual
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 bg-white/20 hover:bg-white/30 rounded text-white"
          >
            <Settings size={16} />
          </button>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* 3D View */}
      <div className="flex-1 relative">
        <Canvas shadows className="cursor-crosshair">
          <PerspectiveCamera makeDefault position={[0, 1.65, floorDepth / 2000]} fov={fov} />
          
          {isLocked && (
            <FirstPersonController
              speed={walkSpeed}
              position={cameraPosition}
              onPositionChange={handlePositionChange}
            />
          )}
          
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[0, wallHeight / 1000 - 0.3, 0]} intensity={0.5} color="#fff5e0" />
          
          <Suspense fallback={null}>
            <Room floorWidth={floorWidth} floorDepth={floorDepth} wallHeight={wallHeight} />
            
            {modules.map(mod => (
              <ModuleMesh key={mod.id} module={mod} />
            ))}
          </Suspense>
          
          <Sky sunPosition={[100, 20, 100]} />
        </Canvas>
        
        {/* Mini-map */}
        <MiniMap
          modules={modules}
          floorWidth={floorWidth}
          floorDepth={floorDepth}
          cameraPosition={cameraPosition}
        />
        
        {/* Instructions overlay */}
        {!isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Eye size={40} className="text-cyan-400" />
              </div>
              <h3 className="text-2xl text-white font-bold mb-2">Modo Walkthrough</h3>
              <p className="text-white/70 mb-4">Explore o ambiente em primeira pessoa</p>
              <button
                onClick={startWalkthrough}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-lg flex items-center gap-2 mx-auto"
              >
                <Play size={20} />
                Iniciar Passeio
              </button>
              <p className="text-white/50 text-sm mt-4">
                Clique na tela para travar o mouse - WASD ou setas para mover - ESC para sair
              </p>
            </div>
          </div>
        )}
        
        {/* Settings panel */}
        {showSettings && (
          <div className="absolute top-16 right-4 w-64 bg-black/80 rounded-lg p-4 border border-cyan-500/30">
            <h4 className="text-cyan-400 font-bold mb-3">Configuracoes</h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-white/70 text-xs block mb-1">Velocidade</label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={walkSpeed}
                  onChange={(e) => setWalkSpeed(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <span className="text-cyan-400 text-xs">{walkSpeed} m/s</span>
              </div>
              
              <div>
                <label className="text-white/70 text-xs block mb-1">Campo de Visao</label>
                <input
                  type="range"
                  min="50"
                  max="120"
                  value={fov}
                  onChange={(e) => setFov(parseInt(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <span className="text-cyan-400 text-xs">{fov} graus</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Recording controls */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 font-bold ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-black/50 text-white hover:bg-black/70'
            }`}
          >
            <Video size={16} />
            {isRecording ? 'Gravando...' : 'Gravar Video'}
          </button>
          
          <button className="px-4 py-2 bg-black/50 text-white hover:bg-black/70 rounded-lg flex items-center gap-2">
            <Camera size={16} />
            Capturar
          </button>
        </div>
        
        {/* Position info */}
        <div className="absolute bottom-4 right-4 bg-black/50 rounded-lg px-3 py-2 text-xs text-white/70">
          <p>X: {(cameraPosition.x * 1000).toFixed(0)}mm</p>
          <p>Z: {(cameraPosition.z * 1000).toFixed(0)}mm</p>
        </div>
        
        {/* Controls hint */}
        {isLocked && (
          <div className="absolute top-4 left-4 bg-black/50 rounded-lg px-3 py-2 text-xs text-white/70">
            <div className="grid grid-cols-3 gap-1 text-center mb-2">
              <div></div>
              <div className="bg-white/20 rounded px-2 py-1">W</div>
              <div></div>
              <div className="bg-white/20 rounded px-2 py-1">A</div>
              <div className="bg-white/20 rounded px-2 py-1">S</div>
              <div className="bg-white/20 rounded px-2 py-1">D</div>
            </div>
            <p className="text-center">ESC para sair</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalkthroughMode;
