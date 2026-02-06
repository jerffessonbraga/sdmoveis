import React from "react";
import { cn } from "@/lib/utils";

export interface DashboardStatProps {
  title: string;
  value: string;
  icon: string;
  dark?: boolean;
  color?: string;
  trend?: string;
}

export const DashboardStat: React.FC<DashboardStatProps> = ({ 
  title, 
  value, 
  icon, 
  dark, 
  color,
  trend
}) => (
  <div className={cn(
    "p-6 rounded-[24px] transition-all hover:scale-[1.02]",
    dark 
      ? "bg-gray-900 text-white" 
      : "bg-white shadow-lg border border-gray-100",
    color
  )}>
    <div className="flex items-start justify-between mb-3">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-white/80 shadow-sm">
        {icon}
      </div>
    </div>
    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
    <p className="text-2xl font-black text-gray-900">{value}</p>
    {trend && (
      <p className="text-xs text-green-600 font-medium mt-1">{trend}</p>
    )}
  </div>
);
