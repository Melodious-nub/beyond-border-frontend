import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageDataService, PageInfo } from '../../../../core/page-data.service';

@Component({
  selector: 'app-breadcrumb',
  imports: [CommonModule],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.scss'
})
export class BreadcrumbComponent implements OnInit {
  @Input() pageTitle: string = '';

  private pageDataService = inject(PageDataService);
  currentPageInfo: PageInfo | null = null;

  ngOnInit(): void {
    this.loadPageData();
  }

  private loadPageData(): void {
    if (this.pageTitle) {
      // Use the service to get page data
      this.currentPageInfo = this.pageDataService.getPageDataSync(this.pageTitle);
    }
  }

  // Method to get page data by page name (for external use)
  getPageData(pageName: string): PageInfo | null {
    return this.pageDataService.getPageDataSync(pageName);
  }
}
