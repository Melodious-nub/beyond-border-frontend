import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ConsultationRequestComponent, ConsultationRequestData } from '../../shared/components/consultation-request/consultation-request';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, ConsultationRequestComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {
  // Placeholder state since external content APIs were removed
  featuredServices = signal<any[]>([]);
  latestBlogPosts = signal<any[]>([]);
  isLoading = signal(false);

  onConsultationSubmitted(data: ConsultationRequestData) {
    console.log('Consultation request submitted:', data);
    // Here you can handle the form submission
    // For example, send to API, show success message, etc.
  }
}
