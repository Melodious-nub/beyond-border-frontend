import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private title = inject(Title);
  private router = inject(Router);
  private readonly baseTitle = 'Beyond Border';

  constructor() {
    this.initializeTitleUpdates();
  }

  private initializeTitleUpdates(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.router.routerState.root),
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        map(route => route.snapshot.data)
      )
      .subscribe(data => {
        const pageTitle = data['title'];
        if (pageTitle) {
          this.setTitle(pageTitle);
        }
      });
  }

  setTitle(pageTitle: string): void {
    const fullTitle = `${this.baseTitle}: ${pageTitle}`;
    this.title.setTitle(fullTitle);
  }

  getTitle(): string {
    return this.title.getTitle();
  }

  resetTitle(): void {
    this.title.setTitle(this.baseTitle);
  }
}
