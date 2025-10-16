import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, finalize } from 'rxjs';
import { ApiService } from '../../../../core/api';
import { CacheService } from '../../../../core/cache.service';

// Interfaces
interface AboutUs {
  id: number;
  description: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface AboutUsResponse {
  success: boolean;
  message: string;
  data: {
    aboutUs: AboutUs;
  };
}

@Component({
  selector: 'app-about-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-data.html',
  styleUrl: './about-data.scss'
})
export class AboutData implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);
  private readonly cacheService = inject(CacheService);
  private readonly destroy$ = new Subject<void>();

  // Signals for reactive state management
  aboutUs = signal<AboutUs | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  
  // Retry mechanism
  private retryCount = 0;
  private readonly maxRetries = 3;

  ngOnInit(): void {
    this.loadAboutUs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAboutUs(): void {
    // Check cache first
    const cachedData = this.cacheService.get<AboutUs>('about_us');
    if (cachedData) {
      this.aboutUs.set(cachedData);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.retryCount = 0; // Reset retry count for new load

    this.makeApiCall();
  }

  private makeApiCall(): void {
    this.apiService.getPublicAboutUs()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response: any) => {
          if (response.success && response.data.aboutUs) {
            this.aboutUs.set(response.data.aboutUs);
            // Cache the data for 10 minutes
            this.cacheService.set('about_us', response.data.aboutUs, 10 * 60 * 1000);
            this.retryCount = 0; // Reset retry count on success
          } else {
            this.handleError('Failed to load about us information');
          }
        },
        error: (error: any) => {
          this.handleError('Failed to load about us information. Please try again.');
        }
      });
  }

  private handleError(errorMessage: string): void {
    this.retryCount++;
    
    if (this.retryCount < this.maxRetries) {
      // Retry after a short delay
      setTimeout(() => {
        this.makeApiCall();
      }, 1000 * this.retryCount); // Exponential backoff: 1s, 2s, 3s
    } else {
      // Max retries reached, show error
      this.error.set(errorMessage);
      this.aboutUs.set(null);
      this.retryCount = 0; // Reset for future attempts
    }
  }

  formatDescription(description: string | undefined): string {
    if (!description) return '';
    
    // Replace \r\n and \n with <br> tags for proper line breaks
    return description
      .replace(/\r\n/g, '<br>')
      .replace(/\n/g, '<br>')
      .replace(/\r/g, '<br>');
  }
}
