import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header';
import { FooterComponent } from './shared/components/footer/footer';
import { ScrollToTopComponent } from './shared/components/scroll-to-top/scroll-to-top';
import { TitleService } from '../core/title.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ScrollToTopComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {
  protected readonly title = signal('Beyond Border');
  protected readonly router = inject(Router);
  private readonly titleService = inject(TitleService);

  ngOnInit(): void {
    // Initialize the title service to start listening for route changes
    // The service will automatically update titles based on route data
  }
}
