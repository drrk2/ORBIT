import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { OrbitStore } from '../../core/orbit-store';
import { OrbitIcon } from '../../shared/orbit-icon';

@Component({
  selector: 'app-organization',
  imports: [ReactiveFormsModule, OrbitIcon],
  templateUrl: './organization.html',
  styleUrl: './organization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Organization {
  readonly store = inject(OrbitStore);
  private readonly formBuilder = inject(FormBuilder);
  readonly modal = signal<'site' | 'department' | null>(null);

  readonly siteForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    city: ['', Validators.required],
    address: ['', Validators.required],
  });

  readonly departmentForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    code: ['', [Validators.required, Validators.maxLength(5)]],
    manager: ['', Validators.required],
    siteId: ['site-gdl', Validators.required],
  });

  employeeCountForSite(siteId: string): number {
    return this.store
      .employees()
      .filter((employee) => employee.siteId === siteId && employee.status !== 'inactive').length;
  }

  employeeCountForDepartment(departmentId: string): number {
    return this.store
      .employees()
      .filter(
        (employee) => employee.departmentId === departmentId && employee.status !== 'inactive',
      ).length;
  }

  submitSite(): void {
    if (this.siteForm.invalid) {
      this.siteForm.markAllAsTouched();
      return;
    }
    this.store.addSite(this.siteForm.getRawValue());
    this.siteForm.reset();
    this.modal.set(null);
  }

  submitDepartment(): void {
    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }
    this.store.addDepartment(this.departmentForm.getRawValue());
    this.departmentForm.reset({ siteId: 'site-gdl' });
    this.modal.set(null);
  }
}
