import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { VacationRequest } from '../types/vacation';
import { StatusBadge } from '../components/StatusBadge';
import { ViewRejectionReasonModal } from '../components/ViewRejectionReasonModal';
import { cancelVacationRequest } from '../services/firebaseService';
import {
  Calendar,
  Clock,
  Sparkles,
  AlertCircle,
  PlusCircle,
  History,
  ShieldCheck,
  Ban,
  HelpCircle,
  DollarSign,
  ChevronRight,
} from 'lucide-react';

interface EmployeeDashboardProps {
  requests: VacationRequest[];
  onNavigateToRequest: () => void;
  onNavigateToHistory: () => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  requests,
  onNavigateToRequest,
  onNavigateToHistory,
}) => {
  const { currentUser } = useAuth();
  const [selectedRejectedReq, setSelectedRejectedReq] = useState<VacationRequest | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  if (!currentUser) return null;

  // Filtrar pedidos deste funcionário
  const myRequests = requests.filter(r => r.employeeId === currentUser.uid);
  const pendingRequests = myRequests.filter(r => r.status === 'pending');
  const recentRequests = myRequests.slice(0, 4);

  // Próximas férias aprovadas ou registradas
  const upcomingVacation = myRequests
    .filter(r => (r.status === 'approved' || r.status === 'registered') && new Date(r.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

  const handleCancel = async (req: VacationRequest) => {
    if (!confirm('Deseja realmente cancelar este pedido de férias pendente?')) return;
    try {
      setCancellingId(req.id);
      await cancelVacationRequest(req.id, currentUser);
    } catch (err: any) {
      alert(err.message || 'Erro ao cancelar pedido.');
    } finally {
      setCancellingId(null);
    }
  };

  const percentageUsed = Math.min(
    100,
    Math.round(((currentUser.usedVacationDays + currentUser.soldVacationDays) / (currentUser.totalVacationDays || 30)) * 100)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-900/40 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portal do Colaborador</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Olá, {currentUser.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Gerencie suas solicitações de férias, consulte seu saldo e acompanhe pareceres da gestão.
          </p>
        </div>

        <button
          onClick={onNavigateToRequest}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs sm:text-sm text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Solicitar Férias</span>
        </button>
      </div>

      {/* Hero Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Saldo Disponível */}
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/70 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium">Saldo Restante</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {currentUser.remainingVacationDays}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              / {currentUser.totalVacationDays || 30} dias
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${100 - percentageUsed}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1.5 block">
            {currentUser.remainingVacationDays > 0 ? 'Disponível para agendamento' : 'Saldo esgotado neste período'}
          </span>
        </div>

        {/* Card 2: Dias Gozados / Usufruídos */}
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/70 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium">Dias Gozados</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {currentUser.usedVacationDays || 0}
            <span className="text-xs font-normal text-slate-400 ml-1">dias</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Férias já usufruídas ou aprovadas formalmente
          </p>
        </div>

        {/* Card 3: Abono Pecuniário (Venda 1/3) */}
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/70 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium">Abono Pecuniário (1/3)</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {currentUser.soldVacationDays || 0}
            <span className="text-xs font-normal text-slate-400 ml-1">dias</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            {currentUser.soldVacationDays > 0 ? '1/3 convertido em dinheiro' : 'Nenhum dia vendido ainda'}
          </p>
        </div>

        {/* Card 4: Fracionamento (Períodos Utilizados) */}
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/70 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium">Períodos Usufruídos</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {currentUser.periodsUsed || 0}
            <span className="text-xs font-normal text-slate-400 ml-1">/ 3 máx</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                currentUser.hasLongPeriodUsed
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}
            >
              {currentUser.hasLongPeriodUsed ? '✓ Período de 14d cumprido' : 'Pendente período de 14d'}
            </span>
          </div>
        </div>
      </div>

      {/* Banner de Próximas Férias se houver */}
      {upcomingVacation && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-800/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Suas Próximas Férias Marcadas
              </span>
              <p className="text-sm font-semibold text-white">
                De {upcomingVacation.startDate} até {upcomingVacation.endDate} ({upcomingVacation.durationDays} dias corridos)
              </p>
              <p className="text-xs text-slate-400">
                Status: {upcomingVacation.status === 'registered' ? 'Registrado pelo RH no DP' : 'Aprovado pelo gestor'}
              </p>
            </div>
          </div>
          <StatusBadge status={upcomingVacation.status} />
        </div>
      )}

      {/* Pedidos Recentes & Acompanhamento */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-3xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Acompanhamento de Solicitações
            </h2>
            <p className="text-xs text-slate-400">
              Acompanhe em tempo real a análise do gerente e a formalização pelo RH
            </p>
          </div>
          <button
            onClick={onNavigateToHistory}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <span>Ver Histórico Completo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentRequests.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-slate-900/50 border border-slate-800">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-300">Nenhum pedido de férias registrado</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Você ainda não enviou solicitações de férias para o período aquisitivo atual.
            </p>
            <button
              onClick={onNavigateToRequest}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Fazer Primeiro Pedido</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {recentRequests.map((req) => (
              <div
                key={req.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-700/20 px-3 rounded-xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-white">
                      {req.durationDays} dias corridos
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-300">
                      Início: <strong className="text-slate-100">{req.startDate}</strong>
                    </span>
                    <span className="text-xs text-slate-400">até</span>
                    <span className="text-xs text-slate-300">
                      <strong className="text-slate-100">{req.endDate}</strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span>Solicitado em {new Date(req.createdAt).toLocaleDateString('pt-BR')}</span>
                    {req.sellDays && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        + Venda 1/3 ({req.soldDaysCount || 10}d)
                      </span>
                    )}
                    {req.protocolNumber && (
                      <span className="font-mono text-indigo-300">
                        Protocolo: {req.protocolNumber}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={req.status} />

                  {/* Se foi recusado, botão para ler a justificativa */}
                  {req.status === 'rejected' && (
                    <button
                      onClick={() => setSelectedRejectedReq(req)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors flex items-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Ver Motivo</span>
                    </button>
                  )}

                  {/* Se ainda está pendente, permitir cancelamento pelo colaborador */}
                  {req.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(req)}
                      disabled={cancellingId === req.id}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/30 transition-colors flex items-center gap-1"
                      title="Cancelar pedido antes de ser analisado pelo gerente"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>{cancellingId === req.id ? 'Cancelando...' : 'Cancelar'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para ver motivo da recusa */}
      <ViewRejectionReasonModal
        isOpen={!!selectedRejectedReq}
        request={selectedRejectedReq}
        onClose={() => setSelectedRejectedReq(null)}
      />
    </div>
  );
};
