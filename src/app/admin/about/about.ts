import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../../../core/api';

// Interfaces
interface AboutUs {
  id: number;
  description: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface AboutResponse {
  success: boolean;
  message: string;
  data: {
    aboutUs: AboutUs;
  };
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  // Signals for reactive state management
  aboutData = signal<AboutUs | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  imagePreview = signal<string | null>(null);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // Form
  aboutForm: FormGroup;

  constructor() {
    this.aboutForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(10)]],
      image: [null]
    });
  }

  ngOnInit(): void {
    this.loadAboutData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAboutData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiService.getAboutUs()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: AboutResponse) => {
          this.aboutData.set(response.data.aboutUs);
          this.aboutForm.patchValue({
            description: response.data.aboutUs.description
          });
          this.isLoading.set(false);
        },
        error: (error) => {
          this.error.set('Failed to load about data. Please try again.');
          this.isLoading.set(false);
        }
      });
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.error.set('Please select a valid image file.');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.error.set('Image size should not exceed 5MB.');
        return;
      }

      this.aboutForm.patchValue({ image: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.aboutForm.patchValue({ image: null });
    this.imagePreview.set(null);
  }

  saveAbout(): void {
    if (this.aboutForm.invalid) {
      this.markFormGroupTouched(this.aboutForm);
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);
    this.success.set(null);

    const formData = new FormData();
    formData.append('description', this.aboutForm.value.description);
    
    if (this.aboutForm.value.image) {
      formData.append('image', this.aboutForm.value.image);
    }

    this.apiService.postAboutUs(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.success.set('About information updated successfully!');
          this.loadAboutData();
          this.aboutForm.patchValue({ image: null });
          this.imagePreview.set(null);
          this.isSaving.set(false);
        },
        error: (error) => {
          this.error.set('Failed to update about information. Please try again.');
          this.isSaving.set(false);
        }
      });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.aboutForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.aboutForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  clearMessages(): void {
    this.error.set(null);
    this.success.set(null);
  }
}
