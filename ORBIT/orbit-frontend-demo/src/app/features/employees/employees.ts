import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Employee } from '../../core/models';
import { OrbitStore } from '../../core/orbit-store';
import { OrbitIcon } from '../../shared/orbit-icon';
import { InitialsPipe, OrbitLabelPipe } from '../../shared/labels.pipe';

@Component({
  selector: 'app-employees',
  imports: [ReactiveFormsModule, DatePipe, OrbitIcon, OrbitLabelPipe, InitialsPipe],
  templateUrl: './employees.html',
  styleUrl: './employees.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Employees {
  readonly store = inject(OrbitStore);
  private readonly formBuilder = inject(FormBuilder);
  readonly query = signal('');
  readonly statusFilter = signal('all');
  readonly departmentFilter = signal('all');
  readonly createOpen = signal(false);
  readonly selected = signal<Employee | null>(null);
  readonly activeCount = computed(
    () => this.store.employees().filter((employee) => employee.status !== 'inactive').length,
  );
  readonly onboardingCount = computed(
    () => this.store.employees().filter((employee) => employee.status === 'onboarding').length,
  );

  readonly employeeForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    jobTitle: ['', Validators.required],
    departmentId: ['dep-eng', Validators.required],
    siteId: ['site-gdl', Validators.required],
    managerId: ['emp-001', Validators.required],
    startDate: [new Date().toISOString().slice(0, 10), Validators.required],
    createEquipmentRequest: [true],
  });

  readonly filteredEmployees = computed(() => {
    const query = this.query().trim().toLowerCase();
    const status = this.statusFilter();
    const department = this.departmentFilter();
    return this.store.employees().filter((employee) => {
      const matchesQuery =
        !query ||
        employee.name.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.jobTitle.toLowerCase().includes(query);
      return (
        matchesQuery &&
        (status === 'all' || employee.status === status) &&
        (department === 'all' || employee.departmentId === department)
      );
    });
  });

  updateQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  updateStatus(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
  }

  updateDepartment(event: Event): void {
    this.departmentFilter.set((event.target as HTMLSelectElement).value);
  }

  createEmployee(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }
    this.store.addEmployee(this.employeeForm.getRawValue());
    this.employeeForm.reset({
      departmentId: 'dep-eng',
      siteId: 'site-gdl',
      managerId: 'emp-001',
      startDate: new Date().toISOString().slice(0, 10),
      createEquipmentRequest: true,
    });
    this.createOpen.set(false);
  }

  requestFor(employeeId: string) {
    return this.store
      .requests()
      .find((request) => request.employeeId === employeeId && request.category === 'Equipo');
  }

  assetsFor(employee: Employee) {
    return this.store.assets().filter((asset) => employee.assetIds.includes(asset.id));
  }
}
