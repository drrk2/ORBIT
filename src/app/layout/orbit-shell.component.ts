import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { NewEmployee, NewRequest, ROLES, Role, isRole } from '../core/models/orbit.models';
import { OrbitStore } from '../core/state/orbit.store';
import { OrbitUiService } from '../core/ui/orbit-ui.service';

type ViewKey =
  | 'dashboard'
  | 'organization'
  | 'employees'
  | 'assets'
  | 'requests'
  | 'approvals'
  | 'roles'
  | 'audit';

interface NavItem {
  id: ViewKey;
  label: string;
  icon: string;
}

const PAGE_TITLES: Record<ViewKey, string> = {
  dashboard: 'Resumen ejecutivo',
  organization: 'Organización',
  employees: 'Directorio de empleados',
  assets: 'Activos e inventario',
  requests: 'Solicitudes internas',
  approvals: 'Centro de aprobaciones',
  roles: 'Roles y permisos',
  audit: 'Registro de auditoría',
};

const NEW_EMPLOYEE_DRAFT: NewEmployee = {
  name: '',
  email: '',
  position: '',
  department: 'Tecnología',
  site: 'Guadalajara',
  manager: 'Carlos Ramírez',
};

@Component({
  selector: 'app-orbit-shell',
  imports: [FormsModule, RouterOutlet],
  templateUrl: './orbit-shell.component.html',
})
export class OrbitShellComponent {
  protected readonly store = inject(OrbitStore);
  protected readonly ui = inject(OrbitUiService);
  protected readonly roles = ROLES;
  protected readonly menuOpen = signal(false);
  protected readonly activeView = signal<ViewKey>('dashboard');
  protected readonly pageTitle = computed(() => PAGE_TITLES[this.activeView()]);
  protected readonly navItems: readonly NavItem[] = [
    { id: 'dashboard', label: 'Resumen', icon: '◫' },
    { id: 'organization', label: 'Organización', icon: '⌘' },
    { id: 'employees', label: 'Empleados', icon: '◎' },
    { id: 'assets', label: 'Activos', icon: '▣' },
    { id: 'requests', label: 'Solicitudes', icon: '◇' },
    { id: 'approvals', label: 'Aprobaciones', icon: '✓' },
    { id: 'roles', label: 'Roles y permisos', icon: '⌾' },
    { id: 'audit', label: 'Auditoría', icon: '≡' },
  ];

  protected employeeDraft: NewEmployee = { ...NEW_EMPLOYEE_DRAFT };
  protected requestDraft: NewRequest = {
    employeeId: 'EMP-1042',
    title: 'Equipo para nueva contratación',
    category: 'Equipo de cómputo',
    priority: 'Alta',
  };

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.syncActiveView(this.router.url);
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.syncActiveView(event.urlAfterRedirects));
  }

  protected login(role: Role): void {
    this.store.login(role);
    this.navigate('dashboard');
    this.ui.notify(`Sesión iniciada como ${role}.`);
  }

  protected logout(): void {
    this.store.logout();
    this.menuOpen.set(false);
    this.ui.clearSearch();
  }

  protected changeRole(role: string): void {
    if (!isRole(role)) return;
    this.store.changeRole(role);
    this.ui.notify(`Perfil demo cambiado a ${role}.`);
  }

  protected navigate(view: ViewKey): void {
    this.menuOpen.set(false);
    this.ui.clearSearch();
    void this.router.navigate([view]);
  }

  protected navBadge(view: ViewKey): number | null {
    if (view === 'approvals') return this.store.pendingRequests().length;
    if (view === 'requests') return this.store.requests().length;
    return null;
  }

  protected submitEmployee(): void {
    if (
      !this.employeeDraft.name.trim() ||
      !this.employeeDraft.email.trim() ||
      !this.employeeDraft.position.trim()
    ) {
      this.ui.notify('Completa nombre, correo y puesto.');
      return;
    }

    this.store.addEmployee({ ...this.employeeDraft });
    this.employeeDraft = { ...NEW_EMPLOYEE_DRAFT };
    this.ui.closeEmployeeModal();
    this.ui.notify('Empleado creado. ORBIT generó la solicitud de equipo.');
  }

  protected submitRequest(): void {
    if (!this.requestDraft.employeeId || !this.requestDraft.title.trim()) {
      this.ui.notify('Selecciona un empleado y escribe el motivo.');
      return;
    }

    if (!this.store.createRequest({ ...this.requestDraft })) {
      this.ui.notify('No fue posible crear la solicitud para ese empleado.');
      return;
    }

    this.ui.closeRequestModal();
    this.ui.notify('Solicitud enviada a aprobación.');
  }

  private syncActiveView(url: string): void {
    const view = url.split(/[/?#]/).filter(Boolean)[0];
    if (view && view in PAGE_TITLES) this.activeView.set(view as ViewKey);
  }
}
