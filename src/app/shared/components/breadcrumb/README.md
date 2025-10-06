# Breadcrumb Component

A dynamic, reusable breadcrumb component for Beyond Border Consultants website that displays page titles and descriptions based on the current page.

## Features

- **Dynamic Content**: Page titles and descriptions are loaded from a centralized service
- **Reusable**: Can be used across all pages in the application
- **Consistent Styling**: Uses the existing design system styles
- **Type Safe**: Built with TypeScript for better development experience
- **Service-Based**: Data is managed through a dedicated service for easy maintenance

## Usage

### Basic Usage

```html
<app-breadcrumb pageTitle="about"></app-breadcrumb>
```

### Available Page Titles

The component supports the following page titles:

- `about` - About Beyond Border Consultants
- `team` - Our Expert Team
- `contact` - Contact Beyond Border Consultants
- `services` - Our Services
- `microcredit-financial-inclusion` - Microcredit & Financial Inclusion
- `ngo-technical-service-provider` - NGO Technical Service Provider
- `recruitment-support` - Recruitment Support
- `health-systems-strengthening` - Health Systems Strengthening
- `banking-finance-advisory` - Banking & Finance Advisory
- `administrative-regulatory-due-diligence` - Administrative & Regulatory Due Diligence
- `infrastructure-civil-engineering` - Infrastructure & Civil Engineering
- `legal-compliance-services` - Legal & Compliance Services
- `agricultural-innovation` - Agricultural Innovation
- `technology-digital-transformation` - Technology & Digital Transformation
- `green-design-development` - Green Design and Development
- `hr-services` - HR Services
- `blog` - Insights & Blog
- `community` - Community
- `consultant` - Consultant Portal

## Implementation in Components

### 1. Import the Component

```typescript
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb';

@Component({
  selector: 'app-your-component',
  imports: [BreadcrumbComponent],
  templateUrl: './your-component.html',
  styleUrl: './your-component.scss'
})
export class YourComponent {
  // Your component logic
}
```

### 2. Use in Template

```html
<!-- Dynamic Breadcrumb Component -->
<app-breadcrumb pageTitle="your-page-title"></app-breadcrumb>

<!-- Rest of your page content -->
<section class="your-content">
  <!-- Your content here -->
</section>
```

## Data Management

### PageDataService

The component uses the `PageDataService` located at `src/core/page-data.service.ts` to manage page data.

#### Service Methods

- `getAllPageData()`: Returns all page data as Observable
- `getPageData(pageName: string)`: Returns specific page data as Observable
- `getPageDataSync(pageName: string)`: Returns specific page data synchronously
- `updatePageData(pageInfo: PageInfo)`: Updates or adds page data

#### Adding New Pages

To add a new page to the breadcrumb system:

1. Add the page data to the `pageData` array in `PageDataService`:

```typescript
{
  page: 'new-page',
  pageTitle: 'New Page Title',
  pageDescription: 'Description of the new page...'
}
```

2. Use the component in your page template:

```html
<app-breadcrumb pageTitle="new-page"></app-breadcrumb>
```

## Styling

The component uses the existing design system styles:

- `.page-hero` - Main container styling
- `.page-title` - Title styling
- `.page-description` - Description styling

Styles are defined in `breadcrumb.scss` and extend the main application styles.

## Future Enhancements

### API Integration

The service is designed to easily integrate with a backend API. To implement:

1. Replace the mock data with HTTP calls in `PageDataService`
2. Update the service methods to use `HttpClient`
3. The component will automatically work with the new data source

### Example API Integration

```typescript
// In PageDataService
getAllPageData(): Observable<PageInfo[]> {
  return this.http.get<PageInfo[]>('/api/pages');
}

getPageData(pageName: string): Observable<PageInfo | null> {
  return this.http.get<PageInfo>(`/api/pages/${pageName}`);
}
```

## File Structure

```
src/app/shared/components/breadcrumb/
├── breadcrumb.ts          # Component logic
├── breadcrumb.html        # Component template
├── breadcrumb.scss        # Component styles
└── README.md             # This documentation

src/core/
└── page-data.service.ts   # Data service
```

## Dependencies

- Angular Common Module
- PageDataService (custom service)

## Browser Support

The component supports all modern browsers and uses CSS features that are widely supported:

- CSS Grid
- CSS Custom Properties
- CSS clamp() function
- CSS transitions and transforms
