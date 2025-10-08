import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/api';

// Interfaces
interface Contact {
  id: number;
  name: string;
  email: string;
  description: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  pages: number;
}

interface ContactResponse {
  success: boolean;
  message: string;
  data: {
    contacts: Contact[];
    pagination: Pagination;
  };
}

@Component({
  selector: 'app-contact-responses',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-responses.html',
  styleUrl: './contact-responses.scss'
})
export class ContactResponses implements OnInit {
  private readonly apiService = inject(ApiService);

  contacts: Contact[] = [];
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
  selectedContact: Contact | null = null;

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.loading = true;
    this.error = null;

    this.apiService.getAllContactResponses(this.pagination.page, this.pagination.pageSize)
      .subscribe({
        next: (response: ContactResponse) => {
          this.contacts = response.data.contacts;
          this.pagination = response.data.pagination;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load contact responses. Please try again.';
          this.loading = false;
          console.error('Error loading contacts:', error);
        }
      });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.pagination.pages) {
      this.pagination.page = page;
      this.loadContacts();
    }
  }

  onPageSizeChange(pageSize: number): void {
    this.pagination.pageSize = pageSize;
    this.pagination.page = 1; // Reset to first page
    this.loadContacts();
  }

  // Modal methods
  openModal(contact: Contact): void {
    this.selectedContact = contact;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedContact = null;
  }

  // Refresh data manually
  refreshData(): void {
    this.loadContacts();
  }

  onSearch(): void {
    this.pagination.page = 1; // Reset to first page
    this.loadContacts();
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
      case 'read':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'replied':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'closed':
        return `${baseClasses} bg-gray-100 text-gray-800`;
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

  get filteredContacts(): Contact[] {
    let filtered = this.contacts;

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(term) ||
        contact.email.toLowerCase().includes(term) ||
        contact.description.toLowerCase().includes(term)
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
