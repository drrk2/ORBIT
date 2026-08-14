import { computed, Injectable, signal } from '@angular/core';

import {
  AuditEntry,
  Department,
  NewAssetInput,
  NewEmployeeInput,
  NewRequestInput,
  OrbitState,
  RoleId,
  Site,
} from './models';
import { createSeedState } from './seed';

@Injectable({ providedIn: 'root' })
export class OrbitStore {
  private readonly storageKey = 'orbit-demo-state-v1';
  private readonly state = signal<OrbitState>(this.load());

  readonly toast = signal<string | null>(null);
  readonly users = computed(() => this.state().users);
  readonly sites = computed(() => this.state().sites);
  readonly departments = computed(() => this.state().departments);
  readonly employees = computed(() => this.state().employees);
  readonly assets = computed(() => this.state().assets);
  readonly requests = computed(() => this.state().requests);
  readonly audit = computed(() => this.state().audit);
  readonly currentUser = computed(() => {
    const state = this.state();
    return state.users.find((user) => user.id === state.sessionUserId) ?? null;
  });

  login(email: string, password: string): boolean {
    const user = this.users().find(
      (candidate) => candidate.email.toLowerCase() === email.toLowerCase(),
    );
    if (!user || password !== 'orbit2026') {
      return false;
    }

    this.commit((state) => ({ ...state, sessionUserId: user.id }));
    this.showToast(`Sesión iniciada como ${user.name}`);
    return true;
  }

  loginAs(userId: string): void {
    const user = this.users().find((candidate) => candidate.id === userId);
    if (!user) {
      return;
    }
    this.commit((state) => ({ ...state, sessionUserId: userId }));
    this.showToast(`Perfil cambiado a ${user.name}`);
  }

  logout(): void {
    this.commit((state) => ({ ...state, sessionUserId: null }));
  }

  can(...roles: RoleId[]): boolean {
    const role = this.currentUser()?.role;
    return role ? roles.includes(role) : false;
  }

  addEmployee(input: NewEmployeeInput): void {
    this.requireRole('admin', 'hr');
    const employeeId = this.uid('emp');
    const now = new Date().toISOString();
    const user = this.currentUser();
    const palette = ['#625bf6', '#e86f51', '#1d9c73', '#3276e8', '#d15b87'];

    this.commit((state) => {
      const employee = {
        id: employeeId,
        name: input.name,
        email: input.email,
        jobTitle: input.jobTitle,
        departmentId: input.departmentId,
        siteId: input.siteId,
        managerId: input.managerId,
        status: 'onboarding' as const,
        startDate: input.startDate,
        onboardingProgress: input.createEquipmentRequest ? 25 : 50,
        assetIds: [],
        avatarColor: palette[state.employees.length % palette.length],
      };

      const audit = [
        this.auditEntry(
          'Empleado registrado',
          'Empleado',
          employeeId,
          `${input.name} fue agregado al directorio e inició onboarding.`,
          user,
          now,
        ),
        ...state.audit,
      ];

      if (!input.createEquipmentRequest) {
        return { ...state, employees: [employee, ...state.employees], audit };
      }

      const requestCode = this.nextRequestCode(state);
      const request = {
        id: this.uid('req'),
        code: requestCode,
        title: `Laptop para ${input.name}`,
        category: 'Equipo',
        description: `Preparar equipo de trabajo para el ingreso de ${input.name}.`,
        requesterId: user?.id ?? 'system',
        employeeId,
        approverId: input.managerId,
        priority: 'high' as const,
        status: 'pending_approval' as const,
        assetId: null,
        createdAt: now,
        updatedAt: now,
      };

      audit.unshift(
        this.auditEntry(
          'Solicitud creada',
          'Solicitud',
          requestCode,
          `Se creó automáticamente la solicitud de equipo para ${input.name}.`,
          user,
          now,
        ),
      );

      return {
        ...state,
        employees: [employee, ...state.employees],
        requests: [request, ...state.requests],
        audit,
      };
    });
    this.showToast(
      input.createEquipmentRequest
        ? 'Empleado registrado y solicitud de equipo creada'
        : 'Empleado registrado correctamente',
    );
  }

  addAsset(input: NewAssetInput): void {
    this.requireRole('admin', 'it');
    const user = this.currentUser();
    const assetId = this.uid('asset');
    const now = new Date().toISOString();
    this.commit((state) => ({
      ...state,
      assets: [
        {
          ...input,
          id: assetId,
          status: 'available',
          assignedTo: null,
        },
        ...state.assets,
      ],
      audit: [
        this.auditEntry(
          'Activo registrado',
          'Activo',
          input.serial,
          `${input.name} fue agregado al catálogo y está disponible.`,
          user,
          now,
        ),
        ...state.audit,
      ],
    }));
    this.showToast('Activo agregado al catálogo');
  }

  assignAsset(assetId: string, employeeId: string): void {
    this.requireRole('admin', 'it');
    const user = this.currentUser();
    const now = new Date().toISOString();
    this.commit((state) => {
      const asset = state.assets.find((item) => item.id === assetId);
      const employee = state.employees.find((item) => item.id === employeeId);
      if (!asset || !employee || asset.status !== 'available') {
        return state;
      }
      return {
        ...state,
        assets: state.assets.map((item) =>
          item.id === assetId ? { ...item, status: 'assigned', assignedTo: employeeId } : item,
        ),
        employees: state.employees.map((item) =>
          item.id === employeeId
            ? {
                ...item,
                assetIds: [...item.assetIds, assetId],
                onboardingProgress: 100,
                status: 'active',
              }
            : item,
        ),
        audit: [
          this.auditEntry(
            'Activo asignado',
            'Activo',
            asset.serial,
            `${asset.name} fue asignado a ${employee.name}.`,
            user,
            now,
          ),
          ...state.audit,
        ],
      };
    });
    this.showToast('Activo asignado correctamente');
  }

  returnAsset(assetId: string): void {
    this.requireRole('admin', 'it');
    const user = this.currentUser();
    const now = new Date().toISOString();
    this.commit((state) => {
      const asset = state.assets.find((item) => item.id === assetId);
      if (!asset || !asset.assignedTo) {
        return state;
      }
      const employee = state.employees.find((item) => item.id === asset.assignedTo);
      return {
        ...state,
        assets: state.assets.map((item) =>
          item.id === assetId ? { ...item, status: 'available', assignedTo: null } : item,
        ),
        employees: state.employees.map((item) =>
          item.id === asset.assignedTo
            ? { ...item, assetIds: item.assetIds.filter((id) => id !== assetId) }
            : item,
        ),
        audit: [
          this.auditEntry(
            'Activo devuelto',
            'Activo',
            asset.serial,
            `${asset.name} fue devuelto${employee ? ` por ${employee.name}` : ''}.`,
            user,
            now,
          ),
          ...state.audit,
        ],
      };
    });
    this.showToast('Devolución registrada');
  }

  addRequest(input: NewRequestInput): void {
    const user = this.currentUser();
    if (!user) {
      return;
    }
    const now = new Date().toISOString();
    this.commit((state) => {
      const code = this.nextRequestCode(state);
      const employee = state.employees.find((item) => item.id === input.employeeId);
      return {
        ...state,
        requests: [
          {
            ...input,
            id: this.uid('req'),
            code,
            requesterId: user.id,
            status: 'pending_approval',
            assetId: null,
            createdAt: now,
            updatedAt: now,
          },
          ...state.requests,
        ],
        audit: [
          this.auditEntry(
            'Solicitud creada',
            'Solicitud',
            code,
            `${input.title}${employee ? ` para ${employee.name}` : ''}.`,
            user,
            now,
          ),
          ...state.audit,
        ],
      };
    });
    this.showToast('Solicitud enviada para aprobación');
  }

  approveRequest(requestId: string): void {
    this.changeRequestStatus(requestId, 'approved', 'Solicitud aprobada');
  }

  rejectRequest(requestId: string): void {
    this.changeRequestStatus(requestId, 'rejected', 'Solicitud rechazada');
  }

  startRequest(requestId: string): void {
    this.requireRole('admin', 'it');
    this.changeRequestStatus(requestId, 'in_progress', 'Solicitud en proceso', false);
  }

  completeRequest(requestId: string): void {
    this.requireRole('admin', 'it');
    this.changeRequestStatus(requestId, 'completed', 'Solicitud completada', false);
  }

  fulfillEquipmentRequest(requestId: string, assetId: string): void {
    this.requireRole('admin', 'it');
    const user = this.currentUser();
    const now = new Date().toISOString();
    this.commit((state) => {
      const request = state.requests.find((item) => item.id === requestId);
      const asset = state.assets.find((item) => item.id === assetId);
      const employee = request
        ? state.employees.find((item) => item.id === request.employeeId)
        : undefined;
      if (!request || !asset || !employee || asset.status !== 'available') {
        return state;
      }
      return {
        ...state,
        requests: state.requests.map((item) =>
          item.id === requestId ? { ...item, status: 'completed', assetId, updatedAt: now } : item,
        ),
        assets: state.assets.map((item) =>
          item.id === assetId ? { ...item, status: 'assigned', assignedTo: employee.id } : item,
        ),
        employees: state.employees.map((item) =>
          item.id === employee.id
            ? {
                ...item,
                assetIds: [...item.assetIds, assetId],
                onboardingProgress: 100,
                status: 'active',
              }
            : item,
        ),
        audit: [
          this.auditEntry(
            'Onboarding completado',
            'Solicitud',
            request.code,
            `${asset.name} fue asignado a ${employee.name}; solicitud y onboarding completados.`,
            user,
            now,
          ),
          ...state.audit,
        ],
      };
    });
    this.showToast('Equipo asignado y onboarding completado');
  }

  addSite(input: Omit<Site, 'id'>): void {
    this.requireRole('admin', 'hr');
    const user = this.currentUser();
    const site: Site = { ...input, id: this.uid('site') };
    const now = new Date().toISOString();
    this.commit((state) => ({
      ...state,
      sites: [...state.sites, site],
      audit: [
        this.auditEntry(
          'Sede registrada',
          'Organización',
          site.id,
          `La sede ${site.name} fue agregada a ORBIT.`,
          user,
          now,
        ),
        ...state.audit,
      ],
    }));
    this.showToast('Sede agregada correctamente');
  }

  addDepartment(input: Omit<Department, 'id' | 'color'>): void {
    this.requireRole('admin', 'hr');
    const user = this.currentUser();
    const colors = ['#625bf6', '#e86f51', '#1d9c73', '#3276e8', '#e5a436'];
    const now = new Date().toISOString();
    this.commit((state) => {
      const department: Department = {
        ...input,
        id: this.uid('dep'),
        color: colors[state.departments.length % colors.length],
      };
      return {
        ...state,
        departments: [...state.departments, department],
        audit: [
          this.auditEntry(
            'Departamento creado',
            'Organización',
            department.id,
            `${department.name} fue agregado a la estructura organizacional.`,
            user,
            now,
          ),
          ...state.audit,
        ],
      };
    });
    this.showToast('Departamento agregado');
  }

  resetDemo(): void {
    const sessionUserId = this.currentUser()?.id ?? 'user-admin';
    const seed = createSeedState();
    seed.sessionUserId = sessionUserId;
    this.state.set(seed);
    this.persist(seed);
    this.showToast('Datos de demostración restablecidos');
  }

  findEmployee(id: string): string {
    return this.employees().find((employee) => employee.id === id)?.name ?? 'Sin asignar';
  }

  findSite(id: string): string {
    return this.sites().find((site) => site.id === id)?.name ?? 'Sin sede';
  }

  findDepartment(id: string): string {
    return (
      this.departments().find((department) => department.id === id)?.name ?? 'Sin departamento'
    );
  }

  private changeRequestStatus(
    requestId: string,
    status: 'approved' | 'rejected' | 'in_progress' | 'completed',
    action: string,
    managerAction = true,
  ): void {
    if (managerAction) {
      this.requireRole('admin', 'manager');
    }
    const user = this.currentUser();
    const now = new Date().toISOString();
    this.commit((state) => {
      const request = state.requests.find((item) => item.id === requestId);
      if (!request) {
        return state;
      }
      return {
        ...state,
        requests: state.requests.map((item) =>
          item.id === requestId ? { ...item, status, updatedAt: now } : item,
        ),
        audit: [
          this.auditEntry(
            action,
            'Solicitud',
            request.code,
            `${request.title} cambió a ${status.replace('_', ' ')}.`,
            user,
            now,
          ),
          ...state.audit,
        ],
      };
    });
    this.showToast(action);
  }

  private load(): OrbitState {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as OrbitState;
        if (parsed.version === 1) {
          return parsed;
        }
      }
    } catch {
      localStorage.removeItem(this.storageKey);
    }
    return createSeedState();
  }

  private commit(updater: (state: OrbitState) => OrbitState): void {
    const next = updater(this.state());
    this.state.set(next);
    this.persist(next);
  }

  private persist(state: OrbitState): void {
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  private requireRole(...roles: RoleId[]): void {
    if (!this.can(...roles)) {
      throw new Error('El perfil actual no tiene permiso para realizar esta acción.');
    }
  }

  private nextRequestCode(state: OrbitState): string {
    const max = state.requests.reduce((current, request) => {
      const value = Number(request.code.replace('REQ-', ''));
      return Number.isFinite(value) ? Math.max(current, value) : current;
    }, 1000);
    return `REQ-${max + 1}`;
  }

  private uid(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  private auditEntry(
    action: string,
    resource: string,
    resourceId: string,
    details: string,
    user: ReturnType<OrbitStore['currentUser']>,
    timestamp: string,
  ): AuditEntry {
    return {
      id: this.uid('audit'),
      action,
      resource,
      resourceId,
      actor: user?.name ?? 'Sistema ORBIT',
      actorRole: user?.role ?? 'admin',
      details,
      timestamp,
    };
  }

  private showToast(message: string): void {
    this.toast.set(message);
    window.setTimeout(() => {
      if (this.toast() === message) {
        this.toast.set(null);
      }
    }, 3200);
  }
}
