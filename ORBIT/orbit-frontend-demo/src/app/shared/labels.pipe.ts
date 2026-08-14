import { Pipe, PipeTransform } from '@angular/core';

import { PRIORITY_LABELS, REQUEST_STATUS_LABELS, ROLE_LABELS } from '../core/models';

const LABELS: Record<string, string> = {
  ...ROLE_LABELS,
  ...REQUEST_STATUS_LABELS,
  ...PRIORITY_LABELS,
  active: 'Activo',
  onboarding: 'Onboarding',
  inactive: 'Inactivo',
  available: 'Disponible',
  assigned: 'Asignado',
  maintenance: 'Mantenimiento',
};

@Pipe({ name: 'orbitLabel', standalone: true })
export class OrbitLabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return value ? (LABELS[value] ?? value) : '—';
  }
}

@Pipe({ name: 'initials', standalone: true })
export class InitialsPipe implements PipeTransform {
  transform(value: string): string {
    return value
      .split(' ')
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  }
}
