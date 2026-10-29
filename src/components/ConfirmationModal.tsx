import React from 'react';
import { CalendarCheck, DollarSign, Clock, ShieldCheck, X } from 'lucide-react';
import { UserProfile } from '../types/vacation';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  employee: UserProfile;
  startDate: string;
  endDate: string;
  durationDays: number;
  sellDays: boolean;
  soldDaysCount: number;
  remainingDaysAfter: number;
  isSubmitting: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  employee,
  startDate,
  endDate,
  durationDays,
  sellDays,
  soldDaysCount,
  remainingDaysAfter,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  const totalDeducted = durationDays + (sellDays ? soldDaysCount : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-indigo-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Resumo e Confirmação do Pedido</h3>
              <p className="text-xs text-indigo-300">Confira todos os dados antes de submeter ao gerente</p>
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
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <span className="text-[11px] text-slate-400 block font-medium">Colaborador</span>
              <span className="text-xs font-semibold text-white">{employee.name}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <span className="text-[11px] text-slate-400 block font-medium">Departamento</span>
              <span className="text-xs font-semibold text-white">{employee.department}</span>
            </div>
          </div>

          {/* Details Card */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                Data de Início:
              </span>
              <span className="font-semibold text-white">{startDate}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                Data de Término prevista:
              </span>
              <span className="font-semibold text-white">{endDate}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-emerald-400" />
                Dias de Descanso:
              </span>
              <span className="font-bold text-emerald-400">{durationDays} dias corridos</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-amber-400" />
                Venda de 1/3 (Abono Pecuniário):
              </span>
              <span className="font-semibold text-white">
                {sellDays ? `Sim (${soldDaysCount} dias convertidos em remuneração)` : 'Não solicitado'}
              </span>
            </div>

            <div className="border-t border-slate-700/60 pt-2 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Total de dias a debitar do saldo:</span>
              <span className="font-bold text-white text-sm">{totalDeducted} dias</span>
            </div>

            <div className="flex items-center justify-between text-xs text-indigo-300 bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-900/60">
              <span>Saldo restante após aprovação deste pedido:</span>
              <span className="font-bold text-sm text-indigo-200">{remainingDaysAfter} dias</span>
            </div>
          </div>

          {/* Compliance Badge */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-emerald-200">Em conformidade com as regras CLT (Art. 134)</p>
              <p className="text-[11px] text-emerald-400/90 mt-0.5">
                O gestor imediato ({employee.managerName || 'Gerente da área'}) receberá a solicitação para avaliação.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 border border-slate-700"
            >
              Revisar Dados
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Enviando Pedido...</span>
              ) : (
                <>
                  <CalendarCheck className="w-4 h-4" />
                  <span>Confirmar e Enviar Pedido</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
