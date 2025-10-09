import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, finalize, debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiService } from '../../../core/api';
import Swal from 'sweetalert2';

// Interfaces
interface TeamMember {
  id: number;
  name: string;
  email: string;
  designation: string;
  avatar?: string;
  status: 'active' | 'inactive';
  isManagement: boolean;
  phoneNumber?: string;
  department?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  redditUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  pages: number;
}

interface TeamResponse {
  success: boolean;
  message: string;
  data: {
    teamMembers: TeamMember[];
    pagination: Pagination;
  };
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

interface Filters {
  status: string;
}

@Component({
  selector: 'app-team',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './team.html',
  styleUrl: './team.scss'
})
export class Team implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Signals for reactive state management
  teamMembers = signal<TeamMember[]>([]);
  isLoading = signal(false);
  isModalOpen = signal(false);
  isViewModalOpen = signal(false);
  isEditMode = signal(false);
  isDeleting = signal<number | null>(null);
  avatarPreview = signal<string | null>(null);
  selectedMember = signal<TeamMember | null>(null);

  // Data properties
  pagination: Pagination = {
    page: 1,
    pageSize: 20,
    total: 0,
    pages: 0
  };
  
  error: string | null = null;
  searchTerm: string = '';
  departments: string[] = [];

  // Filters
  filters: Filters = {
    status: ''
  };

  // Form
  teamForm: FormGroup;

  constructor() {
    this.teamForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      designation: ['', [Validators.required, Validators.minLength(2)]],
      department: [''],
      phoneNumber: [''],
      status: ['active'],
      isManagement: [false],
      linkedinUrl: [''],
      twitterUrl: [''],
      facebookUrl: [''],
      instagramUrl: [''],
      redditUrl: [''],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadTeamMembers();
    this.setupSearchDebounce();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject.complete();
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(800),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.searchTerm = searchTerm;
        this.pagination.page = 1;
        this.loadTeamMembers();
      });
  }

  loadTeamMembers(): void {
    this.isLoading.set(true);
    this.error = null;

    // Initialize with empty state to prevent undefined errors
    this.teamMembers.set([]);
    this.departments = [];
    
    // Build query parameters
    const params = this.buildQueryParams();
    
    this.apiService.getTeamMembers(params)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response: any) => {
          try {
            if (response && response.success && response.data && response.data.teams) {
              this.teamMembers.set(response.data.teams);
              this.pagination = response.data.pagination || { page: 1, pageSize: 20, total: 0, pages: 0 };
              this.extractDepartments();
            } else {
              this.teamMembers.set([]);
              this.pagination = { page: 1, pageSize: 20, total: 0, pages: 0 };
              this.departments = [];
            }
          } catch (error) {
            this.teamMembers.set([]);
            this.pagination = { page: 1, pageSize: 20, total: 0, pages: 0 };
            this.departments = [];
          }
        },
        error: (error) => {
          this.error = 'Failed to load team members. Please try again.';
          this.teamMembers.set([]);
          this.pagination = { page: 1, pageSize: 20, total: 0, pages: 0 };
          this.departments = [];
        }
      });
  }

  private buildQueryParams(): any {
    const params: any = {};
    
    if (this.pagination.page) params.page = this.pagination.page.toString();
    if (this.pagination.pageSize) params.pageSize = this.pagination.pageSize.toString();
    if (this.filters.status) params.status = this.filters.status;
    if (this.searchTerm) params.search = this.searchTerm;
    
    return params;
  }

  private extractDepartments(): void {
    const departments = new Set<string>();
    const members = this.teamMembers();
    
    if (members && Array.isArray(members)) {
      members.forEach(member => {
        if (member && member.department) {
          departments.add(member.department);
        }
      });
    }
    
    this.departments = Array.from(departments).sort();
  }

  // Modal methods
  openAddTeamModal(): void {
    // Close any open modals first
    this.isViewModalOpen.set(false);
    
    this.isEditMode.set(false);
    this.selectedMember.set(null);
    this.teamForm.reset({
      status: 'active',
      isManagement: false
    });
    this.avatarPreview.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(member: TeamMember): void {
    // Close any open modals first
    this.isViewModalOpen.set(false);
    
    this.isEditMode.set(true);
    this.selectedMember.set(member);
    this.teamForm.patchValue({
      name: member.name,
      email: member.email,
      designation: member.designation,
      department: member.department || '',
      phoneNumber: member.phoneNumber || '',
      status: member.status,
      isManagement: member.isManagement,
      linkedinUrl: member.linkedinUrl || '',
      twitterUrl: member.twitterUrl || '',
      facebookUrl: member.facebookUrl || '',
      instagramUrl: member.instagramUrl || '',
      redditUrl: member.redditUrl || '',
      description: member.description || ''
    });
    this.avatarPreview.set(member.avatar || null);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.isEditMode.set(false);
    this.selectedMember.set(null);
    this.teamForm.reset();
    this.avatarPreview.set(null);
  }

  // View modal methods
  openViewModal(member: TeamMember): void {
    // Close any open modals first
    this.isModalOpen.set(false);
    this.isViewModalOpen.set(false);
    
    // Set the selected member and open view modal
    this.selectedMember.set(member);
    this.isViewModalOpen.set(true);
  }

  closeViewModal(): void {
    this.isViewModalOpen.set(false);
    this.selectedMember.set(null);
  }

  // Helper method to check if member has social links
  hasSocialLinks(member: TeamMember | null | undefined): boolean {
    if (!member) return false;
    return !!(
      member.linkedinUrl || 
      member.facebookUrl || 
      member.twitterUrl || 
      member.instagramUrl || 
      member.redditUrl
    );
  }

  // Avatar handling
  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        this.showError('File Too Large', 'Please select an image smaller than 10MB.');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.showError('Invalid File Type', 'Please select a valid image file.');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  // Form submission
  saveMember(): void {
    if (this.teamForm.valid) {
      this.isLoading.set(true);
      
      const formData = new FormData();
      const formValue = this.teamForm.value;
      
      // Append all form fields
      Object.keys(formValue).forEach(key => {
        if (formValue[key] !== null && formValue[key] !== '') {
          formData.append(key, formValue[key]);
        }
      });
      
      // Append avatar file if selected
      const avatarInput = document.getElementById('avatar') as HTMLInputElement;
      if (avatarInput && avatarInput.files && avatarInput.files[0]) {
        formData.append('avatar', avatarInput.files[0]);
      }
      
      const operation = this.isEditMode() 
        ? this.apiService.updateTeamMember(this.selectedMember()!.id.toString(), formData)
        : this.apiService.createTeamMember(formData);
      
      operation
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoading.set(false))
        )
        .subscribe({
          next: (response: TeamResponse) => {
            if (response.success) {
              this.showSuccess('Success', response.message);
              this.closeModal();
              this.loadTeamMembers();
            } else {
              this.showFormErrors(response.errors || []);
            }
          },
          error: (error) => {
            this.showError('Error', 'Failed to save team member. Please try again.');
          }
        });
    } else {
      this.markFormGroupTouched(this.teamForm);
    }
  }

  // Delete member
  deleteMember(member: TeamMember): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${member.name} from the team?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isDeleting.set(member.id);
        this.apiService.deleteTeamMember(member.id.toString())
          .pipe(
            takeUntil(this.destroy$),
            finalize(() => this.isDeleting.set(null))
          )
          .subscribe({
            next: (response: TeamResponse) => {
              if (response.success) {
                this.showSuccess('Deleted', response.message);
                this.loadTeamMembers();
              } else {
                this.showError('Error', response.message);
              }
            },
            error: (error) => {
              this.showError('Error', 'Failed to delete team member. Please try again.');
            }
          });
      }
    });
  }

  // Pagination
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.pagination.pages) {
      this.pagination.page = page;
      this.loadTeamMembers();
    }
  }

  onPageSizeChange(pageSize: number): void {
    this.pagination.pageSize = pageSize;
    this.pagination.page = 1;
    this.loadTeamMembers();
  }

  // Search and filters
  onSearchInput(event: any): void {
    const searchTerm = event.target.value;
    this.searchSubject.next(searchTerm);
  }

  onSearch(): void {
    this.pagination.page = 1;
    this.loadTeamMembers();
  }

  onFilterChange(): void {
    this.pagination.page = 1;
    this.loadTeamMembers();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchSubject.next('');
    this.pagination.page = 1;
    this.loadTeamMembers();
  }

  clearFilters(): void {
    this.filters = {
      status: ''
    };
    this.searchTerm = '';
    this.onFilterChange();
  }

  // Refresh data
  refreshData(): void {
    this.loadTeamMembers();
  }

  // Helper methods
  get filteredMembers(): TeamMember[] {
    const members = this.teamMembers();
    return members && Array.isArray(members) ? members : [];
  }

  // Image error handling
  onImageError(event: any): void {
    event.target.style.display = 'none';
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const totalPages = this.pagination.pages;
    const currentPage = this.pagination.page;
    
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getPaginationRange(): { start: number; end: number } {
    const start = (this.pagination.page - 1) * this.pagination.pageSize + 1;
    const end = Math.min(this.pagination.page * this.pagination.pageSize, this.pagination.total);
    return { start, end };
  }

  getStatusBadgeClass(status: string): string {
    const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'inactive':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.status);
  }

  getActiveMembersCount(): number {
    const members = this.teamMembers();
    if (!members || !Array.isArray(members)) return 0;
    return members.filter(member => member && member.status === 'active').length;
  }

  getManagementCount(): number {
    const members = this.teamMembers();
    if (!members || !Array.isArray(members)) return 0;
    return members.filter(member => member && member.isManagement).length;
  }

  getDepartmentsCount(): number {
    return this.departments.length;
  }

  // Form validation helpers
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

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

  // Notification methods
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
}
