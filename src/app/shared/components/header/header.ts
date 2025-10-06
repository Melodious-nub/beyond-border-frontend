import { Component, inject, signal, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent implements OnInit {
  private readonly authService = inject(AuthService);
  readonly router = inject(Router);

  isAuthenticated = this.authService.isAuthenticated;
  user = this.authService.user;
  isMenuOpen = signal(false);
  isServicesDropdownOpen = signal(false);
  isInsightsDropdownOpen = signal(false);
  isAboutDropdownOpen = signal(false);
  isMobile = signal(false);

  navLinks = [
    { label: 'Home', path: '/' },
    { 
      label: 'Services', 
      path: '/services',
      hasSubmenu: true,
      submenu: [
        { label: 'All Services', path: '/services' },
        { label: 'Microcredit & Financial Inclusion', path: '/services/microcredit-financial-inclusion' },
        { label: 'NGO Technical Service Provider', path: '/services/ngo-technical-service-provider' },
        { label: 'Recruitment Support', path: '/services/recruitment-support' },
        { label: 'Health Systems Strengthening', path: '/services/health-systems-strengthening' },
        { label: 'Banking & Finance Advisory', path: '/services/banking-finance-advisory' },
        { label: 'Administrative & Regulatory Due Diligence', path: '/services/administrative-regulatory-due-diligence' },
        { label: 'Infrastructure & Civil Engineering', path: '/services/infrastructure-civil-engineering' },
        { label: 'Legal & Compliance Services', path: '/services/legal-compliance-services' },
        { label: 'Agricultural Innovation', path: '/services/agricultural-innovation' },
        { label: 'Technology & Digital Transformation', path: '/services/technology-digital-transformation' },
        { label: 'Green Design and Development', path: '/services/green-design-development' },
        { label: 'HR Services', path: '/services/hr-services' }
      ]
    },
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
    this.isServicesDropdownOpen.set(false);
    this.isInsightsDropdownOpen.set(false);
    this.isAboutDropdownOpen.set(false);
  }

  toggleServicesDropdown(): void {
    this.isServicesDropdownOpen.update(open => !open);
    this.isInsightsDropdownOpen.set(false);
    this.isAboutDropdownOpen.set(false);
  }

  toggleInsightsDropdown(): void {
    this.isInsightsDropdownOpen.update(open => !open);
    this.isServicesDropdownOpen.set(false);
    this.isAboutDropdownOpen.set(false);
  }

  toggleAboutDropdown(): void {
    this.isAboutDropdownOpen.update(open => !open);
    this.isServicesDropdownOpen.set(false);
    this.isInsightsDropdownOpen.set(false);
  }

  closeServicesDropdown(): void {
    this.isServicesDropdownOpen.set(false);
  }

  isServicesActive(): boolean {
    const currentUrl = this.router.url;
    return currentUrl === '/services' || currentUrl.startsWith('/services/');
  }

  isInsightsActive(): boolean {
    const currentUrl = this.router.url;
    return currentUrl === '/insights' || currentUrl.startsWith('/insights/') || currentUrl === '/blog';
  }

  isAboutActive(): boolean {
    const currentUrl = this.router.url;
    return currentUrl === '/about' || currentUrl === '/team';
  }

  isSubmenuItemActive(path: string): boolean {
    return this.router.url === path;
  }

  logout(): void {
    this.authService.logout();
  }

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkMobile();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.nav-dropdown');
    
    if (!dropdown) {
      this.isServicesDropdownOpen.set(false);
      this.isInsightsDropdownOpen.set(false);
      this.isAboutDropdownOpen.set(false);
    }
  }

  private checkMobile(): void {
    this.isMobile.set(window.innerWidth <= 768);
  }

  ngOnInit(): void {
    this.checkMobile();
  }
}
