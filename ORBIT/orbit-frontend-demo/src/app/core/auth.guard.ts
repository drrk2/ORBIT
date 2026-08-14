import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { OrbitStore } from './orbit-store';

export const authGuard: CanActivateFn = () => {
  const store = inject(OrbitStore);
  const router = inject(Router);
  return store.currentUser() ? true : router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = () => {
  const store = inject(OrbitStore);
  const router = inject(Router);
  return store.currentUser() ? router.createUrlTree(['/dashboard']) : true;
};
