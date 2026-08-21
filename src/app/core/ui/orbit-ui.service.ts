import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OrbitUiService {
  readonly searchTerm = signal('');
  readonly employeeModalOpen = signal(false);
  readonly requestModalOpen = signal(false);
  readonly toast = signal('');

  openEmployeeModal(): void {
    this.employeeModalOpen.set(true);
  }

  closeEmployeeModal(): void {
    this.employeeModalOpen.set(false);
  }

  openRequestModal(): void {
    this.requestModalOpen.set(true);
  }

  closeRequestModal(): void {
    this.requestModalOpen.set(false);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  notify(message: string): void {
    this.toast.set(message);
    window.setTimeout(() => {
      if (this.toast() === message) this.toast.set('');
    }, 3600);
  }
}
