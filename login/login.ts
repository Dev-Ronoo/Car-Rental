import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../data/auth-store';
import { apiErrorMessage } from '../../data/api-client';

@Component({
  imports: [RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthStore);
  protected readonly passwordVisible = signal(false);
  protected readonly mode = signal<'login' | 'signup'>('login');
  protected readonly errorMessage = signal('');
  protected readonly submitting = signal(false);

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  protected setMode(mode: 'login' | 'signup'): void {
    this.mode.set(mode);
    this.errorMessage.set('');
    this.passwordVisible.set(false);
  }

  protected async submitLogin(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    if (!form.reportValidity() || this.submitting()) return;

    const values = new FormData(form);
    const email = String(values.get('email')).trim().toLowerCase();
    const password = String(values.get('password'));
    if (this.mode() === 'signup' && password !== String(values.get('confirmPassword'))) {
      this.errorMessage.set('The passwords do not match.');
      return;
    }
    this.submitting.set(true);
    const error = this.mode() === 'signup'
      ? await this.auth.signUp(String(values.get('name')).trim(), email, password)
      : await this.auth.signIn(email, password);
    if (error) {
      this.errorMessage.set(apiErrorMessage(error, error));
      this.submitting.set(false);
      return;
    }

    this.errorMessage.set('');
    void this.router.navigateByUrl('/dashboard');
  }
}
