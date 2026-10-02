import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthStore } from '../../data/auth-store';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-layout',
  styleUrl: './layout.css',
  templateUrl: './layout.html',
})
export class Layout {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  protected readonly user = this.auth.user;
  protected readonly profileOpen = signal(false);

  protected toggleProfile(): void {
    this.profileOpen.update((open) => !open);
  }

  protected async signOut(): Promise<void> {
    this.profileOpen.set(false);
    await this.auth.signOut();
    void this.router.navigateByUrl('/login');
  }
}
