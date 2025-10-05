import { Routes } from '@angular/router';
import { AuthGuard, AdminGuard, GuestGuard } from '../core/auth.guard';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'home',
    redirectTo: '/',
    pathMatch: 'full'
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then(m => m.About)
  },
  {
    path: 'blog',
    loadComponent: () => import('./pages/blog/blog').then(m => m.Blog)
  },
  {
    path: 'team',
    loadComponent: () => import('./pages/team/team').then(m => m.Team)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then(m => m.Contact)
  },
  {
    path: 'find-consultant',
    loadComponent: () => import('./pages/consultant/consultant').then(m => m.Consultant)
  },
  {
    path: 'join-community',
    loadComponent: () => import('./pages/community/community').then(m => m.Community)
  },
  {
    path: 'services',
    loadComponent: () => import('./pages/services/services').then(m => m.Services)
  },
  // Service detail routes
  {
    path: 'services/microcredit-financial-inclusion',
    loadComponent: () => import('./pages/services/microcredit/microcredit').then(m => m.Microcredit)
  },
  {
    path: 'services/ngo-technical-service-provider',
    loadComponent: () => import('./pages/services/ngo-technical/ngo-technical').then(m => m.NgoTechnical)
  },
  {
    path: 'services/recruitment-support',
    loadComponent: () => import('./pages/services/recruitment/recruitment').then(m => m.Recruitment)
  },
  {
    path: 'services/health-systems-strengthening',
    loadComponent: () => import('./pages/services/health-systems/health-systems').then(m => m.HealthSystems)
  },
  {
    path: 'services/banking-finance-advisory',
    loadComponent: () => import('./pages/services/banking-finance/banking-finance').then(m => m.BankingFinance)
  },
  {
    path: 'services/administrative-regulatory-due-diligence',
    loadComponent: () => import('./pages/services/administrative-regulatory/administrative-regulatory').then(m => m.AdministrativeRegulatory)
  },
  {
    path: 'services/infrastructure-civil-engineering',
    loadComponent: () => import('./pages/services/infrastructure-civil/infrastructure-civil').then(m => m.InfrastructureCivil)
  },
  {
    path: 'services/legal-compliance-services',
    loadComponent: () => import('./pages/services/legal-compliance/legal-compliance').then(m => m.LegalCompliance)
  },
  {
    path: 'services/agricultural-innovation',
    loadComponent: () => import('./pages/services/agricultural-innovation/agricultural-innovation').then(m => m.AgriculturalInnovation)
  },
  {
    path: 'services/technology-digital-transformation',
    loadComponent: () => import('./pages/services/technology-digital/technology-digital').then(m => m.TechnologyDigital)
  },
  {
    path: 'services/green-design-development',
    loadComponent: () => import('./pages/services/green-design/green-design').then(m => m.GreenDesign)
  },
  {
    path: 'services/hr-services',
    loadComponent: () => import('./pages/services/hr-services/hr-services').then(m => m.HrServices)
  },
  // Auth routes
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent),
    canActivate: [GuestGuard]
  },
  // Admin routes (protected)
  {
    path: 'admin',
    canActivate: [AdminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'about',
        loadComponent: () => import('./admin/about/about').then(m => m.About)
      },
      {
        path: 'blog',
        loadComponent: () => import('./admin/blog/blog').then(m => m.Blog)
      },
      {
        path: 'team',
        loadComponent: () => import('./admin/team/team').then(m => m.Team)
      }
    ]
  },
  // Wildcard route
  {
    path: '**',
    redirectTo: '/'
  }
];
