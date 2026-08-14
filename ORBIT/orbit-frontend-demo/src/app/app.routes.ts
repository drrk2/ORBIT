import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/login/login').then((component) => component.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/app-shell').then((component) => component.AppShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Resumen ejecutivo',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((component) => component.Dashboard),
      },
      {
        path: 'organization',
        title: 'Organización',
        loadComponent: () =>
          import('./features/organization/organization').then(
            (component) => component.Organization,
          ),
      },
      {
        path: 'employees',
        title: 'Empleados',
        loadComponent: () =>
          import('./features/employees/employees').then((component) => component.Employees),
      },
      {
        path: 'assets',
        title: 'Activos',
        loadComponent: () =>
          import('./features/assets/assets').then((component) => component.Assets),
      },
      {
        path: 'requests',
        title: 'Solicitudes',
        loadComponent: () =>
          import('./features/requests/requests').then((component) => component.Requests),
      },
      {
        path: 'approvals',
        title: 'Aprobaciones',
        loadComponent: () =>
          import('./features/approvals/approvals').then((component) => component.Approvals),
      },
      {
        path: 'access',
        title: 'Roles y permisos',
        loadComponent: () =>
          import('./features/access/access').then((component) => component.Access),
      },
      {
        path: 'audit',
        title: 'Auditoría',
        loadComponent: () => import('./features/audit/audit').then((component) => component.Audit),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
