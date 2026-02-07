import React, { useState } from 'react';
import { FurnitureModule } from '@/types';
import { 
  X, 
  Plus, 
  Trash2, 
  Copy, 
  Edit2, 
  Check, 
  Home, 
  ChefHat, 
  Bed, 
  Sofa, 
  Bath, 
  Briefcase,
  Grid3X3,
  Move
} from 'lucide-react';

interface Room {
  id: string;
  name: string;
  type: RoomType;
  width: number;
  depth: number;
  height: number;
  modules: FurnitureModule[];
  position: { x: number; y: number }; // Position in floor plan
  color: string;
}

type RoomType = 'kitchen' | 'bedroom' | 'living' | 'bathroom' | 'office' | 'laundry' | 'other';

interface MultiRoomManagerProps {
  onClose: () => void;
  onLoadRoom: (room: Room) => void;
  currentModules: FurnitureModule[];
}

const ROOM_TYPES: { type: RoomType; label: string; icon: React.ReactNode; color: string; defaultSize: { w: number; d: number } }[] = [
  { type: 'kitchen', label: 'Cozinha', icon: <ChefHat size={16} />, color: '#f59e0b', defaultSize: { w: 4000, d: 3500 } },
  { type: 'bedroom', label: 'Dormitório', icon: <Bed size={16} />, color: '#8b5cf6', defaultSize: { w: 3500, d: 4000 } },
  { type: 'living', label: 'Sala', icon: <Sofa size={16} />, color: '#3b82f6', defaultSize: { w: 5000, d: 4500 } },
  { type: 'bathroom', label: 'Banheiro', icon: <Bath size={16} />, color: '#14b8a6', defaultSize: { w: 2500, d: 2500 } },
  { type: 'office', label: 'Escritório', icon: <Briefcase size={16} />, color: '#6366f1', defaultSize: { w: 3000, d: 3000 } },
  { type: 'laundry', label: 'Lavanderia', icon: <Home size={16} />, color: '#ec4899', defaultSize: { w: 2000, d: 2500 } },
  { type: 'other', label: 'Outro', icon: <Grid3X3 size={16} />, color: '#6b7280', defaultSize: { w: 3000, d: 3000 } },
];

const MultiRoomManager: React.FC<MultiRoomManagerProps> = ({
  onClose,
  onLoadRoom,
  currentModules,
}) => {
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: '1',
      name: 'Cozinha Principal',
      type: 'kitchen',
      width: 4000,
      depth: 3500,
      height: 2700,
      modules: [],
      position: { x: 0, y: 0 },
      color: '#f59e0b',
    }
  ]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('1');
  const [editingName, setEditingName] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [showAddRoom, setShowAddRoom] = useState(false);
  
  const selectedRoom = rooms.find(r => r.id === selectedRoomId);
  
  const addRoom = (type: RoomType) => {
    const typeConfig = ROOM_TYPES.find(t => t.type === type)!;
    const existingOfType = rooms.filter(r => r.type === type).length;
    
    const newRoom: Room = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${typeConfig.label} ${existingOfType + 1}`,
      type,
      width: typeConfig.defaultSize.w,
      depth: typeConfig.defaultSize.d,
      height: 2700,
      modules: [],
      position: { 
        x: Math.random() * 200, 
        y: Math.random() * 200 
      },
      color: typeConfig.color,
    };
    
    setRooms([...rooms, newRoom]);
    setSelectedRoomId(newRoom.id);
    setShowAddRoom(false);
  };
  
  const deleteRoom = (id: string) => {
    if (rooms.length <= 1) return;
    const newRooms = rooms.filter(r => r.id !== id);
    setRooms(newRooms);
    if (selectedRoomId === id) {
      setSelectedRoomId(newRooms[0].id);
    }
  };
  
  const duplicateRoom = (room: Room) => {
    const newRoom: Room = {
      ...room,
      id: Math.random().toString(36).substr(2, 9),
      name: `${room.name} (Cópia)`,
      position: { x: room.position.x + 50, y: room.position.y + 50 },
      modules: room.modules.map(m => ({ ...m, id: Math.random().toString(36).substr(2, 9) })),
    };
    setRooms([...rooms, newRoom]);
    setSelectedRoomId(newRoom.id);
  };
  
  const saveCurrentToRoom = () => {
    if (!selectedRoom) return;
    setRooms(rooms.map(r => 
      r.id === selectedRoomId 
        ? { ...r, modules: [...currentModules] }
        : r
    ));
  };
  
  const updateRoomDimensions = (id: string, dim: 'width' | 'depth' | 'height', value: number) => {
    setRooms(rooms.map(r => 
      r.id === id ? { ...r, [dim]: value } : r
    ));
  };
  
  const startEditName = (room: Room) => {
    setEditingName(room.id);
    setNewName(room.name);
  };
  
  const saveName = (id: string) => {
    setRooms(rooms.map(r => 
      r.id === id ? { ...r, name: newName } : r
    ));
    setEditingName(null);
  };
  
  // Calculate floor plan bounds
  const floorPlanBounds = React.useMemo(() => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    rooms.forEach(room => {
      minX = Math.min(minX, room.position.x);
      minY = Math.min(minY, room.position.y);
      maxX = Math.max(maxX, room.position.x + room.width / 20);
      maxY = Math.max(maxY, room.position.y + room.depth / 20);
    });
    return { minX, minY, maxX, maxY, width: maxX - minX + 100, height: maxY - minY + 100 };
  }, [rooms]);
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] border border-amber-500/30 rounded-lg shadow-2xl w-[1000px] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3 flex items-center justify-between">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Home size={18} />
            Gerenciador de Ambientes
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Room list */}
          <div className="w-72 border-r border-amber-500/20 flex flex-col">
            <div className="p-3 border-b border-amber-500/10 flex justify-between items-center">
              <span className="text-amber-400 text-sm font-bold">Ambientes ({rooms.length})</span>
              <button
                onClick={() => setShowAddRoom(true)}
                className="p-1.5 bg-amber-500 hover:bg-amber-400 rounded text-amber-950"
              >
                <Plus size={14} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-2 space-y-1">
              {rooms.map(room => {
                const typeConfig = ROOM_TYPES.find(t => t.type === room.type)!;
                
                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedRoomId === room.id
                        ? 'bg-amber-500/20 border border-amber-500/50'
                        : 'bg-[#16213e] border border-transparent hover:border-amber-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center"
                        style={{ backgroundColor: room.color + '30', color: room.color }}
                      >
                        {typeConfig.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        {editingName === room.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && saveName(room.id)}
                              className="flex-1 bg-[#0f0f23] border border-amber-500/30 px-2 py-0.5 text-sm text-amber-100 rounded"
                              autoFocus
                            />
                            <button onClick={() => saveName(room.id)} className="text-green-400">
                              <Check size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-amber-100 text-sm truncate">{room.name}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); startEditName(room); }}
                              className="text-amber-400/50 hover:text-amber-400"
                            >
                              <Edit2 size={10} />
                            </button>
                          </div>
                        )}
                        <p className="text-amber-300/50 text-xs">
                          {room.width/100}×{room.depth/100}cm • {room.modules.length} módulos
                        </p>
                      </div>
                    </div>
                    
                    {selectedRoomId === room.id && (
                      <div className="flex gap-1 mt-2 pt-2 border-t border-amber-500/10">
                        <button
                          onClick={(e) => { e.stopPropagation(); duplicateRoom(room); }}
                          className="flex-1 py-1 bg-[#0f0f23] hover:bg-amber-500/10 rounded text-amber-300/70 text-xs flex items-center justify-center gap-1"
                        >
                          <Copy size={10} />
                          Duplicar
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteRoom(room.id); }}
                          disabled={rooms.length <= 1}
                          className="flex-1 py-1 bg-[#0f0f23] hover:bg-red-500/10 rounded text-red-400/70 text-xs flex items-center justify-center gap-1 disabled:opacity-30"
                        >
                          <Trash2 size={10} />
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Add room modal */}
            {showAddRoom && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-[#1a1a2e] rounded-lg p-4 w-72 border border-amber-500/30">
                  <h4 className="text-amber-400 font-bold mb-3">Novo Ambiente</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {ROOM_TYPES.map(type => (
                      <button
                        key={type.type}
                        onClick={() => addRoom(type.type)}
                        className="p-3 bg-[#16213e] hover:bg-amber-500/10 rounded-lg flex flex-col items-center gap-1 transition-colors"
                        style={{ borderColor: type.color + '50' }}
                      >
                        <div style={{ color: type.color }}>{type.icon}</div>
                        <span className="text-amber-100 text-xs">{type.label}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowAddRoom(false)}
                    className="w-full mt-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Center: Floor plan */}
          <div className="flex-1 p-4 overflow-auto">
            <h3 className="text-amber-400 text-sm font-bold mb-2">Planta Baixa</h3>
            <div className="bg-[#0f0f23] rounded-lg p-4 min-h-[300px] border border-amber-500/10">
              <svg 
                viewBox={`0 0 ${floorPlanBounds.width} ${floorPlanBounds.height}`}
                className="w-full h-full"
                style={{ minHeight: 250 }}
              >
                {rooms.map(room => {
                  const x = room.position.x - floorPlanBounds.minX + 20;
                  const y = room.position.y - floorPlanBounds.minY + 20;
                  const w = room.width / 20;
                  const h = room.depth / 20;
                  const isSelected = selectedRoomId === room.id;
                  
                  return (
                    <g 
                      key={room.id} 
                      onClick={() => setSelectedRoomId(room.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <rect
                        x={x}
                        y={y}
                        width={w}
                        height={h}
                        fill={room.color + '30'}
                        stroke={isSelected ? room.color : room.color + '80'}
                        strokeWidth={isSelected ? 3 : 1}
                        rx={4}
                      />
                      <text
                        x={x + w / 2}
                        y={y + h / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={room.color}
                        fontSize="12"
                        fontWeight="bold"
                      >
                        {room.name}
                      </text>
                      <text
                        x={x + w / 2}
                        y={y + h / 2 + 14}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={room.color}
                        fontSize="8"
                        opacity={0.7}
                      >
                        {room.width/100}×{room.depth/100}cm
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Right: Room properties */}
          {selectedRoom && (
            <div className="w-64 border-l border-amber-500/20 p-4 overflow-auto">
              <h3 className="text-amber-400 text-sm font-bold mb-3">Propriedades</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-amber-300/70 text-xs block mb-1">Largura (mm)</label>
                  <input
                    type="number"
                    value={selectedRoom.width}
                    onChange={(e) => updateRoomDimensions(selectedRoom.id, 'width', parseInt(e.target.value) || 1000)}
                    className="w-full bg-[#16213e] border border-amber-500/20 text-amber-100 text-sm px-2 py-1.5 rounded"
                  />
                </div>
                <div>
                  <label className="text-amber-300/70 text-xs block mb-1">Profundidade (mm)</label>
                  <input
                    type="number"
                    value={selectedRoom.depth}
                    onChange={(e) => updateRoomDimensions(selectedRoom.id, 'depth', parseInt(e.target.value) || 1000)}
                    className="w-full bg-[#16213e] border border-amber-500/20 text-amber-100 text-sm px-2 py-1.5 rounded"
                  />
                </div>
                <div>
                  <label className="text-amber-300/70 text-xs block mb-1">Altura (mm)</label>
                  <input
                    type="number"
                    value={selectedRoom.height}
                    onChange={(e) => updateRoomDimensions(selectedRoom.id, 'height', parseInt(e.target.value) || 2400)}
                    className="w-full bg-[#16213e] border border-amber-500/20 text-amber-100 text-sm px-2 py-1.5 rounded"
                  />
                </div>
                
                <hr className="border-amber-500/20" />
                
                <div className="bg-[#16213e] rounded p-2">
                  <p className="text-amber-300/70 text-xs">Módulos neste ambiente:</p>
                  <p className="text-amber-400 text-lg font-bold">{selectedRoom.modules.length}</p>
                </div>
                
                <button
                  onClick={saveCurrentToRoom}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded text-sm"
                >
                  Salvar Módulos Atuais
                </button>
                
                <button
                  onClick={() => onLoadRoom(selectedRoom)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded text-sm"
                >
                  Carregar Ambiente
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#16213e] border-t border-amber-500/20 flex justify-between items-center">
          <span className="text-amber-300/50 text-xs">
            Total: {rooms.length} ambientes • {rooms.reduce((sum, r) => sum + r.modules.length, 0)} módulos
          </span>
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiRoomManager;
