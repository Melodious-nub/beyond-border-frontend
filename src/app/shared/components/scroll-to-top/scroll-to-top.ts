import { Component, signal, HostListener, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-scroll-to-top',
  templateUrl: './scroll-to-top.html',
  styleUrl: './scroll-to-top.scss'
})
export class ScrollToTopComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private routerSubscription?: Subscription;
  
  isVisible = signal(false);
  private readonly scrollThreshold = 300; // Show button after scrolling 300px

  ngOnInit(): void {
    // Listen to route changes and scroll to top
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Use multiple timeouts to ensure scroll works
        setTimeout(() => {
          this.scrollToTop();
        }, 0);
        
        // Additional timeout for slower route changes
        setTimeout(() => {
          this.scrollToTop();
        }, 100);
        
        // Final timeout for complex route changes
        setTimeout(() => {
          this.scrollToTop();
        }, 300);
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isVisible.set(scrollTop > this.scrollThreshold);
  }

  scrollToTop(smooth: boolean = true): void {
    // Multiple methods to ensure scroll to top works
    try {
      if (smooth) {
        // Method 1: Modern smooth scroll
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      } else {
        // Method 1: Instant scroll for button clicks
        window.scrollTo(0, 0);
      }
      
      // Method 2: Fallback for older browsers
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Method 3: Additional fallback
      if (window.pageYOffset !== undefined) {
        window.pageYOffset = 0;
      }
    } catch (error) {
      // Method 4: Last resort - instant scroll
      window.scrollTo(0, 0);
    }
  }
}
