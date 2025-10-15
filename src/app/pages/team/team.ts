import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb';
import { TeamData } from "../../shared/components/team-data/team-data";

@Component({
  selector: 'app-team',
  imports: [BreadcrumbComponent, RouterModule, TeamData],
  templateUrl: './team.html',
  styleUrl: './team.scss'
})
export class Team implements OnInit, AfterViewInit {

  ngOnInit(): void {
    // Force scroll to top immediately with multiple methods
    this.forceScrollToTop();
  }

  ngAfterViewInit(): void {
    // Ensure scroll to top after view is initialized
    setTimeout(() => {
      this.forceScrollToTop();
    }, 0);
    
    // Additional timeout to override any smooth scrolling
    setTimeout(() => {
      this.forceScrollToTop();
    }, 100);
  }

  private forceScrollToTop(): void {
    // Method 1: Instant scroll
    window.scrollTo(0, 0);
    
    // Method 2: DOM scroll properties
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Method 3: Force instant scroll with behavior
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
    
    // Method 4: Additional fallback
    if (window.pageYOffset !== undefined) {
      window.pageYOffset = 0;
    }
    
    // Method 5: Force scroll on all possible elements
    const elements = [document.documentElement, document.body, document.querySelector('html')];
    elements.forEach(el => {
      if (el) {
        el.scrollTop = 0;
        el.scrollLeft = 0;
      }
    });
  }

}
