import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Briefcase,
  Users,
  Building,
} from 'lucide-react';
import { saveUserProfile } from '../services/firebaseService';
import { UserRole } from '../types/vacation';

interface LoginViewProps {
  onSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { switchDemoUser, loginWithGoogle, demoUsers } = useAuth();
  const [activeTab, setActiveTab] = useState<'personas' | 'register'>('personas');

  // Registration form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [department, setDepartment] = useState('Engenharia de Software');
  const [jobTitle, setJobTitle] = useState('Analista de Requisitos');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const newUid = `user_${Date.now()}`;
      await saveUserProfile({
        uid: newUid,
        name: name.trim(),
        email: email.trim(),
        role,
        department,
        jobTitle,
        managerId: 'demo_mgr_carlos',
        managerName: 'Carlos Mendes',
        hireDate: new Date().toISOString().split('T')[0],
        totalVacationDays: 30,
        usedVacationDays: 0,
        soldVacationDays: 0,
        remainingVacationDays: 30,
        periodsUsed: 0,
        hasLongPeriodUsed: false,
        acquisitionPeriodStart: `${new Date().getFullYear()}-01-01`,
        acquisitionPeriodEnd: `${new Date().getFullYear()}-12-31`,
        updatedAt: new Date().toISOString(),
      });
      localStorage.setItem('vacation_active_uid', newUid);
      window.location.reload();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao criar conta.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/25 mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Portal de Pedido e Gestão de Férias
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Sistema acadêmico para <span className="text-indigo-400 font-semibold">Elicitação de Requisitos</span> com integração Firebase e regras CLT.
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
          {/* Tabs */}
          <div className="flex border-b border-slate-700/70 mb-6">
            <button
              onClick={() => setActiveTab('personas')}
              className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'personas'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Entrar com Perfis de Demonstração (Apresentação)
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ml-4 ${
                activeTab === 'register'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Novo Cadastro
            </button>
          </div>

          {activeTab === 'personas' ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200">
                <span className="font-semibold block mb-0.5">Dica para a apresentação do trabalho:</span>
                Escolha um dos 3 perfis abaixo para testar cada etapa do ciclo de vida das férias:
              </div>

              <div className="space-y-3">
                {demoUsers.map((p) => {
                  const roleBadge = {
                    employee: { label: 'Funcionário', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
                    manager: { label: 'Gerente', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
                    hr: { label: 'RH / DP', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
                  }[p.role];

                  return (
                    <button
                      key={p.uid}
                      onClick={async () => {
                        await switchDemoUser(p.uid);
                        onSuccess();
                      }}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/70 border border-slate-700/60 hover:border-indigo-500/50 hover:bg-slate-700/40 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.avatarUrl}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                              {p.name}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleBadge.color}`}>
                              {roleBadge.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            {p.jobTitle} • {p.department}
                          </p>
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-indigo-600 transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Google Login Option */}
              <div className="pt-4 border-t border-slate-700/60">
                <button
                  onClick={async () => {
                    await loginWithGoogle();
                    onSuccess();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-medium text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Entrar com Conta Google (Firebase Auth)</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: Lucas Martins"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  E-mail Corporativo *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lucas.martins@empresa.com.br"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Perfil de Acesso
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="employee">Funcionário</option>
                    <option value="manager">Gerente</option>
                    <option value="hr">Recursos Humanos (RH)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Departamento
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Engenharia de Software">Engenharia de Software</option>
                    <option value="Design & Produto">Design & Produto</option>
                    <option value="Operações & Suporte">Operações & Suporte</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Cargo</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Ex.: Desenvolvedor Frontend"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white text-xs sm:text-sm shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all"
              >
                {submitting ? 'Cadastrando...' : 'Cadastrar e Acessar Sistema'}
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Banco de Dados Firestore Conectado com Regras de Segurança Ativas</span>
        </div>
      </div>
    </div>
  );
};
