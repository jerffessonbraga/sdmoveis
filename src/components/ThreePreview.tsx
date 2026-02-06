import React, { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { Canvas, useThree, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Grid, Text, Line } from "@react-three/drei";
import * as THREE from "three";
import { FurnitureModule } from "@/types";

interface ThreePreviewProps {
  modules: FurnitureModule[];
  floorWidth: number;
  floorDepth: number;
  wallHeight: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateModule: (id: string, updates: Partial<FurnitureModule>) => void;
  customRotation: { x: number; y: number };
  showDimensions?: boolean;
}

// Sistema de Snap
const SNAP_THRESHOLD = 50; // mm
const DRAG_START_THRESHOLD = 8; // pixels - distância mínima para iniciar arrasto

const calculateSnap = (
  targetX: number,
  targetZ: number,
  moduleWidth: number,
  moduleDepth: number,
  floorWidth: number,
  floorDepth: number,
  otherModules: FurnitureModule[],
  moduleId: string
) => {
  let x = targetX;
  let z = targetZ;
  let snappedToWall: 'left' | 'right' | 'back' | null = null;
  let snappedToModule: string | null = null;

  const walls = {
    left: -floorWidth / 2,
    right: floorWidth / 2,
    back: -floorDepth / 2,
  };

  // Snap para paredes
  const leftEdge = targetX - moduleWidth / 2;
  if (Math.abs(leftEdge - walls.left) < SNAP_THRESHOLD) {
    x = walls.left + moduleWidth / 2;
    snappedToWall = 'left';
  }

  const rightEdge = targetX + moduleWidth / 2;
  if (Math.abs(rightEdge - walls.right) < SNAP_THRESHOLD) {
    x = walls.right - moduleWidth / 2;
    snappedToWall = 'right';
  }

  const backEdge = targetZ - moduleDepth / 2;
  if (Math.abs(backEdge - walls.back) < SNAP_THRESHOLD) {
    z = walls.back + moduleDepth / 2;
    snappedToWall = 'back';
  }

  // Snap para outros módulos
  for (const other of otherModules) {
    if (other.id === moduleId) continue;

    // Snap lateral
    const otherRightEdge = other.x + other.width / 2;
    const currentLeftEdge = x - moduleWidth / 2;
    if (Math.abs(otherRightEdge - currentLeftEdge) < SNAP_THRESHOLD && 
        Math.abs(other.z - z) < moduleDepth) {
      x = otherRightEdge + moduleWidth / 2;
      snappedToModule = other.id;
    }

    const otherLeftEdge = other.x - other.width / 2;
    const currentRightEdge = x + moduleWidth / 2;
    if (Math.abs(otherLeftEdge - currentRightEdge) < SNAP_THRESHOLD &&
        Math.abs(other.z - z) < moduleDepth) {
      x = otherLeftEdge - moduleWidth / 2;
      snappedToModule = other.id;
    }

    // Alinhamento em Z
    if (Math.abs(other.z - z) < 30) {
      z = other.z;
    }
  }

  return { x, z, snappedToWall, snappedToModule };
};

// Componente de Móvel Arrastável
interface DraggableBoxProps {
  module: FurnitureModule;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<FurnitureModule>) => void;
  floorWidth: number;
  floorDepth: number;
  allModules: FurnitureModule[];
  showDimensions: boolean;
}

const DraggableBox: React.FC<DraggableBoxProps> = ({ 
  module, 
  isSelected, 
  onSelect, 
  onUpdate,
  floorWidth,
  floorDepth,
  allModules,
  showDimensions,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { raycaster, gl, camera } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [snapInfo, setSnapInfo] = useState<{ snappedToWall: string | null; snappedToModule: string | null }>({ snappedToWall: null, snappedToModule: null });
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const dragOffset = useRef(new THREE.Vector3());
  const pointerStartPos = useRef<{ x: number; y: number } | null>(null);
  const dragStarted = useRef(false);

  const color = useMemo(() => {
    if (isDragging) return '#4a90d9';
    if (snapInfo.snappedToWall || snapInfo.snappedToModule) return '#4CAF50';
    switch (module.category) {
      case "Cozinha": return "#8B5A2B";
      case "Dormitório": return "#654321";
      case "Sala": return "#A0522D";
      default: return "#D2691E";
    }
  }, [module.category, isDragging, snapInfo]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onSelect();
    
    // Armazena posição inicial do ponteiro para verificar threshold
    pointerStartPos.current = { x: e.clientX, y: e.clientY };
    dragStarted.current = false;
    setIsPointerDown(true);
    gl.domElement.style.cursor = 'grabbing';
    
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(dragPlane.current, intersection);
    dragOffset.current.copy(intersection).sub(
      new THREE.Vector3(module.x / 1000, 0, module.z / 1000)
    );
  };

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!isPointerDown) return;
    e.stopPropagation();

    // Verifica se passou do threshold para iniciar arrasto
    if (!dragStarted.current && pointerStartPos.current) {
      const dx = e.clientX - pointerStartPos.current.x;
      const dy = e.clientY - pointerStartPos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < DRAG_START_THRESHOLD) {
        return; // Ainda não passou do threshold, não arrasta
      }
      dragStarted.current = true;
      setIsDragging(true);
    }

    if (!isDragging) return;

    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(dragPlane.current, intersection);
    
    let newX = (intersection.x - dragOffset.current.x) * 1000;
    let newZ = (intersection.z - dragOffset.current.z) * 1000;

    // Aplicar snap
    const snap = calculateSnap(
      newX, newZ, 
      module.width, module.depth,
      floorWidth, floorDepth,
      allModules, module.id
    );

    newX = snap.x;
    newZ = snap.z;
    setSnapInfo({ snappedToWall: snap.snappedToWall, snappedToModule: snap.snappedToModule });

    // Clamp para dentro do ambiente
    const halfW = module.width / 2;
    const halfD = module.depth / 2;
    newX = Math.max(-floorWidth / 2 + halfW, Math.min(floorWidth / 2 - halfW, newX));
    newZ = Math.max(-floorDepth / 2 + halfD, Math.min(floorDepth / 2 - halfD, newZ));

    onUpdate({ x: newX, z: newZ });
  }, [isPointerDown, isDragging, raycaster, module, floorWidth, floorDepth, allModules, onUpdate]);

  const handlePointerUp = useCallback(() => {
    if (isPointerDown) {
      setIsPointerDown(false);
      setIsDragging(false);
      dragStarted.current = false;
      pointerStartPos.current = null;
      setSnapInfo({ snappedToWall: null, snappedToModule: null });
      gl.domElement.style.cursor = 'default';
    }
  }, [isPointerDown, gl]);

  // Adiciona listeners globais para capturar mouse fora do objeto
  useEffect(() => {
    if (isPointerDown) {
      const canvas = gl.domElement;
      
      const onMove = (e: PointerEvent) => {
        // Verifica threshold antes de iniciar arrasto
        if (!dragStarted.current && pointerStartPos.current) {
          const dx = e.clientX - pointerStartPos.current.x;
          const dy = e.clientY - pointerStartPos.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < DRAG_START_THRESHOLD) {
            return;
          }
          dragStarted.current = true;
          setIsDragging(true);
        }

        if (!dragStarted.current) return;

        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
        
        const intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(dragPlane.current, intersection);
        
        let newX = (intersection.x - dragOffset.current.x) * 1000;
        let newZ = (intersection.z - dragOffset.current.z) * 1000;

        const snap = calculateSnap(
          newX, newZ, 
          module.width, module.depth,
          floorWidth, floorDepth,
          allModules, module.id
        );

        newX = snap.x;
        newZ = snap.z;
        setSnapInfo({ snappedToWall: snap.snappedToWall, snappedToModule: snap.snappedToModule });

        const halfW = module.width / 2;
        const halfD = module.depth / 2;
        newX = Math.max(-floorWidth / 2 + halfW, Math.min(floorWidth / 2 - halfW, newX));
        newZ = Math.max(-floorDepth / 2 + halfD, Math.min(floorDepth / 2 - halfD, newZ));

        onUpdate({ x: newX, z: newZ });
      };

      const onUp = () => {
        setIsPointerDown(false);
        setIsDragging(false);
        dragStarted.current = false;
        pointerStartPos.current = null;
        setSnapInfo({ snappedToWall: null, snappedToModule: null });
        gl.domElement.style.cursor = 'default';
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      
      return () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
    }
  }, [isPointerDown, gl, raycaster, camera, module, floorWidth, floorDepth, allModules, onUpdate]);

  const position: [number, number, number] = [
    module.x / 1000,
    module.y / 1000 + module.height / 2000,
    module.z / 1000,
  ];

  const size: [number, number, number] = [
    module.width / 1000,
    module.height / 1000,
    module.depth / 1000,
  ];

  // Calcular distâncias
  const distToLeftWall = Math.round(module.x - module.width / 2 + floorWidth / 2);
  const distToBackWall = Math.round(module.z - module.depth / 2 + floorDepth / 2);

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        rotation={[0, (module.rotation * Math.PI) / 180, 0]}
        onPointerDown={handlePointerDown}
        onPointerOver={() => { if (!isDragging) gl.domElement.style.cursor = 'grab'; }}
        onPointerOut={() => { if (!isDragging) gl.domElement.style.cursor = 'default'; }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.1}
          emissive={isSelected ? "#d4af37" : "#000000"}
          emissiveIntensity={isSelected ? 0.3 : 0}
          transparent={isDragging}
          opacity={isDragging ? 0.85 : 1}
        />
      </mesh>

      {/* Borda de seleção */}
      {isSelected && (
        <lineSegments position={position} rotation={[0, (module.rotation * Math.PI) / 180, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(size[0] + 0.02, size[1] + 0.02, size[2] + 0.02)]} />
          <lineBasicMaterial color="#d4af37" linewidth={2} />
        </lineSegments>
      )}

      {/* Cotas do módulo selecionado */}
      {isSelected && showDimensions && (
        <>
          {/* Largura */}
          <Text
            position={[position[0], 0.02, position[2] + size[2] / 2 + 0.15]}
            fontSize={0.08}
            color="#0a246a"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.004}
            outlineColor="#ffffff"
          >
            {module.width}mm
          </Text>

          {/* Distância para parede esquerda */}
          {distToLeftWall > 50 && (
            <>
              <Line
                points={[
                  [-floorWidth / 2000, 0.02, position[2]],
                  [position[0] - size[0] / 2, 0.02, position[2]],
                ]}
                color="#ff6b6b"
                lineWidth={2}
                dashed
                dashSize={0.05}
                gapSize={0.03}
              />
              <Text
                position={[(-floorWidth / 2000 + position[0] - size[0] / 2) / 2, 0.1, position[2]]}
                fontSize={0.07}
                color="#ff6b6b"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.003}
                outlineColor="#ffffff"
              >
                {distToLeftWall}mm
              </Text>
            </>
          )}

          {/* Distância para parede de fundo */}
          {distToBackWall > 50 && (
            <>
              <Line
                points={[
                  [position[0], 0.02, -floorDepth / 2000],
                  [position[0], 0.02, position[2] - size[2] / 2],
                ]}
                color="#4ecdc4"
                lineWidth={2}
                dashed
                dashSize={0.05}
                gapSize={0.03}
              />
              <Text
                position={[position[0] + 0.15, 0.1, (-floorDepth / 2000 + position[2] - size[2] / 2) / 2]}
                fontSize={0.07}
                color="#4ecdc4"
                anchorX="center"
                anchorY="middle"
                rotation={[0, Math.PI / 2, 0]}
                outlineWidth={0.003}
                outlineColor="#ffffff"
              >
                {distToBackWall}mm
              </Text>
            </>
          )}
        </>
      )}

      {/* Indicador de snap */}
      {(snapInfo.snappedToWall || snapInfo.snappedToModule) && (
        <Text
          position={[position[0], position[1] + size[1] / 2 + 0.15, position[2]]}
          fontSize={0.06}
          color="#4CAF50"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.003}
          outlineColor="#ffffff"
        >
          ⚡ SNAP
        </Text>
      )}
    </group>
  );
};

// Componente do Ambiente
interface RoomProps {
  floorWidth: number;
  floorDepth: number;
  wallHeight: number;
}

const Room: React.FC<RoomProps> = ({ floorWidth, floorDepth, wallHeight }) => {
  const fw = floorWidth / 1000;
  const fd = floorDepth / 1000;
  const wh = wallHeight / 1000;

  return (
    <group>
      {/* Chão */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[fw, fd]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.9} />
      </mesh>

      {/* Parede de fundo */}
      <mesh position={[0, wh / 2, -fd / 2]}>
        <planeGeometry args={[fw, wh]} />
        <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>

      {/* Parede esquerda */}
      <mesh position={[-fw / 2, wh / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[fd, wh]} />
        <meshStandardMaterial color="#fafafa" side={THREE.DoubleSide} />
      </mesh>

      {/* Parede direita */}
      <mesh position={[fw / 2, wh / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[fd, wh]} />
        <meshStandardMaterial color="#fafafa" side={THREE.DoubleSide} />
      </mesh>

      {/* Grade no chão */}
      <Grid
        position={[0, 0.001, 0]}
        args={[fw, fd]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#d0d0d0"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#b0b0b0"
        fadeDistance={30}
        infiniteGrid={false}
      />

      {/* Réguas nas paredes */}
      {/* Régua parede esquerda */}
      {Array.from({ length: Math.floor(fd) + 1 }).map((_, i) => (
        <group key={`ruler-left-${i}`} position={[-fw / 2 - 0.02, 0.05, -fd / 2 + i]}>
          <mesh>
            <boxGeometry args={[0.01, 0.02, 0.01]} />
            <meshBasicMaterial color="#666" />
          </mesh>
          {i % 1 === 0 && (
            <Text
              position={[-0.05, 0, 0]}
              fontSize={0.04}
              color="#666"
              anchorX="right"
              rotation={[0, Math.PI / 2, 0]}
            >
              {i}m
            </Text>
          )}
        </group>
      ))}

      {/* Régua parede de fundo */}
      {Array.from({ length: Math.floor(fw) + 1 }).map((_, i) => (
        <group key={`ruler-back-${i}`} position={[-fw / 2 + i, 0.05, -fd / 2 - 0.02]}>
          <mesh>
            <boxGeometry args={[0.01, 0.02, 0.01]} />
            <meshBasicMaterial color="#666" />
          </mesh>
          {i % 1 === 0 && (
            <Text
              position={[0, 0, -0.05]}
              fontSize={0.04}
              color="#666"
              anchorX="center"
            >
              {i}m
            </Text>
          )}
        </group>
      ))}
    </group>
  );
};

// Controlador de câmera
interface CameraControllerProps {
  customRotation: { x: number; y: number };
}

const CameraController: React.FC<CameraControllerProps> = ({ customRotation }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (controlsRef.current) {
      const radius = 6;
      const xRad = (customRotation.x * Math.PI) / 180;
      const yRad = (customRotation.y * Math.PI) / 180;
      
      camera.position.x = radius * Math.sin(yRad) * Math.cos(xRad);
      camera.position.y = radius * Math.sin(-xRad) + 2;
      camera.position.z = radius * Math.cos(yRad) * Math.cos(xRad);
      camera.lookAt(0, 0.5, 0);
    }
  }, [customRotation, camera]);

  return <OrbitControls ref={controlsRef} target={[0, 0.5, 0]} enablePan enableZoom enableRotate />;
};

// Componente principal
const ThreePreview: React.FC<ThreePreviewProps> = ({
  modules,
  floorWidth,
  floorDepth,
  wallHeight,
  selectedId,
  onSelect,
  onUpdateModule,
  customRotation,
  showDimensions = true,
}) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded overflow-hidden">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[4, 3, 6]} fov={50} />
        <CameraController customRotation={customRotation} />
        
        {/* Iluminação */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[8, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-5, 5, -5]} intensity={0.4} />
        <hemisphereLight args={["#ffffff", "#b0b0b0", 0.6]} />

        {/* Sala */}
        <Room floorWidth={floorWidth} floorDepth={floorDepth} wallHeight={wallHeight} />

        {/* Módulos de móveis */}
        {modules.map((module) => (
          <DraggableBox
            key={module.id}
            module={module}
            isSelected={selectedId === module.id}
            onSelect={() => onSelect(module.id)}
            onUpdate={(updates) => onUpdateModule(module.id, updates)}
            floorWidth={floorWidth}
            floorDepth={floorDepth}
            allModules={modules}
            showDimensions={showDimensions}
          />
        ))}

        {/* Clique no espaço vazio para desselecionar */}
        <mesh
          position={[0, -0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={() => onSelect(null)}
        >
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </Canvas>
    </div>
  );
};

export default ThreePreview;
