import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types/vacation';
import { AdjustBalanceModal } from '../components/AdjustBalanceModal';
import {
  Users,
  Search,
  Sliders,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from 'lucide-react';

interface HrEmployeesViewProps {
  allUsers: UserProfile[];
}

export const HrEmployeesView: React.FC<HrEmployeesViewProps> = ({ allUsers }) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [adjustingEmployee, setAdjustingEmployee] = useState<UserProfile | null>(null);

  if (!currentUser) return null;

  const employees = allUsers.filter(u => u.role === 'employee');

  const departments = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));

  const filteredEmployees = employees.filter(emp => {
    if (selectedDept !== 'all' && emp.department !== selectedDept) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = emp.name.toLowerCase().includes(term);
      const matchEmail = emp.email.toLowerCase().includes(term);
      const matchJob = emp.jobTitle?.toLowerCase().includes(term);
      if (!matchName && !matchEmail && !matchJob) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-1">
          <Users className="w-4 h-4" />
          <span>Gestão de Pessoas & Ciclos Aquisitivos</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Colaboradores & Administração de Saldos
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Gerencie o saldo de férias de cada colaborador, períodos aquisitivos e parâmetros legais.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Departamento:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
          >
            <option value="all">Todos os Departamentos</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar colaborador ou cargo..."
            className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Employees Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEmployees.map((emp) => (
          <div
            key={emp.uid}
            className="p-5 rounded-3xl bg-slate-800/90 border border-slate-700/70 space-y-4 shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{emp.name}</h3>
                    <p className="text-xs text-slate-400">{emp.jobTitle} • {emp.department}</p>
                  </div>
                </div>

                <button
                  onClick={() => setAdjustingEmployee(emp)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Ajustar Saldo</span>
                </button>
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 block">Saldo Restante</span>
                  <span className="text-sm font-extrabold text-emerald-400">
                    {emp.remainingVacationDays}d
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 block">Gozados</span>
                  <span className="text-sm font-bold text-slate-200">
                    {emp.usedVacationDays || 0}d
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 block">Vendidos (1/3)</span>
                  <span className="text-sm font-bold text-slate-200">
                    {emp.soldVacationDays || 0}d
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Período Aquisitivo: {emp.acquisitionPeriodStart} a {emp.acquisitionPeriodEnd}</span>
              <span className="font-semibold text-slate-300">Fracionamento: {emp.periodsUsed || 0}/3</span>
            </div>
          </div>
        ))}
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
