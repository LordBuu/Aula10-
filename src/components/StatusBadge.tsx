import React from 'react';
import { VacationStatus } from '../types/vacation';
import { Clock, CheckCircle2, XCircle, FileCheck, Ban } from 'lucide-react';

interface StatusBadgeProps {
  status: VacationStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = {
    pending: {
      label: 'Pendente (Aguardando Gerente)',
      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      icon: Clock,
    },
    approved: {
      label: 'Aprovado pelo Gerente',
      bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      icon: CheckCircle2,
    },
    rejected: {
      label: 'Recusado pelo Gerente',
      bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
      icon: XCircle,
    },
    registered: {
      label: 'Registrado pelo RH',
      bg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
      icon: FileCheck,
    },
    cancelled: {
      label: 'Cancelado pelo Funcionário',
      bg: 'bg-slate-500/15 border-slate-500/30 text-slate-400',
      icon: Ban,
    },
  }[status] || {
    label: status,
    bg: 'bg-slate-700 text-slate-300 border-slate-600',
    icon: Clock,
  };

  const Icon = config.icon;
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {config.label}
    </span>
  );
};
