import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ApiService } from '../../../core/api';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly apiService = inject(ApiService);

  user = this.authService.user;
  stats = signal({
    totalBlogPosts: 0,
    totalTeamMembers: 0,
    totalServices: 0,
    totalConsultants: 0
  });
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  private loadDashboardStats(): void {
    this.isLoading.set(true);
    this.stats.set({
      totalBlogPosts: 0,
      totalTeamMembers: 0,
      totalServices: 0,
      totalConsultants: 0
    });
    this.isLoading.set(false);
  }
}
