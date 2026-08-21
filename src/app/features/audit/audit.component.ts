import { Component, inject } from '@angular/core';
import { OrbitStore } from '../../core/state/orbit.store';

@Component({
  selector: 'app-audit',
  templateUrl: './audit.component.html',
})
export class AuditComponent {
  protected readonly store = inject(OrbitStore);
}
