# Beyond Border Frontend

A modern Angular application built with the latest Angular features and best practices for performance, memory leak prevention, and maintainable code.

## Features

### 🚀 Performance Optimizations
- **Lazy Loading**: All routes and components are lazy-loaded for optimal bundle splitting
- **Virtual Scrolling**: Built-in virtual scrolling service for large lists
- **Image Lazy Loading**: Automatic image lazy loading with intersection observer
- **API Caching**: Intelligent caching system for API responses
- **Memory Leak Prevention**: Base component class with automatic subscription cleanup

### 🔐 Authentication & Security
- **JWT Token Management**: Automatic token refresh and storage
- **Route Guards**: Admin and guest route protection
- **HTTP Interceptors**: Automatic token injection and error handling
- **Role-based Access**: Admin-only routes and components

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with modern CSS Grid and Flexbox
- **Component Architecture**: Standalone components with proper separation of concerns
- **Reactive Forms**: Form validation and error handling
- **Loading States**: Comprehensive loading and error state management

### 📱 Pages & Components

#### Public Pages
- **Home**: Hero section, featured services, latest blog posts
- **About**: Company information and mission
- **Services**: Comprehensive service listings with detailed pages
- **Blog**: Latest insights and industry news
- **Team**: Team member profiles and information
- **Contact**: Contact form and information
- **Find Consultant**: Consultant search and profiles
- **Join Community**: Community registration

#### Service Pages
- Microcredit & Financial Inclusion
- NGO Technical Service Provider
- Recruitment Support
- Health Systems Strengthening
- Banking & Finance Advisory
- Administrative & Regulatory Due Diligence
- Infrastructure & Civil Engineering
- Legal & Compliance Services
- Agricultural Innovation
- Technology & Digital Transformation
- Green Design and Development
- HR Services

#### Admin Dashboard
- **Dashboard**: Statistics and quick actions
- **Blog Management**: Create, edit, and manage blog posts
- **Team Management**: Manage team members
- **About Management**: Edit company information

## Technology Stack

- **Angular 20+**: Latest Angular with standalone components
- **TypeScript**: Type-safe development
- **RxJS**: Reactive programming with observables
- **SCSS**: Modern CSS with variables and mixins
- **Angular Signals**: Reactive state management
- **Angular Router**: Lazy-loaded routing
- **Angular Forms**: Reactive forms with validation

## Project Structure

```
src/
├── app/
│   ├── admin/                 # Admin components
│   ├── auth/                  # Authentication components
│   ├── pages/                 # Public page components
│   ├── shared/                # Shared components and services
│   ├── core/                  # Core services and utilities
│   ├── app.config.ts          # Application configuration
│   ├── app.routes.ts          # Routing configuration
│   └── app.component.ts       # Root component
├── core/                      # Core services
│   ├── auth.service.ts        # Authentication service
│   ├── auth.guard.ts          # Route guards
│   ├── auth.interceptor.ts    # HTTP interceptors
│   ├── api.ts                 # API service
│   ├── cache.service.ts       # Caching service
│   ├── performance.service.ts # Performance utilities
│   ├── lazy-loading.service.ts # Lazy loading utilities
│   └── virtual-scroll.service.ts # Virtual scrolling
└── environments/              # Environment configurations
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:4200`

### Build for Production

```bash
npm run build
```

## API Integration

The application is configured to work with the Beyond Border backend API. Update the environment files with your API endpoints:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

## Authentication

The application uses JWT-based authentication. Admin users can access the admin dashboard at `/admin/dashboard` after logging in.

### Login Credentials
Use the API endpoint `/auth/login` with the following format:
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

## Performance Features

### Memory Leak Prevention
- All components extend `BaseComponent` for automatic cleanup
- Subscriptions are automatically unsubscribed using `takeUntilDestroy()`
- Performance monitoring and memory usage tracking

### Caching Strategy
- API responses are cached with configurable TTL
- Automatic cache invalidation
- Background refresh for frequently accessed data

### Lazy Loading
- Route-based code splitting
- Image lazy loading with intersection observer
- Component lazy loading for better performance

## Development Guidelines

### Code Style
- Use Angular Signals for reactive state management
- Implement proper error handling and loading states
- Follow Angular style guide and best practices
- Use TypeScript strict mode

### Performance
- Always use `OnDestroy` for cleanup
- Implement proper loading states
- Use virtual scrolling for large lists
- Optimize images and assets

### Security
- Validate all user inputs
- Use route guards for protected routes
- Implement proper error handling
- Sanitize user-generated content

## Contributing

1. Follow the established code style
2. Write meaningful commit messages
3. Test your changes thoroughly
4. Update documentation as needed

## License

This project is licensed under the MIT License.