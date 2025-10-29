import { Injectable } from '@angular/core';
import type { Notification as AppNotification } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private permissionGranted = false;

  constructor() {
    this.checkPermission();
  }

  /**
   * Check if notification permission is granted
   */
  private checkPermission(): void {
    if (!('Notification' in window)) {
      return;
    }

    this.permissionGranted = Notification.permission === 'granted';
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
      return this.permissionGranted;
    }

    return false;
  }

  /**
   * Show browser push notification
   */
  async showNotification(notification: AppNotification): Promise<void> {
    if (!this.permissionGranted) {
      const granted = await this.requestPermission();
      if (!granted) {
        return;
      }
    }

    try {
      const title = notification.title;
      const options: NotificationOptions = {
        body: notification.message,
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: `notification-${notification.id}`,
        requireInteraction: false,
        data: {
          id: notification.id,
          targetRoute: notification.targetRoute,
          type: notification.type
        }
      };

      const browserNotification = new Notification(title, options);

      // Handle notification click
      browserNotification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        // Navigate to target route
        if (notification.targetRoute) {
          window.location.href = notification.targetRoute;
        }
        
        browserNotification.close();
      };

      // Auto close after 10 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 10000);
    } catch (error) {
      // Silently handle errors
    }
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  /**
   * Check if permission is granted
   */
  isPermissionGranted(): boolean {
    return this.permissionGranted;
  }
}

