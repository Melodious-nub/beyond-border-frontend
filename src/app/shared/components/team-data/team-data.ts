import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, signal, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize, debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiService } from '../../../../core/api';
import { CacheService } from '../../../../core/cache.service';

// Interfaces
interface TeamMember {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  designation: string;
  isManagement: boolean;
  phoneNumber?: string;
  department?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  redditUrl?: string;
  description?: string;
}

interface TeamResponse {
  success: boolean;
  message: string;
  data: {
    teamMembers: TeamMember[];
  };
}

interface TeamDataFilters {
  search: string;
  department: string;
  designation: string;
}

@Component({
  selector: 'app-team-data',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team-data.html',
  styleUrl: './team-data.scss'
})
export class TeamData implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private cacheService = inject(CacheService);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Input properties
  @Input() showLoadMore: boolean = true;
  @Input() maxItems: number = 20;
  @Input() showFilters: boolean = true;
  @Input() parentFilters: TeamDataFilters = { search: '', department: '', designation: '' };
  @Input() isManagement: boolean | any = undefined;
  @Input() reverseData: boolean = true;

  // Output events
  @Output() filtersChanged = new EventEmitter<TeamDataFilters>();

  // Signals for reactive state
  teamMembers = signal<TeamMember[]>([]);
  filteredMembers = signal<TeamMember[]>([]);
  isLoading = signal(false);
  isLoadingMore = signal(false);
  hasMoreData = signal(false);

  // Data properties
  allTeamMembers: TeamMember[] = [];
  displayedCount = 0;
  error: string | null = null;

  // Filters
  filters: TeamDataFilters = {
    search: '',
    department: '',
    designation: ''
  };

  // Available filter options
  departments: string[] = [];
  designations: string[] = [];

  ngOnInit(): void {
    this.initializeFilters();
    this.loadTeamMembers();
    this.setupSearchDebounce();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject.complete();
  }

  private initializeFilters(): void {
    // Initialize with parent filters if provided
    this.filters = { ...this.parentFilters };
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.filters.search = searchTerm;
        this.applyFilters();
        this.emitFiltersChanged();
      });
  }

  loadTeamMembers(): void {
    // Check cache first
    const cachedData = this.cacheService.getCachedTeamMembers();
    if (cachedData && cachedData.length > 0) {
      this.allTeamMembers = cachedData;
      this.extractFilterOptions();
      this.applyFilters();
      return;
    }

    this.isLoading.set(true);
    this.error = null;

    this.apiService.getPublicTeamMembers()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response: TeamResponse) => {
          if (response.success && response.data.teamMembers) {
            this.allTeamMembers = response.data.teamMembers;
            this.cacheService.cacheTeamMembers(this.allTeamMembers);
            this.extractFilterOptions();
            this.applyFilters();
          } else {
            this.error = 'Failed to load team members';
            this.allTeamMembers = [];
          }
        },
        error: (error) => {
          this.error = 'Failed to load team members. Please try again.';
          this.allTeamMembers = [];
        }
      });
  }

  private extractFilterOptions(): void {
    const departments = new Set<string>();
    const designations = new Set<string>();

    this.allTeamMembers.forEach(member => {
      if (member.department) departments.add(member.department);
      if (member.designation) designations.add(member.designation);
    });

    this.departments = Array.from(departments).sort();
    this.designations = Array.from(designations).sort();
  }

  private applyFilters(): void {
    let filtered = [...this.allTeamMembers];

    // Apply search filter
    if (this.filters.search.trim()) {
      const searchTerm = this.filters.search.toLowerCase();
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm) ||
        member.designation.toLowerCase().includes(searchTerm) ||
        member.department?.toLowerCase().includes(searchTerm) ||
        member.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply department filter
    if (this.filters.department) {
      filtered = filtered.filter(member => member.department === this.filters.department);
    }

    // Apply designation filter
    if (this.filters.designation) {
      filtered = filtered.filter(member => member.designation === this.filters.designation);
    }

    // Apply management filter (simple boolean)
    if (this.isManagement !== undefined) {
      filtered = filtered.filter(member => member.isManagement === this.isManagement);
    }

    // Reverse data if reverseData input is true
    if (this.reverseData) {
      filtered = filtered.reverse();
    }
    
    this.filteredMembers.set(filtered);
    this.displayedCount = Math.min(this.maxItems, filtered.length);
    this.hasMoreData.set(filtered.length > this.displayedCount);
  }

  loadMore(): void {
    if (this.isLoadingMore()) return;

    this.isLoadingMore.set(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      this.displayedCount = Math.min(this.displayedCount + this.maxItems, this.filteredMembers().length);
      this.hasMoreData.set(this.filteredMembers().length > this.displayedCount);
      this.isLoadingMore.set(false);
    }, 500);
  }

  onSearchInput(event: any): void {
    const searchTerm = event.target.value;
    this.searchSubject.next(searchTerm);
  }

  onFilterChange(): void {
    this.applyFilters();
    this.emitFiltersChanged();
  }

  clearFilters(): void {
    this.filters = { search: '', department: '', designation: '' };
    this.applyFilters();
    this.emitFiltersChanged();
  }

  private emitFiltersChanged(): void {
    this.filtersChanged.emit({ ...this.filters });
  }

  // Helper methods
  get displayedMembers(): TeamMember[] {
    return this.filteredMembers().slice(0, this.displayedCount);
  }

  hasSocialLinks(member: TeamMember): boolean {
    return !!(
      member.linkedinUrl || 
      member.facebookUrl || 
      member.twitterUrl || 
      member.instagramUrl || 
      member.redditUrl
    );
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
  }

  getStatusBadgeClass(isManagement: boolean): string {
    const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
    return isManagement 
      ? `${baseClasses} bg-purple-100 text-purple-800`
      : `${baseClasses} bg-blue-100 text-blue-800`;
  }

  trackByMemberId(index: number, member: TeamMember): number {
    return member.id;
  }

  // Check if text is truncated and show tooltip only if needed
  isTextTruncated(element: HTMLElement): boolean {
    return element.scrollHeight > element.clientHeight;
  }

  // Click-based tooltip system
  private visibleTooltips = new Set<number>();

  toggleTooltip(event: MouseEvent, memberId: number): void {
    event.stopPropagation();
    
    if (this.visibleTooltips.has(memberId)) {
      // Hide tooltip if already visible
      this.visibleTooltips.delete(memberId);
    } else {
      // Show tooltip and hide others
      this.visibleTooltips.clear();
      this.visibleTooltips.add(memberId);
    }
  }

  isTooltipVisible(memberId: number): boolean {
    return this.visibleTooltips.has(memberId);
  }

  hideAllTooltips(): void {
    this.visibleTooltips.clear();
  }

  // Handle outside clicks to close tooltips
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    // Check if click is outside any tooltip container
    if (!target.closest('.member-description')) {
      this.hideAllTooltips();
    }
  }
}