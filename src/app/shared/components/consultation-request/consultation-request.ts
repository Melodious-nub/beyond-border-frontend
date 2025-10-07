import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  formData: ConsultationRequestData = {
    name: '',
    email: '',
    description: ''
  };

  isSubmitting = false;

  onSubmit() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    // Emit the form data to parent component
    this.consultationSubmitted.emit({ ...this.formData });

    // Simulate API call delay
    setTimeout(() => {
      this.isSubmitting = false;
      this.resetForm();
    }, 2000);
  }

  private resetForm() {
    this.formData = {
      name: '',
      email: '',
      description: ''
    };
  }
}
