import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthStore } from '../../data/auth-store';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([{ path: 'dashboard', component: Login }]),
        { provide: AuthStore, useValue: {
          signIn: async (email: string, password: string) =>
            email === 'valid@example.com' && password === 'ValidPassword123' ? null : 'Email or password is incorrect.',
          signUp: async (name: string, email: string, password: string) =>
            name && email === 'new@example.com' && password === 'ValidPassword123' ? null : 'Account creation failed.',
        } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows an error for invalid credentials', async () => {
    const element = fixture.nativeElement as HTMLElement;
    (element.querySelector('[name="email"]') as HTMLInputElement).value = 'wrong@example.com';
    (element.querySelector('[name="password"]') as HTMLInputElement).value = 'not-the-password';
    element.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Email or password is incorrect');
  });

  it('navigates to the dashboard after a successful account login', async () => {
    const element = fixture.nativeElement as HTMLElement;
    (element.querySelector('[name="email"]') as HTMLInputElement).value = 'valid@example.com';
    (element.querySelector('[name="password"]') as HTMLInputElement).value = 'ValidPassword123';
    element.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/dashboard');
  });

  it('shows the account registration fields when create account is selected', async () => {
    const element = fixture.nativeElement as HTMLElement;
    (element.querySelector('[role="tab"][aria-selected="false"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(element.querySelector('[name="name"]')).toBeTruthy();
    expect(element.querySelector('[name="confirmPassword"]')).toBeTruthy();
    expect(element.querySelector('.demo-credentials')).toBeNull();
  });
});
