import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { VacationRequest } from '../types/vacation';

interface RejectionModalProps {
  isOpen: boolean;
  request: VacationRequest | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export const RejectionModal: React.FC<RejectionModalProps> = ({
  isOpen,
  request,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Por favor, informe a justificativa obrigatória da recusa.');
      return;
    }
    if (reason.trim().length < 5) {
      setError('A justificativa deve conter pelo menos 5 caracteres.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onConfirm(reason.trim());
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao recusar pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-rose-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Recusar Solicitação de Férias</h3>
              <p className="text-xs text-rose-300">Justificativa obrigatória (Regra RN05)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-1">
            <p>
              <strong className="text-white">Colaborador:</strong> {request.employeeName}
            </p>
            <p>
              <strong className="text-white">Período Solicitado:</strong> {request.startDate} até {request.endDate} ({request.durationDays} dias)
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Motivo da Recusa <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Ex.: Período coincidente com entrega de sprint crítico e férias simultâneas de outro membro do time. Sugiro adiar para a segunda quinzena."
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 resize-none"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Este motivo será registrado no histórico e exibido com transparência ao colaborador.
            </p>
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
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/20 disabled:opacity-50"
            >
              {submitting ? 'Gravando Recusa...' : 'Confirmar Recusa com Justificativa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
