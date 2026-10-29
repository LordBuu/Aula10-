/**
 * Server-Side Vacation Calculation & CLT Compliance Engine
 */

export interface ValidationInput {
  remainingDays: number;
  periodsUsed: number;
  hasLongPeriodUsed: boolean;
  soldVacationDays: number;
  durationDays: number;
  sellDays: boolean;
  startDate: string;
}

export class VacationCalculationService {
  /**
   * Valida regras CLT de fracionamento e prazos
   */
  static validate(input: ValidationInput) {
    const errors: string[] = [];
    const warnings: string[] = [];

    const {
      remainingDays,
      periodsUsed,
      hasLongPeriodUsed,
      soldVacationDays,
      durationDays,
      sellDays,
      startDate,
    } = input;

    // Regra RN01: Limite de 3 períodos
    if (periodsUsed >= 3) {
      errors.push('Limite de 3 períodos fracionados por ciclo aquisitivo já atingido (Art. 134, § 1º CLT).');
    }

    // Regra RN03: Mínimo 5 dias corridos
    if (durationDays < 5) {
      errors.push('Nenhum período de férias pode ser menor que 5 dias corridos (Art. 134, § 1º CLT).');
    }

    // Abono pecuniário (venda de 1/3)
    let soldDays = 0;
    if (sellDays) {
      if (soldVacationDays > 0) {
        errors.push('Abono pecuniário (1/3) já foi concedido neste período aquisitivo (Art. 143 CLT).');
      } else {
        soldDays = 10;
      }
    }

    const totalDaysToDeduct = durationDays + soldDays;

    // Saldo suficiente
    if (totalDaysToDeduct > remainingDays) {
      errors.push(
        `Saldo insuficiente: Solicitação total de ${totalDaysToDeduct} dias (${durationDays} descanso + ${soldDays} abono) excede o saldo restante de ${remainingDays} dias.`
      );
    }

    // Regra RN02: Período obrigatório de pelo menos 14 dias
    const nextPeriod = periodsUsed + 1;
    const isLongPeriod = durationDays >= 14;

    if (nextPeriod === 3 && !hasLongPeriodUsed && !isLongPeriod) {
      errors.push(
        'Este é o terceiro período. É obrigatório que tenha no mínimo 14 dias corridos, pois nenhum período anterior cumpriu o requisito legal.'
      );
    } else if (!hasLongPeriodUsed && !isLongPeriod) {
      const remainingAfter = remainingDays - totalDaysToDeduct;
      if (remainingAfter < 14 && nextPeriod < 3) {
        errors.push(
          `Com este pedido de ${durationDays} dias, o saldo restante será de ${remainingAfter} dias, inviabilizando o cumprimento obrigatório de um período de pelo menos 14 dias.`
        );
      } else {
        warnings.push('Lembre-se: pelo menos um dos 3 períodos deve ter 14 dias corridos ou mais.');
      }
    }

    // Data de início
    if (startDate) {
      const start = new Date(startDate + 'T00:00:00');
      const dayOfWeek = start.getDay(); // 0 = Domingo, 5 = Sexta, 6 = Sábado
      // CLT Art. 134, § 3º: É vedado o início das férias nos dois dias que antecedem feriado ou dia de repouso semanal remunerado
      if (dayOfWeek === 4 || dayOfWeek === 5) {
        warnings.push('Aviso CLT (Art. 134, § 3º): É desaconselhado iniciar férias na quinta ou sexta-feira para evitar antecedência imediata ao repouso semanal (DSR).');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      totalDaysToDeduct,
      soldDays,
    };
  }

  /**
   * Retorna metadados das regras de negócio do sistema para transparência e documentação
   */
  static getBusinessRulesMetadata() {
    return [
      {
        id: 'RN01',
        title: 'Fracionamento em até 3 períodos',
        cltArticle: 'Art. 134, § 1º CLT',
        description: 'Desde que haja concordância do empregado, as férias podem ser usufruídas em até três períodos.',
        impact: 'Impede novas solicitações após o 3º período ser concluído.',
      },
      {
        id: 'RN02',
        title: 'Período principal de no mínimo 14 dias',
        cltArticle: 'Art. 134, § 1º CLT',
        description: 'Um dos períodos de férias não poderá ser inferior a 14 (quatorze) dias corridos.',
        impact: 'Exige que ao menos uma solicitação cumpra o piso de 14 dias.',
      },
      {
        id: 'RN03',
        title: 'Piso mínimo de 5 dias por período',
        cltArticle: 'Art. 134, § 1º CLT',
        description: 'Os demais períodos não poderão ser inferiores a 5 (cinco) dias corridos cada um.',
        impact: 'Bloqueia pedidos com duração de 1 a 4 dias.',
      },
      {
        id: 'RN04',
        title: 'Abono Pecuniário (Venda de 1/3)',
        cltArticle: 'Art. 143 CLT',
        description: 'É facultado ao empregado converter 1/3 do período de férias a que tiver direito em abono pecuniário.',
        impact: 'Converte 10 dias de férias em remuneração financeira.',
      },
      {
        id: 'RN05',
        title: 'Justificativa Obrigatória em Recusas',
        cltArticle: 'Regra de Transparência e Elicitação de Requisitos',
        description: 'O gerente não pode recusar sem registrar fundamentação detalhada visível ao colaborador.',
        impact: 'Garante rastreabilidade e feedback ao empregado.',
      },
      {
        id: 'RN06',
        title: 'Formalização e Registro Exclusivo pelo RH',
        cltArticle: 'Governança Corporativa e Departamento Pessoal',
        description: 'O RH só pode efetivar pedidos previamente chancelados pelo gestor direto da equipe.',
        impact: 'Segrega aprovação operacional da homologação trabalhista.',
      },
    ];
  }
}
