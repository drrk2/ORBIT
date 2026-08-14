import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { OrbitStore } from '../../core/orbit-store';
import { OrbitIcon } from '../../shared/orbit-icon';
import { OrbitLabelPipe } from '../../shared/labels.pipe';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, OrbitIcon, OrbitLabelPipe],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  readonly store = inject(OrbitStore);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly error = signal('');

  readonly form = this.formBuilder.nonNullable.group({
    email: ['admin@orbit.demo', [Validators.required, Validators.email]],
    password: ['orbit2026', [Validators.required]],
  });

  submit(): void {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    if (!this.store.login(email, password)) {
      this.error.set('El correo o la contraseña no coinciden con los perfiles demo.');
      return;
    }
    void this.router.navigateByUrl('/dashboard');
  }

  quickLogin(email: string): void {
    this.form.setValue({ email, password: 'orbit2026' });
    this.submit();
  }
}
