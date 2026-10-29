import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Users,
  Calendar,
  FileCheck2,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface AcademicRequirementsViewProps {
  onNavigateToTab: (tab: string) => void;
}

export const AcademicRequirementsView: React.FC<AcademicRequirementsViewProps> = ({
  onNavigateToTab,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'rf' | 'rn'>('all');

  const functionalRequirements = [
    {
      id: 'RF01',
      title: 'Autenticação e Perfis de Acesso',
      actor: 'Funcionário, Gerente, RH',
      description: 'O sistema deve autenticar usuários e restringir acessos de acordo com os papéis de Funcionário, Gerente e Recursos Humanos.',
      status: 'Implementado',
      targetTab: 'login',
    },
    {
      id: 'RF02',
      title: 'Consulta de Saldo de Férias',
      actor: 'Funcionário, RH',
      description: 'O colaborador deve visualizar seu saldo atual, dias usufruídos, dias vendidos e períodos já consumidos no ciclo aquisitivo.',
      status: 'Implementado',
      targetTab: 'dashboard',
    },
    {
      id: 'RF03',
      title: 'Solicitação de Férias com Preenchimento Automático',
      actor: 'Funcionário',
      description: 'Formulário que preenche automaticamente nome e departamento do colaborador, permitindo escolher data de início e quantidade de dias.',
      status: 'Implementado',
      targetTab: 'request_vacation',
    },
    {
      id: 'RF04',
      title: 'Opção de Conversão de 1/3 em Abono Pecuniário',
      actor: 'Funcionário',
      description: 'Permitir a venda de 10 dias de férias (1/3 legal) com cálculo automático do débito total de dias no saldo.',
      status: 'Implementado',
      targetTab: 'request_vacation',
    },
    {
      id: 'RF05',
      title: 'Resumo e Confirmação Prévia do Pedido',
      actor: 'Funcionário',
      description: 'Exibir modal com resumo detalhado de datas, dias de descanso, abono e saldo projetado antes da confirmação final.',
      status: 'Implementado',
      targetTab: 'request_vacation',
    },
    {
      id: 'RF06',
      title: 'Acompanhamento de Status e Histórico',
      actor: 'Funcionário',
      description: 'Lista em tempo real dos pedidos com status: Pendente, Aprovado pelo Gerente, Registrado pelo RH, Recusado ou Cancelado.',
      status: 'Implementado',
      targetTab: 'employee_history',
    },
    {
      id: 'RF07',
      title: 'Cancelamento de Pedido Pendente',
      actor: 'Funcionário',
      description: 'O colaborador pode cancelar uma solicitação enquanto ela ainda estiver pendente de avaliação pelo gerente.',
      status: 'Implementado',
      targetTab: 'employee_history',
    },
    {
      id: 'RF08',
      title: 'Visualização da Justificativa da Recusa',
      actor: 'Funcionário',
      description: 'Em caso de recusa pelo gestor, o colaborador deve conseguir abrir e ler o motivo detalhado por escrito.',
      status: 'Implementado',
      targetTab: 'employee_history',
    },
    {
      id: 'RF09',
      title: 'Análise e Decisão de Pedidos pelo Gerente',
      actor: 'Gerente',
      description: 'O gerente visualiza pedidos da sua equipe e pode aprovar ou recusar cada solicitação.',
      status: 'Implementado',
      targetTab: 'manager_review',
    },
    {
      id: 'RF10',
      title: 'Detecção de Conflitos e Sobreposições de Equipe',
      actor: 'Gerente, RH',
      description: 'O sistema deve apontar automaticamente se outro colaborador do mesmo setor já possui férias aprovadas ou pendentes no mesmo período.',
      status: 'Implementado',
      targetTab: 'calendar',
    },
    {
      id: 'RF11',
      title: 'Registro e Homologação das Férias pelo RH',
      actor: 'RH',
      description: 'O RH consulta férias aprovadas pelos gestores e formaliza o registro no sistema, gerando protocolo oficial (FER-2026-XXXX).',
      status: 'Implementado',
      targetTab: 'hr_registration',
    },
    {
      id: 'RF12',
      title: 'Administração e Ajuste de Saldos pelo RH',
      actor: 'RH',
      description: 'Permitir que o RH gerencie os períodos aquisitivos dos colaboradores e ajuste os saldos de férias no banco de dados.',
      status: 'Implementado',
      targetTab: 'hr_dashboard',
    },
  ];

  const businessRules = [
    {
      id: 'RN01',
      title: 'Fracionamento em até 3 Períodos',
      fundamentation: 'Art. 134, § 1º da CLT',
      description: 'As férias podem ser divididas em até três períodos ao longo do período aquisitivo. O sistema bloqueia a 4ª solicitação.',
      validationLayer: 'Frontend + Backend Express + Firestore Rules',
    },
    {
      id: 'RN02',
      title: 'Período Obrigatório de Mínimo 14 Dias',
      fundamentation: 'Art. 134, § 1º da CLT',
      description: 'Pelo menos um dos períodos de férias não pode ser inferior a 14 (quatorze) dias corridos.',
      validationLayer: 'VacationValidator Engine (impede esgotar saldo sem cumprir os 14 dias)',
    },
    {
      id: 'RN03',
      title: 'Piso Mínimo de 5 Dias por Período',
      fundamentation: 'Art. 134, § 1º da CLT',
      description: 'Nenhum dos períodos fracionados pode ser menor do que 5 (cinco) dias corridos.',
      validationLayer: 'Validação síncrona no formulário e no backend',
    },
    {
      id: 'RN04',
      title: 'Abono Pecuniário (Venda de 1/3)',
      fundamentation: 'Art. 143 da CLT',
      description: 'Facultado ao empregado converter 1/3 (10 dias de 30) em abono financeiro. O sistema debita 10 dias adicionais do saldo.',
      validationLayer: 'Cálculo de débito de saldo e trava de 1 abono por ciclo',
    },
    {
      id: 'RN05',
      title: 'Justificativa Obrigatória em Recusa',
      fundamentation: 'Regra de Transparência e Feedback',
      description: 'Toda recusa por parte do gestor deve conter obrigatoriamente um texto fundamentado explicando o motivo ao colaborador.',
      validationLayer: 'Bloqueio no modal de recusa e gravação no Firestore',
    },
    {
      id: 'RN06',
      title: 'Segregação de Funções: Registro Após Aprovação',
      fundamentation: 'Governança Corporativa e Departamento Pessoal',
      description: 'Um pedido só pode ser homologado e registrado pelo RH após ter sido aprovado pelo gerente imediato da equipe.',
      validationLayer: 'Verificação de status (status === "approved" antes de "registered")',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-900/40 shadow-xl">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Disciplina de Elicitação de Requisitos • Documento de Engenharia de Software</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Matriz de Requisitos & Regras de Negócio
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
          Mapeamento completo dos Requisitos Funcionais (RF) e Regras de Negócio (RN) implementados e verificáveis no sistema web.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-700/60 pb-3">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          Visão Completa ({functionalRequirements.length + businessRules.length})
        </button>
        <button
          onClick={() => setActiveFilter('rf')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === 'rf'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          Requisitos Funcionais ({functionalRequirements.length})
        </button>
        <button
          onClick={() => setActiveFilter('rn')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === 'rn'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          Regras de Negócio ({businessRules.length})
        </button>
      </div>

      {/* Requisitos Funcionais */}
      {(activeFilter === 'all' || activeFilter === 'rf') && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-400" />
            <span>Requisitos Funcionais (RF)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {functionalRequirements.map((rf) => (
              <div
                key={rf.id}
                className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700/70 space-y-2.5 shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                      {rf.id}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {rf.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-1.5">{rf.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{rf.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    Atores: <strong className="text-slate-200">{rf.actor}</strong>
                  </span>
                  <button
                    onClick={() => onNavigateToTab(rf.targetTab)}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Testar no Sistema</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regras de Negócio */}
      {(activeFilter === 'all' || activeFilter === 'rn') && (
        <div className="space-y-4 pt-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Regras de Negócio (RN)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {businessRules.map((rn) => (
              <div
                key={rn.id}
                className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700/70 space-y-2.5 shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                    {rn.id}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {rn.fundamentation}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">{rn.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{rn.description}</p>

                <div className="pt-2 border-t border-slate-700/60 text-[11px] text-slate-400">
                  <span className="text-slate-500">Mecanismo de Aplicação:</span>{' '}
                  <span className="text-emerald-400/90 font-medium">{rn.validationLayer}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
