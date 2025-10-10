import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/api';

// Interfaces
interface ConsultantRequest {
  id: number;
  ngoName: string;
  ngoRegistrationNumber: string;
  chairmanPresidentName: string;
  specializedAreas: string[];
  planningToExpand: number;
  expansionRegions: string[];
  needFundingSupport: number;
  totalFundRequired?: number;
  lookingForFundManager: number;
  openToSplittingInvestment: number;
  hasSpecializedTeam: number;
  needAssistance?: string;
  emailAddress: string;
  websiteAddress: string;
  phoneNumber: string;
  status: 'new' | 'reviewed' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  pages: number;
}

interface ConsultantRequestResponse {
  success: boolean;
  message: string;
  data: {
    consultants: ConsultantRequest[];
    pagination: Pagination;
  };
}

@Component({
  selector: 'app-consultant-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultant-requests.html',
  styleUrl: './consultant-requests.scss'
})
export class ConsultantRequests implements OnInit {
  private readonly apiService = inject(ApiService);

  consultantRequests: ConsultantRequest[] = [];
  pagination: Pagination = {
    page: 1,
    pageSize: 20,
    total: 0,
    pages: 0
  };
  
  loading = false;
  error: string | null = null;
  searchTerm: string = '';
  
  // Modal state
  showModal = false;
  selectedRequest: ConsultantRequest | null = null;

  ngOnInit(): void {
    this.loadConsultantRequests();
  }

  loadConsultantRequests(): void {
    this.loading = true;
    this.error = null;

    this.apiService.getAllConsultantRequests(this.pagination.page, this.pagination.pageSize)
      .subscribe({
        next: (response: ConsultantRequestResponse) => {
          this.consultantRequests = response.data.consultants;
          this.pagination = response.data.pagination;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load consultant requests. Please try again.';
          this.loading = false;
        }
      });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.pagination.pages) {
      this.pagination.page = page;
      this.loadConsultantRequests();
    }
  }

  onPageSizeChange(pageSize: number): void {
    this.pagination.pageSize = pageSize;
    this.pagination.page = 1; // Reset to first page
    this.loadConsultantRequests();
  }

  // Modal methods
  openModal(request: ConsultantRequest): void {
    this.selectedRequest = request;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedRequest = null;
  }

  // Refresh data manually
  refreshData(): void {
    this.loadConsultantRequests();
  }

  onSearch(): void {
    this.pagination.page = 1; // Reset to first page
    this.loadConsultantRequests();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  getStatusBadgeClass(status: string): string {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'new':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'reviewed':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
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

  get filteredRequests(): ConsultantRequest[] {
    let filtered = this.consultantRequests;

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(request =>
        request.ngoName.toLowerCase().includes(term) ||
        request.emailAddress.toLowerCase().includes(term) ||
        request.chairmanPresidentName.toLowerCase().includes(term) ||
        request.ngoRegistrationNumber.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const totalPages = this.pagination.pages;
    const currentPage = this.pagination.page;
    
    // Show up to 5 page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Expose Math object for template usage
  Math = Math;

  // Helper method for pagination range calculation
  getPaginationRange(): { start: number; end: number } {
    const start = (this.pagination.page - 1) * this.pagination.pageSize + 1;
    const end = Math.min(this.pagination.page * this.pagination.pageSize, this.pagination.total);
    return { start, end };
  }

  // Helper method to format boolean values
  formatBoolean(value: number): string {
    return value ? 'Yes' : 'No';
  }
}