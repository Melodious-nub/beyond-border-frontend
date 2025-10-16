import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, finalize } from 'rxjs';
import { ApiService } from '../../../../core/api';
import { CacheService } from '../../../../core/cache.service';

// Interfaces
interface WhyChooseUsItem {
  id: number;
  title: string;
  details: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface WhyChooseUsResponse {
  success: boolean;
  message: string;
  data: {
    whyChooseUsItems: WhyChooseUsItem[];
  };
}

@Component({
  selector: 'app-why-choose-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './why-choose-us.html',
  styleUrl: './why-choose-us.scss'
})
export class WhyChooseUs implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);
  private readonly cacheService = inject(CacheService);
  private readonly destroy$ = new Subject<void>();

  // Signals for reactive state management
  whyChooseUsItems = signal<WhyChooseUsItem[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  
  // Retry mechanism
  private retryCount = 0;
  private readonly maxRetries = 3;

  ngOnInit(): void {
    this.loadWhyChooseUsItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadWhyChooseUsItems(): void {
    // Check cache first
    const cachedData = this.cacheService.get<WhyChooseUsItem[]>('why_choose_us_items');
    if (cachedData && cachedData.length > 0) {
      this.whyChooseUsItems.set(cachedData);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.retryCount = 0; // Reset retry count for new load

    this.makeApiCall();
  }

  private makeApiCall(): void {
    this.apiService.getPublicWhyChooseUs()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response: any) => {
          if (response.success && response.data.whyChooseUsItems) {
            this.whyChooseUsItems.set(response.data.whyChooseUsItems);
            // Cache the data for 10 minutes
            this.cacheService.set('why_choose_us_items', response.data.whyChooseUsItems, 10 * 60 * 1000);
            this.retryCount = 0; // Reset retry count on success
          } else {
            this.handleError('Failed to load why choose us items');
          }
        },
        error: (error: any) => {
          this.handleError('Failed to load why choose us items. Please try again.');
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
      this.whyChooseUsItems.set([]);
      this.retryCount = 0; // Reset for future attempts
    }
  }
}
