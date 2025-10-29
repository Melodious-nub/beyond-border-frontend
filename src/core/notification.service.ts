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
  
  // SSE connection
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private abortController: AbortController | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private reconnectTimer: any = null;

  // Reactive state
  public notifications$ = new BehaviorSubject<Notification[]>([]);
  public unreadCount$ = new BehaviorSubject<number>(0);
  public newNotification$ = new Subject<Notification>();
  public connectionStatus$ = new BehaviorSubject<'connected' | 'disconnected' | 'connecting'>('disconnected');

  /**
   * Connect to SSE using fetch API for better header control
   */
  async connectToSSE(token: string): Promise<void> {
    if (this.reader) {
      return;
    }

    this.connectionStatus$.next('connecting');

    try {
      this.abortController = new AbortController();

      const response = await fetch(`${this.apiUrl}/stream`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream'
        },
        signal: this.abortController.signal
      });

      if (!response.ok) {
        throw new Error(`Failed to connect to SSE stream: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      this.reader = reader;
      this.connectionStatus$.next('connected');
      this.reconnectAttempts = 0;

      this.readStream(reader);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        this.handleDisconnect(token);
      }
    }
  }

  /**
   * Read SSE stream
   */
  private async readStream(reader: ReadableStreamDefaultReader<Uint8Array>): Promise<void> {
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            try {
              const event = JSON.parse(data);
              this.handleSSEEvent(event);
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        this.handleDisconnect(localStorage.getItem('token') || '');
      }
    }
  }

  /**
   * Handle SSE events
   */
  private handleSSEEvent(event: any): void {
    switch (event.type) {
      case 'connected':
        break;

      case 'notification':
        const notification = event.data as Notification;
        this.newNotification$.next(notification);
        this.incrementUnreadCount();
        break;

      case 'unread_count':
        this.unreadCount$.next(event.data.count);
        break;

      case 'heartbeat':
        break;

      default:
        break;
    }
  }

  /**
   * Handle disconnect and attempt reconnection
   */
  private handleDisconnect(token: string): void {
    this.connectionStatus$.next('disconnected');
    this.closeConnection();

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      
      this.reconnectTimer = setTimeout(() => {
        if (token) {
          this.connectToSSE(token);
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  /**
   * Close SSE connection
   */
  closeConnection(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    if (this.reader) {
      this.reader.cancel();
      this.reader = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.connectionStatus$.next('disconnected');
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
    }
  }

  /**
   * Reset unread count to zero
   */
  resetUnreadCount(): void {
    this.unreadCount$.next(0);
  }

  /**
   * Load initial unread count
   */
  loadUnreadCount(): void {
    this.getUnreadCount().subscribe({
      next: (response) => {
        if (response.success) {
          this.unreadCount$.next(response.data.count);
        }
      }
    });
  }
}

