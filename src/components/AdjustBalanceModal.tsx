import React, { useState } from 'react';
import { Sliders, X, ShieldAlert, Check } from 'lucide-react';
import { UserProfile } from '../types/vacation';
import { updateEmployeeBalance } from '../services/firebaseService';

interface AdjustBalanceModalProps {
  isOpen: boolean;
  employee: UserProfile | null;
  hrUser: UserProfile;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdjustBalanceModal: React.FC<AdjustBalanceModalProps> = ({
  isOpen,
  employee,
  hrUser,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !employee) return null;

  const [totalVacationDays, setTotalVacationDays] = useState(employee.totalVacationDays || 30);
  const [usedVacationDays, setUsedVacationDays] = useState(employee.usedVacationDays || 0);
  const [soldVacationDays, setSoldVacationDays] = useState(employee.soldVacationDays || 0);
  const [periodsUsed, setPeriodsUsed] = useState(employee.periodsUsed || 0);
  const [hasLongPeriodUsed, setHasLongPeriodUsed] = useState(employee.hasLongPeriodUsed || false);
  const [periodStart, setPeriodStart] = useState(employee.acquisitionPeriodStart || '2025-01-01');
  const [periodEnd, setPeriodEnd] = useState(employee.acquisitionPeriodEnd || '2025-12-31');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculatedRemaining = Math.max(0, totalVacationDays - usedVacationDays - soldVacationDays);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalVacationDays < 0 || usedVacationDays < 0) {
      setError('Os valores de dias devem ser números positivos.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await updateEmployeeBalance(
        employee.uid,
        {
          totalVacationDays: Number(totalVacationDays),
          usedVacationDays: Number(usedVacationDays),
          soldVacationDays: Number(soldVacationDays),
          remainingVacationDays: calculatedRemaining,
          periodsUsed: Number(periodsUsed),
          hasLongPeriodUsed,
          acquisitionPeriodStart: periodStart,
          acquisitionPeriodEnd: periodEnd,
        },
        hrUser
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar saldo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Administrar Saldo de Férias (RH)</h3>
              <p className="text-xs text-purple-300">Gestão do período aquisitivo do colaborador</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
            <p className="font-semibold text-white">{employee.name}</p>
            <p className="text-slate-400">{employee.jobTitle} • {employee.department}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Início do Período Aquisitivo
              </label>
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Fim do Período Aquisitivo
              </label>
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Direito Total (Dias)
              </label>
              <input
                type="number"
                min={0}
                max={45}
                value={totalVacationDays}
                onChange={(e) => setTotalVacationDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Dias Usufruídos
              </label>
              <input
                type="number"
                min={0}
                max={totalVacationDays}
                value={usedVacationDays}
                onChange={(e) => setUsedVacationDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Dias Vendidos (1/3)
              </label>
              <input
                type="number"
                min={0}
                max={15}
                value={soldVacationDays}
                onChange={(e) => setSoldVacationDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Períodos já usufruídos (0 a 3)
              </label>
              <select
                value={periodsUsed}
                onChange={(e) => setPeriodsUsed(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              >
                <option value={0}>0 períodos</option>
                <option value={1}>1 período</option>
                <option value={2}>2 períodos</option>
                <option value={3}>3 períodos (limite atingido)</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={hasLongPeriodUsed}
                  onChange={(e) => setHasLongPeriodUsed(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-purple-500"
                />
                <span>Já usufruiu período &ge; 14 dias?</span>
              </label>
            </div>
          </div>

          {/* Result Calculation Preview */}
          <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/50 flex items-center justify-between text-xs">
            <span className="text-purple-300 font-medium">Saldo Restante Calculado:</span>
            <span className="text-base font-bold text-white">{calculatedRemaining} dias disponíveis</span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 border border-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/30 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {submitting ? 'Salvando...' : 'Salvar Saldo no Sistema'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
