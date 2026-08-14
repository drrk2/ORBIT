import { TestBed } from '@angular/core/testing';

import { OrbitStore } from './orbit-store';

describe('OrbitStore', () => {
  let store: OrbitStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    store = TestBed.inject(OrbitStore);
  });

  it('persists a valid demo session', () => {
    expect(store.login('rh@orbit.demo', 'orbit2026')).toBe(true);
    expect(store.currentUser()?.role).toBe('hr');
    expect(localStorage.getItem('orbit-demo-state-v1')).toContain('user-hr');
  });

  it('runs the HR to manager to IT onboarding flow', () => {
    store.login('rh@orbit.demo', 'orbit2026');
    store.addEmployee({
      name: 'Alex Rivera',
      email: 'alex.rivera@orbit.demo',
      jobTitle: 'Software Engineer',
      departmentId: 'dep-eng',
      siteId: 'site-gdl',
      managerId: 'emp-001',
      startDate: '2026-08-18',
      createEquipmentRequest: true,
    });

    const employee = store.employees().find((item) => item.email === 'alex.rivera@orbit.demo');
    const request = store.requests().find((item) => item.employeeId === employee?.id);
    expect(employee?.status).toBe('onboarding');
    expect(request?.status).toBe('pending_approval');

    store.loginAs('user-manager');
    store.approveRequest(request?.id ?? 'missing');
    expect(store.requests().find((item) => item.id === request?.id)?.status).toBe('approved');

    const asset = store
      .assets()
      .find((item) => item.status === 'available' && item.type === 'Laptop');
    store.loginAs('user-it');
    store.fulfillEquipmentRequest(request?.id ?? 'missing', asset?.id ?? 'missing');

    const completedEmployee = store.employees().find((item) => item.id === employee?.id);
    expect(completedEmployee?.status).toBe('active');
    expect(completedEmployee?.onboardingProgress).toBe(100);
    expect(store.requests().find((item) => item.id === request?.id)?.status).toBe('completed');
    expect(store.audit()[0]?.action).toBe('Onboarding completado');
  });
});
