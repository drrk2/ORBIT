import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { OrbitStore } from '../../core/orbit-store';
import { OrbitIcon } from '../../shared/orbit-icon';
import { OrbitLabelPipe } from '../../shared/labels.pipe';

@Component({
  selector: 'app-audit',
  imports: [DatePipe, OrbitIcon, OrbitLabelPipe],
  templateUrl: './audit.html',
  styleUrl: './audit.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Audit {
  readonly store = inject(OrbitStore);
  readonly query = signal('');
  readonly resourceFilter = signal('all');
  readonly roleFilter = signal('all');

  readonly resources = computed(() => [
    ...new Set(this.store.audit().map((entry) => entry.resource)),
  ]);
  readonly filteredAudit = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.store.audit().filter((entry) => {
      const matchesQuery =
        !query ||
        entry.action.toLowerCase().includes(query) ||
        entry.actor.toLowerCase().includes(query) ||
        entry.resourceId.toLowerCase().includes(query) ||
        entry.details.toLowerCase().includes(query);
      return (
        matchesQuery &&
        (this.resourceFilter() === 'all' || entry.resource === this.resourceFilter()) &&
        (this.roleFilter() === 'all' || entry.actorRole === this.roleFilter())
      );
    });
  });

  updateQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  updateResource(event: Event): void {
    this.resourceFilter.set((event.target as HTMLSelectElement).value);
  }

  updateRole(event: Event): void {
    this.roleFilter.set((event.target as HTMLSelectElement).value);
  }
}
