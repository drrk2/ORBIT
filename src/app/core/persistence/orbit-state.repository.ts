import { Injectable } from '@angular/core';
import { createInitialOrbitState } from '../data/orbit-demo.data';
import { OrbitState } from '../models/orbit.models';

@Injectable({ providedIn: 'root' })
export class OrbitStateRepository {
  private readonly storageKey = 'orbit-demo-state-v2';

  load(): OrbitState {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return createInitialOrbitState();

      const parsed = JSON.parse(stored) as Partial<OrbitState>;
      return this.isValidState(parsed) ? parsed : createInitialOrbitState();
    } catch {
      return createInitialOrbitState();
    }
  }

  save(state: OrbitState): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch {
      // El demo conserva el estado en memoria si localStorage no está disponible.
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // El demo también funciona cuando el navegador bloquea localStorage.
    }
  }

  private isValidState(state: Partial<OrbitState>): state is OrbitState {
    return (
      (state.session === null || typeof state.session === 'object') &&
      Array.isArray(state.employees) &&
      Array.isArray(state.assets) &&
      Array.isArray(state.requests) &&
      Array.isArray(state.audit)
    );
  }
}
