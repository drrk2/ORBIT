import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Asset } from '../../core/models';
import { OrbitStore } from '../../core/orbit-store';
import { OrbitIcon } from '../../shared/orbit-icon';
import { OrbitLabelPipe } from '../../shared/labels.pipe';

@Component({
  selector: 'app-assets',
  imports: [ReactiveFormsModule, DatePipe, OrbitIcon, OrbitLabelPipe],
  templateUrl: './assets.html',
  styleUrl: './assets.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Assets {
  readonly store = inject(OrbitStore);
  private readonly formBuilder = inject(FormBuilder);
  readonly query = signal('');
  readonly statusFilter = signal('all');
  readonly typeFilter = signal('all');
  readonly createOpen = signal(false);
  readonly assigning = signal<Asset | null>(null);
  readonly employeeToAssign = signal('');

  readonly availableCount = computed(
    () => this.store.assets().filter((asset) => asset.status === 'available').length,
  );
  readonly assignedCount = computed(
    () => this.store.assets().filter((asset) => asset.status === 'assigned').length,
  );
  readonly maintenanceCount = computed(
    () => this.store.assets().filter((asset) => asset.status === 'maintenance').length,
  );
  readonly assetTypes = computed(() => [
    ...new Set(this.store.assets().map((asset) => asset.type)),
  ]);

  readonly filteredAssets = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.store.assets().filter((asset) => {
      const matchesQuery =
        !query ||
        asset.name.toLowerCase().includes(query) ||
        asset.serial.toLowerCase().includes(query) ||
        asset.brand.toLowerCase().includes(query);
      return (
        matchesQuery &&
        (this.statusFilter() === 'all' || asset.status === this.statusFilter()) &&
        (this.typeFilter() === 'all' || asset.type === this.typeFilter())
      );
    });
  });

  readonly assetForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    type: ['Laptop', Validators.required],
    brand: ['', Validators.required],
    model: ['', Validators.required],
    serial: ['', Validators.required],
    siteId: ['site-gdl', Validators.required],
    purchaseDate: [new Date().toISOString().slice(0, 10), Validators.required],
  });

  updateQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  updateStatus(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
  }

  updateType(event: Event): void {
    this.typeFilter.set((event.target as HTMLSelectElement).value);
  }

  createAsset(): void {
    if (this.assetForm.invalid) {
      this.assetForm.markAllAsTouched();
      return;
    }
    this.store.addAsset(this.assetForm.getRawValue());
    this.assetForm.reset({
      type: 'Laptop',
      siteId: 'site-gdl',
      purchaseDate: new Date().toISOString().slice(0, 10),
    });
    this.createOpen.set(false);
  }

  openAssignment(asset: Asset): void {
    this.assigning.set(asset);
    this.employeeToAssign.set('');
  }

  updateEmployee(event: Event): void {
    this.employeeToAssign.set((event.target as HTMLSelectElement).value);
  }

  confirmAssignment(): void {
    const asset = this.assigning();
    const employeeId = this.employeeToAssign();
    if (asset && employeeId) {
      this.store.assignAsset(asset.id, employeeId);
      this.assigning.set(null);
    }
  }

  returnAsset(asset: Asset): void {
    if (window.confirm(`¿Registrar la devolución de ${asset.name}?`)) {
      this.store.returnAsset(asset.id);
    }
  }
}
