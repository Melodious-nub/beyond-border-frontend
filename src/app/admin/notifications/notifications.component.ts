import { Component, OnInit, OnDestroy, signal, inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService, Notification } from '../../../core/notification.service';
import { PushNotificationService } from '../../../core/push-notification.service';
import { SoundService } from '../../../core/sound.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private pushNotificationService = inject(PushNotificationService);
  private soundService = inject(SoundService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  private destroy$ = new Subject<void>();

  // Signals
  notifications = signal<Notification[]>([]);
  unreadCount = signal(0);
  isDropdownOpen = signal(false);
  isLoading = signal(false);
  hasMore = signal(true);

  // Pagination
  currentPage = 1;
  pageSize = 20;
  totalPages = 1;

  ngOnInit(): void {
    this.setupNotificationListener();
    this.loadUnreadCount();
    this.requestNotificationPermission();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Setup notification listeners - sync with service state
   */
  private setupNotificationListener(): void {
    // Subscribe to notification list updates from service (central source of truth)
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notifications) => {
        // Only update if we're showing the first page or dropdown is closed
        if (this.currentPage === 1 || !this.isDropdownOpen()) {
          this.notifications.set(notifications);
        }
      });

    // Listen for NEW notifications (for sound/push notification only)
    this.notificationService.newNotification$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notification) => {
        this.handleNewNotification(notification);
      });

    // Listen for unread count updates
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe((count) => {
        this.unreadCount.set(count);
      });
  }

  /**
   * Handle new notification - play sound and show push notification
   * DON'T manually update list - service handles that
   */
  private handleNewNotification(notification: Notification): void {
    // Play sound
    this.soundService.playNotificationSound();

    // Show browser push notification if window not focused
    if (!document.hasFocus()) {
      this.pushNotificationService.showNotification(notification);
    }
  }

  /**
   * Load unread count
   */
  private loadUnreadCount(): void {
    this.notificationService.loadUnreadCount();
  }

  /**
   * Request browser notification permission
   */
  private async requestNotificationPermission(): Promise<void> {
    if (this.pushNotificationService.isSupported()) {
      await this.pushNotificationService.requestPermission();
    }
  }

  /**
   * Toggle dropdown - always refresh when opening
   */
  toggleDropdown(): void {
    const isOpen = !this.isDropdownOpen();
    this.isDropdownOpen.set(isOpen);

    if (isOpen) {
      // Always refresh when opening to get latest notifications in proper order
      this.currentPage = 1;
      this.loadNotifications();
    }
  }

  /**
   * Close dropdown
   */
  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  /**
   * Load notifications
   */
  loadNotifications(): void {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.notificationService.getNotifications(this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            const newNotifications = response.data.notifications;
            
            if (this.currentPage === 1) {
              // First page - replace all notifications
              this.notifications.set(newNotifications);
            } else {
              // Subsequent pages - append to existing list
              const currentNotifications = this.notifications();
              this.notifications.set([...currentNotifications, ...newNotifications]);
            }
            
            this.totalPages = response.data.pagination.pages;
            this.hasMore.set(this.currentPage < this.totalPages);
          }
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
  }

  /**
   * Load more notifications
   */
  loadMore(): void {
    if (this.hasMore() && !this.isLoading()) {
      this.currentPage++;
      this.loadNotifications();
    }
  }

  /**
   * Mark notification as read and navigate
   */
  onNotificationClick(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Update local state
            const updatedNotifications = this.notifications().map(n =>
              n.id === notification.id ? { ...n, isRead: true } : n
            );
            this.notifications.set(updatedNotifications);
            this.notificationService.decrementUnreadCount();
          }
        });
    }

    // Navigate to target route
    this.closeDropdown();
    this.router.navigate([notification.targetRoute]);
  }

  /**
   * Mark all as read
   */
  markAllAsRead(): void {
    this.notificationService.markAllAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Update local state
          const updatedNotifications = this.notifications().map(n => ({ ...n, isRead: true }));
          this.notifications.set(updatedNotifications);
          this.notificationService.resetUnreadCount();
        }
      });
  }

  /**
   * Get notification icon based on type
   */
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'contact':
        return 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z';
      case 'consultant':
        return 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z';
      case 'community':
        return 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z';
      default:
        return 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9';
    }
  }

  /**
   * Get notification icon color
   */
  getNotificationIconColor(type: string): string {
    switch (type) {
      case 'contact':
        return 'text-blue-500';
      case 'consultant':
        return 'text-green-500';
      case 'community':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  }

  /**
   * Format timestamp
   */
  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  }

  /**
   * Close dropdown when clicking outside
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }
}
