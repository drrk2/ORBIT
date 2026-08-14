import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { RoleId } from '../../core/models';
import { OrbitStore } from '../../core/orbit-store';
import { OrbitIcon } from '../../shared/orbit-icon';
import { OrbitLabelPipe } from '../../shared/labels.pipe';

interface PermissionRow {
  module: string;
  action: string;
  permissions: Record<RoleId, boolean>;
}

@Component({
  selector: 'app-access',
  imports: [OrbitIcon, OrbitLabelPipe],
  templateUrl: './access.html',
  styleUrl: './access.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Access {
  readonly store = inject(OrbitStore);
  readonly roles: RoleId[] = ['admin', 'hr', 'manager', 'it'];
  readonly permissions: PermissionRow[] = [
    {
      module: 'Organización',
      action: 'Ver estructura',
      permissions: { admin: true, hr: true, manager: true, it: false },
    },
    {
      module: 'Organización',
      action: 'Crear sedes y áreas',
      permissions: { admin: true, hr: true, manager: false, it: false },
    },
    {
      module: 'Empleados',
      action: 'Consultar directorio',
      permissions: { admin: true, hr: true, manager: true, it: true },
    },
    {
      module: 'Empleados',
      action: 'Registrar ingreso',
      permissions: { admin: true, hr: true, manager: false, it: false },
    },
    {
      module: 'Activos',
      action: 'Consultar catálogo',
      permissions: { admin: true, hr: true, manager: true, it: true },
    },
    {
      module: 'Activos',
      action: 'Asignar o devolver',
      permissions: { admin: true, hr: false, manager: false, it: true },
    },
    {
      module: 'Solicitudes',
      action: 'Crear y consultar',
      permissions: { admin: true, hr: true, manager: true, it: true },
    },
    {
      module: 'Solicitudes',
      action: 'Aprobar o rechazar',
      permissions: { admin: true, hr: false, manager: true, it: false },
    },
    {
      module: 'Solicitudes',
      action: 'Completar operación',
      permissions: { admin: true, hr: false, manager: false, it: true },
    },
    {
      module: 'Auditoría',
      action: 'Consultar actividad',
      permissions: { admin: true, hr: true, manager: true, it: true },
    },
  ];

  demoUserFor(role: RoleId) {
    return this.store.users().find((user) => user.role === role);
  }
}
