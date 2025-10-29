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
  
  // Polling configuration
  private pollingInterval: any = null;
  private pollingFrequency = 30000; // 30 seconds
  private previousUnreadCount = 0;
  private isPolling = false;
  private errorCount = 0;
  private maxErrors = 5;

  // Reactive state
  public notifications$ = new BehaviorSubject<Notification[]>([]);
  public unreadCount$ = new BehaviorSubject<number>(0);
  public newNotification$ = new Subject<Notification>();
  public connectionStatus$ = new BehaviorSubject<'connected' | 'disconnected' | 'polling'>('disconnected');

  /**
   * Start polling for notifications
   */
  startPolling(token: string): void {
    if (this.isPolling) {
      console.log('📊 Polling already active');
      return;
    }

    console.log(`📊 Starting notification polling (interval: ${this.pollingFrequency / 1000}s)`);
    this.isPolling = true;
    this.connectionStatus$.next('polling');
    this.errorCount = 0;

    // Initial check immediately
    this.checkForNewNotifications();

    // Setup polling interval
    this.pollingInterval = setInterval(() => {
      this.checkForNewNotifications();
    }, this.pollingFrequency);

    // Setup visibility change handler to pause/resume polling
    this.setupVisibilityHandler();
  }

  /**
   * Stop polling for notifications
   */
  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
    this.connectionStatus$.next('disconnected');
    console.log('📊 Polling stopped');
  }

  /**
   * Check for new notifications
   */
  private checkForNewNotifications(): void {
    this.getUnreadCount().subscribe({
      next: (response) => {
        if (response.success) {
          const currentCount = response.data.count;
          
          // Update unread count
          this.unreadCount$.next(currentCount);
          
          // Check if there are new notifications
          if (currentCount > this.previousUnreadCount) {
            const newCount = currentCount - this.previousUnreadCount;
            console.log(`🔔 New notifications detected: ${newCount}`);
            
            // Fetch the latest notifications
            this.fetchLatestNotifications();
          }
          
          this.previousUnreadCount = currentCount;
          this.errorCount = 0; // Reset error count on success
          
          if (this.connectionStatus$.value !== 'polling') {
            this.connectionStatus$.next('polling');
          }
        }
      },
      error: (error) => {
        this.errorCount++;
        console.error(`❌ Polling error (${this.errorCount}/${this.maxErrors}):`, error.message);
        
        // If too many errors, increase polling interval
        if (this.errorCount >= this.maxErrors) {
          console.warn('⚠️ Too many polling errors, slowing down polling...');
          this.adjustPollingFrequency(60000); // Slow down to 1 minute
        }
      }
    });
  }

  /**
   * Fetch latest notifications when count increases
   */
  private fetchLatestNotifications(): void {
    this.getNotifications(1, 5).subscribe({
      next: (response) => {
        if (response.success) {
          const latestNotifications = response.data.notifications;
          
          // Find truly new notifications (not in current list)
          const currentIds = this.notifications$.value.map(n => n.id);
          const newNotifications = latestNotifications.filter(n => !currentIds.includes(n.id));
          
          // Emit each new notification
          newNotifications.forEach(notification => {
            this.newNotification$.next(notification);
          });
          
          // Update notifications list
          this.notifications$.next(latestNotifications);
        }
      },
      error: (error) => {
        console.error('❌ Error fetching latest notifications:', error);
      }
    });
  }

  /**
   * Setup visibility change handler to pause/resume polling
   */
  private setupVisibilityHandler(): void {
    if (typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Tab is hidden - slow down polling to 2 minutes
        console.log('👁️ Tab hidden, slowing polling to 2 minutes');
        this.adjustPollingFrequency(120000);
      } else {
        // Tab is visible - restore normal polling
        console.log('👁️ Tab visible, restoring normal polling');
        this.adjustPollingFrequency(30000);
        // Check immediately when tab becomes visible
        this.checkForNewNotifications();
      }
    });
  }

  /**
   * Adjust polling frequency
   */
  private adjustPollingFrequency(newFrequency: number): void {
    if (this.pollingFrequency === newFrequency) return;
    
    this.pollingFrequency = newFrequency;
    
    // Restart polling with new frequency
    if (this.isPolling) {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
      }
      
      this.pollingInterval = setInterval(() => {
        this.checkForNewNotifications();
      }, this.pollingFrequency);
      
      console.log(`⚙️ Polling frequency adjusted to ${this.pollingFrequency / 1000}s`);
    }
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
   * Increment unread count locally
   */
  private incrementUnreadCount(): void {
    this.unreadCount$.next(this.unreadCount$.value + 1);
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
          console.log(`📊 Initial unread count: ${count}`);
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

  /**
   * Get current polling frequency (for debugging)
   */
  getPollingFrequency(): number {
    return this.pollingFrequency;
  }
}

