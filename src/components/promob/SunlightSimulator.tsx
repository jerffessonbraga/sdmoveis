import React, { useState, useMemo } from 'react';
import { X, Sun, Moon, Play, Pause, Calendar, MapPin, Clock } from 'lucide-react';

interface SunlightSimulatorProps {
  onApply: (config: SunConfig) => void;
  onClose: () => void;
}

export interface SunConfig {
  enabled: boolean;
  hour: number; // 0-23
  month: number; // 1-12
  latitude: number;
  intensity: number;
  shadowSoftness: number;
}

const BRAZILIAN_CITIES = [
  { name: 'São Paulo', lat: -23.55 },
  { name: 'Rio de Janeiro', lat: -22.91 },
  { name: 'Brasília', lat: -15.78 },
  { name: 'Salvador', lat: -12.97 },
  { name: 'Fortaleza', lat: -3.72 },
  { name: 'Belo Horizonte', lat: -19.92 },
  { name: 'Curitiba', lat: -25.43 },
  { name: 'Porto Alegre', lat: -30.03 },
  { name: 'Manaus', lat: -3.10 },
  { name: 'Recife', lat: -8.05 },
];

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const SunlightSimulator: React.FC<SunlightSimulatorProps> = ({ onApply, onClose }) => {
  const [config, setConfig] = useState<SunConfig>({
    enabled: true,
    hour: 10,
    month: 6,
    latitude: -23.55, // São Paulo
    intensity: 1.0,
    shadowSoftness: 0.5,
  });
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  // Calculate sun position based on hour, month, and latitude
  const sunPosition = useMemo(() => {
    const hourAngle = (config.hour - 12) * 15; // degrees
    const dayOfYear = (config.month - 1) * 30 + 15; // approximate
    const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * Math.PI / 180);
    
    // Simplified solar altitude calculation
    const latRad = config.latitude * Math.PI / 180;
    const declRad = declination * Math.PI / 180;
    const hourRad = hourAngle * Math.PI / 180;
    
    const altitude = Math.asin(
      Math.sin(latRad) * Math.sin(declRad) + 
      Math.cos(latRad) * Math.cos(declRad) * Math.cos(hourRad)
    ) * 180 / Math.PI;
    
    const azimuth = Math.atan2(
      Math.sin(hourRad),
      Math.cos(hourRad) * Math.sin(latRad) - Math.tan(declRad) * Math.cos(latRad)
    ) * 180 / Math.PI;
    
    return {
      altitude: Math.max(0, altitude),
      azimuth: azimuth + 180,
      isDay: altitude > 0,
    };
  }, [config.hour, config.month, config.latitude]);

  // Animation loop
  React.useEffect(() => {
    if (!isAnimating) return;
    
    const interval = setInterval(() => {
      setConfig(c => ({
        ...c,
        hour: (c.hour + 0.1 * animationSpeed) % 24
      }));
    }, 100);
    
    return () => clearInterval(interval);
  }, [isAnimating, animationSpeed]);

  const formatHour = (hour: number) => {
    const h = Math.floor(hour);
    const m = Math.floor((hour % 1) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const getSkyGradient = () => {
    if (!sunPosition.isDay) {
      return 'linear-gradient(to bottom, #0f172a, #1e3a5f)';
    }
    
    const altitude = sunPosition.altitude;
    if (altitude < 10) {
      // Sunrise/sunset
      return 'linear-gradient(to bottom, #f97316, #fbbf24, #fef3c7)';
    } else if (altitude < 30) {
      return 'linear-gradient(to bottom, #7dd3fc, #bae6fd, #f0f9ff)';
    } else {
      return 'linear-gradient(to bottom, #0ea5e9, #7dd3fc, #e0f2fe)';
    }
  };

  const handleApply = () => {
    onApply(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] border border-amber-500/30 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-yellow-500 px-4 py-3 flex items-center justify-between">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Sun size={18} />
            Simulador de Iluminação Natural
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Left: Controls */}
            <div className="space-y-4">
              {/* Location */}
              <div className="bg-[#16213e] p-3 rounded border border-amber-500/20">
                <h3 className="text-amber-400 text-sm font-bold mb-2 flex items-center gap-1">
                  <MapPin size={14} />
                  Localização
                </h3>
                <select
                  value={config.latitude}
                  onChange={(e) => setConfig(c => ({ ...c, latitude: Number(e.target.value) }))}
                  className="w-full bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-2 py-2 rounded"
                >
                  {BRAZILIAN_CITIES.map(city => (
                    <option key={city.name} value={city.lat}>
                      {city.name} ({city.lat.toFixed(1)}°)
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="bg-[#16213e] p-3 rounded border border-amber-500/20">
                <h3 className="text-amber-400 text-sm font-bold mb-2 flex items-center gap-1">
                  <Calendar size={14} />
                  Mês do Ano
                </h3>
                <select
                  value={config.month}
                  onChange={(e) => setConfig(c => ({ ...c, month: Number(e.target.value) }))}
                  className="w-full bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-2 py-2 rounded"
                >
                  {MONTHS.map((month, idx) => (
                    <option key={month} value={idx + 1}>{month}</option>
                  ))}
                </select>
              </div>

              {/* Time */}
              <div className="bg-[#16213e] p-3 rounded border border-amber-500/20">
                <h3 className="text-amber-400 text-sm font-bold mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    Hora do Dia
                  </span>
                  <span className="text-lg font-mono">{formatHour(config.hour)}</span>
                </h3>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="0.5"
                  value={config.hour}
                  onChange={(e) => setConfig(c => ({ ...c, hour: Number(e.target.value) }))}
                  className="w-full accent-orange-500"
                  disabled={isAnimating}
                />
                <div className="flex justify-between text-[10px] text-amber-300/50 mt-1">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>24:00</span>
                </div>
                
                {/* Animation controls */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setIsAnimating(!isAnimating)}
                    className={`flex-1 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 ${
                      isAnimating
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}
                  >
                    {isAnimating ? <Pause size={12} /> : <Play size={12} />}
                    {isAnimating ? 'Pausar' : 'Animar'}
                  </button>
                  {isAnimating && (
                    <select
                      value={animationSpeed}
                      onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                      className="bg-[#0f0f23] border border-amber-500/20 text-amber-100 text-xs px-2 rounded"
                    >
                      <option value={0.5}>0.5x</option>
                      <option value={1}>1x</option>
                      <option value={2}>2x</option>
                      <option value={4}>4x</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Intensity */}
              <div className="bg-[#16213e] p-3 rounded border border-amber-500/20">
                <h3 className="text-amber-400 text-sm font-bold mb-2 flex items-center justify-between">
                  <span>Intensidade</span>
                  <span>{Math.round(config.intensity * 100)}%</span>
                </h3>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.intensity}
                  onChange={(e) => setConfig(c => ({ ...c, intensity: Number(e.target.value) }))}
                  className="w-full accent-orange-500"
                />
              </div>

              {/* Shadow */}
              <div className="bg-[#16213e] p-3 rounded border border-amber-500/20">
                <h3 className="text-amber-400 text-sm font-bold mb-2 flex items-center justify-between">
                  <span>Suavidade das Sombras</span>
                  <span>{Math.round(config.shadowSoftness * 100)}%</span>
                </h3>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.shadowSoftness}
                  onChange={(e) => setConfig(c => ({ ...c, shadowSoftness: Number(e.target.value) }))}
                  className="w-full accent-orange-500"
                />
              </div>
            </div>

            {/* Right: Preview */}
            <div className="space-y-4">
              {/* Sky Preview */}
              <div 
                className="rounded-lg h-40 relative overflow-hidden border border-amber-500/20"
                style={{ background: getSkyGradient() }}
              >
                {/* Sun/Moon */}
                {sunPosition.isDay ? (
                  <div
                    className="absolute w-12 h-12"
                    style={{
                      left: `${50 + (sunPosition.azimuth - 180) * 0.3}%`,
                      bottom: `${sunPosition.altitude}%`,
                      transform: 'translate(-50%, 50%)',
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-yellow-300 shadow-lg shadow-yellow-300/50" />
                  </div>
                ) : (
                  <div
                    className="absolute w-10 h-10"
                    style={{
                      left: '50%',
                      top: '30%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <Moon className="w-full h-full text-gray-300" />
                  </div>
                )}

                {/* Horizon line */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-800/50 to-transparent" />

                {/* Info */}
                <div className="absolute bottom-2 left-2 text-white/80 text-xs">
                  <p>Alt: {sunPosition.altitude.toFixed(1)}°</p>
                  <p>Az: {sunPosition.azimuth.toFixed(1)}°</p>
                </div>
              </div>

              {/* Sun Path Diagram */}
              <div className="bg-[#0f0f23] rounded-lg p-3 border border-amber-500/10">
                <h4 className="text-amber-400 text-xs font-bold mb-2">Trajetória Solar</h4>
                <svg viewBox="0 0 200 100" className="w-full h-24">
                  {/* Grid */}
                  <line x1="0" y1="80" x2="200" y2="80" stroke="#333" strokeWidth="1" />
                  <line x1="100" y1="80" x2="100" y2="10" stroke="#333" strokeWidth="0.5" strokeDasharray="2,2" />
                  
                  {/* Sun path arc */}
                  <path
                    d={`M 10,80 Q 100,${80 - (90 - Math.abs(config.latitude)) * 0.7} 190,80`}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="4,2"
                  />
                  
                  {/* Current sun position */}
                  <circle
                    cx={10 + (config.hour / 24) * 180}
                    cy={80 - Math.max(0, sunPosition.altitude) * 0.7}
                    r="6"
                    fill={sunPosition.isDay ? '#fbbf24' : '#64748b'}
                  />
                  
                  {/* Labels */}
                  <text x="10" y="95" fontSize="8" fill="#666">6h</text>
                  <text x="95" y="95" fontSize="8" fill="#666">12h</text>
                  <text x="180" y="95" fontSize="8" fill="#666">18h</text>
                  <text x="100" y="8" fontSize="8" fill="#666" textAnchor="middle">N</text>
                </svg>
              </div>

              {/* Quick presets */}
              <div className="bg-[#16213e] p-3 rounded border border-amber-500/20">
                <h4 className="text-amber-400 text-xs font-bold mb-2">Presets Rápidos</h4>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { label: 'Manhã', hour: 9, icon: '🌅' },
                    { label: 'Meio-dia', hour: 12, icon: '☀️' },
                    { label: 'Tarde', hour: 15, icon: '🌤️' },
                    { label: 'Fim de tarde', hour: 17, icon: '🌇' },
                    { label: 'Anoitecer', hour: 19, icon: '🌆' },
                    { label: 'Noite', hour: 21, icon: '🌙' },
                  ].map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => setConfig(c => ({ ...c, hour: preset.hour }))}
                      className="p-2 bg-[#0f0f23] hover:bg-amber-500/20 rounded text-xs text-amber-100 flex flex-col items-center gap-0.5"
                    >
                      <span>{preset.icon}</span>
                      <span className="text-[10px]">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#16213e] border-t border-amber-500/20 flex justify-between items-center">
          <div className="text-xs text-amber-300/70">
            <p>{sunPosition.isDay ? '☀️ Dia' : '🌙 Noite'} • Altitude solar: {sunPosition.altitude.toFixed(1)}°</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded text-sm font-bold flex items-center gap-2"
            >
              <Sun size={14} />
              Aplicar Iluminação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SunlightSimulator;
