import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { OrbitStore } from '../../core/orbit-store';
import { OrbitIcon } from '../../shared/orbit-icon';
import { OrbitLabelPipe } from '../../shared/labels.pipe';

@Component({
  selector: 'app-approvals',
  imports: [DatePipe, RouterLink, OrbitIcon, OrbitLabelPipe],
  templateUrl: './approvals.html',
  styleUrl: './approvals.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Approvals {
  readonly store = inject(OrbitStore);
  readonly pending = computed(() =>
    this.store.requests().filter((request) => request.status === 'pending_approval'),
  );

  requesterName(requesterId: string): string {
    return this.store.users().find((user) => user.id === requesterId)?.name ?? 'Sistema ORBIT';
  }
}
