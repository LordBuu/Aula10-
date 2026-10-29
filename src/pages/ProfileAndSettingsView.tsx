import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Shield,
  Briefcase,
  Building,
  Mail,
  Calendar,
  Clock,
  Sparkles,
  Save,
  CheckCircle2,
  Database,
  Key,
} from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';

export const ProfileAndSettingsView: React.FC = () => {
  const { currentUser, updateCurrentUserProfile } = useAuth();

  const [name, setName] = useState(currentUser?.name || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [jobTitle, setJobTitle] = useState(currentUser?.jobTitle || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateCurrentUserProfile({
        name: name.trim(),
        department: department.trim(),
        jobTitle: jobTitle.trim(),
      });
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar perfil.');
    } finally {
      setSaving(false);
    }
  };

  const roleTitle = {
    employee: 'Colaborador / Funcionário',
    manager: 'Gerente / Gestor de Equipe',
    hr: 'Analista de Recursos Humanos / DP',
  }[currentUser.role];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
          <User className="w-4 h-4" />
          <span>Configurações Pessoais & Perfil</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Meu Perfil de Acesso
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Consulte seus dados cadastrais, informações de ciclo aquisitivo e parâmetros de autenticação.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card & Avatar */}
        <div className="p-6 rounded-3xl bg-slate-800/90 border border-slate-700/70 text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-3xl overflow-hidden bg-slate-700 border-2 border-indigo-500/50 shadow-xl">
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold bg-indigo-600">
                {currentUser.name.charAt(0)}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">{currentUser.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{currentUser.jobTitle}</p>
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              <Shield className="w-3.5 h-3.5" />
              <span>{roleTitle}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700/60 text-left text-xs space-y-2 text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Departamento:</span>
              <span className="font-semibold text-white">{currentUser.department}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Admissão:</span>
              <span className="font-semibold text-white">{currentUser.hireDate || '2023-01-10'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Gerente Imediato:</span>
              <span className="font-semibold text-white">{currentUser.managerName || 'Carlos Mendes'}</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-slate-800/90 border border-slate-700/70 shadow-lg space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            <span>Editar Informações Cadastrais</span>
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nome de Exibição
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Departamento
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Cargo / Função
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                E-mail Corporativo
              </label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-700 text-slate-400 text-xs cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                O e-mail é vinculado à sua autenticação no Firebase e não pode ser alterado diretamente.
              </span>
            </div>

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Dados atualizados com sucesso no Firestore!</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Ciclo Aquisitivo e Saldo Detalhado */}
      <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/70 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>Extrato de Saldo e Período Aquisitivo de Férias</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">Início do Ciclo</span>
            <span className="font-bold text-white text-sm">
              {currentUser.acquisitionPeriodStart || '15/03/2025'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">Fim do Ciclo</span>
            <span className="font-bold text-white text-sm">
              {currentUser.acquisitionPeriodEnd || '14/03/2026'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">Direito Adquirido</span>
            <span className="font-bold text-white text-sm">
              {currentUser.totalVacationDays || 30} dias
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-emerald-500/30 bg-emerald-950/20">
            <span className="text-emerald-400 block text-[11px] font-semibold">Saldo Restante</span>
            <span className="font-extrabold text-emerald-300 text-base">
              {currentUser.remainingVacationDays} dias
            </span>
          </div>
        </div>
      </div>

      {/* Parâmetros de Integração Técnica */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs text-slate-400">
        <h4 className="font-semibold text-slate-300 flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <span>Parâmetros Técnicos de Conexão</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
          <div>
            <span className="text-slate-500 block">Firebase Project ID:</span>
            <code className="text-slate-300 font-mono">{firebaseConfig.projectId}</code>
          </div>
          <div>
            <span className="text-slate-500 block">Firestore Database ID:</span>
            <code className="text-slate-300 font-mono">{firebaseConfig.firestoreDatabaseId}</code>
          </div>
          <div>
            <span className="text-slate-500 block">UID do Usuário Ativo:</span>
            <code className="text-slate-300 font-mono">{currentUser.uid}</code>
          </div>
          <div>
            <span className="text-slate-500 block">Regras de Segurança:</span>
            <span className="text-emerald-400 font-medium">ABAC com Default-Deny implantadas</span>
          </div>
        </div>
      </div>
    </div>
  );
};
