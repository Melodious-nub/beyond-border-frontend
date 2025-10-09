import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface PageInfo {
  page: string;
  pageTitle: string;
  pageDescription: string;
}

@Injectable({
  providedIn: 'root'
})
export class PageDataService {
  private pageData: PageInfo[] = [
    {
      page: 'about',
      pageTitle: 'About Beyond Border Consultants',
      pageDescription: 'Beyond Border Consultants is a multidisciplinary advisory firm dedicated to empowering NGOs, development agencies, and public-private partnerships through strategic consultancy services. With a collective experience spanning over 100 years across microfinance, banking, infrastructure, legal compliance, agriculture, and technology, our team brings deep domain expertise and global insights to every engagement.'
    },
    {
      page: 'team',
      pageTitle: 'Our Team',
      pageDescription: 'Access top-tier independent management consultants from McKinsey, Bain, and BCG. Browse our community of experienced professionals with a combined experience of over 100 years.'
    },
    {
      page: 'contact',
      pageTitle: 'Contact Us',
      pageDescription: 'Ready to discuss your development challenges? Our multidisciplinary team is here to provide strategic advisory services. Contact us to schedule a consultation. Contact us to schedule a consultation.'
    },
    {
      page: 'services',
      pageTitle: 'Our Services',
      pageDescription: 'Comprehensive advisory services across multiple domains including microfinance, banking, infrastructure, legal compliance, agriculture, and technology to support your organization\'s growth and development. We offer a wide range of services to meet your needs.'
    },
    {
      page: 'microcredit-financial-inclusion',
      pageTitle: 'Microcredit & Financial Inclusion',
      pageDescription: 'Specialized advisory services in microfinance and financial inclusion to help organizations develop sustainable financial products and services for underserved communities. We offer a wide range of services to meet your needs.'
    },
    {
      page: 'ngo-technical-service-provider',
      pageTitle: 'NGO Technical Service Provider',
      pageDescription: 'Comprehensive technical support and advisory services for NGOs to enhance their operational efficiency, program delivery, and impact measurement capabilities. We offer a wide range of services to meet your needs.'
    },
    {
      page: 'recruitment-support',
      pageTitle: 'Recruitment Support',
      pageDescription: 'Expert recruitment services to help organizations find and hire the right talent for their development projects and organizational growth. We offer a wide range of services to meet your needs.'
    },
    {
      page: 'health-systems-strengthening',
      pageTitle: 'Health Systems Strengthening',
      pageDescription: 'Strategic advisory services to strengthen healthcare systems, improve service delivery, and enhance health outcomes in developing communities. We offer a wide range of services to meet your needs.'
    },
    {
      page: 'banking-finance-advisory',
      pageTitle: 'Banking & Finance Advisory',
      pageDescription: 'Expert financial advisory services to help financial institutions and development organizations optimize their operations and expand their impact. We offer a wide range of services to meet your needs.'
    },
    {
      page: 'administrative-regulatory-due-diligence',
      pageTitle: 'Administrative & Regulatory Due Diligence',
      pageDescription: 'Comprehensive due diligence services to ensure compliance with regulatory requirements and best practices in administrative operations. We offer a wide range of services to meet your needs.'
    },
    {
      page: 'infrastructure-civil-engineering',
      pageTitle: 'Infrastructure & Civil Engineering',
      pageDescription: 'Technical advisory services for infrastructure development projects, from planning and design to implementation and maintenance. We offer a wide range of services to meet your needs.'
    },
    {
      page: 'legal-compliance-services',
      pageTitle: 'Legal & Compliance Services',
      pageDescription: 'Expert legal advisory and compliance services to help organizations navigate complex regulatory environments and ensure adherence to legal requirements. We offer a wide range of services to meet your needs.'
    },
    {
      page: 'agricultural-innovation',
      pageTitle: 'Agricultural Innovation',
      pageDescription: 'Innovative agricultural advisory services to help farmers and agricultural organizations adopt modern farming techniques and sustainable practices. We offer a wide range of services to meet your needs.'
    },
    {
      page: 'technology-digital-transformation',
      pageTitle: 'Technology & Digital Transformation',
      pageDescription: 'Digital transformation advisory services to help organizations leverage technology for improved efficiency, reach, and impact in their development work. We offer a wide range of services to meet your needs.'
    },
    {
      page: 'green-design-development',
      pageTitle: 'Green Design and Development',
      pageDescription: 'Sustainable development advisory services focused on environmental conservation, green technologies, and eco-friendly project implementation. We offer a wide range of services to meet your needs.'
    },
    {
      page: 'hr-services',
      pageTitle: 'HR Services',
      pageDescription: 'Comprehensive human resources advisory services to help organizations build strong teams, develop talent, and create effective HR policies and practices. We offer a wide range of services to meet your needs.'
    },
    {
      page: 'blog',
      pageTitle: 'Insights & Blog',
      pageDescription: 'Stay updated with the latest insights, trends, and best practices in development consulting, microfinance, and sustainable development from our expert team. We offer a wide range of services to meet your needs.'
    },
    {
      page: 'community',
      pageTitle: 'Community',
      pageDescription: 'Join our community of development professionals, share knowledge, and collaborate on sustainable development initiatives that create lasting impact. We offer a wide range of services to meet your needs.'
    },
    {
      page: 'consultant',
      pageTitle: 'Consultant Portal',
      pageDescription: 'Access our consultant portal for project updates, resources, and collaboration tools designed to enhance your consulting experience with Beyond Border. We offer a wide range of services to meet your needs.'
    }
  ];

  constructor() { }

  /**
   * Get all page data - in real implementation, this would make an API call
   * @returns Observable<PageInfo[]> - Array of all page information
   */
  getAllPageData(): Observable<PageInfo[]> {
    // In real implementation, this would make an HTTP call to the backend
    // return this.http.get<PageInfo[]>('/api/pages');
    return of(this.pageData);
  }

  /**
   * Get page data by page name
   * @param pageName - The page identifier
   * @returns Observable<PageInfo | null> - Page information or null if not found
   */
  getPageData(pageName: string): Observable<PageInfo | null> {
    // In real implementation, this would make an HTTP call to the backend
    // return this.http.get<PageInfo>(`/api/pages/${pageName}`);
    const pageInfo = this.pageData.find(page => page.page === pageName) || null;
    return of(pageInfo);
  }

  /**
   * Get page data synchronously (for immediate use)
   * @param pageName - The page identifier
   * @returns PageInfo | null - Page information or null if not found
   */
  getPageDataSync(pageName: string): PageInfo | null {
    return this.pageData.find(page => page.page === pageName) || null;
  }

  /**
   * Add or update page data (for admin use)
   * @param pageInfo - The page information to add or update
   * @returns Observable<PageInfo> - The updated page information
   */
  updatePageData(pageInfo: PageInfo): Observable<PageInfo> {
    // In real implementation, this would make an HTTP call to the backend
    // return this.http.put<PageInfo>(`/api/pages/${pageInfo.page}`, pageInfo);
    
    const existingIndex = this.pageData.findIndex(page => page.page === pageInfo.page);
    if (existingIndex >= 0) {
      this.pageData[existingIndex] = pageInfo;
    } else {
      this.pageData.push(pageInfo);
    }
    return of(pageInfo);
  }
}
