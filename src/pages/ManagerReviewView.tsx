import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { VacationRequest, UserProfile } from '../types/vacation';
import { StatusBadge } from '../components/StatusBadge';
import { RejectionModal } from '../components/RejectionModal';
import {
  approveVacationRequest,
  rejectVacationRequest,
} from '../services/firebaseService';
import { checkTeamConflicts } from '../services/vacationValidator';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Check,
  X,
  User,
  MessageSquare,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';

interface ManagerReviewViewProps {
  requests: VacationRequest[];
  allUsers: UserProfile[];
}

export const ManagerReviewView: React.FC<ManagerReviewViewProps> = ({
  requests,
  allUsers,
}) => {
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [rejectingReq, setRejectingReq] = useState<VacationRequest | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  if (!currentUser) return null;

  // Filtrar pedidos da equipe
  const teamRequests = requests.filter(
    r => r.managerId === currentUser.uid || r.department === currentUser.department
  );

  const filteredRequests = teamRequests.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'approved') return r.status === 'approved' || r.status === 'registered';
    return r.status === filter;
  });

  const handleApprove = async (req: VacationRequest) => {
    try {
      setApprovingId(req.id);
      await approveVacationRequest(req.id, currentUser);
    } catch (err: any) {
      alert(err.message || 'Erro ao aprovar.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleConfirmReject = async (reason: string) => {
    if (!rejectingReq) return;
    await rejectVacationRequest(rejectingReq.id, currentUser, reason);
    setRejectingReq(null);
  };

  const counts = {
    pending: teamRequests.filter(r => r.status === 'pending').length,
    approved: teamRequests.filter(r => r.status === 'approved' || r.status === 'registered').length,
    rejected: teamRequests.filter(r => r.status === 'rejected').length,
    all: teamRequests.length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>Gestão Operacional de Equipe</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Análise e Decisão de Pedidos de Férias
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Avalie o impacto operacional das solicitações, verifique sobreposições entre colaboradores e tome a decisão.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 ${
            filter === 'pending'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pendentes de Decisão</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-bold">
            {counts.pending}
          </span>
        </button>

        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 ${
            filter === 'approved'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Aprovados</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-bold">
            {counts.approved}
          </span>
        </button>

        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 ${
            filter === 'rejected'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Recusados</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-bold">
            {counts.rejected}
          </span>
        </button>

        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 ${
            filter === 'all'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
          }`}
        >
          <span>Todos da Equipe</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-bold">
            {counts.all}
          </span>
        </button>
      </div>

      {/* Requests Feed */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-slate-800/50 border border-slate-700/60">
          <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">Nenhum pedido encontrado nesta seção</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Não há solicitações para o filtro selecionado no momento.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const conflicts = checkTeamConflicts(req, requests);
            const employeeProfile = allUsers.find(u => u.uid === req.employeeId);

            return (
              <div
                key={req.id}
                className="p-6 rounded-3xl bg-slate-800/90 border border-slate-700/70 shadow-lg space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-base shrink-0">
                      {req.employeeName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          {req.employeeName}
                        </h3>
                        <span className="text-xs text-slate-400">• {req.department}</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        {employeeProfile?.jobTitle || 'Colaborador da equipe'} • Solicitado em {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={req.status} size="lg" />
                </div>

                {/* Body Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                    <span className="text-[11px] text-slate-400 block font-medium">Período de Descanso</span>
                    <span className="text-sm font-bold text-white">
                      {req.startDate} até {req.endDate}
                    </span>
                    <span className="text-emerald-400 block font-semibold mt-0.5">
                      {req.durationDays} dias corridos
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                    <span className="text-[11px] text-slate-400 block font-medium">Abono Pecuniário</span>
                    <span className="text-sm font-bold text-white">
                      {req.sellDays ? 'Sim, vender 1/3' : 'Não (somente descanso)'}
                    </span>
                    {req.sellDays && (
                      <span className="text-amber-400 block font-semibold mt-0.5">
                        +{req.soldDaysCount || 10} dias convertidos em remuneração
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                    <span className="text-[11px] text-slate-400 block font-medium">Saldo do Colaborador</span>
                    <span className="text-sm font-bold text-white">
                      {employeeProfile?.remainingVacationDays ?? '30'} dias disponíveis
                    </span>
                    <span className="text-slate-400 block mt-0.5">
                      Período de solicitação: {req.periodNumber}º período
                    </span>
                  </div>
                </div>

                {/* Observações do funcionário se houver */}
                {req.notes && (
                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-300">
                    <strong className="text-slate-200">Mensagem do colaborador:</strong> "{req.notes}"
                  </div>
                )}

                {/* Verificador de Conflitos de Escala da Equipe */}
                {conflicts.length > 0 ? (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Alerta de Sobreposição com Colegas da Mesma Equipe:</span>
                    </div>
                    <p className="text-amber-300/90">
                      Durante este mesmo intervalo de datas, os seguintes membros também estarão ausentes:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 font-medium">
                      {conflicts.map((c) => (
                        <li key={c.id}>
                          <strong>{c.employeeName}</strong>: {c.startDate} até {c.endDate} ({c.durationDays}d - Status: {c.status})
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Nenhum outro membro da equipe de {req.department} estará de férias neste período.</span>
                  </div>
                )}

                {/* Exibição da Justificativa da Recusa se já foi recusado */}
                {req.status === 'rejected' && req.rejectionReason && (
                  <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 text-xs text-rose-300 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-rose-200">
                      <XCircle className="w-4 h-4 text-rose-400" />
                      Justificativa formal registrada na recusa:
                    </span>
                    <p className="text-slate-200 text-sm whitespace-pre-wrap pl-5">
                      "{req.rejectionReason}"
                    </p>
                    <p className="text-[11px] text-slate-400 pl-5">
                      Avaliado por {req.reviewedByName || 'Gestor'} em {req.reviewedAt ? new Date(req.reviewedAt).toLocaleString('pt-BR') : ''}
                    </p>
                  </div>
                )}

                {/* Ações do Gestor (Se pendente) */}
                {req.status === 'pending' && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-700/60">
                    <span className="text-xs text-slate-400">
                      Ao aprovar, o pedido avança automaticamente para a formalização do RH.
                    </span>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setRejectingReq(req)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Recusar com Justificativa</span>
                      </button>

                      <button
                        onClick={() => handleApprove(req)}
                        disabled={approvingId === req.id}
                        className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>{approvingId === req.id ? 'Aprovando...' : 'Aprovar Pedido de Férias'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Justificativa Obrigatória de Recusa */}
      <RejectionModal
        isOpen={!!rejectingReq}
        request={rejectingReq}
        onClose={() => setRejectingReq(null)}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
};
