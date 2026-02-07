import React, { useState, useEffect } from 'react';
import { X, History, RotateCcw, Clock, Eye, Trash2, Save, ChevronRight } from 'lucide-react';

interface VersionHistoryProps {
  currentProject: any;
  onRestore: (project: any) => void;
  onClose: () => void;
}

interface VersionEntry {
  id: string;
  timestamp: string;
  label: string;
  moduleCount: number;
  projectData: any;
  thumbnail?: string;
}

const STORAGE_KEY = 'sd_project_versions';
const MAX_VERSIONS = 20;

const VersionHistory: React.FC<VersionHistoryProps> = ({
  currentProject,
  onRestore,
  onClose,
}) => {
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [newLabel, setNewLabel] = useState('');

  // Load versions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setVersions(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading versions:', e);
      }
    }
  }, []);

  const saveVersion = () => {
    const entry: VersionEntry = {
      id: `v_${Date.now()}`,
      timestamp: new Date().toISOString(),
      label: newLabel.trim() || `Versão ${versions.length + 1}`,
      moduleCount: currentProject.modules?.length || 0,
      projectData: JSON.parse(JSON.stringify(currentProject)),
    };

    const updated = [entry, ...versions].slice(0, MAX_VERSIONS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setVersions(updated);
    setNewLabel('');
  };

  const deleteVersion = (id: string) => {
    const updated = versions.filter(v => v.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setVersions(updated);
    if (selectedVersion === id) {
      setSelectedVersion(null);
      setPreviewData(null);
    }
  };

  const handleSelect = (version: VersionEntry) => {
    setSelectedVersion(version.id);
    setPreviewData(version.projectData);
  };

  const handleRestore = () => {
    if (previewData) {
      onRestore(previewData);
      onClose();
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      relative: getRelativeTime(date),
    };
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days} dia${days > 1 ? 's' : ''} atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] border border-amber-500/30 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3 flex items-center justify-between">
          <h2 className="text-white font-bold flex items-center gap-2">
            <History size={18} />
            Histórico de Versões
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Left: Save New + Version List */}
          <div className="w-72 border-r border-amber-500/20 flex flex-col">
            {/* Save Current */}
            <div className="p-3 border-b border-amber-500/20">
              <h3 className="text-amber-400 text-sm font-bold mb-2 flex items-center gap-1">
                <Save size={14} />
                Salvar Versão Atual
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Nome da versão..."
                  className="flex-1 bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-2 py-1.5 rounded"
                />
                <button
                  onClick={saveVersion}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold"
                >
                  Salvar
                </button>
              </div>
              <p className="text-amber-300/50 text-[10px] mt-1">
                {currentProject.modules?.length || 0} módulos • R$ {(currentProject.modules?.reduce((s: number, m: any) => s + m.price, 0) || 0).toLocaleString()}
              </p>
            </div>

            {/* Version List */}
            <div className="flex-1 overflow-auto">
              {versions.length > 0 ? (
                <div className="divide-y divide-amber-500/10">
                  {versions.map(version => {
                    const { date, time, relative } = formatDate(version.timestamp);
                    const isSelected = selectedVersion === version.id;
                    
                    return (
                      <button
                        key={version.id}
                        onClick={() => handleSelect(version)}
                        className={`w-full p-3 text-left transition-colors ${
                          isSelected ? 'bg-indigo-500/20' : 'hover:bg-amber-500/10'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-amber-100 text-sm font-medium truncate">
                              {version.label}
                            </p>
                            <p className="text-amber-300/60 text-[10px] flex items-center gap-1">
                              <Clock size={10} />
                              {relative}
                            </p>
                            <p className="text-amber-300/40 text-[10px]">
                              {version.moduleCount} módulos
                            </p>
                          </div>
                          
                          {isSelected && (
                            <ChevronRight size={16} className="text-indigo-400 mt-1" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-amber-300/40">
                  <History size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma versão salva</p>
                  <p className="text-[10px] mt-1">Salve versões para poder restaurar depois</p>
                </div>
              )}
            </div>

            {/* Footer info */}
            <div className="p-2 bg-[#16213e] border-t border-amber-500/20">
              <p className="text-amber-300/50 text-[10px] text-center">
                {versions.length}/{MAX_VERSIONS} versões armazenadas
              </p>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="flex-1 p-4 flex flex-col">
            {previewData ? (
              <>
                <h3 className="text-amber-400 text-sm font-bold mb-3">
                  Prévia da Versão
                </h3>

                {/* Project Info */}
                <div className="bg-[#16213e] p-3 rounded border border-amber-500/20 mb-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-amber-300/60">Nome do Projeto</p>
                      <p className="text-amber-100 font-medium">{previewData.name}</p>
                    </div>
                    <div>
                      <p className="text-amber-300/60">Cliente</p>
                      <p className="text-amber-100 font-medium">{previewData.clientName}</p>
                    </div>
                    <div>
                      <p className="text-amber-300/60">Dimensões</p>
                      <p className="text-amber-100">{previewData.floorWidth}×{previewData.floorDepth}mm</p>
                    </div>
                    <div>
                      <p className="text-amber-300/60">Total</p>
                      <p className="text-green-400 font-medium">
                        R$ {(previewData.modules?.reduce((s: number, m: any) => s + m.price, 0) || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Module List Preview */}
                <div className="flex-1 bg-[#0f0f23] rounded-lg p-3 border border-amber-500/10 overflow-auto">
                  <h4 className="text-amber-400 text-xs font-bold mb-2">
                    Módulos ({previewData.modules?.length || 0})
                  </h4>
                  
                  <div className="space-y-1">
                    {previewData.modules?.slice(0, 10).map((mod: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-[#16213e] rounded text-xs"
                      >
                        <div>
                          <p className="text-amber-100">{mod.type}</p>
                          <p className="text-amber-300/50 text-[10px]">
                            {mod.width}×{mod.height}×{mod.depth}mm • {mod.finish}
                          </p>
                        </div>
                        <span className="text-amber-400">R$ {mod.price}</span>
                      </div>
                    ))}
                    {(previewData.modules?.length || 0) > 10 && (
                      <p className="text-amber-300/40 text-[10px] text-center py-1">
                        +{previewData.modules.length - 10} módulos...
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      const v = versions.find(x => x.id === selectedVersion);
                      if (v) deleteVersion(v.id);
                    }}
                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-400 rounded text-xs flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    Excluir
                  </button>
                  <button
                    onClick={handleRestore}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={14} />
                    Restaurar Esta Versão
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-amber-300/40">
                <div className="text-center">
                  <Eye size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Selecione uma versão para visualizar</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#16213e] border-t border-amber-500/20 flex justify-between items-center">
          <p className="text-amber-300/50 text-xs">
            O histórico é salvo localmente no navegador
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

export default VersionHistory;
