import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { OrbitStore } from './core/state/orbit.store';

describe('ORBIT demo', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('creates the application and shows the profile selector', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    await router.navigateByUrl('/dashboard');
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(fixture.componentInstance).toBeTruthy();
    expect(compiled.querySelector('h1')?.textContent).toContain('Tu empresa, en una sola órbita');
    expect(compiled.querySelectorAll('.profile-option').length).toBe(4);
  });

  it('completes the approval and asset assignment workflow', () => {
    const store = TestBed.inject(OrbitStore);
    store.resetDemo();
    store.login('Manager');

    expect(store.approveRequest('REQ-1084')).toBe(true);
    expect(store.requests().find((item) => item.id === 'REQ-1084')?.status).toBe('Aprobada');

    store.changeRole('Tecnología');
    expect(store.assignAsset('REQ-1084', 'AST-0248')).toBe(true);
    expect(store.requests().find((item) => item.id === 'REQ-1084')?.status).toBe('Completada');
    expect(store.assets().find((item) => item.id === 'AST-0248')?.assignedTo).toBe('Sofía Torres');
  });

  it('blocks approvals when the selected role lacks permission', () => {
    const store = TestBed.inject(OrbitStore);
    store.resetDemo();
    store.login('Recursos Humanos');

    expect(store.approveRequest('REQ-1084')).toBe(false);
    expect(store.requests().find((item) => item.id === 'REQ-1084')?.status).toBe('Pendiente');
  });

  it('recovers safely when localStorage contains invalid data', () => {
    localStorage.setItem('orbit-demo-state-v2', '{not-json');
    const store = TestBed.inject(OrbitStore);

    expect(store.employees().length).toBe(5);
    expect(store.requests().some((item) => item.id === 'REQ-1084')).toBe(true);
  });
});
