/**
 * Vacation Business Rules Validator (CLT & Elicitação de Requisitos)
 */
import { UserProfile, ValidationResult, VacationRequest } from '../types/vacation';

export function calculateEndDate(startDateStr: string, durationDays: number): string {
  if (!startDateStr || durationDays <= 0) return '';
  const date = new Date(startDateStr + 'T00:00:00');
  // Se inicia no dia 1 e dura 10 dias, termina no dia 10 (1 + 10 - 1)
  date.setDate(date.getDate() + (durationDays - 1));
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function validateVacationRequest(
  profile: UserProfile,
  startDateStr: string,
  durationDays: number,
  sellDays: boolean,
  existingRequests: VacationRequest[] = []
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Validação de data inicial
  if (!startDateStr) {
    errors.push('A data de início das férias é obrigatória.');
    return { isValid: false, errors, warnings };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(startDateStr + 'T00:00:00');

  if (isNaN(startDate.getTime())) {
    errors.push('Data de início inválida.');
  } else if (startDate <= today) {
    errors.push('A data de início das férias deve ser uma data futura.');
  }

  // 2. Validação da quantidade de dias
  if (!durationDays || durationDays <= 0) {
    errors.push('Informe uma quantidade válida de dias.');
    return { isValid: false, errors, warnings };
  }

  // Regra RN03: Nenhum período de férias pode ser menor que 5 dias corridos
  if (durationDays < 5) {
    errors.push('Regra CLT / RN03: Nenhum período de férias pode ser inferior a 5 dias corridos.');
  }

  // Regra RN01: As férias podem ser fracionadas em até 3 períodos
  const currentPeriodsUsed = profile.periodsUsed || 0;
  if (currentPeriodsUsed >= 3) {
    errors.push('Regra CLT / RN01: O limite de 3 períodos de fracionamento para o ciclo aquisitivo já foi atingido.');
  }

  // Abono pecuniário (venda de 1/3)
  let soldDays = 0;
  if (sellDays) {
    if (profile.soldVacationDays > 0) {
      errors.push('Regra CLT / RN04: O abono pecuniário (venda de 1/3) já foi concedido neste período aquisitivo.');
    } else {
      soldDays = 10; // 1/3 de 30 dias
    }
  }

  // Dias totais a deduzir do saldo
  const totalDeduct = durationDays + soldDays;

  // Verificação de saldo disponível
  if (totalDeduct > profile.remainingVacationDays) {
    errors.push(
      `Saldo insuficiente: Você solicitou ${durationDays} dias de descanso${
        soldDays > 0 ? ` + ${soldDays} dias de abono` : ''
      } (total ${totalDeduct} dias), mas possui apenas ${profile.remainingVacationDays} dias disponíveis.`
    );
  }

  // Regra RN02: Um dos períodos deve ter no mínimo 14 dias corridos
  const nextPeriodNumber = currentPeriodsUsed + 1;
  const alreadyHasLongPeriod = profile.hasLongPeriodUsed || false;
  const isRequestingLongPeriod = durationDays >= 14;

  if (nextPeriodNumber === 3 && !alreadyHasLongPeriod && !isRequestingLongPeriod) {
    errors.push(
      'Regra CLT / RN02: Este é o seu 3º e último período permitido. Como você ainda não usufruiu do período obrigatório de pelo menos 14 dias corridos, esta solicitação deve ter no mínimo 14 dias.'
    );
  } else if (!alreadyHasLongPeriod && !isRequestingLongPeriod) {
    const remainingDaysAfterThis = profile.remainingVacationDays - totalDeduct;
    if (remainingDaysAfterThis < 14 && nextPeriodNumber < 3) {
      errors.push(
        `Regra CLT / RN02: Ao solicitar ${durationDays} dias, restarão ${remainingDaysAfterThis} dias de saldo, o que impossibilitará o cumprimento da regra de usufruir de pelo menos um período de 14 dias corridos.`
      );
    } else {
      warnings.push(
        'Atenção: A legislação exige que ao menos um dos até 3 períodos de férias tenha 14 dias ou mais. Lembre-se de reservar saldo para isso.'
      );
    }
  }

  // 3. Verificação de conflito/sobreposição com pedidos existentes do próprio funcionário
  if (startDateStr && durationDays > 0) {
    const calculatedEnd = calculateEndDate(startDateStr, durationDays);
    const startReq = new Date(startDateStr + 'T00:00:00').getTime();
    const endReq = new Date(calculatedEnd + 'T00:00:00').getTime();

    const hasSelfConflict = existingRequests.some(r => {
      if (r.status === 'cancelled' || r.status === 'rejected') return false;
      const rStart = new Date(r.startDate + 'T00:00:00').getTime();
      const rEnd = new Date(r.endDate + 'T00:00:00').getTime();
      return (startReq <= rEnd && endReq >= rStart);
    });

    if (hasSelfConflict) {
      errors.push('Você já possui um pedido de férias aprovado ou em análise para o mesmo intervalo de datas.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      calculatedEndDate: calculatedEnd,
      daysToDeduct: totalDeduct,
    };
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Verifica sobreposição de férias entre membros da mesma equipe (para o gerente e RH)
 */
export function checkTeamConflicts(
  targetRequest: VacationRequest,
  allRequests: VacationRequest[]
): VacationRequest[] {
  const reqStart = new Date(targetRequest.startDate + 'T00:00:00').getTime();
  const reqEnd = new Date(targetRequest.endDate + 'T00:00:00').getTime();

  return allRequests.filter(r => {
    if (r.id === targetRequest.id) return false;
    if (r.employeeId === targetRequest.employeeId) return false;
    if (r.department !== targetRequest.department) return false;
    if (r.status !== 'approved' && r.status !== 'registered' && r.status !== 'pending') return false;

    const otherStart = new Date(r.startDate + 'T00:00:00').getTime();
    const otherEnd = new Date(r.endDate + 'T00:00:00').getTime();

    return reqStart <= otherEnd && reqEnd >= otherStart;
  });
}
