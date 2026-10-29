import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  LogOut,
  UserCheck,
  ChevronDown,
  Sparkles,
  Shield,
  Briefcase,
  Users,
  Menu,
  BookOpen,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, setActiveTab }) => {
  const { currentUser, switchDemoUser, logout, demoUsers } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const roleLabel = {
    employee: 'Funcionário',
    manager: 'Gerente de Equipe',
    hr: 'Recursos Humanos (RH)',
  }[currentUser?.role || 'employee'];

  const roleBadgeColor = {
    employee: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    manager: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    hr: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  }[currentUser?.role || 'employee'];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Mobile toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden focus:outline-none"
              title="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              onClick={() => setActiveTab(currentUser?.role === 'employee' ? 'dashboard' : currentUser?.role === 'manager' ? 'manager_dashboard' : 'hr_dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                  Férias<span className="text-indigo-400">Hub</span>
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    SaaS
                  </span>
                </span>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Gestão & Elicitação de Requisitos
                </p>
              </div>
            </div>
          </div>

          {/* Quick Academic Demo Switcher & User Actions */}
          <div className="flex items-center gap-3">
            {/* Academic Presentation Tab Shortcut */}
            <button
              onClick={() => setActiveTab('requirements')}
              className="hidden md:inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 hover:bg-indigo-900/60 transition-colors"
              title="Visualizar matriz de requisitos para apresentação"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Matriz de Requisitos</span>
            </button>

            {/* Quick Persona Switcher for Presentation */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800 text-left transition-all"
              >
                <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-700 flex items-center justify-center shrink-0 border border-slate-600">
                  {currentUser?.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-4 h-4 text-slate-300" />
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1">
                    {currentUser?.name || 'Visitante'}
                    <span className={`text-[10px] px-1.5 py-0.2 rounded border ${roleBadgeColor}`}>
                      {roleLabel}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {currentUser?.department || 'Tecnologia'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {/* Persona Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 text-slate-200">
                    <div className="px-4 py-2 border-b border-slate-700/80">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        Alternar Perfil Acadêmico
                      </p>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Alterne entre perfis para testar o fluxo de ponta a ponta na aula:
                      </p>
                    </div>

                    <div className="p-1 space-y-1">
                      {demoUsers.map((persona) => {
                        const isCurrent = currentUser?.uid === persona.uid;
                        const roleDesc =
                          persona.role === 'employee'
                            ? 'Solicita férias e vê saldo'
                            : persona.role === 'manager'
                            ? 'Aprova ou recusa pedidos da equipe'
                            : 'Registra e formaliza na folha';

                        return (
                          <button
                            key={persona.uid}
                            onClick={() => {
                              switchDemoUser(persona.uid);
                              setDropdownOpen(false);
                            }}
                            className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-all ${
                              isCurrent
                                ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                                : 'hover:bg-slate-700/60 text-slate-300'
                            }`}
                          >
                            <img
                              src={persona.avatarUrl}
                              alt={persona.name}
                              className="w-8 h-8 rounded-lg object-cover shrink-0 mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold flex items-center justify-between">
                                <span className="truncate">{persona.name}</span>
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                    persona.role === 'employee'
                                      ? 'bg-blue-500/20 text-blue-300'
                                      : persona.role === 'manager'
                                      ? 'bg-amber-500/20 text-amber-300'
                                      : 'bg-purple-500/20 text-purple-300'
                                  }`}
                                >
                                  {persona.role === 'employee' ? 'Funcionário' : persona.role === 'manager' ? 'Gerente' : 'RH'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 truncate">{roleDesc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-700/80 pt-1 mt-1 px-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          setActiveTab('profile');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg text-left"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Ver Perfil & Período Aquisitivo</span>
                      </button>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sair / Trocar Conta</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
