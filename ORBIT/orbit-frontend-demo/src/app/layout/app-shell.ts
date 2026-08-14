import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { RoleId } from '../core/models';
import { OrbitStore } from '../core/orbit-store';
import { IconName, OrbitIcon } from '../shared/orbit-icon';
import { OrbitLabelPipe } from '../shared/labels.pipe';

interface NavItem {
  label: string;
  path: string;
  icon: IconName;
  roles: RoleId[];
  badge?: 'approvals';
}

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, OrbitIcon, OrbitLabelPipe],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShell {
  readonly store = inject(OrbitStore);
  private readonly router = inject(Router);

  readonly mobileOpen = signal(false);
  readonly currentUser = this.store.currentUser;
  readonly pendingApprovals = computed(
    () => this.store.requests().filter((request) => request.status === 'pending_approval').length,
  );

  private readonly navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'dashboard',
      roles: ['admin', 'hr', 'manager', 'it'],
    },
    {
      label: 'Organización',
      path: '/organization',
      icon: 'building',
      roles: ['admin', 'hr', 'manager'],
    },
    {
      label: 'Empleados',
      path: '/employees',
      icon: 'users',
      roles: ['admin', 'hr', 'manager', 'it'],
    },
    { label: 'Activos', path: '/assets', icon: 'laptop', roles: ['admin', 'hr', 'manager', 'it'] },
    {
      label: 'Solicitudes',
      path: '/requests',
      icon: 'requests',
      roles: ['admin', 'hr', 'manager', 'it'],
    },
    {
      label: 'Aprobaciones',
      path: '/approvals',
      icon: 'approval',
      roles: ['admin', 'manager'],
      badge: 'approvals',
    },
    { label: 'Roles y permisos', path: '/access', icon: 'shield', roles: ['admin'] },
    {
      label: 'Auditoría',
      path: '/audit',
      icon: 'history',
      roles: ['admin', 'hr', 'manager', 'it'],
    },
  ];

  readonly visibleNav = computed(() => {
    const role = this.currentUser()?.role;
    return role ? this.navItems.filter((item) => item.roles.includes(role)) : [];
  });

  switchProfile(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.store.loginAs(target.value);
    void this.router.navigateByUrl('/dashboard');
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  resetDemo(): void {
    if (window.confirm('¿Restablecer todos los datos locales de la demostración?')) {
      this.store.resetDemo();
      void this.router.navigateByUrl('/dashboard');
    }
  }

  logout(): void {
    this.store.logout();
    void this.router.navigateByUrl('/login');
  }
}
