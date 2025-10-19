import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/api';
import Swal from 'sweetalert2';

export interface ConsultationRequestData {
  name: string;
  email: string;
  description: string;
}

@Component({
  selector: 'app-consultation-request',
  imports: [CommonModule, FormsModule],
  templateUrl: './consultation-request.html',
  styleUrl: './consultation-request.scss'
})
export class ConsultationRequestComponent {
  @Output() consultationSubmitted = new EventEmitter<ConsultationRequestData>();
  
  private apiService = inject(ApiService);

  formData: ConsultationRequestData = {
    name: '',
    email: '',
    description: ''
  };

  isSubmitting = false;

  getDescriptionLength(): number {
    return this.formData.description ? this.formData.description.length : 0;
  }

  isDescriptionValid(): boolean {
    const length = this.getDescriptionLength();
    return length >= 10 && length <= 2000;
  }

  shouldShowValidation(): boolean {
    // Only show validation if field has been touched AND is dirty (user has interacted and changed value)
    // This prevents showing validation errors on initial load or just focus without typing
    return this.formData.description.length > 0 && !this.isDescriptionValid();
  }

  onSubmit() {
    if (this.isSubmitting) return;

    // Check if form is valid before proceeding
    if (!this.formData.name.trim() || !this.formData.email.trim() || !this.formData.description.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all required fields before submitting.',
        confirmButtonColor: '#A50034'
      });
      return;
    }

    // Check description length validation
    if (!this.isDescriptionValid()) {
      const length = this.getDescriptionLength();
      let message = '';
      if (length < 10) {
        message = 'Description must be at least 10 characters long.';
      } else if (length > 2000) {
        message = 'Description must not exceed 2000 characters.';
      }
      
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Description',
        text: message,
        confirmButtonColor: '#A50034'
      });
      return;
    }

    this.isSubmitting = true;

    // Add delay before API call to simulate processing
    setTimeout(() => {
      // Call the API
      this.apiService.contactUs(this.formData).subscribe({
        next: (response: any) => {
          this.isSubmitting = false;
          
          if (response.success) {
            // Show success message
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: response.message || 'Your message has been sent successfully!',
              confirmButtonColor: '#A50034'
            });
            
            // Emit the form data to parent component
            this.consultationSubmitted.emit({ ...this.formData });
            
            // Reset form
            this.resetForm();
          } else {
            // Show error message
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.message || 'Something went wrong. Please try again.',
              confirmButtonColor: '#A50034'
            });
          }
        },
        error: (error: any) => {
          this.isSubmitting = false;
          
          // Show error message
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while sending your request. Please try again.',
            confirmButtonColor: '#A50034'
          });
        }
      });
    }, 1500); // 1.5 second delay
  }

  private resetForm() {
    this.formData = {
      name: '',
      email: '',
      description: ''
    };
  }
}
