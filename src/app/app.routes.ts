import { Routes } from '@angular/router';
import { AuthGuard, AdminGuard, GuestGuard } from '../core/auth.guard';
import { adminRoutes } from './admin/admin.routes';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent),
    data: { title: 'Home' }
  },
  {
    path: 'home',
    redirectTo: '/',
    pathMatch: 'full'
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then(m => m.About),
    data: { title: 'About Us' }
  },
  {
    path: 'blog',
    loadComponent: () => import('./pages/blog/blog').then(m => m.Blog),
    data: { title: 'Blog' }
  },
  {
    path: 'team',
    loadComponent: () => import('./pages/team/team').then(m => m.Team),
    data: { title: 'Our Team' }
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then(m => m.Contact),
    data: { title: 'Contact Us' }
  },
  {
    path: 'find-consultant',
    loadComponent: () => import('./pages/consultant/consultant').then(m => m.Consultant),
    data: { title: 'Find Consultant' }
  },
  {
    path: 'join-community',
    loadComponent: () => import('./pages/community/community').then(m => m.Community),
    data: { title: 'Join Community' }
  },
  {
    path: 'services',
    loadComponent: () => import('./pages/services/services').then(m => m.Services),
    data: { title: 'Our Services' }
  },
  // Service detail routes
  {
    path: 'services/microcredit-financial-inclusion',
    loadComponent: () => import('./pages/services/microcredit/microcredit').then(m => m.Microcredit),
    data: { title: 'Microcredit & Financial Inclusion' }
  },
  {
    path: 'services/ngo-technical-service-provider',
    loadComponent: () => import('./pages/services/ngo-technical/ngo-technical').then(m => m.NgoTechnical),
    data: { title: 'NGO Technical Service Provider' }
  },
  {
    path: 'services/recruitment-support',
    loadComponent: () => import('./pages/services/recruitment/recruitment').then(m => m.Recruitment),
    data: { title: 'Recruitment Support' }
  },
  {
    path: 'services/health-systems-strengthening',
    loadComponent: () => import('./pages/services/health-systems/health-systems').then(m => m.HealthSystems),
    data: { title: 'Health Systems Strengthening' }
  },
  {
    path: 'services/banking-finance-advisory',
    loadComponent: () => import('./pages/services/banking-finance/banking-finance').then(m => m.BankingFinance),
    data: { title: 'Banking & Finance Advisory' }
  },
  {
    path: 'services/administrative-regulatory-due-diligence',
    loadComponent: () => import('./pages/services/administrative-regulatory/administrative-regulatory').then(m => m.AdministrativeRegulatory),
    data: { title: 'Administrative & Regulatory Due Diligence' }
  },
  {
    path: 'services/infrastructure-civil-engineering',
    loadComponent: () => import('./pages/services/infrastructure-civil/infrastructure-civil').then(m => m.InfrastructureCivil),
    data: { title: 'Infrastructure & Civil Engineering' }
  },
  {
    path: 'services/legal-compliance-services',
    loadComponent: () => import('./pages/services/legal-compliance/legal-compliance').then(m => m.LegalCompliance),
    data: { title: 'Legal & Compliance Services' }
  },
  {
    path: 'services/agricultural-innovation',
    loadComponent: () => import('./pages/services/agricultural-innovation/agricultural-innovation').then(m => m.AgriculturalInnovation),
    data: { title: 'Agricultural Innovation' }
  },
  {
    path: 'services/technology-digital-transformation',
    loadComponent: () => import('./pages/services/technology-digital/technology-digital').then(m => m.TechnologyDigital),
    data: { title: 'Technology & Digital Transformation' }
  },
  {
    path: 'services/green-design-development',
    loadComponent: () => import('./pages/services/green-design/green-design').then(m => m.GreenDesign),
    data: { title: 'Green Design & Development' }
  },
  {
    path: 'services/hr-services',
    loadComponent: () => import('./pages/services/hr-services/hr-services').then(m => m.HrServices),
    data: { title: 'HR Services' }
  },
  // Auth routes
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent),
    canActivate: [GuestGuard],
    data: { title: 'Login' }
  },
  // Admin routes (protected)
  {
    path: 'admin',
    canActivate: [AdminGuard],
    loadComponent: () => import('./admin/admin-layout/admin-layout').then(m => m.AdminLayoutComponent),
    children: adminRoutes,
    data: { title: 'Admin Panel' }
  },
  // Wildcard route
  {
    path: '**',
    redirectTo: '/'
  }
];
