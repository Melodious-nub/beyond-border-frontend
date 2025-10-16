import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, finalize } from 'rxjs';
import { ApiService } from '../../../../core/api';
import { CacheService } from '../../../../core/cache.service';

// Interfaces
interface Testimonial {
  id: number;
  name: string;
  department: string;
  designation: string;
  description: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface TestimonialsResponse {
  success: boolean;
  message: string;
  data: {
    testimonials: Testimonial[];
  };
}

@Component({
  selector: 'app-testimonials-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials-data.html',
  styleUrl: './testimonials-data.scss'
})
export class TestimonialsData implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);
  private readonly cacheService = inject(CacheService);
  private readonly destroy$ = new Subject<void>();

  // Signals for reactive state management
  testimonials = signal<Testimonial[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  
  // Retry mechanism
  private retryCount = 0;
  private readonly maxRetries = 3;

  ngOnInit(): void {
    this.loadTestimonials();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTestimonials(): void {
    // Check cache first
    const cachedData = this.cacheService.get<Testimonial[]>('testimonials');
    if (cachedData && cachedData.length > 0) {
      this.testimonials.set(cachedData);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.retryCount = 0; // Reset retry count for new load

    this.makeApiCall();
  }

  private makeApiCall(): void {
    this.apiService.getPublicTestimonials()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response: any) => {
          if (response.success && response.data.testimonials) {
            this.testimonials.set(response.data.testimonials);
            // Cache the data for 10 minutes
            this.cacheService.set('testimonials', response.data.testimonials, 10 * 60 * 1000);
            this.retryCount = 0; // Reset retry count on success
          } else {
            this.handleError('Failed to load testimonials');
          }
        },
        error: (error: any) => {
          this.handleError('Failed to load testimonials. Please try again.');
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
      this.testimonials.set([]);
      this.retryCount = 0; // Reset for future attempts
    }
  }
}
