// src/components/admin/AdminCard.tsx
'use client';

import { ReactNode } from 'react';

type AdminCardProps = {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
  trend?: { value: number; positive: boolean };
  className?: string;
};

export function AdminCard({ title, value, icon, color = 'from-cyan-500/60 to-blue-500/60', trend, className = '' }: AdminCardProps) {
  return (
    <div className={`rounded-2xl p-4 bg-transparent transition-all duration-300 group ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-gray-400/60 font-light">{title}</p>
        {icon && (
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
            <span className="text-white/80">{icon}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-end gap-2">
        <p className="text-xl font-semibold text-white/80">
          {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        </p>
        
        {trend && (
          <span className={`text-xs font-light flex items-center gap-0.5 mb-0.5 ${
            trend.positive ? 'text-emerald-400/70' : 'text-red-400/70'
          }`}>
            <span>{trend.positive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </span>
        )}
      </div>
    </div>
  );
}