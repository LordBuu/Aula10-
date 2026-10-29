import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { VacationRequest } from '../types/vacation';
import { StatusBadge } from '../components/StatusBadge';
import { ViewRejectionReasonModal } from '../components/ViewRejectionReasonModal';
import { History, Calendar, Search, HelpCircle } from 'lucide-react';

interface ManagerTeamHistoryViewProps {
  requests: VacationRequest[];
}

export const ManagerTeamHistoryView: React.FC<ManagerTeamHistoryViewProps> = ({ requests }) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRejectedReq, setSelectedRejectedReq] = useState<VacationRequest | null>(null);

  if (!currentUser) return null;

  const teamRequests = requests.filter(
    r => r.managerId === currentUser.uid || r.department === currentUser.department
  );

  const filtered = teamRequests.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      if (!r.employeeName.toLowerCase().includes(term) && !r.startDate.includes(term)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
          <History className="w-4 h-4" />
          <span>Gestão de Equipe • Histórico</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Histórico Completo da Equipe
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Todos os pedidos submetidos pelos membros do seu departamento.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendentes</option>
            <option value="approved">Aprovados</option>
            <option value="registered">Registrados pelo RH</option>
            <option value="rejected">Recusados</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por colaborador ou data..."
            className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <div className="bg-slate-800/90 border border-slate-700/70 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
        {filtered.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-500">
            Nenhum pedido localizado para a equipe.
          </p>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {filtered.map((req) => (
              <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-700/20 px-3 rounded-xl transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{req.employeeName}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-emerald-400 font-semibold">{req.durationDays} dias</span>
                    <span className="text-xs text-slate-400">({req.startDate} até {req.endDate})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>Solicitado em {new Date(req.createdAt).toLocaleDateString('pt-BR')}</span>
                    {req.sellDays && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        Venda 1/3 ({req.soldDaysCount || 10}d)
                      </span>
                    )}
                    {req.protocolNumber && (
                      <span className="font-mono text-purple-300">
                        Protocolo: {req.protocolNumber}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={req.status} />
                  {req.status === 'rejected' && (
                    <button
                      onClick={() => setSelectedRejectedReq(req)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Ver Justificativa</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ViewRejectionReasonModal
        isOpen={!!selectedRejectedReq}
        request={selectedRejectedReq}
        onClose={() => setSelectedRejectedReq(null)}
      />
    </div>
  );
};
