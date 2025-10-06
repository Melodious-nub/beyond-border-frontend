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
    path: 'about',
    loadComponent: () => import('./about/about').then(m => m.About),
    data: { title: 'Admin - About Us' }
  },
  {
    path: 'blog',
    loadComponent: () => import('./blog/blog').then(m => m.Blog),
    data: { title: 'Admin - Blog' }
  },
  {
    path: 'team',
    loadComponent: () => import('./team/team').then(m => m.Team),
    data: { title: 'Admin - Our Team' }
  }
];
