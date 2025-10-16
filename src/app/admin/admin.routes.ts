import { Routes } from '@angular/router';
import { AdminGuard } from '../../core/auth.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent),
    data: { title: 'Admin Dashboard' }
  },
  {
    path: 'team',
    loadComponent: () => import('./team/team').then(m => m.Team),
    data: { title: 'Admin - Our Team' }
  },
  {
    path: 'blog',
    loadComponent: () => import('./blog/blog').then(m => m.Blog),
    data: { title: 'Admin - Blog' }
  },
  {
    path: 'breadcrumb',
    loadComponent: () => import('./breadcrumb/breadcrumb').then(m => m.Breadcrumb),
    data: { title: 'Admin - Breadcrumb' }
  },
  {
    path: 'email-notification',
    loadComponent: () => import('./email-notification/email-notification').then(m => m.EmailNotification),
    data: { title: 'Admin - Email Notification' }
  },
  {
    path: 'contact-responses',
    loadComponent: () => import('./contact-responses/contact-responses').then(m => m.ContactResponses),
    data: { title: 'Admin - Contact Responses' }
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about').then(m => m.About),
    data: { title: 'Admin - About Us' }
  },
  {
    path: 'community',
    loadComponent: () => import('./community/community').then(m => m.Community),
    data: { title: 'Admin - Community' }
  },
  {
    path: 'consultant-requests',
    loadComponent: () => import('./consultant-requests/consultant-requests').then(m => m.ConsultantRequests),
    data: { title: 'Admin - Consultant Requests' }
  },
  {
    path: 'why-choose-us',
    loadComponent: () => import('./why-choose-us/why-choose-us').then(m => m.WhyChooseUs),
    data: { title: 'Admin - Why Choose Us' }
  }
];
