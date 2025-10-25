import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../../../core/api';
import Swal from 'sweetalert2';

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

    this.apiService.getAllTestimonials(this.pagination().page, this.pagination().pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: TestimonialResponse) => {
          this.items.set(response.data.items);
          this.pagination.set(response.data.pagination);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.isLoading.set(false);
          // Error handled silently for loading - optimistic updates handle user actions
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
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.isEditMode.set(false);
    this.selectedItem.set(null);
    this.itemForm.reset();
    this.imagePreview.set(null);
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          title: 'Invalid File',
          text: 'Please select a valid image file.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          title: 'File Too Large',
          text: 'Image size should not exceed 5MB.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
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

    // Optimistic update
    const newItem: TestimonialItem = {
      id: this.isEditMode() ? this.selectedItem()!.id : Date.now(), // Temporary ID for new items
      name: this.itemForm.value.name,
      department: this.itemForm.value.department || undefined,
      designation: this.itemForm.value.designation || undefined,
      description: this.itemForm.value.description,
      image: this.imagePreview() || this.selectedItem()?.image || undefined,
      createdAt: this.isEditMode() ? this.selectedItem()!.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this.isEditMode()) {
      // Optimistic update for edit
      this.items.update(items => 
        items.map(item => item.id === this.selectedItem()!.id ? newItem : item)
      );
    } else {
      // Optimistic add for create
      this.items.update(items => [newItem, ...items]);
      this.pagination.update(p => ({ ...p, total: p.total + 1 }));
    }

    const apiCall = this.isEditMode() 
      ? this.apiService.updateTestimonial(this.selectedItem()!.id.toString(), formData)
      : this.apiService.createTestimonial(formData);

    apiCall
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isSaving.set(false);
          this.closeModal();
          
          // Show success message with SweetAlert2
          Swal.fire({
            title: 'Success!',
            text: `Testimonial ${this.isEditMode() ? 'updated' : 'created'} successfully!`,
            icon: 'success',
            confirmButtonColor: '#10b981',
            timer: 3000,
            timerProgressBar: true
          });

          // Update with actual data from server
          if (this.isEditMode()) {
            this.items.update(items => 
              items.map(item => item.id === this.selectedItem()!.id ? response.data.testimonial : item)
            );
          } else {
            this.items.update(items => 
              items.map(item => item.id === newItem.id ? response.data.testimonial : item)
            );
          }
        },
        error: (error) => {
          this.isSaving.set(false);
          
          // Revert optimistic update on error
          if (this.isEditMode()) {
            this.items.update(items => 
              items.map(item => item.id === this.selectedItem()!.id ? this.selectedItem()! : item)
            );
          } else {
            this.items.update(items => items.filter(item => item.id !== newItem.id));
            this.pagination.update(p => ({ ...p, total: p.total - 1 }));
          }

          // Show error message with SweetAlert2
          Swal.fire({
            title: 'Error!',
            text: `Failed to ${this.isEditMode() ? 'update' : 'create'} testimonial. Please try again.`,
            icon: 'error',
            confirmButtonColor: '#ef4444'
          });
        }
      });
  }

  deleteItem(item: TestimonialItem): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete "${item.name}"'s testimonial?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isDeleting.set(item.id);

        // Optimistic delete
        const originalItems = [...this.items()];
        this.items.update(items => items.filter(i => i.id !== item.id));
        this.pagination.update(p => ({ ...p, total: p.total - 1 }));

        this.apiService.deleteTestimonial(item.id.toString())
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              this.isDeleting.set(null);
              
              // Show success message with SweetAlert2
              Swal.fire({
                title: 'Deleted!',
                text: 'Testimonial deleted successfully!',
                icon: 'success',
                confirmButtonColor: '#10b981',
                timer: 3000,
                timerProgressBar: true
              });
            },
            error: (error) => {
              this.isDeleting.set(null);
              
              // Revert optimistic delete on error
              this.items.set(originalItems);
              this.pagination.update(p => ({ ...p, total: p.total + 1 }));

              // Show error message with SweetAlert2
              Swal.fire({
                title: 'Error!',
                text: 'Failed to delete testimonial. Please try again.',
                icon: 'error',
                confirmButtonColor: '#ef4444'
              });
            }
          });
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
