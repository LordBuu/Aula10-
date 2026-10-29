import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { VacationRequest, UserProfile } from '../types/vacation';
import { StatusBadge } from '../components/StatusBadge';
import { registerVacationRequest } from '../services/firebaseService';
import {
  FileCheck2,
  Calendar,
  Clock,
  CheckCircle2,
  Search,
  Check,
  Building,
  User,
  ShieldCheck,
  Printer,
  Sparkles,
} from 'lucide-react';

interface HrRegistrationViewProps {
  requests: VacationRequest[];
  allUsers: UserProfile[];
}

export const HrRegistrationView: React.FC<HrRegistrationViewProps> = ({
  requests,
  allUsers,
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending_registration' | 'already_registered' | 'all'>('pending_registration');
  const [searchTerm, setSearchTerm] = useState('');
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [successProtocol, setSuccessProtocol] = useState<{ reqId: string; protocol: string } | null>(null);

  if (!currentUser) return null;

  // Filtragem conforme a aba
  const displayedRequests = requests.filter(r => {
    if (activeTab === 'pending_registration') {
      if (r.status !== 'approved') return false;
    } else if (activeTab === 'already_registered') {
      if (r.status !== 'registered') return false;
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = r.employeeName.toLowerCase().includes(term);
      const matchDept = r.department.toLowerCase().includes(term);
      const matchProtocol = r.protocolNumber?.toLowerCase().includes(term);
      if (!matchName && !matchDept && !matchProtocol) return false;
    }

    return true;
  });

  const handleRegister = async (req: VacationRequest) => {
    const employee = allUsers.find(u => u.uid === req.employeeId);
    if (!employee) {
      alert('Perfil do colaborador não encontrado no banco de dados.');
      return;
    }

    try {
      setRegisteringId(req.id);
      const protocol = await registerVacationRequest(req, employee, currentUser);
      setSuccessProtocol({ reqId: req.id, protocol });
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar férias.');
    } finally {
      setRegisteringId(null);
    }
  };

  const counts = {
    pending_registration: requests.filter(r => r.status === 'approved').length,
    already_registered: requests.filter(r => r.status === 'registered').length,
    all: requests.length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-1">
            <FileCheck2 className="w-4 h-4" />
            <span>Departamento de Pessoal • Formalização Trabalhista</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Tela de Registro e Homologação de Férias
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Formalize na folha de pagamento as férias já aprovadas pelos gestores imediatos.
          </p>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('pending_registration')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 ${
              activeTab === 'pending_registration'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Aguardando Registro</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-bold">
              {counts.pending_registration}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('already_registered')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 ${
              activeTab === 'already_registered'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Já Registradas (Homologadas)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-bold">
              {counts.already_registered}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            <span>Todos os Registros</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-bold">
              {counts.all}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por colaborador, equipe ou protocolo..."
            className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Success banner if registered during this session */}
      {successProtocol && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-white text-sm">Férias registradas no sistema corporativo!</p>
              <p className="text-emerald-300/90">
                Protocolo emitido: <strong className="font-mono text-white">{successProtocol.protocol}</strong>. O saldo do funcionário foi devidamente debitado.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSuccessProtocol(null)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Requests List */}
      {displayedRequests.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-slate-800/50 border border-slate-700/60">
          <FileCheck2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">Nenhum pedido encontrado nesta seção</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {activeTab === 'pending_registration'
              ? 'Todos os pedidos aprovados pelos gestores já foram registrados pelo RH.'
              : 'Nenhum resultado corresponde à sua pesquisa.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedRequests.map((req) => {
            const employee = allUsers.find(u => u.uid === req.employeeId);

            return (
              <div
                key={req.id}
                className={`p-6 rounded-3xl border shadow-lg space-y-4 transition-all ${
                  req.status === 'approved'
                    ? 'bg-slate-800/90 border-purple-500/40 ring-1 ring-purple-500/20'
                    : 'bg-slate-800/80 border-slate-700/70'
                }`}
              >
                {/* Top row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-base shrink-0">
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
                        {employee?.jobTitle || 'Funcionário'} • Solicitado em {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={req.status} size="lg" />
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
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
                    <span className="text-[11px] text-slate-400 block font-medium">Abono Pecuniário (1/3)</span>
                    <span className="text-sm font-bold text-white">
                      {req.sellDays ? 'Sim, 10 dias vendidos' : 'Não'}
                    </span>
                    <span className="text-amber-400 block mt-0.5">
                      {req.sellDays ? 'Pagar abono em folha' : 'Somente férias normais'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                    <span className="text-[11px] text-slate-400 block font-medium">Saldo Atual do Funcionário</span>
                    <span className="text-sm font-bold text-white">
                      {employee?.remainingVacationDays ?? '30'} dias restantes
                    </span>
                    <span className="text-slate-400 block mt-0.5">
                      Período de gozo: {req.periodNumber}º período
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                    <span className="text-[11px] text-slate-400 block font-medium">Aprovação do Gestor</span>
                    <span className="text-xs font-semibold text-white">
                      {req.reviewedByName || 'Gestor'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {req.reviewedAt ? new Date(req.reviewedAt).toLocaleString('pt-BR') : 'Data não registrada'}
                    </span>
                  </div>
                </div>

                {/* If already registered: show protocol card */}
                {req.status === 'registered' && req.protocolNumber && (
                  <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-200">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                        Formalizado pelo RH sob Protocolo Oficial
                      </span>
                      <p className="font-mono text-base font-bold text-white">
                        {req.protocolNumber}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Operador: {req.registeredByName || 'RH'} • Registrado em {req.registeredAt ? new Date(req.registeredAt).toLocaleString('pt-BR') : ''}
                      </p>
                    </div>

                    <button
                      onClick={() => alert(`Comprovante de Homologação de Férias\nProtocolo: ${req.protocolNumber}\nColaborador: ${req.employeeName}\nPeríodo: ${req.startDate} a ${req.endDate} (${req.durationDays} dias)\nRegistrado no Sistema Corporativo.`)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Emitir Comprovante</span>
                    </button>
                  </div>
                )}

                {/* Action button if ready for registration */}
                {req.status === 'approved' && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-700/60">
                    <div className="text-xs text-purple-300 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>
                        Regra RN06: Pedido aprovado pelo gerente. Pronto para efetivação pelo RH.
                      </span>
                    </div>

                    <button
                      onClick={() => handleRegister(req)}
                      disabled={registeringId === req.id}
                      className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>{registeringId === req.id ? 'Registrando...' : 'Homologar e Registrar no Sistema'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
