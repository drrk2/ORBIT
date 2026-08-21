import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OrbitStore } from '../../core/state/orbit.store';
import { OrbitUiService } from '../../core/ui/orbit-ui.service';
import { statusClass } from '../../shared/status-class';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  protected readonly store = inject(OrbitStore);
  protected readonly ui = inject(OrbitUiService);
  protected readonly statusClass = statusClass;
  protected readonly spotlightRequest = computed(
    () =>
      this.store.requests().find((request) => request.id === 'REQ-1084') ??
      this.store.requests()[0],
  );
  protected readonly completionRate = computed(() => {
    const requests = this.store.requests();
    return requests.length
      ? Math.round((this.store.completedRequests().length / requests.length) * 100)
      : 0;
  });

  private readonly router = inject(Router);

  protected navigate(view: string): void {
    this.ui.clearSearch();
    void this.router.navigate([view]);
  }

  protected resetDemo(): void {
    this.store.resetDemo();
    void this.router.navigate(['dashboard']);
    this.ui.notify('Datos demo restaurados.');
  }
}
