export const ROLES = ['Recursos Humanos', 'Manager', 'Tecnología', 'Administrador'] as const;

export type Role = (typeof ROLES)[number];
export type RequestStatus = 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Completada';
export type AssetStatus = 'Disponible' | 'Asignado' | 'Mantenimiento';
export type EmployeeStatus = 'Activo' | 'Onboarding' | 'Inactivo';
export type RequestPriority = 'Baja' | 'Media' | 'Alta';

export interface SessionUser {
  name: string;
  email: string;
  initials: string;
  role: Role;
}

export interface Employee {
  id: string;
  initials: string;
  name: string;
  email: string;
  position: string;
  department: string;
  site: string;
  manager: string;
  status: EmployeeStatus;
  joinedAt: string;
}

export interface Asset {
  id: string;
  type: string;
  brand: string;
  model: string;
  serial: string;
  status: AssetStatus;
  site: string;
  assignedTo?: string;
}

export interface InternalRequest {
  id: string;
  title: string;
  employeeId: string;
  employeeName: string;
  category: string;
  priority: RequestPriority;
  status: RequestStatus;
  requestedAt: string;
  approver: string;
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  resource: string;
  detail: string;
  timestamp: string;
}

export interface OrbitState {
  session: SessionUser | null;
  employees: Employee[];
  assets: Asset[];
  requests: InternalRequest[];
  audit: AuditEntry[];
}

export type NewEmployee = Pick<
  Employee,
  'name' | 'email' | 'position' | 'department' | 'site' | 'manager'
>;

export interface NewRequest {
  employeeId: string;
  title: string;
  category: string;
  priority: RequestPriority;
}

export function isRole(value: string): value is Role {
  return ROLES.includes(value as Role);
}
