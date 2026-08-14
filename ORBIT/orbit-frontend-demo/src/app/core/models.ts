export type RoleId = 'admin' | 'hr' | 'manager' | 'it';

export type EmployeeStatus = 'active' | 'onboarding' | 'inactive';
export type AssetStatus = 'available' | 'assigned' | 'maintenance';
export type RequestStatus =
  'pending_approval' | 'approved' | 'in_progress' | 'completed' | 'rejected';
export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: RoleId;
  initials: string;
  title: string;
  color: string;
}

export interface Site {
  id: string;
  name: string;
  city: string;
  address: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  manager: string;
  siteId: string;
  color: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  departmentId: string;
  siteId: string;
  managerId: string;
  status: EmployeeStatus;
  startDate: string;
  onboardingProgress: number;
  assetIds: string[];
  avatarColor: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  serial: string;
  status: AssetStatus;
  assignedTo: string | null;
  siteId: string;
  purchaseDate: string;
}

export interface InternalRequest {
  id: string;
  code: string;
  title: string;
  category: string;
  description: string;
  requesterId: string;
  employeeId: string;
  approverId: string;
  priority: RequestPriority;
  status: RequestStatus;
  assetId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  actor: string;
  actorRole: RoleId;
  details: string;
  timestamp: string;
}

export interface OrbitState {
  version: number;
  sessionUserId: string | null;
  users: DemoUser[];
  sites: Site[];
  departments: Department[];
  employees: Employee[];
  assets: Asset[];
  requests: InternalRequest[];
  audit: AuditEntry[];
}

export interface NewEmployeeInput {
  name: string;
  email: string;
  jobTitle: string;
  departmentId: string;
  siteId: string;
  managerId: string;
  startDate: string;
  createEquipmentRequest: boolean;
}

export interface NewAssetInput {
  name: string;
  type: string;
  brand: string;
  model: string;
  serial: string;
  siteId: string;
  purchaseDate: string;
}

export interface NewRequestInput {
  title: string;
  category: string;
  description: string;
  employeeId: string;
  approverId: string;
  priority: RequestPriority;
}

export const ROLE_LABELS: Record<RoleId, string> = {
  admin: 'Administración',
  hr: 'Recursos Humanos',
  manager: 'Manager',
  it: 'Tecnología',
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  pending_approval: 'Pendiente de aprobación',
  approved: 'Aprobada',
  in_progress: 'En proceso',
  completed: 'Completada',
  rejected: 'Rechazada',
};

export const PRIORITY_LABELS: Record<RequestPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
};
