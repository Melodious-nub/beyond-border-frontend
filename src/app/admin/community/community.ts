import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/api';

// Interfaces
interface CommunityMember {
  id: number;
  name: string;
  emailAddress: string;
  phoneNumber: string;
  linkedInProfile?: string;
  company: string;
  designation: string;
  yearsOfExperience: number;
  areasOfExpertise: string[];
  whyJoinCommunity: string;
  howCanContribute: string;
  email: number;
  whatsapp: number;
  slack: number;
  openToMentoring: number;
  agreement: number;
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

interface CommunityResponse {
  success: boolean;
  message: string;
  data: {
    consultantCommunities: CommunityMember[];
    pagination: Pagination;
  };
}

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './community.html',
  styleUrl: './community.scss'
})
export class Community implements OnInit {
  private readonly apiService = inject(ApiService);

  communityMembers: CommunityMember[] = [];
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
  selectedMember: CommunityMember | null = null;

  ngOnInit(): void {
    this.loadCommunityMembers();
  }

  loadCommunityMembers(): void {
    this.loading = true;
    this.error = null;

    this.apiService.getAllCommunityMembers(this.pagination.page, this.pagination.pageSize)
      .subscribe({
        next: (response: CommunityResponse) => {
          this.communityMembers = response.data.consultantCommunities;
          this.pagination = response.data.pagination;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load community members. Please try again.';
          this.loading = false;
        }
      });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.pagination.pages) {
      this.pagination.page = page;
      this.loadCommunityMembers();
    }
  }

  onPageSizeChange(pageSize: number): void {
    this.pagination.pageSize = pageSize;
    this.pagination.page = 1; // Reset to first page
    this.loadCommunityMembers();
  }

  // Modal methods
  openModal(member: CommunityMember): void {
    this.selectedMember = member;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedMember = null;
  }

  // Refresh data manually
  refreshData(): void {
    this.loadCommunityMembers();
  }

  onSearch(): void {
    this.pagination.page = 1; // Reset to first page
    this.loadCommunityMembers();
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

  get filteredMembers(): CommunityMember[] {
    let filtered = this.communityMembers;

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(term) ||
        member.emailAddress.toLowerCase().includes(term) ||
        member.company.toLowerCase().includes(term) ||
        member.designation.toLowerCase().includes(term)
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
}