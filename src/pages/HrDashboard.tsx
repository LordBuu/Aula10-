import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { VacationRequest, UserProfile, VacationLog } from '../types/vacation';
import { StatusBadge } from '../components/StatusBadge';
import { AdjustBalanceModal } from '../components/AdjustBalanceModal';
import { registerVacationRequest } from '../services/firebaseService';
import {
  Building2,
  FileCheck2,
  Users,
  CalendarCheck,
  CheckCircle2,
  Sparkles,
  Sliders,
  Clock,
  ChevronRight,
  ShieldAlert,
  FileText,
} from 'lucide-react';

interface HrDashboardProps {
  requests: VacationRequest[];
  allUsers: UserProfile[];
  logs: VacationLog[];
  onNavigateToRegistration: () => void;
  onNavigateToEmployees: () => void;
  onNavigateToAudit: () => void;
}

export const HrDashboard: React.FC<HrDashboardProps> = ({
  requests,
  allUsers,
  logs,
  onNavigateToRegistration,
  onNavigateToEmployees,
  onNavigateToAudit,
}) => {
  const { currentUser } = useAuth();
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [adjustingEmployee, setAdjustingEmployee] = useState<UserProfile | null>(null);

  if (!currentUser) return null;

  // Pedidos que o gerente aprovou e que agora esperam o registro do RH
  const approvedWaitingRegistration = requests.filter(r => r.status === 'approved');
  const registeredRequests = requests.filter(r => r.status === 'registered');
  const employeesList = allUsers.filter(u => u.role === 'employee');

  const handleRegisterQuick = async (req: VacationRequest) => {
    const employee = allUsers.find(u => u.uid === req.employeeId);
    if (!employee) {
      alert('Perfil do colaborador não localizado.');
      return;
    }

    try {
      setRegisteringId(req.id);
      const protocol = await registerVacationRequest(req, employee, currentUser);
      alert(`Férias registradas e homologadas na folha com sucesso!\nProtocolo: ${protocol}`);
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar férias.');
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-900/40 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Departamento Pessoal & Recursos Humanos</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Painel Executivo do RH
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Formalização de férias na folha, controle de saldos por ciclo aquisitivo e auditoria geral.
          </p>
        </div>

        <button
          onClick={onNavigateToRegistration}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 font-semibold text-xs sm:text-sm text-white shadow-lg shadow-purple-600/30 transition-all shrink-0 cursor-pointer"
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Fila de Registro ({approvedWaitingRegistration.length})</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Prontas para Registro */}
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-purple-500/40 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium text-purple-300">Aguardando Registro RH</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {approvedWaitingRegistration.length}
          </div>
          <p className="text-[10px] text-purple-400/90 mt-2 font-medium">
            {approvedWaitingRegistration.length > 0
              ? 'Aprovadas pelo gestor, prontas para homologação'
              : 'Nenhum pedido pendente de registro'}
          </p>
        </div>

        {/* Card 2: Registradas formalmente */}
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/70">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium">Total Registradas no DP</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {registeredRequests.length}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Férias homologadas e debitadas do saldo
          </p>
        </div>

        {/* Card 3: Colaboradores Ativos */}
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/70">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium">Funcionários Cadastrados</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {employeesList.length}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Com períodos aquisitivos gerenciados
          </p>
        </div>

        {/* Card 4: Taxa de Fracionamento */}
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/70">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium">Conformidade CLT</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            100%
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Validação automática de 14d e 5d ativa
          </p>
        </div>
      </div>

      {/* Fila Prioritária de Homologação / Registro */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-3xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-purple-400" />
              <span>Férias Aprovadas Aguardando Registro em Folha</span>
              {approvedWaitingRegistration.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  {approvedWaitingRegistration.length} pendente(s)
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Estes pedidos foram validados e aprovados pelo gestor da equipe. O RH deve registrá-los para gerar o protocolo e atualizar o saldo.
            </p>
          </div>

          <button
            onClick={onNavigateToRegistration}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            <span>Ver Fila Completa</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {approvedWaitingRegistration.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-slate-900/50 border border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-200">Sem Pendências de Registro</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Todas as férias aprovadas pelos gestores já foram devidamente registradas e homologadas.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {approvedWaitingRegistration.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-slate-900/70 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{req.employeeName}</span>
                    <span className="text-xs text-slate-400">• {req.department}</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Período: <strong className="text-white">{req.startDate}</strong> até <strong className="text-white">{req.endDate}</strong> ({req.durationDays} dias corridos)
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Aprovado pelo gestor {req.reviewedByName || 'Gestor'} {req.reviewedAt ? `em ${new Date(req.reviewedAt).toLocaleDateString('pt-BR')}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRegisterQuick(req)}
                    disabled={registeringId === req.id}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>{registeringId === req.id ? 'Registrando...' : 'Registrar no Sistema'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visão de Saldos dos Colaboradores */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-3xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Colaboradores e Administração de Saldos</span>
            </h2>
            <p className="text-xs text-slate-400">
              O RH pode consultar e ajustar o saldo de cada funcionário conforme admissão e período aquisitivo.
            </p>
          </div>

          <button
            onClick={onNavigateToEmployees}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <span>Gerenciar Todos</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-700/60">
              <tr>
                <th className="py-3 px-4">Colaborador</th>
                <th className="py-3 px-4">Departamento</th>
                <th className="py-3 px-4">Período Aquisitivo</th>
                <th className="py-3 px-4">Saldo Restante</th>
                <th className="py-3 px-4">Períodos</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {employeesList.slice(0, 5).map((emp) => (
                <tr key={emp.uid} className="hover:bg-slate-700/20 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">
                    <div>{emp.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{emp.jobTitle}</div>
                  </td>
                  <td className="py-3 px-4">{emp.department}</td>
                  <td className="py-3 px-4 text-slate-300">
                    {emp.acquisitionPeriodStart || '2025-01-01'} a {emp.acquisitionPeriodEnd || '2025-12-31'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-emerald-400 text-sm">
                      {emp.remainingVacationDays}
                    </span>
                    <span className="text-slate-400"> / {emp.totalVacationDays || 30} dias</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-200 text-[10px] font-semibold">
                      {emp.periodsUsed || 0}/3
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setAdjustingEmployee(emp)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Ajustar Saldo</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Ajuste de Saldo */}
      <AdjustBalanceModal
        isOpen={!!adjustingEmployee}
        employee={adjustingEmployee}
        hrUser={currentUser}
        onClose={() => setAdjustingEmployee(null)}
        onSuccess={() => alert('Saldo do colaborador atualizado com sucesso no Firestore!')}
      />
    </div>
  );
};
