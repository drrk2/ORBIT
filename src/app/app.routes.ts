import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/orbit-shell.component').then((module) => module.OrbitShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (module) => module.DashboardComponent,
          ),
      },
      {
        path: 'organization',
        loadComponent: () =>
          import('./features/organization/organization.component').then(
            (module) => module.OrganizationComponent,
          ),
      },
      {
        path: 'employees',
        loadComponent: () =>
          import('./features/employees/employees.component').then(
            (module) => module.EmployeesComponent,
          ),
      },
      {
        path: 'assets',
        loadComponent: () =>
          import('./features/assets/assets.component').then((module) => module.AssetsComponent),
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./features/requests/requests.component').then(
            (module) => module.RequestsComponent,
          ),
      },
      {
        path: 'approvals',
        loadComponent: () =>
          import('./features/approvals/approvals.component').then(
            (module) => module.ApprovalsComponent,
          ),
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./features/roles/roles.component').then((module) => module.RolesComponent),
      },
      {
        path: 'audit',
        loadComponent: () =>
          import('./features/audit/audit.component').then((module) => module.AuditComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
