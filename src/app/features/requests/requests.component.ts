import { Component, computed, inject } from '@angular/core';
import { OrbitStore } from '../../core/state/orbit.store';
import { OrbitUiService } from '../../core/ui/orbit-ui.service';
import { statusClass } from '../../shared/status-class';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
})
export class RequestsComponent {
  protected readonly store = inject(OrbitStore);
  protected readonly ui = inject(OrbitUiService);
  protected readonly statusClass = statusClass;
  protected readonly filteredRequests = computed(() => {
    const term = this.ui.searchTerm().trim().toLowerCase();
    if (!term) return this.store.requests();
    return this.store
      .requests()
      .filter((request) =>
        [request.id, request.title, request.employeeName, request.category, request.status]
          .join(' ')
          .toLowerCase()
          .includes(term),
      );
  });
}
