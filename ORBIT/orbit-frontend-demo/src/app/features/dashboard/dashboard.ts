import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { OrbitStore } from '../../core/orbit-store';
import { IconName, OrbitIcon } from '../../shared/orbit-icon';
import { InitialsPipe, OrbitLabelPipe } from '../../shared/labels.pipe';

interface MetricCard {
  label: string;
  value: number;
  note: string;
  icon: IconName;
  tone: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe, OrbitIcon, OrbitLabelPipe, InitialsPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  readonly store = inject(OrbitStore);

  readonly metrics = computed<MetricCard[]>(() => [
    {
      label: 'Empleados activos',
      value: this.store.employees().filter((employee) => employee.status !== 'inactive').length,
      note: `${this.store.employees().filter((employee) => employee.status === 'onboarding').length} en onboarding`,
      icon: 'users',
      tone: '',
    },
    {
      label: 'Activos disponibles',
      value: this.store.assets().filter((asset) => asset.status === 'available').length,
      note: `${this.store.assets().length} activos registrados`,
      icon: 'laptop',
      tone: 'success',
    },
    {
      label: 'Aprobaciones pendientes',
      value: this.store.requests().filter((request) => request.status === 'pending_approval')
        .length,
      note: 'Requieren atención del manager',
      icon: 'approval',
      tone: 'warning',
    },
    {
      label: 'Solicitudes abiertas',
      value: this.store
        .requests()
        .filter((request) => !['completed', 'rejected'].includes(request.status)).length,
      note: `${this.store.requests().filter((request) => request.status === 'in_progress').length} en proceso`,
      icon: 'requests',
      tone: 'info',
    },
  ]);

  readonly pipeline = computed(() => {
    const requests = this.store.requests();
    return [
      {
        status: 'pending_approval',
        label: 'Por aprobar',
        count: requests.filter((item) => item.status === 'pending_approval').length,
      },
      {
        status: 'approved',
        label: 'Aprobadas',
        count: requests.filter((item) => item.status === 'approved').length,
      },
      {
        status: 'in_progress',
        label: 'En proceso',
        count: requests.filter((item) => item.status === 'in_progress').length,
      },
      {
        status: 'completed',
        label: 'Completadas',
        count: requests.filter((item) => item.status === 'completed').length,
      },
      {
        status: 'rejected',
        label: 'Rechazadas',
        count: requests.filter((item) => item.status === 'rejected').length,
      },
    ];
  });

  readonly recentAudit = computed(() => this.store.audit().slice(0, 5));
  readonly onboarding = computed(() =>
    this.store
      .employees()
      .filter((employee) => employee.status === 'onboarding')
      .slice(0, 4),
  );

  pipelineWidth(count: number): number {
    const max = Math.max(...this.pipeline().map((item) => item.count), 1);
    return Math.max((count / max) * 100, count ? 12 : 0);
  }

  greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }
}
