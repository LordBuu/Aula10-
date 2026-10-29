/**
 * Firebase Firestore Service Layer for Vacation System
 */
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../config/firebase';
import { UserProfile, VacationRequest, VacationLog, UserRole } from '../types/vacation';

// Seed demo users so evaluator/professor can test immediately with real personas
export const DEMO_USERS: UserProfile[] = [
  {
    uid: 'demo_emp_ana',
    name: 'Ana Silva',
    email: 'ana.silva@empresa.com.br',
    role: 'employee',
    department: 'Engenharia de Software',
    jobTitle: 'Desenvolvedora Full Stack',
    managerId: 'demo_mgr_carlos',
    managerName: 'Carlos Mendes',
    hireDate: '2023-03-15',
    totalVacationDays: 30,
    usedVacationDays: 0,
    soldVacationDays: 0,
    remainingVacationDays: 30,
    periodsUsed: 0,
    hasLongPeriodUsed: false,
    acquisitionPeriodStart: '2025-03-15',
    acquisitionPeriodEnd: '2026-03-14',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    updatedAt: new Date().toISOString(),
  },
  {
    uid: 'demo_emp_bruno',
    name: 'Bruno Oliveira',
    email: 'bruno.oliveira@empresa.com.br',
    role: 'employee',
    department: 'Engenharia de Software',
    jobTitle: 'Engenheiro de DevOps',
    managerId: 'demo_mgr_carlos',
    managerName: 'Carlos Mendes',
    hireDate: '2022-08-10',
    totalVacationDays: 30,
    usedVacationDays: 15,
    soldVacationDays: 0,
    remainingVacationDays: 15,
    periodsUsed: 1,
    hasLongPeriodUsed: true,
    acquisitionPeriodStart: '2025-08-10',
    acquisitionPeriodEnd: '2026-08-09',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    updatedAt: new Date().toISOString(),
  },
  {
    uid: 'demo_mgr_carlos',
    name: 'Carlos Mendes',
    email: 'carlos.mendes@empresa.com.br',
    role: 'manager',
    department: 'Engenharia de Software',
    jobTitle: 'Gerente de Engenharia',
    hireDate: '2020-01-10',
    totalVacationDays: 30,
    usedVacationDays: 10,
    soldVacationDays: 0,
    remainingVacationDays: 20,
    periodsUsed: 1,
    hasLongPeriodUsed: false,
    acquisitionPeriodStart: '2025-01-10',
    acquisitionPeriodEnd: '2026-01-09',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    updatedAt: new Date().toISOString(),
  },
  {
    uid: 'demo_hr_mariana',
    name: 'Mariana Costa',
    email: 'mariana.costa@empresa.com.br',
    role: 'hr',
    department: 'Recursos Humanos',
    jobTitle: 'Analista Sênior de Departamento Pessoal',
    hireDate: '2021-05-01',
    totalVacationDays: 30,
    usedVacationDays: 0,
    soldVacationDays: 0,
    remainingVacationDays: 30,
    periodsUsed: 0,
    hasLongPeriodUsed: false,
    acquisitionPeriodStart: '2025-05-01',
    acquisitionPeriodEnd: '2026-04-30',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    updatedAt: new Date().toISOString(),
  },
];

// Helper to seed initial data in Firestore if empty
export async function seedInitialDataIfEmpty() {
  const usersPath = 'users';
  try {
    const snap = await getDocs(collection(db, usersPath));
    if (snap.empty) {
      console.log('Populando banco inicial com funcionários, gerente e RH...');
      for (const u of DEMO_USERS) {
        await setDoc(doc(db, 'users', u.uid), u);
      }

      // Adicionar um pedido inicial do Bruno aprovado pelo gerente para testar conflitos e registro do RH
      const demoReqBruno: VacationRequest = {
        id: 'req_demo_bruno_01',
        employeeId: 'demo_emp_bruno',
        employeeName: 'Bruno Oliveira',
        employeeEmail: 'bruno.oliveira@empresa.com.br',
        department: 'Engenharia de Software',
        managerId: 'demo_mgr_carlos',
        startDate: '2026-11-10',
        endDate: '2026-11-24',
        durationDays: 15,
        sellDays: false,
        soldDaysCount: 0,
        periodNumber: 1,
        status: 'approved',
        reviewedBy: 'demo_mgr_carlos',
        reviewedByName: 'Carlos Mendes',
        reviewedAt: '2026-10-25T14:30:00.000Z',
        createdAt: '2026-10-24T10:00:00.000Z',
        notes: 'Férias de final de ano planejadas.',
      };
      await setDoc(doc(db, 'vacation_requests', demoReqBruno.id), demoReqBruno);

      // Log inicial
      const demoLog: VacationLog = {
        id: 'log_seed_01',
        requestId: demoReqBruno.id,
        employeeId: demoReqBruno.employeeId,
        employeeName: demoReqBruno.employeeName,
        action: 'APROVADO',
        actorId: 'demo_mgr_carlos',
        actorName: 'Carlos Mendes',
        actorRole: 'manager',
        details: 'Aprovado pelo gestor. Aguardando processamento formal pelo RH.',
        timestamp: '2026-10-25T14:30:00.000Z',
      };
      await setDoc(doc(db, 'vacation_logs', demoLog.id), demoLog);
    }
  } catch (error) {
    console.warn('Erro ao inicializar dados padrão:', error);
  }
}

// Subscribe to a single user profile
export function subscribeToUserProfile(userId: string, callback: (profile: UserProfile | null) => void) {
  const path = `users/${userId}`;
  return onSnapshot(
    doc(db, 'users', userId),
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as UserProfile);
      } else {
        callback(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Subscribe to all users (for Manager / RH)
export function subscribeToAllUsers(callback: (users: UserProfile[]) => void) {
  const path = 'users';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const users: UserProfile[] = [];
      snapshot.forEach(docSnap => users.push(docSnap.data() as UserProfile));
      callback(users);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Subscribe to vacation requests
export function subscribeToVacationRequests(
  role: UserRole,
  userId: string,
  department: string,
  callback: (requests: VacationRequest[]) => void
) {
  const path = 'vacation_requests';
  // Let's listen to all requests or query based on role
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: VacationRequest[] = [];
      snapshot.forEach(docSnap => {
        const item = docSnap.data() as VacationRequest;
        // Role based filtering in client sync
        if (role === 'hr') {
          list.push(item);
        } else if (role === 'manager') {
          if (item.managerId === userId || item.department === department) {
            list.push(item);
          }
        } else {
          // employee
          if (item.employeeId === userId) {
            list.push(item);
          }
        }
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Subscribe to all requests (for calendar view to check team overlaps)
export function subscribeToAllVacationRequests(callback: (requests: VacationRequest[]) => void) {
  const path = 'vacation_requests';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: VacationRequest[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as VacationRequest);
      });
      list.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Subscribe to vacation audit logs
export function subscribeToLogs(callback: (logs: VacationLog[]) => void) {
  const path = 'vacation_logs';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const logs: VacationLog[] = [];
      snapshot.forEach(docSnap => logs.push(docSnap.data() as VacationLog));
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(logs);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Create new vacation request (Employee)
export async function createVacationRequest(
  request: Omit<VacationRequest, 'id' | 'createdAt' | 'status'>
): Promise<string> {
  const path = 'vacation_requests';
  const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const fullRequest: VacationRequest = {
    ...request,
    id,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, path, id), fullRequest);

    // Record audit log
    const logId = `log_${Date.now()}`;
    const log: VacationLog = {
      id: logId,
      requestId: id,
      employeeId: request.employeeId,
      employeeName: request.employeeName,
      action: 'SOLICITADO',
      actorId: request.employeeId,
      actorName: request.employeeName,
      actorRole: 'employee',
      details: `Solicitação criada: ${request.durationDays} dias a partir de ${request.startDate}${
        request.sellDays ? ' (com venda de 1/3)' : ''
      }. Notificado gerente responsável.`,
      timestamp: new Date().toISOString(),
    };
    await setDoc(doc(db, 'vacation_logs', logId), log);

    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Cancel vacation request (Employee, only if pending)
export async function cancelVacationRequest(
  requestId: string,
  employee: UserProfile
): Promise<void> {
  const path = `vacation_requests/${requestId}`;
  try {
    await updateDoc(doc(db, 'vacation_requests', requestId), {
      status: 'cancelled',
      notes: 'Cancelado pelo colaborador antes da avaliação.',
    });

    const logId = `log_${Date.now()}`;
    const log: VacationLog = {
      id: logId,
      requestId,
      employeeId: employee.uid,
      employeeName: employee.name,
      action: 'CANCELADO',
      actorId: employee.uid,
      actorName: employee.name,
      actorRole: 'employee',
      details: 'Pedido cancelado pelo próprio funcionário.',
      timestamp: new Date().toISOString(),
    };
    await setDoc(doc(db, 'vacation_logs', logId), log);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Manager Review: Approve
export async function approveVacationRequest(
  requestId: string,
  manager: UserProfile,
  notes?: string
): Promise<void> {
  const path = `vacation_requests/${requestId}`;
  try {
    await updateDoc(doc(db, 'vacation_requests', requestId), {
      status: 'approved',
      reviewedBy: manager.uid,
      reviewedByName: manager.name,
      reviewedAt: new Date().toISOString(),
      notes: notes || 'Aprovado pelo gestor imediato.',
    });

    const logId = `log_${Date.now()}`;
    const log: VacationLog = {
      id: logId,
      requestId,
      employeeId: '',
      employeeName: '',
      action: 'APROVADO',
      actorId: manager.uid,
      actorName: manager.name,
      actorRole: 'manager',
      details: `Aprovado pelo gerente ${manager.name}. Encaminhado ao RH para efetivação em folha.`,
      timestamp: new Date().toISOString(),
    };
    await setDoc(doc(db, 'vacation_logs', logId), log);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Manager Review: Reject with mandatory written reason
export async function rejectVacationRequest(
  requestId: string,
  manager: UserProfile,
  reason: string
): Promise<void> {
  if (!reason || reason.trim().length === 0) {
    throw new Error('A justificativa da recusa é estritamente obrigatória.');
  }

  const path = `vacation_requests/${requestId}`;
  try {
    await updateDoc(doc(db, 'vacation_requests', requestId), {
      status: 'rejected',
      rejectionReason: reason.trim(),
      reviewedBy: manager.uid,
      reviewedByName: manager.name,
      reviewedAt: new Date().toISOString(),
    });

    const logId = `log_${Date.now()}`;
    const log: VacationLog = {
      id: logId,
      requestId,
      employeeId: '',
      employeeName: '',
      action: 'RECUSADO',
      actorId: manager.uid,
      actorName: manager.name,
      actorRole: 'manager',
      details: `Recusado pelo gestor ${manager.name}. Motivo: "${reason.trim()}"`,
      timestamp: new Date().toISOString(),
    };
    await setDoc(doc(db, 'vacation_logs', logId), log);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// HR Formal Registration in Corporate System / Payroll
export async function registerVacationRequest(
  request: VacationRequest,
  employeeProfile: UserProfile,
  hrUser: UserProfile
): Promise<string> {
  if (request.status !== 'approved') {
    throw new Error('Somente pedidos previamente aprovados pelo gestor podem ser registrados pelo RH.');
  }

  const path = `vacation_requests/${request.id}`;
  const protocol = `FER-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  try {
    // 1. Atualizar status do pedido para 'registered'
    await updateDoc(doc(db, 'vacation_requests', request.id), {
      status: 'registered',
      registeredBy: hrUser.uid,
      registeredByName: hrUser.name,
      registeredAt: new Date().toISOString(),
      protocolNumber: protocol,
    });

    // 2. Atualizar saldo do funcionário
    const duration = request.durationDays;
    const sold = request.sellDays ? (request.soldDaysCount || 10) : 0;
    const totalDeducted = duration + sold;

    const newUsedDays = (employeeProfile.usedVacationDays || 0) + duration;
    const newSoldDays = (employeeProfile.soldVacationDays || 0) + sold;
    const newRemainingDays = Math.max(0, (employeeProfile.remainingVacationDays || 30) - totalDeducted);
    const newPeriodsUsed = (employeeProfile.periodsUsed || 0) + 1;
    const hasLong = employeeProfile.hasLongPeriodUsed || duration >= 14;

    await updateDoc(doc(db, 'users', employeeProfile.uid), {
      usedVacationDays: newUsedDays,
      soldVacationDays: newSoldDays,
      remainingVacationDays: newRemainingDays,
      periodsUsed: newPeriodsUsed,
      hasLongPeriodUsed: hasLong,
      updatedAt: new Date().toISOString(),
    });

    // 3. Registrar Log de Auditoria do RH
    const logId = `log_${Date.now()}`;
    const log: VacationLog = {
      id: logId,
      requestId: request.id,
      employeeId: employeeProfile.uid,
      employeeName: employeeProfile.name,
      action: 'REGISTRADO',
      actorId: hrUser.uid,
      actorName: hrUser.name,
      actorRole: 'hr',
      details: `Férias registradas e formalizadas pelo RH (${hrUser.name}) sob o protocolo ${protocol}. Saldo restante: ${newRemainingDays} dias.`,
      timestamp: new Date().toISOString(),
    };
    await setDoc(doc(db, 'vacation_logs', logId), log);

    return protocol;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// HR Adjust or Grant Employee Vacation Balance
export async function updateEmployeeBalance(
  targetEmployeeId: string,
  newBalance: {
    totalVacationDays: number;
    remainingVacationDays: number;
    usedVacationDays: number;
    soldVacationDays: number;
    periodsUsed: number;
    hasLongPeriodUsed: boolean;
    acquisitionPeriodStart: string;
    acquisitionPeriodEnd: string;
  },
  hrUser: UserProfile
): Promise<void> {
  const path = `users/${targetEmployeeId}`;
  try {
    await updateDoc(doc(db, 'users', targetEmployeeId), {
      ...newBalance,
      updatedAt: new Date().toISOString(),
    });

    const logId = `log_${Date.now()}`;
    const log: VacationLog = {
      id: logId,
      requestId: 'ADMIN_BALANCE_ADJUST',
      employeeId: targetEmployeeId,
      employeeName: 'Funcionário',
      action: 'SALDO_AJUSTADO',
      actorId: hrUser.uid,
      actorName: hrUser.name,
      actorRole: 'hr',
      details: `Ajuste administrativo de saldo pelo RH. Saldo restante atualizado para ${newBalance.remainingVacationDays} dias. Períodos: ${newBalance.periodsUsed}/3.`,
      timestamp: new Date().toISOString(),
    };
    await setDoc(doc(db, 'vacation_logs', logId), log);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Save or update custom UserProfile
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
