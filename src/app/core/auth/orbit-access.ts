import { Role, SessionUser } from '../models/orbit.models';

export type Permission =
  | '*'
  | 'dashboard.read'
  | 'employee.read'
  | 'employee.write'
  | 'request.create'
  | 'request.read'
  | 'request.approve'
  | 'asset.read'
  | 'asset.assign'
  | 'audit.read';

export const DEMO_USERS: Readonly<Record<Role, SessionUser>> = {
  'Recursos Humanos': {
    name: 'Ana Martínez',
    email: 'ana.martinez@orbit.demo',
    initials: 'AM',
    role: 'Recursos Humanos',
  },
  Manager: {
    name: 'Carlos Ramírez',
    email: 'carlos.ramirez@orbit.demo',
    initials: 'CR',
    role: 'Manager',
  },
  Tecnología: {
    name: 'Luis Herrera',
    email: 'luis.herrera@orbit.demo',
    initials: 'LH',
    role: 'Tecnología',
  },
  Administrador: {
    name: 'Mariana Silva',
    email: 'mariana.silva@orbit.demo',
    initials: 'MS',
    role: 'Administrador',
  },
};

const ROLE_PERMISSIONS: Readonly<Record<Role, readonly Permission[]>> = {
  'Recursos Humanos': [
    'dashboard.read',
    'employee.read',
    'employee.write',
    'request.create',
    'audit.read',
  ],
  Manager: ['dashboard.read', 'employee.read', 'request.read', 'request.approve', 'audit.read'],
  Tecnología: [
    'dashboard.read',
    'employee.read',
    'asset.read',
    'asset.assign',
    'request.read',
    'audit.read',
  ],
  Administrador: ['*'],
};

export function roleHasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes('*') || permissions.includes(permission);
}
