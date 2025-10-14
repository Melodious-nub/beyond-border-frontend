import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { ApiService } from '../../../core/api';
import Swal from 'sweetalert2';

interface NotificationEmail {
  id: number;
  email: string;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: {
    notificationEmails?: NotificationEmail[];
  };
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

@Component({
  selector: 'app-email-notification',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './email-notification.html',
  styleUrl: './email-notification.scss'
})
export class EmailNotification implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  // Signals for reactive state management
  emails = signal<NotificationEmail[]>([]);
  isLoading = signal(false);
  isModalOpen = signal(false);
  isTestModalOpen = signal(false);
  isDeleting = signal<string | null>(null);

  // Forms
  emailForm: FormGroup;
  testEmailForm: FormGroup;

  constructor() {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.testEmailForm = this.fb.group({
      subject: ['System Alert', [Validators.required, Validators.minLength(3)]],
      message: ['This is a system notification message.', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.loadEmails();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEmails(): void {
    this.isLoading.set(true);
    this.apiService.getAllEmailsForNotification()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response: ApiResponse) => {
          if (response.success && response.data && response.data.notificationEmails) {
            this.emails.set(response.data.notificationEmails);
          } else {
            // Silently handle error for loading emails - no toast notification
            // Failed to load emails - handled silently
            this.emails.set([]);
          }
        },
        error: (error) => {
          // Error loading emails - handled silently
          // Silently handle error for loading emails - no toast notification
          this.emails.set([]);
        }
      });
  }

  refreshEmails(): void {
    this.loadEmails();
  }

  openAddEmailModal(): void {
    this.emailForm.reset();
    this.isModalOpen.set(true);
  }

  closeAddEmailModal(): void {
    this.isModalOpen.set(false);
    this.emailForm.reset();
  }

  addEmail(): void {
    if (this.emailForm.valid) {
      this.isLoading.set(true);
      const emailData = { email: this.emailForm.value.email };

      this.apiService.addEmailForNotification(emailData)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoading.set(false))
        )
        .subscribe({
          next: (response: ApiResponse) => {
            if (response.success) {
              this.showSuccess('Success', response.message);
              this.closeAddEmailModal();
              this.loadEmails(); // Reload the list
            } else {
              this.showFormErrors(response.errors || []);
            }
          },
          error: (error) => {
            // Error adding email - handled by user notification
            this.showError('Error', 'Failed to add email notification');
          }
        });
    } else {
      this.markFormGroupTouched(this.emailForm);
    }
  }

  deleteEmail(email: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${email} from notification list?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isDeleting.set(email);
        this.apiService.deleteEmailForNotification(email)
          .pipe(
            takeUntil(this.destroy$),
            finalize(() => this.isDeleting.set(null))
          )
          .subscribe({
            next: (response: ApiResponse) => {
              if (response.success) {
                this.showSuccess('Deleted', response.message);
                this.loadEmails(); // Reload the list
              } else {
                this.showError('Error', response.message);
              }
            },
            error: (error) => {
              // Error deleting email - handled by user notification
              this.showError('Error', 'Failed to delete email notification');
            }
          });
      }
    });
  }

  openTestEmailModal(): void {
    this.testEmailForm.reset({
      subject: 'System Alert',
      message: 'This is a system notification message.'
    });
    this.isTestModalOpen.set(true);
  }

  closeTestEmailModal(): void {
    this.isTestModalOpen.set(false);
    this.testEmailForm.reset();
  }

  sendTestEmail(): void {
    if (this.testEmailForm.valid) {
      Swal.fire({
        title: 'Send Test Email?',
        text: 'This will send a test notification to all registered email addresses.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, send it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.isLoading.set(true);
          const testData = this.testEmailForm.value;

          this.apiService.testEmailNotification(testData)
            .pipe(
              takeUntil(this.destroy$),
              finalize(() => this.isLoading.set(false))
            )
            .subscribe({
              next: (response: ApiResponse) => {
                if (response.success) {
                  this.showSuccess('Test Email Sent', response.message);
                  this.closeTestEmailModal();
                } else {
                  this.showError('Error', response.message);
                }
              },
              error: (error) => {
                // Error sending test email - handled by user notification
                this.showError('Error', 'Failed to send test email');
              }
            });
        }
      });
    } else {
      this.markFormGroupTouched(this.testEmailForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private showSuccess(title: string, message: string): void {
    Swal.fire({
      title,
      text: message,
      icon: 'success',
      confirmButtonColor: '#10b981',
      timer: 3000,
      timerProgressBar: true
    });
  }

  private showError(title: string, message: string): void {
    Swal.fire({
      title,
      text: message,
      icon: 'error',
      confirmButtonColor: '#ef4444'
    });
  }

  private showFormErrors(errors: Array<{ field: string; message: string }>): void {
    const errorMessages = errors.map(error => `${error.field}: ${error.message}`).join('\n');
    this.showError('Validation Error', errorMessages);
  }

  // Helper methods for template
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }
}
