import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {
  // Placeholder state since external content APIs were removed
  featuredServices = signal<any[]>([]);
  latestBlogPosts = signal<any[]>([]);
  isLoading = signal(false);
}
