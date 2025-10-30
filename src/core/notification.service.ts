import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

export interface Notification {
  id: number;
  title: string;
  message: string;
  route: string;
  targetRoute: string;
  referenceId: number;
  type: 'contact' | 'consultant' | 'community';
  isRead: boolean;
  createdAt: string;
}

interface NotificationResponse {
  success: boolean;
  message: string;
  data: {
    notifications: Notification[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      pages: number;
    };
  };
}

interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notifications`;
  
  // Web Worker for polling (NOT throttled by browser!)
  private worker: Worker | null = null;
  private previousUnreadCount = 0;
  private isPolling = false;
  private lastNotificationCheck = 0;
  
  // Fallback polling for non-Web Worker browsers
  private fallbackInterval: any = null;

  // Reactive state - central source of truth
  public notifications$ = new BehaviorSubject<Notification[]>([]);
  public unreadCount$ = new BehaviorSubject<number>(0);
  public newNotification$ = new Subject<Notification>();
  public connectionStatus$ = new BehaviorSubject<'connected' | 'disconnected' | 'polling'>('disconnected');

  /**
   * Start polling using Web Worker (NOT throttled in background!)
   */
  startPolling(token: string): void {
    if (this.isPolling) {
      return;
    }

    if (typeof Worker !== 'undefined') {
      try {
        // Create Web Worker from public folder
        this.worker = new Worker('/notification-worker.js');
        
        // Listen for messages from worker
        this.worker.onmessage = (event) => {
          this.handleWorkerMessage(event.data);
        };

        this.worker.onerror = (error) => {
          console.error('❌ Web Worker error:', error);
          this.fallbackToRegularPolling(token);
        };

        // Start worker with API URL and token
        this.worker.postMessage({
          type: 'start',
          data: {
            apiUrl: environment.apiUrl,
            token: token
          }
        });

        this.isPolling = true;

        // Setup visibility handler for immediate checks
        this.setupVisibilityHandler();

      } catch (error) {
        console.error('❌ Failed to create Web Worker:', error);
        this.fallbackToRegularPolling(token);
      }
    } else {
      // Browser doesn't support Web Workers
      console.warn('⚠️ Web Workers not supported, using fallback polling');
      this.fallbackToRegularPolling(token);
    }
  }

  /**
   * Handle messages from Web Worker
   */
  private handleWorkerMessage(message: any): void {
    const { type, data, error, errorCount } = message;
    
    switch (type) {
      case 'started':
        this.connectionStatus$.next('polling');
        break;
        
      case 'stopped':
        this.connectionStatus$.next('disconnected');
        break;
        
      case 'unreadCount':
        this.handleUnreadCount(data);
        break;
        
      case 'error':
        if (errorCount >= 3) {
          console.error('❌ Worker polling error:', error);
        }
        break;
        
      case 'slowdown':
        console.warn('⚠️ Polling slowed down due to errors');
        break;
        
      case 'workerError':
        console.error('❌ Worker fatal error:', error);
        break;
    }
  }

  /**
   * Fallback to regular polling if Web Worker fails
   */
  private fallbackToRegularPolling(token: string): void {
    if (this.isPolling) return;
    
    this.isPolling = true;
    this.connectionStatus$.next('polling');
    
    const poll = () => {
      this.checkForNewNotifications();
    };
    
    // Initial check
    poll();
    
    // Poll every 30 seconds (will be throttled in background but better than nothing)
    this.fallbackInterval = setInterval(poll, 30000);
    
    // Setup visibility handler for immediate checks
    this.setupVisibilityHandler();
  }

  /**
   * Stop polling
   */
  stopPolling(): void {
    if (this.worker) {
      this.worker.postMessage({ type: 'stop' });
      this.worker.terminate();
      this.worker = null;
    }
    
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
    
    this.isPolling = false;
    this.connectionStatus$.next('disconnected');
  }

  /**
   * Handle unread count update from worker or fallback polling
   */
  private handleUnreadCount(currentCount: number): void {
    // Update unread count
    this.unreadCount$.next(currentCount);
    
    // Check if there are NEW notifications (count increased)
    if (currentCount > this.previousUnreadCount) {
      const newCount = currentCount - this.previousUnreadCount;
      
      // Fetch latest notifications to update the list and emit new ones
      this.fetchLatestNotifications();
    }
    
    this.previousUnreadCount = currentCount;
    
    if (this.connectionStatus$.value !== 'polling') {
      this.connectionStatus$.next('polling');
    }
  }

  /**
   * Check for new notifications (used by fallback polling and visibility handler)
   */
  private checkForNewNotifications(): void {
    this.getUnreadCount().subscribe({
      next: (response) => {
        if (response.success) {
          this.handleUnreadCount(response.data.count);
        }
      },
      error: (error) => {
        // Silent fail to avoid console spam
      }
    });
  }

  /**
   * Fetch latest notifications when count increases
   * CRITICAL: This maintains proper ordering and emits new notifications
   */
  private fetchLatestNotifications(): void {
    // Get top 10 most recent notifications
    this.getNotifications(1, 10).subscribe({
      next: (response) => {
        if (response.success) {
          const latestNotifications = response.data.notifications;
          
          // Get current notification IDs to find truly new ones
          const currentIds = this.notifications$.value.map(n => n.id);
          
          // Replace entire list with latest to ensure proper ordering
          this.notifications$.next(latestNotifications);
          
          // Find notifications that are truly new (not in previous list AND recent)
          const newNotifications = latestNotifications.filter(n => {
            const isNew = !currentIds.includes(n.id);
            const isRecent = new Date(n.createdAt).getTime() > (Date.now() - 60000); // Last minute
            const isUnread = !n.isRead;
            return isNew && isRecent && isUnread;
          });
          
          // Emit each new notification for sound/push notification
          newNotifications.forEach(notification => {
            this.newNotification$.next(notification);
          });
        }
      },
      error: (error) => {
        console.error('❌ Error fetching latest notifications:', error);
      }
    });
  }

  /**
   * Setup visibility handler - check immediately when tab becomes visible
   */
  private setupVisibilityHandler(): void {
    if (typeof document === 'undefined') return;

    // Check when tab becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Tab just became visible - check immediately for missed notifications
        this.checkForNewNotifications();
      }
    });
    
    // Also check on window focus
    window.addEventListener('focus', () => {
      if (!document.hidden) {
        this.checkForNewNotifications();
      }
    });
    
    // Check when connection is restored
    window.addEventListener('online', () => {
      this.checkForNewNotifications();
    });
  }

  /**
   * Get notifications with pagination
   */
  getNotifications(page: number = 1, pageSize: number = 20, unreadOnly: boolean = false): Observable<NotificationResponse> {
    const params: any = { page: page.toString(), pageSize: pageSize.toString() };
    if (unreadOnly) {
      params.unreadOnly = 'true';
    }
    return this.http.get<NotificationResponse>(this.apiUrl, { params });
  }

  /**
   * Get unread notification count
   */
  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(`${this.apiUrl}/unread-count`);
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/read`, {});
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<any> {
    return this.http.patch(`${this.apiUrl}/mark-all-read`, {});
  }

  /**
   * Delete notification
   */
  deleteNotification(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Decrement unread count locally
   */
  decrementUnreadCount(): void {
    const current = this.unreadCount$.value;
    if (current > 0) {
      this.unreadCount$.next(current - 1);
      this.previousUnreadCount = Math.max(0, this.previousUnreadCount - 1);
    }
  }

  /**
   * Reset unread count to zero
   */
  resetUnreadCount(): void {
    this.unreadCount$.next(0);
    this.previousUnreadCount = 0;
  }

  /**
   * Load initial unread count
   */
  loadUnreadCount(): void {
    this.getUnreadCount().subscribe({
      next: (response) => {
        if (response.success) {
          const count = response.data.count;
          this.unreadCount$.next(count);
          this.previousUnreadCount = count;
        }
      },
      error: (error) => {
        console.error('❌ Error loading unread count:', error);
      }
    });
  }

  /**
   * Get current polling status
   */
  isPollingActive(): boolean {
    return this.isPolling;
  }
}
