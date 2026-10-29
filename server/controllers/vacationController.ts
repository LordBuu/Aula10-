/**
 * Controller for Vacation API endpoints
 */
import { Request, Response } from 'express';
import { VacationCalculationService, ValidationInput } from '../services/vacationCalculationService';

export class VacationController {
  /**
   * POST /api/vacations/validate
   * Endpoint para validação de regras de negócio em tempo real
   */
  static validateRequest(req: Request, res: Response) {
    try {
      const input: ValidationInput = req.body;
      const result = VacationCalculationService.validate(input);
      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao validar regras de férias',
      });
    }
  }

  /**
   * GET /api/vacations/rules
   * Retorna matriz de requisitos e regras de negócio para documentação acadêmica
   */
  static getRules(req: Request, res: Response) {
    const rules = VacationCalculationService.getBusinessRulesMetadata();
    return res.json({
      success: true,
      data: rules,
    });
  }

  /**
   * GET /api/system/health
   */
  static healthCheck(req: Request, res: Response) {
    return res.json({
      status: 'online',
      service: 'Sistema de Pedido e Gerenciamento de Férias',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  }
}
