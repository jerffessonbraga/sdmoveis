import React, { useState } from 'react';
import { Play, Pause, SkipForward, Music } from 'lucide-react';

interface Louvor {
  title: string;
  artist: string;
  audioUrl: string;
  verse: string;
}

interface WorshipPlayerProps {
  currentLouvor: Louvor;
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
  onNext: () => void;
}

export const WorshipPlayer: React.FC<WorshipPlayerProps> = ({
  currentLouvor,
  isPlaying,
  onPlay,
  onStop,
  onNext,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="fixed bottom-6 right-6 z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`flex items-center gap-3 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-2xl border transition-all duration-300 ${
          isHovered 
            ? 'bg-black/90 border-amber-500/20 opacity-100 scale-100' 
            : 'bg-black/10 border-transparent opacity-30 scale-95'
        }`}
      >
        <button 
          onClick={isPlaying ? onStop : onPlay}
          className={`w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-black transition-all hover:scale-105 shadow-lg shadow-amber-500/30 ${
            !isHovered && 'opacity-50'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        
        <div className={`text-left transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Music className="w-3 h-3" />
            Tocando
            {isPlaying && (
              <span className="inline-flex gap-0.5 ml-1">
                {[1, 2, 3, 4].map((i) => (
                  <span 
                    key={i} 
                    className="w-0.5 bg-amber-400 rounded-full animate-pulse" 
                    style={{ height: `${6 + i * 2}px`, animationDelay: `${i * 0.15}s` }} 
                  />
                ))}
              </span>
            )}
          </p>
          <p className="text-white text-sm font-medium">{currentLouvor.title}</p>
          <p className="text-gray-500 text-xs">{currentLouvor.artist}</p>
        </div>
        
        <button 
          onClick={onNext}
          className={`text-gray-500 hover:text-amber-400 transition-all p-2 hover:bg-white/5 rounded-lg ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default WorshipPlayer;
