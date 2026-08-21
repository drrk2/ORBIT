import { Injectable, computed, inject, signal } from '@angular/core';
import { DEMO_USERS, Permission, roleHasPermission } from '../auth/orbit-access';
import { createInitialOrbitState } from '../data/orbit-demo.data';
import {
  Asset,
  AuditEntry,
  InternalRequest,
  NewEmployee,
  NewRequest,
  OrbitState,
  Role,
} from '../models/orbit.models';
import { OrbitStateRepository } from '../persistence/orbit-state.repository';

@Injectable({ providedIn: 'root' })
export class OrbitStore {
  private readonly repository = inject(OrbitStateRepository);
  private readonly state = signal<OrbitState>(this.repository.load());

  readonly session = computed(() => this.state().session);
  readonly employees = computed(() => this.state().employees);
  readonly assets = computed(() => this.state().assets);
  readonly requests = computed(() => this.state().requests);
  readonly audit = computed(() => this.state().audit);

  readonly pendingRequests = computed(() =>
    this.requests().filter((request) => request.status === 'Pendiente'),
  );
  readonly approvedRequests = computed(() =>
    this.requests().filter((request) => request.status === 'Aprobada'),
  );
  readonly completedRequests = computed(() =>
    this.requests().filter((request) => request.status === 'Completada'),
  );
  readonly availableAssets = computed(() =>
    this.assets().filter((asset) => asset.status === 'Disponible'),
  );
  readonly assignedAssets = computed(() =>
    this.assets().filter((asset) => asset.status === 'Asignado'),
  );
  readonly assetsInMaintenance = computed(() =>
    this.assets().filter((asset) => asset.status === 'Mantenimiento'),
  );
  readonly activeEmployees = computed(() =>
    this.employees().filter((employee) => employee.status !== 'Inactivo'),
  );

  login(role: Role): void {
    this.commit({ ...this.state(), session: DEMO_USERS[role] });
  }

  changeRole(role: Role): void {
    this.login(role);
  }

  logout(): void {
    this.commit({ ...this.state(), session: null });
  }

  hasPermission(permission: Permission): boolean {
    const role = this.session()?.role;
    return role ? roleHasPermission(role, permission) : false;
  }

  addEmployee(input: NewEmployee): void {
    const id = `EMP-${1043 + this.employees().length}`;
    const employee = {
      ...input,
      id,
      initials: this.initialsFor(input.name),
      status: 'Onboarding' as const,
      joinedAt: 'Hoy',
    };
    const request: InternalRequest = {
      id: this.nextRequestId(),
      title: 'Equipo para nueva contratación',
      employeeId: id,
      employeeName: input.name,
      category: 'Equipo de cómputo',
      priority: 'Alta',
      status: 'Pendiente',
      requestedAt: 'Ahora',
      approver: input.manager,
    };

    this.commit({
      ...this.state(),
      employees: [employee, ...this.employees()],
      requests: [request, ...this.requests()],
      audit: [
        this.auditEntry('Empleado creado', id, `Se inició el onboarding de ${input.name}.`),
        this.auditEntry(
          'Solicitud generada',
          request.id,
          'El workflow creó una solicitud de equipo.',
        ),
        ...this.audit(),
      ],
    });
  }

  createRequest(input: NewRequest): boolean {
    const employee = this.employees().find((item) => item.id === input.employeeId);
    if (!employee) return false;

    const request: InternalRequest = {
      id: this.nextRequestId(),
      title: input.title,
      employeeId: input.employeeId,
      employeeName: employee.name,
      category: input.category,
      priority: input.priority,
      status: 'Pendiente',
      requestedAt: 'Ahora',
      approver: employee.manager,
    };

    this.commit({
      ...this.state(),
      requests: [request, ...this.requests()],
      audit: [
        this.auditEntry('Solicitud creada', request.id, `${input.title} para ${employee.name}.`),
        ...this.audit(),
      ],
    });
    return true;
  }

  approveRequest(id: string): boolean {
    if (!this.hasPermission('request.approve')) return false;
    const request = this.requests().find((item) => item.id === id);
    if (!request || request.status !== 'Pendiente') return false;

    this.commit({
      ...this.state(),
      requests: this.requests().map((item) =>
        item.id === id ? { ...item, status: 'Aprobada' } : item,
      ),
      audit: [
        this.auditEntry('Solicitud aprobada', id, `${request.title} fue aprobada.`),
        ...this.audit(),
      ],
    });
    return true;
  }

  rejectRequest(id: string): boolean {
    if (!this.hasPermission('request.approve')) return false;
    const request = this.requests().find((item) => item.id === id);
    if (!request || request.status !== 'Pendiente') return false;

    this.commit({
      ...this.state(),
      requests: this.requests().map((item) =>
        item.id === id ? { ...item, status: 'Rechazada' } : item,
      ),
      audit: [
        this.auditEntry('Solicitud rechazada', id, `${request.title} fue rechazada.`),
        ...this.audit(),
      ],
    });
    return true;
  }

  assignAsset(requestId: string, assetId: string): boolean {
    if (!this.hasPermission('asset.assign')) return false;
    const request = this.requests().find((item) => item.id === requestId);
    const asset = this.assets().find((item) => item.id === assetId);
    if (!request || request.status !== 'Aprobada' || !asset || asset.status !== 'Disponible')
      return false;

    this.commit({
      ...this.state(),
      requests: this.requests().map((item) =>
        item.id === requestId ? { ...item, status: 'Completada' } : item,
      ),
      assets: this.assets().map((item) =>
        item.id === assetId
          ? { ...item, status: 'Asignado', assignedTo: request.employeeName }
          : item,
      ),
      audit: [
        this.auditEntry(
          'Activo asignado',
          assetId,
          `${asset.brand} ${asset.model} asignado a ${request.employeeName}.`,
        ),
        this.auditEntry(
          'Onboarding completado',
          request.employeeId,
          'La entrega de equipo quedó registrada.',
        ),
        ...this.audit(),
      ],
    });
    return true;
  }

  returnAsset(asset: Asset): boolean {
    if (!this.hasPermission('asset.assign') || asset.status !== 'Asignado') return false;

    this.commit({
      ...this.state(),
      assets: this.assets().map((item) =>
        item.id === asset.id ? { ...item, status: 'Disponible', assignedTo: undefined } : item,
      ),
      audit: [
        this.auditEntry(
          'Activo devuelto',
          asset.id,
          `${asset.brand} ${asset.model} regresó a inventario.`,
        ),
        ...this.audit(),
      ],
    });
    return true;
  }

  resetDemo(): void {
    this.repository.clear();
    this.state.set(createInitialOrbitState());
  }

  private initialsFor(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  private nextRequestId(): string {
    const highest = this.requests().reduce(
      (max, item) => Math.max(max, Number(item.id.replace('REQ-', '')) || 0),
      1084,
    );
    return `REQ-${highest + 1}`;
  }

  private auditEntry(action: string, resource: string, detail: string): AuditEntry {
    return {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actor: this.session()?.name ?? 'ORBIT Workflow',
      action,
      resource,
      detail,
      timestamp: 'Ahora',
    };
  }

  private commit(next: OrbitState): void {
    this.state.set(next);
    this.repository.save(next);
  }
}
