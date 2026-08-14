import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { InternalRequest, NewRequestInput, RequestPriority } from '../../core/models';
import { OrbitStore } from '../../core/orbit-store';
import { OrbitIcon } from '../../shared/orbit-icon';
import { OrbitLabelPipe } from '../../shared/labels.pipe';

@Component({
  selector: 'app-requests',
  imports: [ReactiveFormsModule, DatePipe, OrbitIcon, OrbitLabelPipe],
  templateUrl: './requests.html',
  styleUrl: './requests.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Requests {
  readonly store = inject(OrbitStore);
  private readonly formBuilder = inject(FormBuilder);
  readonly query = signal('');
  readonly statusFilter = signal('all');
  readonly createOpen = signal(false);
  readonly fulfilling = signal<InternalRequest | null>(null);
  readonly selectedAssetId = signal('');

  readonly pendingCount = computed(
    () => this.store.requests().filter((request) => request.status === 'pending_approval').length,
  );
  readonly activeCount = computed(
    () =>
      this.store
        .requests()
        .filter((request) => ['approved', 'in_progress'].includes(request.status)).length,
  );
  readonly completedCount = computed(
    () => this.store.requests().filter((request) => request.status === 'completed').length,
  );

  readonly requestForm = this.formBuilder.nonNullable.group({
    title: ['', Validators.required],
    category: ['Equipo', Validators.required],
    description: ['', Validators.required],
    employeeId: ['emp-004', Validators.required],
    approverId: ['emp-001', Validators.required],
    priority: ['medium' as RequestPriority, Validators.required],
  });

  readonly filteredRequests = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.store.requests().filter((request) => {
      const employee = this.store.findEmployee(request.employeeId).toLowerCase();
      const matchesQuery =
        !query ||
        request.title.toLowerCase().includes(query) ||
        request.code.toLowerCase().includes(query) ||
        employee.includes(query);
      return (
        matchesQuery && (this.statusFilter() === 'all' || request.status === this.statusFilter())
      );
    });
  });

  readonly matchingAssets = computed(() => {
    const request = this.fulfilling();
    const available = this.store.assets().filter((asset) => asset.status === 'available');
    if (!request) return available;
    if (request.title.toLowerCase().includes('monitor')) {
      return available.filter((asset) => asset.type === 'Monitor');
    }
    return available.filter((asset) => asset.type === 'Laptop');
  });

  updateQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  updateStatus(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
  }

  createRequest(): void {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }
    this.store.addRequest(this.requestForm.getRawValue() as NewRequestInput);
    this.requestForm.reset({
      category: 'Equipo',
      employeeId: 'emp-004',
      approverId: 'emp-001',
      priority: 'medium',
    });
    this.createOpen.set(false);
  }

  openFulfillment(request: InternalRequest): void {
    this.fulfilling.set(request);
    this.selectedAssetId.set('');
  }

  updateAsset(event: Event): void {
    this.selectedAssetId.set((event.target as HTMLSelectElement).value);
  }

  fulfill(): void {
    const request = this.fulfilling();
    const assetId = this.selectedAssetId();
    if (request && assetId) {
      this.store.fulfillEquipmentRequest(request.id, assetId);
      this.fulfilling.set(null);
    }
  }

  requesterName(requesterId: string): string {
    return this.store.users().find((user) => user.id === requesterId)?.name ?? 'Sistema ORBIT';
  }
}
