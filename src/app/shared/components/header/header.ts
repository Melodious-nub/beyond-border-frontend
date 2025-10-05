import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isAuthenticated = this.authService.isAuthenticated;
  user = this.authService.user;
  isMenuOpen = signal(false);
  isScrolled = signal(false);

  navLinks = [
    { label: 'Home', path: '/home' },
    { label: 'Services', path: '/services' },
    { label: 'About', path: '/about' },
    { label: 'Blog', path: '/blog' },
    { label: 'Team', path: '/team' },
    { label: 'Contact', path: '/contact' }
  ];

  toggleMenu(): void {
    this.isMenuOpen.update(open => !open);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  constructor() {
    this.updateScrollState();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.updateScrollState();
  }

  private updateScrollState(): void {
    this.isScrolled.set(typeof window !== 'undefined' && window.scrollY > 10);
  }
}
