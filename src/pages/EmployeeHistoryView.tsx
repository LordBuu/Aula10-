import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { VacationRequest, VacationStatus } from '../types/vacation';
import { StatusBadge } from '../components/StatusBadge';
import { ViewRejectionReasonModal } from '../components/ViewRejectionReasonModal';
import { cancelVacationRequest } from '../services/firebaseService';
import {
  History,
  Calendar,
  Filter,
  Ban,
  HelpCircle,
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarPlus,
} from 'lucide-react';

interface EmployeeHistoryViewProps {
  requests: VacationRequest[];
  onNavigateToRequest: () => void;
}

export const EmployeeHistoryView: React.FC<EmployeeHistoryViewProps> = ({
  requests,
  onNavigateToRequest,
}) => {
  const { currentUser } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRejectedReq, setSelectedRejectedReq] = useState<VacationRequest | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  if (!currentUser) return null;

  const myRequests = requests.filter(r => r.employeeId === currentUser.uid);

  const filteredRequests = myRequests.filter(r => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  const handleCancel = async (req: VacationRequest) => {
    if (!confirm('Tem certeza que deseja cancelar esta solicitação antes da avaliação do gestor?')) return;
    try {
      setCancellingId(req.id);
      await cancelVacationRequest(req.id, currentUser);
    } catch (err: any) {
      alert(err.message || 'Erro ao cancelar pedido.');
    } finally {
      setCancellingId(null);
    }
  };

  const statusCounts = {
    all: myRequests.length,
    pending: myRequests.filter(r => r.status === 'pending').length,
    approved: myRequests.filter(r => r.status === 'approved').length,
    rejected: myRequests.filter(r => r.status === 'rejected').length,
    registered: myRequests.filter(r => r.status === 'registered').length,
    cancelled: myRequests.filter(r => r.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
            <History className="w-4 h-4" />
            <span>Acompanhamento e Histórico</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Meus Pedidos de Férias
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Histórico completo de solicitações, status de aprovação e formalizações pelo RH.
          </p>
        </div>

        <button
          onClick={onNavigateToRequest}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs sm:text-sm text-white shadow-md transition-all shrink-0 cursor-pointer"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Nova Solicitação</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: 'Todos os Pedidos', count: statusCounts.all },
          { id: 'pending', label: 'Pendentes', count: statusCounts.pending },
          { id: 'approved', label: 'Aprovados pelo Gestor', count: statusCounts.approved },
          { id: 'registered', label: 'Registrados pelo RH', count: statusCounts.registered },
          { id: 'rejected', label: 'Recusados', count: statusCounts.rejected },
          { id: 'cancelled', label: 'Cancelados', count: statusCounts.cancelled },
        ].map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/70'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-slate-800/50 border border-slate-700/60">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">Nenhum pedido encontrado nesta categoria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {statusFilter === 'all'
              ? 'Você ainda não possui pedidos de férias registrados no sistema.'
              : 'Não há registros com este status no momento.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="p-5 sm:p-6 rounded-3xl bg-slate-800/90 border border-slate-700/70 backdrop-blur-sm space-y-4 shadow-md"
            >
              {/* Top row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {req.durationDays} dias corridos ({req.startDate} até {req.endDate})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Solicitado em {new Date(req.createdAt).toLocaleString('pt-BR')} • {req.periodNumber}º período
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={req.status} size="lg" />
                </div>
              </div>

              {/* Middle details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <span className="text-[11px] text-slate-400 block font-medium">Dias de Descanso</span>
                  <span className="font-semibold text-white">{req.durationDays} dias</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <span className="text-[11px] text-slate-400 block font-medium">Abono Pecuniário (1/3)</span>
                  <span className="font-semibold text-white">
                    {req.sellDays ? `Sim (${req.soldDaysCount || 10} dias vendidos)` : 'Não solicitado'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <span className="text-[11px] text-slate-400 block font-medium">Protocolo Oficial RH</span>
                  <span className="font-mono font-semibold text-indigo-300">
                    {req.protocolNumber || 'Aguardando formalização'}
                  </span>
                </div>
              </div>

              {/* Status Timeline Workflow */}
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Fluxo de Aprovação:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Step 1: Solicitado */}
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>1. Solicitado pelo Colaborador</span>
                  </div>

                  {/* Step 2: Gerente */}
                  <div
                    className={`flex items-center gap-2 ${
                      req.status === 'rejected'
                        ? 'text-rose-400'
                        : req.status === 'approved' || req.status === 'registered'
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {req.status === 'rejected' ? (
                      <XCircle className="w-4 h-4 shrink-0" />
                    ) : req.status === 'approved' || req.status === 'registered' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 shrink-0" />
                    )}
                    <span>
                      {req.status === 'rejected'
                        ? '2. Recusado pelo Gestor'
                        : req.status === 'approved' || req.status === 'registered'
                        ? '2. Aprovado pelo Gestor'
                        : '2. Em análise pelo Gestor'}
                    </span>
                  </div>

                  {/* Step 3: RH */}
                  <div
                    className={`flex items-center gap-2 ${
                      req.status === 'registered'
                        ? 'text-indigo-400 font-semibold'
                        : 'text-slate-500'
                    }`}
                  >
                    {req.status === 'registered' ? (
                      <FileCheck2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 shrink-0" />
                    )}
                    <span>
                      {req.status === 'registered'
                        ? '3. Registrado pelo RH no DP'
                        : '3. Registro no RH'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions / Details Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-400">
                  {req.reviewedByName && (
                    <span>Avaliador: <strong className="text-slate-300">{req.reviewedByName}</strong></span>
                  )}
                  {req.registeredByName && (
                    <span className="ml-2">• Homologado por: <strong className="text-slate-300">{req.registeredByName}</strong></span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {req.status === 'rejected' && (
                    <button
                      onClick={() => setSelectedRejectedReq(req)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>Ver Justificativa da Recusa</span>
                    </button>
                  )}

                  {req.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(req)}
                      disabled={cancellingId === req.id}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Ban className="w-4 h-4" />
                      <span>{cancellingId === req.id ? 'Cancelando...' : 'Cancelar Pedido'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para ver motivo da recusa */}
      <ViewRejectionReasonModal
        isOpen={!!selectedRejectedReq}
        request={selectedRejectedReq}
        onClose={() => setSelectedRejectedReq(null)}
      />
    </div>
  );
};
