import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { VacationRequest } from '../types/vacation';
import { StatusBadge } from '../components/StatusBadge';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  CalendarCheck,
  Building,
} from 'lucide-react';

interface TeamCalendarViewProps {
  requests: VacationRequest[];
}

export const TeamCalendarView: React.FC<TeamCalendarViewProps> = ({ requests }) => {
  const { currentUser } = useAuth();

  // Current view date (year and month)
  const [currentDate, setCurrentDate] = useState(() => {
    // Default to current date or November 2026 for demo data visibility
    return new Date(2026, 10, 1); // Novembro 2026 (onde temos férias do Bruno)
  });

  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved_only' | 'pending'>('all');
  const [selectedRequest, setSelectedRequest] = useState<VacationRequest | null>(null);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      if (r.status === 'cancelled' || r.status === 'rejected') return false;
      if (selectedDepartment !== 'all' && r.department !== selectedDepartment) return false;
      if (statusFilter === 'approved_only' && (r.status !== 'approved' && r.status !== 'registered')) return false;
      if (statusFilter === 'pending' && r.status !== 'pending') return false;
      return true;
    });
  }, [requests, selectedDepartment, statusFilter]);

  // Days in month calculation
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Domingo

  // Gera dias do mês
  const calendarDays = useMemo(() => {
    const days: { dayNumber: number; dateStr: string; vacations: VacationRequest[] }[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayReqs = filteredRequests.filter(r => {
        return r.startDate <= dateStr && r.endDate >= dateStr;
      });
      days.push({ dayNumber: day, dateStr, vacations: dayReqs });
    }
    return days;
  }, [year, month, daysInMonth, filteredRequests]);

  // Departamentos disponíveis
  const departments = useMemo(() => {
    const set = new Set<string>();
    requests.forEach(r => {
      if (r.department) set.add(r.department);
    });
    return Array.from(set);
  }, [requests]);

  // Férias ocorrendo no mês selecionado
  const monthVacations = useMemo(() => {
    const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
    return filteredRequests.filter(r => {
      return r.startDate <= monthEnd && r.endDate >= monthStart;
    });
  }, [filteredRequests, year, month, daysInMonth]);

  // Paleta de cores para os colaboradores
  const getEmployeeColor = (name: string, status: string) => {
    if (status === 'pending') {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
    if (status === 'registered') {
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
            <Calendar className="w-4 h-4" />
            <span>Escala Operacional & Visão de Conflitos</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Calendário de Férias da Equipe
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Mapeamento visual de ausências para identificar sobreposições antes de aprovar novas solicitações.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-700">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Mês Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs sm:text-sm font-bold text-white px-3 min-w-[130px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Próximo Mês"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleToday}
            className="ml-1 px-2.5 py-1 text-xs font-semibold text-indigo-400 hover:bg-indigo-950/60 rounded-lg transition-colors"
          >
            Hoje
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Departamento:</span>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Todos os Departamentos</option>
              {departments.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Todas as Solicitações</option>
              <option value="approved_only">Apenas Aprovadas / Registradas</option>
              <option value="pending">Apenas Pendentes de Análise</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Aprovado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Registrado RH</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Pendente</span>
          </div>
        </div>
      </div>

      {/* Visual Month Grid */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-sm">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="text-rose-400">Dom</div>
          <div>Seg</div>
          <div>Ter</div>
          <div>Qua</div>
          <div>Qui</div>
          <div>Sex</div>
          <div className="text-rose-400">Sáb</div>
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-[70px] sm:min-h-[90px] rounded-2xl bg-slate-900/30 border border-slate-800/40 opacity-30"
            />
          ))}

          {/* Actual days */}
          {calendarDays.map(({ dayNumber, dateStr, vacations }) => {
            const hasMultiple = vacations.length > 1;
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            return (
              <div
                key={dateStr}
                className={`min-h-[70px] sm:min-h-[90px] p-1.5 sm:p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                  isToday
                    ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/50'
                    : vacations.length > 0
                    ? 'bg-slate-900/80 border-slate-700/80'
                    : 'bg-slate-900/40 border-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold ${
                      isToday ? 'text-indigo-400 font-extrabold' : 'text-slate-300'
                    }`}
                  >
                    {dayNumber}
                  </span>

                  {hasMultiple && (
                    <span
                      title="Alerta: Múltiplos colaboradores em férias nesta mesma data"
                      className="p-0.5 rounded bg-amber-500/20 text-amber-400"
                    >
                      <AlertTriangle className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Chips of vacations */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {vacations.slice(0, 2).map((vac) => (
                    <button
                      key={vac.id}
                      onClick={() => setSelectedRequest(vac)}
                      className={`w-full text-left truncate text-[10px] px-1.5 py-0.5 rounded-lg border font-medium transition-all ${getEmployeeColor(
                        vac.employeeName,
                        vac.status
                      )}`}
                    >
                      {vac.employeeName.split(' ')[0]}
                    </button>
                  ))}
                  {vacations.length > 2 && (
                    <span className="text-[9px] text-slate-400 font-medium block text-center">
                      +{vacations.length - 2} mais
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline List of Scheduled Vacations for Selected Month */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-3xl p-6 backdrop-blur-sm">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-indigo-400" />
          <span>Férias Programadas em {monthNames[month]} de {year}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-medium">
            {monthVacations.length} agendamento(s)
          </span>
        </h3>

        {monthVacations.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            Nenhuma ausência programada para este mês no filtro atual.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {monthVacations.map((vac) => (
              <div
                key={vac.id}
                onClick={() => setSelectedRequest(vac)}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-700/70 hover:border-indigo-500/50 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {vac.employeeName}
                    </span>
                    <span className="text-xs text-slate-400">• {vac.department}</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    <strong className="text-white">{vac.startDate}</strong> até <strong className="text-white">{vac.endDate}</strong> ({vac.durationDays} dias)
                  </p>
                </div>
                <StatusBadge status={vac.status} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Details Modal when clicking a vacation */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Detalhes do Agendamento</h3>
              <StatusBadge status={selectedRequest.status} size="sm" />
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p><strong className="text-white">Colaborador:</strong> {selectedRequest.employeeName}</p>
              <p><strong className="text-white">Departamento:</strong> {selectedRequest.department}</p>
              <p><strong className="text-white">Período:</strong> {selectedRequest.startDate} até {selectedRequest.endDate} ({selectedRequest.durationDays} dias)</p>
              <p><strong className="text-white">Venda de 1/3:</strong> {selectedRequest.sellDays ? 'Sim (10 dias)' : 'Não'}</p>
              {selectedRequest.protocolNumber && (
                <p><strong className="text-white">Protocolo RH:</strong> {selectedRequest.protocolNumber}</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
