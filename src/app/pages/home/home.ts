import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ConsultationRequestComponent, ConsultationRequestData } from '../../shared/components/consultation-request/consultation-request';
import { TeamData } from "../../shared/components/team-data/team-data";
import { WhyChooseUs } from "../../shared/components/why-choose-us/why-choose-us";
import { TestimonialsData } from "../../shared/components/testimonials-data/testimonials-data";

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, ConsultationRequestComponent, TeamData, WhyChooseUs, TestimonialsData],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {
  // Placeholder state since external content APIs were removed
  featuredServices = signal<any[]>([]);
  latestBlogPosts = signal<any[]>([]);
  isLoading = signal(false);
}
