import React, { useState } from 'react';
import { VacationLog } from '../types/vacation';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  FileCheck,
  Ban,
  Sliders,
  Calendar,
  Search,
} from 'lucide-react';

interface HrAuditViewProps {
  logs: VacationLog[];
}

export const HrAuditView: React.FC<HrAuditViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = logs.filter(log => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchDetails = log.details.toLowerCase().includes(term);
      const matchActor = log.actorName.toLowerCase().includes(term);
      const matchEmployee = log.employeeName.toLowerCase().includes(term);
      if (!matchDetails && !matchActor && !matchEmployee) return false;
    }
    return true;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'SOLICITADO':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">SOLICITADO</span>;
      case 'APROVADO':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">APROVADO PELO GESTOR</span>;
      case 'RECUSADO':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">RECUSADO</span>;
      case 'REGISTRADO':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">REGISTRADO RH</span>;
      case 'CANCELADO':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">CANCELADO</span>;
      case 'SALDO_AJUSTADO':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">AJUSTE DE SALDO</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300">{action}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-1">
          <FileText className="w-4 h-4" />
          <span>Auditoria Corporativa & Rastreabilidade</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Histórico Geral & Logs de Eventos
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Registro cronológico imutável de todas as movimentações, aprovações, recusas e formalizações no sistema.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Ação:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
          >
            <option value="all">Todas as Ações</option>
            <option value="SOLICITADO">Solicitações</option>
            <option value="APROVADO">Aprovações</option>
            <option value="RECUSADO">Recusas</option>
            <option value="REGISTRADO">Registros no RH</option>
            <option value="CANCELADO">Cancelamentos</option>
            <option value="SALDO_AJUSTADO">Ajustes de Saldo</option>
          </select>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por nome, ator ou detalhes..."
            className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-800/90 border border-slate-700/70 rounded-3xl p-6 shadow-xl backdrop-blur-sm overflow-x-auto">
        {filteredLogs.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-500">
            Nenhum evento de auditoria localizado para os filtros selecionados.
          </p>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {filteredLogs.map((log) => (
              <div key={log.id} className="py-3.5 space-y-1 hover:bg-slate-700/20 px-3 rounded-xl transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {getActionBadge(log.action)}
                    <span className="text-xs font-semibold text-white">
                      {log.actorName} <span className="text-[10px] text-slate-400">({log.actorRole})</span>
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-1">
                  {log.details}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
