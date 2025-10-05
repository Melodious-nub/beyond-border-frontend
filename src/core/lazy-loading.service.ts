import { Injectable } from '@angular/core';
import { Observable, fromEvent, merge, of } from 'rxjs';
import { map, filter, take } from 'rxjs/operators';

/**
 * Lazy loading service for images and components
 */
@Injectable({
  providedIn: 'root'
})
export class LazyLoadingService {
  private readonly intersectionObserver: IntersectionObserver;

  constructor() {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const event = new CustomEvent('lazyLoad');
            element.dispatchEvent(event);
            this.intersectionObserver.unobserve(element);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );
  }

  /**
   * Observe element for lazy loading
   */
  observe(element: HTMLElement): void {
    this.intersectionObserver.observe(element);
  }

  /**
   * Unobserve element
   */
  unobserve(element: HTMLElement): void {
    this.intersectionObserver.unobserve(element);
  }

  /**
   * Lazy load image
   */
  lazyLoadImage(img: HTMLImageElement, src: string, placeholder?: string): Observable<boolean> {
    return new Observable(observer => {
      // Set placeholder if provided
      if (placeholder) {
        img.src = placeholder;
      }

      // Create lazy load event listener
      const lazyLoadHandler = () => {
        img.src = src;
        img.onload = () => {
          observer.next(true);
          observer.complete();
        };
        img.onerror = () => {
          observer.error(new Error('Failed to load image'));
        };
      };

      // Listen for lazy load event
      img.addEventListener('lazyLoad', lazyLoadHandler);

      // Cleanup
      return () => {
        img.removeEventListener('lazyLoad', lazyLoadHandler);
      };
    });
  }

  /**
   * Check if element is in viewport
   */
  isInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Create lazy loading directive for images
   */
  createLazyImageDirective(): any {
    return {
      onInit: (element: HTMLImageElement, binding: any) => {
        const src = binding.value;
        const placeholder = binding.placeholder || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+';
        
        this.observe(element);
        this.lazyLoadImage(element, src, placeholder).subscribe();
      },
      onDestroy: (element: HTMLImageElement) => {
        this.unobserve(element);
      }
    };
  }

  /**
   * Preload critical images
   */
  preloadImages(urls: string[]): Promise<void[]> {
    const promises = urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to preload image: ${url}`));
        img.src = url;
      });
    });

    return Promise.all(promises);
  }

  /**
   * Cleanup
   */
  ngOnDestroy(): void {
    this.intersectionObserver.disconnect();
  }
}
