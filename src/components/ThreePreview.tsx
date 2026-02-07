import React, { useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { FurnitureModule } from "@/types";
import { Room } from "./three/environment/Room";
import { RealisticModule } from "./three/RealisticModule";

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
  showCeiling?: boolean;
  showGrid?: boolean;
}

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
  showCeiling = true,
  showGrid = true,
}) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded overflow-hidden">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[4, 3, 6]} fov={50} />
        <CameraController customRotation={customRotation} />
        
        {/* Iluminação melhorada */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[8, 12, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <directionalLight position={[-5, 8, -5]} intensity={0.3} />
        <hemisphereLight args={["#f0f5ff", "#d0c8b0", 0.4]} />
        
        {/* Luz pontual para realce */}
        <pointLight position={[0, 2.5, 0]} intensity={0.3} color="#fff5e6" />

        {/* Sala com teto */}
        <Room 
          floorWidth={floorWidth} 
          floorDepth={floorDepth} 
          wallHeight={wallHeight}
          showCeiling={showCeiling}
          showGrid={showGrid}
        />

        {/* Módulos de móveis realistas */}
        {modules.map((module) => (
          <RealisticModule
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
