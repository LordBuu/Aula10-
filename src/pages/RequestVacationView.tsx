import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { VacationRequest } from '../types/vacation';
import {
  calculateEndDate,
  validateVacationRequest,
} from '../services/vacationValidator';
import { createVacationRequest } from '../services/firebaseService';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Info,
  CalendarCheck,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface RequestVacationViewProps {
  existingRequests: VacationRequest[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const RequestVacationView: React.FC<RequestVacationViewProps> = ({
  existingRequests,
  onSuccess,
  onCancel,
}) => {
  const { currentUser } = useAuth();

  // Default start date to next Monday
  const defaultDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14); // 14 dias de antecedência padrão
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [startDate, setStartDate] = useState(defaultDate);
  const [durationDays, setDurationDays] = useState<number>(15);
  const [sellDays, setSellDays] = useState<boolean>(false);
  const [notes, setNotes] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!currentUser) return null;

  // Cálculo da data final calculada
  const endDate = useMemo(() => {
    return calculateEndDate(startDate, durationDays);
  }, [startDate, durationDays]);

  // Validação em tempo real das regras CLT / Disciplina
  const validation = useMemo(() => {
    return validateVacationRequest(
      currentUser,
      startDate,
      durationDays,
      sellDays,
      existingRequests
    );
  }, [currentUser, startDate, durationDays, sellDays, existingRequests]);

  const soldCount = sellDays ? 10 : 0;
  const totalDebit = durationDays + soldCount;
  const remainingAfter = Math.max(0, currentUser.remainingVacationDays - totalDebit);

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validation.isValid) return;
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      await createVacationRequest({
        employeeId: currentUser.uid,
        employeeName: currentUser.name,
        employeeEmail: currentUser.email,
        department: currentUser.department,
        managerId: currentUser.managerId || 'demo_mgr_carlos',
        startDate,
        endDate,
        durationDays,
        sellDays,
        soldDaysCount: soldCount,
        periodNumber: (currentUser.periodsUsed || 0) + 1,
        notes: notes.trim() || undefined,
      });

      setShowConfirmModal(false);
      onSuccess();
    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao submeter pedido de férias.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
          <CalendarCheck className="w-4 h-4" />
          <span>Solicitação Formal de Férias</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Formulário de Pedido de Férias
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Preencha o período desejado. O sistema validará automaticamente as regras CLT de fracionamento antes de enviar ao gestor.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleOpenConfirm} className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Identificação do Funcionário (Preenchido Automaticamente) */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            1. Dados do Colaborador (Preenchimento Automático)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60">
            <div>
              <span className="text-[11px] text-slate-400 block">Nome Completo</span>
              <span className="text-xs sm:text-sm font-semibold text-white">{currentUser.name}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Departamento</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-200">{currentUser.department}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Saldo Atual Disponível</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-400">
                {currentUser.remainingVacationDays} dias restantes
              </span>
            </div>
          </div>
        </div>

        {/* Parâmetros do Pedido */}
        <div className="space-y-4">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            2. Período Desejado e Duração
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Data de Início */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Data de Início das Férias <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Sugestão: selecione uma segunda-feira para evitar início próximo ao DSR.
              </span>
            </div>

            {/* Quantidade de Dias */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Quantidade de Dias de Descanso <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={5}
                  max={currentUser.remainingVacationDays || 30}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                {/* Botões rápidos de duração frequente */}
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setDurationDays(10)}
                    className="px-2 py-1 rounded-lg text-xs bg-slate-700 hover:bg-slate-600 text-slate-200"
                  >
                    10d
                  </button>
                  <button
                    type="button"
                    onClick={() => setDurationDays(14)}
                    className="px-2 py-1 rounded-lg text-xs bg-slate-700 hover:bg-slate-600 text-slate-200"
                  >
                    14d
                  </button>
                  <button
                    type="button"
                    onClick={() => setDurationDays(15)}
                    className="px-2 py-1 rounded-lg text-xs bg-slate-700 hover:bg-slate-600 text-slate-200"
                  >
                    15d
                  </button>
                  <button
                    type="button"
                    onClick={() => setDurationDays(currentUser.remainingVacationDays || 30)}
                    className="px-2 py-1 rounded-lg text-xs bg-indigo-900/50 text-indigo-300 hover:bg-indigo-800/60"
                  >
                    Tudo
                  </button>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Mínimo de 5 dias corridos por período (Regra CLT).
              </span>
            </div>
          </div>

          {/* Data Final Prevista */}
          {endDate && (
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 flex items-center justify-between text-xs text-indigo-200">
              <span className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-indigo-400" />
                Intervalo Calculado de Gozo:
              </span>
              <span className="font-bold text-white text-sm">
                {startDate} até {endDate} ({durationDays} dias corridos)
              </span>
            </div>
          )}

          {/* Opção de Vender 1/3 (Abono Pecuniário) */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 mt-0.5">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white">
                    Vender 1/3 das Férias (Abono Pecuniário)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Art. 143 da CLT: Converte 10 dias de férias em abono em dinheiro, permitindo usufruir até 20 dias de descanso.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={sellDays}
                  onChange={(e) => setSellDays(e.target.checked)}
                  disabled={currentUser.soldVacationDays > 0}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            {currentUser.soldVacationDays > 0 && (
              <p className="text-[11px] text-amber-400/90 font-medium">
                * O abono pecuniário já foi concedido para o seu período aquisitivo vigente.
              </p>
            )}

            {sellDays && (
              <div className="mt-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                ✓ Serão convertidos 10 dias em abono pecuniário. Débito total no saldo: {durationDays} dias de descanso + 10 dias de abono = {durationDays + 10} dias.
              </div>
            )}
          </div>

          {/* Observações opcionais */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Observações ou Justificativa ao Gestor (Opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex.: Alinhado previamente em reunião de alinhamento com a equipe..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
        </div>

        {/* Live CLT Compliance Checklist */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            Checklist de Conformidade CLT e Elicitação de Requisitos
          </h4>

          <div className="space-y-2 text-xs">
            {/* Check 1: Mínimo 5 dias */}
            <div className="flex items-center gap-2">
              {durationDays >= 5 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className={durationDays >= 5 ? 'text-slate-200' : 'text-rose-300 font-medium'}>
                Duração mínima de 5 dias corridos (Art. 134, § 1º CLT)
              </span>
            </div>

            {/* Check 2: Limite de períodos */}
            <div className="flex items-center gap-2">
              {(currentUser.periodsUsed || 0) < 3 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className={(currentUser.periodsUsed || 0) < 3 ? 'text-slate-200' : 'text-rose-300 font-medium'}>
                Fracionamento em até 3 períodos (Atual: {(currentUser.periodsUsed || 0) + 1}º período)
              </span>
            </div>

            {/* Check 3: Ao menos 1 período de 14 dias */}
            <div className="flex items-center gap-2">
              {currentUser.hasLongPeriodUsed || durationDays >= 14 || remainingAfter >= 14 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className={currentUser.hasLongPeriodUsed || durationDays >= 14 || remainingAfter >= 14 ? 'text-slate-200' : 'text-rose-300 font-medium'}>
                Pelo menos um período deve ter 14 ou mais dias corridos
              </span>
            </div>

            {/* Check 4: Saldo suficiente */}
            <div className="flex items-center gap-2">
              {totalDebit <= currentUser.remainingVacationDays ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className={totalDebit <= currentUser.remainingVacationDays ? 'text-slate-200' : 'text-rose-300 font-medium'}>
                Saldo disponível suficiente: {totalDebit} dias solicitados de {currentUser.remainingVacationDays} dias restantes
              </span>
            </div>
          </div>
        </div>

        {/* Validation Errors & Warnings */}
        {validation.errors.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-rose-300">
              <AlertCircle className="w-4 h-4" />
              <span>Impedimentos encontrados:</span>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {validation.errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {validation.warnings.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Avisos importantes:</span>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {validation.warnings.map((warn, idx) => (
                <li key={idx}>{warn}</li>
              ))}
            </ul>
          </div>
        )}

        {submitError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {submitError}
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/60">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            Voltar ao Painel
          </button>
          <button
            type="submit"
            disabled={!validation.isValid}
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Revisar Resumo e Confirmar</span>
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        employee={currentUser}
        startDate={startDate}
        endDate={endDate}
        durationDays={durationDays}
        sellDays={sellDays}
        soldDaysCount={soldCount}
        remainingDaysAfter={remainingAfter}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
