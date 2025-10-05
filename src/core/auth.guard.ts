import { Injectable, inject } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(): Observable<boolean | UrlTree> {
    return this.checkAuth();
  }

  canActivateChild(): Observable<boolean | UrlTree> {
    return this.checkAuth();
  }

  private checkAuth(): Observable<boolean | UrlTree> {
    return this.authService.auth$.pipe(
      take(1),
      map(authState => {
        if (authState.isAuthenticated && !this.authService.isTokenExpired()) {
          return true;
        }
        
        // Redirect to login page
        return this.router.createUrlTree(['/auth/login']);
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate, CanActivateChild {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(): Observable<boolean | UrlTree> {
    return this.checkAdminAuth();
  }

  canActivateChild(): Observable<boolean | UrlTree> {
    return this.checkAdminAuth();
  }

  private checkAdminAuth(): Observable<boolean | UrlTree> {
    return this.authService.auth$.pipe(
      take(1),
      map(authState => {
        if (authState.isAuthenticated && 
            !this.authService.isTokenExpired() && 
            authState.user?.role === 'admin') {
          return true;
        }
        
        // Redirect to login page or unauthorized page
        return this.router.createUrlTree(['/auth/login']);
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.auth$.pipe(
      take(1),
      map(authState => {
        if (authState.isAuthenticated && !this.authService.isTokenExpired()) {
          // If user is already authenticated, redirect to dashboard
          return this.router.createUrlTree(['/admin/dashboard']);
        }
        return true;
      })
    );
  }
}
