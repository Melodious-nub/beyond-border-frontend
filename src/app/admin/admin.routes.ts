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
    loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about').then(m => m.About)
  },
  {
    path: 'blog',
    loadComponent: () => import('./blog/blog').then(m => m.Blog)
  },
  {
    path: 'team',
    loadComponent: () => import('./team/team').then(m => m.Team)
  }
];
