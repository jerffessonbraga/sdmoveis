import React from "react";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Box, 
  FileText, 
  MessageSquare, 
  Home, 
  Image,
  Plus,
  Clock,
  Navigation
} from "lucide-react";

interface NavIconProps {
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
  isFab?: boolean;
}

const iconMap: Record<string, React.ElementType> = {
  "layout-dashboard": LayoutDashboard,
  "box": Box,
  "file-text": FileText,
  "message-square": MessageSquare,
  "home": Home,
  "image": Image,
  "plus": Plus,
  "clock": Clock,
  "navigation": Navigation,
};

export const NavIcon: React.FC<NavIconProps> = ({ icon, label, active, onClick, isFab }) => {
  const IconComponent = iconMap[icon] || Box;
  
  if (isFab) {
    return (
      <button 
        onClick={onClick} 
        className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>
    );
  }
  
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all",
        active 
          ? "bg-amber-500/20 text-amber-500" 
          : "text-gray-400 hover:text-white hover:bg-white/5"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
        active ? "bg-amber-500 text-white shadow-lg" : "bg-gray-800"
      )}>
        <IconComponent className="w-5 h-5" />
      </div>
      <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
};
