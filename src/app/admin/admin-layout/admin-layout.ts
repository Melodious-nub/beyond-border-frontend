import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { ClickOutsideDirective } from '../../shared/directives/click-outside.directive';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterModule, RouterOutlet, ClickOutsideDirective],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.scss', '../../../styles-admin.scss']
})
export class AdminLayoutComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  isMobileSidebarOpen = signal(false);
  isUserMenuOpen = signal(false);
  currentPageTitle = signal('Dashboard');

  // Page title mapping
  private pageTitles: { [key: string]: string } = {
    '/admin/dashboard': 'Dashboard',
    '/admin/team': 'Team Management',
    '/admin/breadcrumb': 'Breadcrumb Management',
    '/admin/email-notification': 'Email Management',
    '/admin/contact-responses': 'Contact Responses',
    '/admin/about': 'About Management',
    '/admin/blog': 'Blog Management',
    '/admin/community': 'Community Management',
    '/admin/consultant-requests': 'Consultant Requests',
    '/admin/why-choose-us': 'Why Choose Us Management'
  };

  constructor() {
    // Listen to route changes to update page title
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const title = this.pageTitles[event.url] || 'Admin Panel';
        this.currentPageTitle.set(title);
      });
  }

  getCurrentPageTitle(): string {
    return this.currentPageTitle();
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.set(!this.isMobileSidebarOpen());
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.set(!this.isUserMenuOpen());
  }

  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }

  logOut(): void {
    this.authService.logout();
  }
}
