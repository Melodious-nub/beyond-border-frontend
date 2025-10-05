import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, catchError, tap, finalize } from 'rxjs';
import { environment } from '../environments/environment';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  
  // Using signals for reactive state management (Angular 17+)
  private readonly _authState = signal<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false
  });

  // Public readonly signals
  readonly authState = this._authState.asReadonly();
  readonly user = computed(() => this._authState().user);
  readonly isAuthenticated = computed(() => this._authState().isAuthenticated);
  readonly isLoading = computed(() => this._authState().isLoading);
  readonly isAdmin = computed(() => this._authState().user?.role === 'admin');

  // Legacy BehaviorSubject for compatibility (can be removed if not needed)
  private readonly authSubject = new BehaviorSubject<AuthState>(this._authState());
  public readonly auth$ = this.authSubject.asObservable();

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from localStorage
   */
  private initializeAuth(): void {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this._authState.update(state => ({
          ...state,
          user,
          token,
          isAuthenticated: true
        }));
        this.authSubject.next(this._authState());
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearAuth();
      }
    }
  }

  /**
   * Login user with email and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.setLoading(true);
    
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.setAuthState(response.data.user, response.data.token);
          }
        }),
        catchError((error) => {
          console.error('Login error:', error);
          return throwError(() => error);
        }),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Logout user and clear authentication state
   */
  logout(): void {
    this.clearAuth();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Get current user profile
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/auth/me`)
      .pipe(
        tap((user) => {
          this._authState.update(state => ({
            ...state,
            user
          }));
          this.authSubject.next(this._authState());
          localStorage.setItem('auth_user', JSON.stringify(user));
        }),
        catchError((error) => {
          console.error('Get current user error:', error);
          if (error.status === 401) {
            this.clearAuth();
          }
          return throwError(() => error);
        })
      );
  }

  /**
   * Update user profile
   */
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/auth/profile`, userData)
      .pipe(
        tap((updatedUser) => {
          this._authState.update(state => ({
            ...state,
            user: updatedUser
          }));
          this.authSubject.next(this._authState());
          localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        }),
        catchError((error) => {
          console.error('Update profile error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    return this._authState().user?.role === role;
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return this._authState().token;
  }

  /**
   * Check if token is expired (basic implementation)
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  // refresh token flow removed

  /**
   * Set authentication state
   */
  private setAuthState(user: User, token: string): void {
    this._authState.update(state => ({
      ...state,
      user,
      token,
      isAuthenticated: true
    }));
    
    this.authSubject.next(this._authState());
    
    // Store in localStorage
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  /**
   * Clear authentication state
   */
  private clearAuth(): void {
    this._authState.update(state => ({
      ...state,
      user: null,
      token: null,
      isAuthenticated: false
    }));
    
    this.authSubject.next(this._authState());
    
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  /**
   * Set loading state
   */
  private setLoading(isLoading: boolean): void {
    this._authState.update(state => ({
      ...state,
      isLoading
    }));
    this.authSubject.next(this._authState());
  }
}
