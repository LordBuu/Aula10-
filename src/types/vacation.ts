/**
 * Domain Models and Types for Vacation Management System
 */

export type UserRole = 'employee' | 'manager' | 'hr';

export type VacationStatus = 
  | 'pending'     // Aguardando análise do gerente
  | 'approved'    // Aprovado pelo gerente, aguardando registro pelo RH
  | 'rejected'    // Recusado pelo gerente com justificativa obrigatória
  | 'registered'  // Formalizado e registrado na folha/sistema pelo RH
  | 'cancelled';  // Cancelado pelo próprio funcionário antes da análise

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  jobTitle: string;
  managerId?: string;
  managerName?: string;
  hireDate: string;
  totalVacationDays: number;
  usedVacationDays: number;
  soldVacationDays: number;
  remainingVacationDays: number;
  periodsUsed: number; // 0, 1, 2 ou 3
  hasLongPeriodUsed: boolean; // se já gozou um período >= 14 dias
  acquisitionPeriodStart: string;
  acquisitionPeriodEnd: string;
  avatarUrl?: string;
  updatedAt?: string;
}

export interface VacationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  managerId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  durationDays: number;
  sellDays: boolean; // Abono pecuniário (venda de 1/3)
  soldDaysCount: number; // e.g., 10 dias
  periodNumber: number; // 1, 2 ou 3
  status: VacationStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  registeredBy?: string;
  registeredByName?: string;
  registeredAt?: string;
  protocolNumber?: string;
  createdAt: string;
  notes?: string;
}

export interface VacationLog {
  id: string;
  requestId: string;
  employeeId: string;
  employeeName: string;
  action: 'SOLICITADO' | 'APROVADO' | 'RECUSADO' | 'REGISTRADO' | 'CANCELADO' | 'SALDO_AJUSTADO';
  actorId: string;
  actorName: string;
  actorRole: UserRole | string;
  details: string;
  timestamp: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  calculatedEndDate?: string;
  daysToDeduct?: number;
}
