import React from 'react';
import { XCircle, X, User, Calendar, MessageSquare } from 'lucide-react';
import { VacationRequest } from '../types/vacation';

interface ViewRejectionReasonModalProps {
  isOpen: boolean;
  request: VacationRequest | null;
  onClose: () => void;
}

export const ViewRejectionReasonModal: React.FC<ViewRejectionReasonModalProps> = ({
  isOpen,
  request,
  onClose,
}) => {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-rose-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Motivo da Recusa do Pedido</h3>
              <p className="text-xs text-rose-300">Parecer registrado pelo gestor</p>
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
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Período solicitado:
              </span>
              <span className="font-semibold text-white">
                {request.startDate} até {request.endDate} ({request.durationDays} dias)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Avaliador:
              </span>
              <span className="font-semibold text-slate-200">
                {request.reviewedByName || 'Gestor imediato'}
              </span>
            </div>
            {request.reviewedAt && (
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/50">
                <span>Avaliado em:</span>
                <span>{new Date(request.reviewedAt).toLocaleString('pt-BR')}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
              Justificativa por escrito do Gestor:
            </label>
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
              {request.rejectionReason || 'Nenhuma justificativa textual foi registrada.'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 text-[11px] text-slate-400">
            Você pode submeter uma nova solicitação com datas alternativas alinhadas previamente com seu gestor.
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
