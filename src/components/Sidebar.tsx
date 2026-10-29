import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarPlus,
  History,
  Calendar,
  CheckSquare,
  Users,
  FileCheck2,
  FileText,
  User,
  BookOpen,
  X,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  pendingManagerCount: number;
  pendingHrCount: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  pendingManagerCount,
  pendingHrCount,
}) => {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'employee';

  const employeeNav: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Painel Geral',
      icon: LayoutDashboard,
      description: 'Saldo e visão rápida',
    },
    {
      id: 'request_vacation',
      label: 'Solicitar Férias',
      icon: CalendarPlus,
      description: 'Novo pedido de férias',
    },
    {
      id: 'employee_history',
      label: 'Meus Pedidos',
      icon: History,
      description: 'Histórico e status',
    },
    {
      id: 'calendar',
      label: 'Calendário da Equipe',
      icon: Calendar,
      description: 'Escala de ausências',
    },
  ];

  const managerNav: NavItem[] = [
    {
      id: 'manager_dashboard',
      label: 'Painel da Equipe',
      icon: LayoutDashboard,
      description: 'Visão geral do time',
    },
    {
      id: 'manager_review',
      label: 'Análise de Pedidos',
      icon: CheckSquare,
      badge: pendingManagerCount,
      description: 'Aprovar ou recusar',
    },
    {
      id: 'calendar',
      label: 'Calendário & Conflitos',
      icon: Calendar,
      description: 'Ver sobreposições',
    },
    {
      id: 'manager_team_history',
      label: 'Histórico do Time',
      icon: History,
      description: 'Todos os pedidos',
    },
  ];

  const hrNav: NavItem[] = [
    {
      id: 'hr_dashboard',
      label: 'Painel do RH',
      icon: LayoutDashboard,
      description: 'Indicadores globais',
    },
    {
      id: 'hr_registration',
      label: 'Registro de Férias',
      icon: FileCheck2,
      badge: pendingHrCount,
      description: 'Efetivação e protocolos',
    },
    {
      id: 'hr_employees',
      label: 'Colaboradores & Saldos',
      icon: Users,
      description: 'Administração de saldos',
    },
    {
      id: 'calendar',
      label: 'Calendário Corporativo',
      icon: Calendar,
      description: 'Mapa de férias',
    },
    {
      id: 'hr_audit',
      label: 'Histórico & Auditoria',
      icon: FileText,
      description: 'Logs e relatórios',
    },
  ];

  const currentNav = role === 'employee' ? employeeNav : role === 'manager' ? managerNav : hrNav;

  const roleTitle = {
    employee: 'Área do Funcionário',
    manager: 'Área de Gestão / Gerente',
    hr: 'Área de Departamento Pessoal / RH',
  }[role];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 left-0 h-full lg:h-[calc(100vh-4rem)] w-64 bg-slate-900 border-r border-slate-800 z-50 transition-transform duration-200 ease-in-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Mobile close button */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800 lg:hidden">
            <span className="text-sm font-semibold text-slate-300">Menu Principal</span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role header chip */}
          <div className="mb-4 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
              Perfil Ativo
            </span>
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mt-0.5">
              {roleTitle}
            </span>
          </div>

          {/* Navigation group */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1 block">
              Navegação
            </span>
            {currentNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group ${
                    isActive
                      ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                      }`}
                    />
                    <div className="truncate">
                      <div className="text-xs font-medium truncate">{item.label}</div>
                      <div
                        className={`text-[10px] truncate ${
                          isActive ? 'text-indigo-100' : 'text-slate-400'
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isActive
                          ? 'bg-white text-indigo-700'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Common Footer links: Profile and Requirements */}
          <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1 block">
              Sistema & Documentação
            </span>

            <button
              onClick={() => {
                setActiveTab('profile');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                activeTab === 'profile'
                  ? 'bg-slate-800 text-white font-medium border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <User className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-xs font-medium">Perfil & Saldo</div>
                <div className="text-[10px] text-slate-400">Ciclo aquisitivo e dados</div>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('requirements');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                activeTab === 'requirements'
                  ? 'bg-indigo-950/80 border border-indigo-700 text-indigo-200 font-medium'
                  : 'text-indigo-300/80 hover:text-indigo-200 hover:bg-indigo-950/40'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="text-xs font-medium flex items-center gap-1.5">
                  Elicitação de Requisitos
                  <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                    Acadêmico
                  </span>
                </div>
                <div className="text-[10px] text-indigo-400/80">RF01-RF12 & RN01-RN06</div>
              </div>
            </button>
          </div>
        </div>

        {/* Small Bottom Info Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 text-center">
          <p className="text-[11px] text-slate-400">
            Conforme regras <span className="text-indigo-400 font-medium">CLT Art. 134</span>
          </p>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Firestore & Express Conectados
          </div>
        </div>
      </aside>
    </>
  );
};
