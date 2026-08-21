import { Component, computed, inject } from '@angular/core';
import { OrbitStore } from '../../core/state/orbit.store';
import { OrbitUiService } from '../../core/ui/orbit-ui.service';
import { statusClass } from '../../shared/status-class';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
})
export class EmployeesComponent {
  protected readonly store = inject(OrbitStore);
  protected readonly ui = inject(OrbitUiService);
  protected readonly statusClass = statusClass;
  protected readonly filteredEmployees = computed(() => {
    const term = this.ui.searchTerm().trim().toLowerCase();
    if (!term) return this.store.employees();
    return this.store
      .employees()
      .filter((employee) =>
        [employee.name, employee.position, employee.department, employee.site, employee.email]
          .join(' ')
          .toLowerCase()
          .includes(term),
      );
  });
}
