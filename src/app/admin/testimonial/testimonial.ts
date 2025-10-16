import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../../../core/api';

// Interfaces
interface TestimonialItem {
  id: number;
  name: string;
  department?: string;
  designation?: string;
  description: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  pages: number;
}

interface TestimonialResponse {
  success: boolean;
  message: string;
  data: {
    items: TestimonialItem[];
    pagination: Pagination;
  };
}

@Component({
  selector: 'app-testimonial',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './testimonial.html',
  styleUrl: './testimonial.scss'
})
export class Testimonial implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  // Signals for reactive state management
  items = signal<TestimonialItem[]>([]);
  pagination = signal<Pagination>({
    page: 1,
    pageSize: 20,
    total: 0,
    pages: 0
  });
  isLoading = signal(false);
  isModalOpen = signal(false);
  isEditMode = signal(false);
  isSaving = signal(false);
  isDeleting = signal<number | null>(null);
  imagePreview = signal<string | null>(null);
  selectedItem = signal<TestimonialItem | null>(null);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // Form
  itemForm: FormGroup;

  constructor() {
    this.itemForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      department: [''],
      designation: [''],
      description: ['', [Validators.required, Validators.minLength(10)]],
      image: [null]
    });
  }

  ngOnInit(): void {
    this.loadItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadItems(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.apiService.getAllTestimonials(this.pagination().page, this.pagination().pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: TestimonialResponse) => {
          this.items.set(response.data.items);
          this.pagination.set(response.data.pagination);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.error.set('Failed to load testimonials. Please try again.');
          this.isLoading.set(false);
        }
      });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.pagination().pages) {
      this.pagination.update(p => ({ ...p, page }));
      this.loadItems();
    }
  }

  onPageSizeChange(pageSize: number): void {
    this.pagination.update(p => ({ ...p, pageSize, page: 1 }));
    this.loadItems();
  }

  openAddModal(): void {
    this.isEditMode.set(false);
    this.selectedItem.set(null);
    this.itemForm.reset();
    this.imagePreview.set(null);
    this.isModalOpen.set(true);
    this.clearMessages();
  }

  openEditModal(item: TestimonialItem): void {
    this.isEditMode.set(true);
    this.selectedItem.set(item);
    this.itemForm.patchValue({
      name: item.name,
      department: item.department || '',
      designation: item.designation || '',
      description: item.description
    });
    this.imagePreview.set(null);
    this.isModalOpen.set(true);
    this.clearMessages();
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.isEditMode.set(false);
    this.selectedItem.set(null);
    this.itemForm.reset();
    this.imagePreview.set(null);
    this.clearMessages();
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

      this.itemForm.patchValue({ image: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.itemForm.patchValue({ image: null });
    this.imagePreview.set(null);
  }

  saveItem(): void {
    if (this.itemForm.invalid) {
      this.markFormGroupTouched(this.itemForm);
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);
    this.success.set(null);

    const formData = new FormData();
    formData.append('name', this.itemForm.value.name);
    formData.append('description', this.itemForm.value.description);
    
    if (this.itemForm.value.department) {
      formData.append('department', this.itemForm.value.department);
    }
    if (this.itemForm.value.designation) {
      formData.append('designation', this.itemForm.value.designation);
    }
    
    if (this.itemForm.value.image) {
      formData.append('image', this.itemForm.value.image);
    }

    const apiCall = this.isEditMode() 
      ? this.apiService.updateTestimonial(this.selectedItem()!.id.toString(), formData)
      : this.apiService.createTestimonial(formData);

    apiCall
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.success.set(`Testimonial ${this.isEditMode() ? 'updated' : 'created'} successfully!`);
          this.loadItems();
          this.closeModal();
          this.isSaving.set(false);
        },
        error: (error) => {
          this.error.set(`Failed to ${this.isEditMode() ? 'update' : 'create'} testimonial. Please try again.`);
          this.isSaving.set(false);
        }
      });
  }

  deleteItem(item: TestimonialItem): void {
    if (!confirm(`Are you sure you want to delete "${item.name}"'s testimonial?`)) {
      return;
    }

    this.isDeleting.set(item.id);
    this.error.set(null);

    this.apiService.deleteTestimonial(item.id.toString())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.success.set('Testimonial deleted successfully!');
          this.loadItems();
          this.isDeleting.set(null);
        },
        error: (error) => {
          this.error.set('Failed to delete testimonial. Please try again.');
          this.isDeleting.set(null);
        }
      });
  }

  refreshData(): void {
    this.loadItems();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.itemForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.itemForm.get(fieldName);
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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const totalPages = this.pagination().pages;
    const currentPage = this.pagination().page;
    
    // Show up to 5 page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getPaginationRange(): { start: number; end: number } {
    const start = (this.pagination().page - 1) * this.pagination().pageSize + 1;
    const end = Math.min(this.pagination().page * this.pagination().pageSize, this.pagination().total);
    return { start, end };
  }

  // Expose Math object for template usage
  Math = Math;
}
