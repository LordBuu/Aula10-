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
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  ChevronRight,
} from 'lucide-react';

interface ManagerDashboardProps {
  requests: VacationRequest[];
  allUsers: UserProfile[];
  onNavigateToReview: () => void;
  onNavigateToCalendar: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  requests,
  allUsers,
  onNavigateToReview,
  onNavigateToCalendar,
}) => {
  const { currentUser } = useAuth();
  const [rejectingReq, setRejectingReq] = useState<VacationRequest | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  if (!currentUser) return null;

  // Filtrar pedidos da equipe do gerente
  const teamRequests = requests.filter(
    r => r.managerId === currentUser.uid || r.department === currentUser.department
  );

  const pendingRequests = teamRequests.filter(r => r.status === 'pending');
  const approvedRequests = teamRequests.filter(r => r.status === 'approved' || r.status === 'registered');
  const rejectedRequests = teamRequests.filter(r => r.status === 'rejected');

  // Colaboradores da equipe
  const teamMembers = allUsers.filter(
    u => u.role === 'employee' && (u.managerId === currentUser.uid || u.department === currentUser.department)
  );

  // Colaboradores em férias hoje
  const today = new Date().toISOString().split('T')[0];
  const membersOnVacationNow = teamRequests.filter(
    r => (r.status === 'approved' || r.status === 'registered') && r.startDate <= today && r.endDate >= today
  );

  const handleApprove = async (req: VacationRequest) => {
    try {
      setApprovingId(req.id);
      await approveVacationRequest(req.id, currentUser);
    } catch (err: any) {
      alert(err.message || 'Erro ao aprovar pedido.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleConfirmReject = async (reason: string) => {
    if (!rejectingReq) return;
    await rejectVacationRequest(rejectingReq.id, currentUser, reason);
    setRejectingReq(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-900/40 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gestão de Equipe • {currentUser.department}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Painel do Gestor
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Avalie solicitações da sua equipe, valide conflitos de escala e decida sobre as férias.
          </p>
        </div>

        <button
          onClick={onNavigateToCalendar}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shrink-0 cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>Ver Calendário da Equipe</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pendentes */}
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-amber-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium text-amber-300">Aguardando Sua Análise</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {pendingRequests.length}
          </div>
          <p className="text-[10px] text-amber-400/90 mt-2 font-medium">
            {pendingRequests.length > 0 ? 'Requer sua aprovação ou recusa' : 'Nenhuma pendência na fila'}
          </p>
        </div>

        {/* Card 2: Membros da Equipe */}
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/70">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium">Colaboradores no Time</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {teamMembers.length}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Subordinados diretos no departamento
          </p>
        </div>

        {/* Card 3: Aprovados */}
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/70">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium">Total Aprovados</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {approvedRequests.length}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Aprovados pelo gestor ou registrados no RH
          </p>
        </div>

        {/* Card 4: Ausentes hoje */}
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/70">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium">Em Férias Hoje</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {membersOnVacationNow.length}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Colaboradores atualmente usufruindo férias
          </p>
        </div>
      </div>

      {/* Solicitações Pendentes de Avaliação */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-3xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Fila de Pedidos Pendentes</span>
              {pendingRequests.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {pendingRequests.length} novo(s)
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Avalie cada solicitação. Para recusar, é obrigatório registrar justificativa por escrito.
            </p>
          </div>

          <button
            onClick={onNavigateToReview}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            <span>Ver Tela de Análise Detalhada</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-slate-900/50 border border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-200">Fila Limpa!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Nenhuma solicitação de férias pendente de aprovação para a sua equipe no momento.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((req) => {
              // Checagem automática de conflitos na mesma equipe
              const conflicts = checkTeamConflicts(req, requests);

              return (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-700/80 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/20">
                        {req.employeeName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          {req.employeeName}
                          <span className="text-xs font-normal text-slate-400">
                            ({req.department})
                          </span>
                        </h4>
                        <p className="text-xs text-slate-300">
                          Período solicitado: <strong className="text-white">{req.startDate}</strong> até <strong className="text-white">{req.endDate}</strong> ({req.durationDays} dias)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRejectingReq(req)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Recusar</span>
                      </button>

                      <button
                        onClick={() => handleApprove(req)}
                        disabled={approvingId === req.id}
                        className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{approvingId === req.id ? 'Aprovando...' : 'Aprovar Pedido'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Informação sobre venda 1/3 se houver */}
                  {req.sellDays && (
                    <div className="text-xs text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 flex items-center gap-2">
                      <span>Colaborador optou por vender 1/3 ({req.soldDaysCount || 10} dias em dinheiro).</span>
                    </div>
                  )}

                  {/* Alerta de Conflito de Equipe */}
                  {conflicts.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-semibold">
                          Possível conflito de escala detectado:
                        </strong>
                        <span>
                          {conflicts.map(c => `${c.employeeName} (${c.startDate} a ${c.endDate})`).join('; ')} também estará de férias neste período.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Recusa Obrigatória */}
      <RejectionModal
        isOpen={!!rejectingReq}
        request={rejectingReq}
        onClose={() => setRejectingReq(null)}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
};
