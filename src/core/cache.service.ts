import { Injectable } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Cache service for API responses and computed values
 */
@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private readonly cache = new Map<string, CacheItem<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached data
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Set cached data
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Delete cached data
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired cache entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Cache observable with TTL
   */
  cacheObservable<T>(
    key: string,
    observable: Observable<T>,
    ttl: number = this.defaultTTL
  ): Observable<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      return of(cached);
    }

    return observable.pipe(
      tap(data => this.set(key, data, ttl))
    );
  }

  /**
   * Cache with refresh strategy
   */
  cacheWithRefresh<T>(
    key: string,
    observable: Observable<T>,
    ttl: number = this.defaultTTL,
    refreshThreshold: number = 0.8 // Refresh when 80% of TTL has passed
  ): Observable<T> {
    const cached = this.get<T>(key);
    const item = this.cache.get(key);
    
    if (cached !== null && item) {
      const age = Date.now() - item.timestamp;
      const refreshTime = item.ttl * refreshThreshold;
      
      if (age < refreshTime) {
        return of(cached);
      } else {
        // Return cached data immediately, but refresh in background
        observable.pipe(
          tap(data => this.set(key, data, ttl))
        ).subscribe();
        return of(cached);
      }
    }

    return observable.pipe(
      tap(data => this.set(key, data, ttl))
    );
  }

  /**
   * Generate cache key from parameters
   */
  generateKey(prefix: string, params: any): string {
    const paramString = JSON.stringify(params);
    return `${prefix}:${btoa(paramString)}`;
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Auto-cleanup expired entries every minute
   */
  startAutoCleanup(): void {
    timer(0, 60000).subscribe(() => {
      this.clearExpired();
    });
  }

  /**
   * Cache team members with specific TTL
   */
  cacheTeamMembers(teamMembers: any[], ttl: number = 10 * 60 * 1000): void {
    this.set('team_members', teamMembers, ttl);
  }

  /**
   * Get cached team members
   */
  getCachedTeamMembers(): any[] | null {
    return this.get<any[]>('team_members');
  }

  /**
   * Cache with automatic refresh for team data
   */
  cacheTeamDataWithRefresh<T>(
    key: string,
    observable: Observable<T>,
    ttl: number = 10 * 60 * 1000,
    refreshThreshold: number = 0.7
  ): Observable<T> {
    return this.cacheWithRefresh(key, observable, ttl, refreshThreshold);
  }
}
