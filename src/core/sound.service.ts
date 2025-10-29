import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private audio: HTMLAudioElement | null = null;
  private soundEnabled = true;

  constructor() {
    this.initializeAudio();
    this.loadSoundPreference();
  }

  /**
   * Initialize audio element
   */
  private initializeAudio(): void {
    try {
      this.audio = new Audio('/assets/sounds/notification.wav');
      this.audio.volume = 0.5; // 50% volume
    } catch (error) {
      // Silently handle errors
    }
  }

  /**
   * Load sound preference from localStorage
   */
  private loadSoundPreference(): void {
    const preference = localStorage.getItem('notificationSoundEnabled');
    if (preference !== null) {
      this.soundEnabled = preference === 'true';
    }
  }

  /**
   * Play notification sound
   */
  playNotificationSound(): void {
    if (!this.soundEnabled || !this.audio) {
      return;
    }

    try {
      // Reset audio to start
      this.audio.currentTime = 0;
      
      // Play sound
      const playPromise = this.audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Silently handle playback errors
        });
      }
    } catch (error) {
      // Silently handle errors
    }
  }

  /**
   * Enable notification sound
   */
  enableSound(): void {
    this.soundEnabled = true;
    localStorage.setItem('notificationSoundEnabled', 'true');
  }

  /**
   * Disable notification sound
   */
  disableSound(): void {
    this.soundEnabled = false;
    localStorage.setItem('notificationSoundEnabled', 'false');
  }

  /**
   * Toggle notification sound
   */
  toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('notificationSoundEnabled', this.soundEnabled.toString());
    return this.soundEnabled;
  }

  /**
   * Check if sound is enabled
   */
  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.audio?.volume || 0.5;
  }
}

