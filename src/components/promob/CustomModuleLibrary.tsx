import React, { useState, useEffect } from 'react';
import { FurnitureModule } from '@/types';
import { X, Save, Trash2, FolderPlus, Edit2, Copy, Download, Upload, Package } from 'lucide-react';

interface CustomModuleLibraryProps {
  currentModule?: FurnitureModule;
  onLoadModule: (module: FurnitureModule) => void;
  onClose: () => void;
}

interface SavedModule extends FurnitureModule {
  savedAt: string;
  tags: string[];
  thumbnail?: string;
}

const STORAGE_KEY = 'sd_custom_modules';

const CustomModuleLibrary: React.FC<CustomModuleLibraryProps> = ({
  currentModule,
  onLoadModule,
  onClose,
}) => {
  const [savedModules, setSavedModules] = useState<SavedModule[]>([]);
  const [newModuleName, setNewModuleName] = useState('');
  const [newTags, setNewTags] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Load saved modules from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedModules(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading saved modules:', e);
      }
    }
  }, []);

  // Save to localStorage
  const persistModules = (modules: SavedModule[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(modules));
    setSavedModules(modules);
  };

  const saveCurrentModule = () => {
    if (!currentModule || !newModuleName.trim()) return;

    const savedModule: SavedModule = {
      ...currentModule,
      id: `custom_${Date.now()}`,
      type: newModuleName.trim(),
      savedAt: new Date().toISOString(),
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
    };

    const updated = [...savedModules, savedModule];
    persistModules(updated);
    setNewModuleName('');
    setNewTags('');
  };

  const deleteModule = (id: string) => {
    const updated = savedModules.filter(m => m.id !== id);
    persistModules(updated);
  };

  const duplicateModule = (module: SavedModule) => {
    const duplicate: SavedModule = {
      ...module,
      id: `custom_${Date.now()}`,
      type: `${module.type} (cópia)`,
      savedAt: new Date().toISOString(),
    };
    persistModules([...savedModules, duplicate]);
  };

  const updateModuleName = (id: string, newName: string) => {
    const updated = savedModules.map(m => 
      m.id === id ? { ...m, type: newName } : m
    );
    persistModules(updated);
    setEditingId(null);
  };

  const exportLibrary = () => {
    const blob = new Blob([JSON.stringify(savedModules, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'minha_biblioteca_modulos.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importLibrary = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        if (Array.isArray(imported)) {
          const merged = [...savedModules, ...imported.map((m: SavedModule) => ({
            ...m,
            id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            savedAt: new Date().toISOString(),
          }))];
          persistModules(merged);
        }
      } catch (error) {
        console.error('Error importing:', error);
      }
    };
    reader.readAsText(file);
  };

  // Get unique categories
  const categories = ['Todos', ...new Set(savedModules.map(m => m.category))];

  // Filter modules
  const filteredModules = savedModules.filter(m => {
    const matchesSearch = m.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'Todos' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] border border-amber-500/30 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-3 flex items-center justify-between">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Package size={18} />
            Biblioteca de Módulos Personalizados
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Left: Save New Module */}
          <div className="w-72 border-r border-amber-500/20 p-3 flex flex-col">
            <h3 className="text-amber-400 text-sm font-bold mb-3 flex items-center gap-1">
              <FolderPlus size={14} />
              Salvar Módulo Atual
            </h3>

            {currentModule ? (
              <div className="space-y-3">
                <div className="bg-[#0f0f23] p-3 rounded border border-amber-500/10">
                  <p className="text-amber-100 text-sm font-medium">{currentModule.type}</p>
                  <p className="text-amber-300/60 text-[10px]">
                    {currentModule.width}×{currentModule.height}×{currentModule.depth}mm
                  </p>
                  <p className="text-amber-300/60 text-[10px]">{currentModule.finish}</p>
                  <p className="text-green-400 text-xs mt-1">R$ {currentModule.price.toLocaleString()}</p>
                </div>

                <div>
                  <label className="text-amber-300/70 text-[10px]">Nome do módulo</label>
                  <input
                    type="text"
                    value={newModuleName}
                    onChange={(e) => setNewModuleName(e.target.value)}
                    placeholder="Ex: Balcão Customizado"
                    className="w-full bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-2 py-1.5 rounded"
                  />
                </div>

                <div>
                  <label className="text-amber-300/70 text-[10px]">Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="cozinha, gavetas, branco"
                    className="w-full bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-2 py-1.5 rounded"
                  />
                </div>

                <button
                  onClick={saveCurrentModule}
                  disabled={!newModuleName.trim()}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Save size={14} />
                  Salvar na Biblioteca
                </button>
              </div>
            ) : (
              <div className="bg-[#0f0f23] p-4 rounded border border-amber-500/10 text-center">
                <Package size={32} className="mx-auto mb-2 text-amber-300/30" />
                <p className="text-amber-300/50 text-xs">
                  Selecione um módulo no projeto para salvá-lo na biblioteca
                </p>
              </div>
            )}

            <hr className="border-amber-500/20 my-4" />

            {/* Import/Export */}
            <div className="space-y-2">
              <button
                onClick={exportLibrary}
                disabled={savedModules.length === 0}
                className="w-full py-1.5 bg-[#16213e] hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 rounded text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download size={12} />
                Exportar Biblioteca
              </button>
              
              <label className="w-full py-1.5 bg-[#16213e] hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 rounded text-xs flex items-center justify-center gap-2 cursor-pointer">
                <Upload size={12} />
                Importar Biblioteca
                <input type="file" accept=".json" onChange={importLibrary} className="hidden" />
              </label>
            </div>
          </div>

          {/* Right: Library Grid */}
          <div className="flex-1 p-3 flex flex-col">
            {/* Search & Filter */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar módulos..."
                className="flex-1 bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-3 py-2 rounded"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-2 py-2 rounded"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Modules Grid */}
            <div className="flex-1 overflow-auto">
              {filteredModules.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {filteredModules.map(module => (
                    <div
                      key={module.id}
                      className="bg-[#16213e] border border-amber-500/20 rounded-lg p-2 hover:border-amber-500/40 transition-colors group"
                    >
                      {/* Preview box */}
                      <div className="bg-gradient-to-br from-amber-600/20 to-amber-800/20 h-16 rounded mb-2 flex items-center justify-center">
                        <Package size={24} className="text-amber-400/50" />
                      </div>

                      {/* Name */}
                      {editingId === module.id ? (
                        <input
                          type="text"
                          defaultValue={module.type}
                          onBlur={(e) => updateModuleName(module.id, e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && updateModuleName(module.id, (e.target as HTMLInputElement).value)}
                          autoFocus
                          className="w-full bg-[#0f0f23] text-amber-100 text-xs px-1 py-0.5 rounded mb-1"
                        />
                      ) : (
                        <p className="text-amber-100 text-xs font-medium truncate mb-1">{module.type}</p>
                      )}

                      <p className="text-amber-300/50 text-[9px]">
                        {module.width}×{module.height}×{module.depth}mm
                      </p>
                      <p className="text-amber-300/50 text-[9px]">{module.finish}</p>

                      {/* Tags */}
                      {module.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {module.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[8px] bg-purple-500/20 text-purple-300 px-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onLoadModule(module)}
                          className="flex-1 py-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded text-[9px]"
                        >
                          Usar
                        </button>
                        <button
                          onClick={() => setEditingId(module.id)}
                          className="p-1 bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 rounded"
                        >
                          <Edit2 size={10} />
                        </button>
                        <button
                          onClick={() => duplicateModule(module)}
                          className="p-1 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 rounded"
                        >
                          <Copy size={10} />
                        </button>
                        <button
                          onClick={() => deleteModule(module.id)}
                          className="p-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-amber-300/40">
                  <div className="text-center">
                    <Package size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Nenhum módulo salvo</p>
                    <p className="text-xs mt-1">Salve módulos customizados para reutilizar</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#16213e] border-t border-amber-500/20 flex justify-between items-center">
          <p className="text-amber-300/70 text-xs">
            {savedModules.length} módulo(s) na biblioteca
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomModuleLibrary;
