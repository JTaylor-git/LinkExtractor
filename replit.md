# Clippr: Web Scraping Platform

## Overview

Clippr is a next-generation web scraping platform that provides both No-Code and Pro-Code interfaces for extracting data from websites. The application features a dark-themed, Shodan-inspired UI with a Clippy assistant to guide users through the scraping process. Built as a full-stack application with React frontend and Express backend, it offers project management, real-time job monitoring, and multiple export formats.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with custom styling
- **Styling**: Tailwind CSS with custom dark theme and glassmorphism effects
- **Component Library**: Shadcn/ui components for consistent design system

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **File Operations**: Archiver for creating downloadable ZIP files
- **API Design**: RESTful API with structured error handling and logging

### Development Setup
- **Monorepo Structure**: Shared schemas and types between frontend and backend
- **Hot Reload**: Vite dev server integrated with Express backend
- **Type Safety**: Full TypeScript coverage with shared type definitions
- **Code Quality**: ESLint and Prettier configurations

## Key Components

### 1. Clippy Assistant
- **Purpose**: Guide users through the scraping wizard process
- **Features**: Context-aware hints, step-by-step navigation, animated presence
- **Implementation**: React component with state management for different wizard steps

### 2. Scraping Wizard
- **Multi-step Interface**: URL input → Depth/Filters → Execution → Download
- **Form Validation**: Zod schema validation with React Hook Form
- **Real-time Feedback**: Live job status updates and progress monitoring
- **Export Options**: Multiple format support (JSON, CSV, XML, GeoJSON, KML)

### 3. Project Management
- **Organization**: Group related scraping jobs under projects with team association
- **Persistence**: Database storage with user and team association
- **Status Tracking**: Real-time job status updates (queued, running, completed, failed)
- **History**: Maintain logs of all scraping activities
- **Collaboration**: Team-based project sharing with role-based permissions

### 4. Dashboard Suite
- **Main Dashboard**: Real-time metrics, active jobs, queue status, system health
- **Analytics Dashboard**: Historical trends, performance metrics, success rates
- **Globe Dashboard**: Interactive 3D visualization of global scraping activities
- **Team Dashboard**: Member management, role assignments, activity auditing

### 5. Plugin Ecosystem
- **Dynamic Plugin Management**: Install, enable, disable, and configure plugins
- **Plugin Registry**: Centralized catalog of available plugins with metadata
- **API Integration**: RESTful API for plugin lifecycle management
- **Security**: Sandboxed execution with permission controls

### 6. Team Management (RBAC)
- **Multi-tenant Architecture**: Team-based organization with resource limits
- **Role-based Access Control**: Owner, Admin, Member, Viewer roles with granular permissions
- **Team Collaboration**: Invite system, member management, project sharing
- **Activity Auditing**: Comprehensive logging of all team and project activities
- **Project Visibility**: Private, team-only, or public project access controls

## Data Flow

### 1. User Interaction Flow
1. User accesses dashboard or starts new scrape via Clippy assistant
2. Scraping wizard collects configuration (URL, depth, filters, formats)
3. Frontend validates input and creates project via API
4. Backend queues scraping job and returns job ID
5. Frontend polls job status and displays progress
6. Upon completion, user can download results as ZIP file

### 2. Backend Processing Flow
1. API receives scrape request and validates parameters
2. Project and job records created in database
3. Scraping service discovers URLs based on depth and filters
4. Each URL processed individually with error handling
5. Results stored in database and filesystem
6. ZIP archive created with all scraped data
7. Job status updated to completed/failed

### 3. Database Schema
- **Users**: Enhanced user management with roles, profiles, and authentication
- **Teams**: Organization-level management with plans and resource limits
- **Team Members**: Role-based team membership with permissions
- **Projects**: Scraping project configuration with team association and visibility
- **Project Collaborators**: Project-level collaboration with granular permissions
- **Scrape Jobs**: Individual scraping job instances with progress tracking
- **Scraped Data**: Actual scraped content and extracted data
- **Activity Logs**: Comprehensive audit trail for all system actions
- **Invitations**: Team and project invitation system with secure tokens

## External Dependencies

### Production Dependencies
- **Database**: Neon PostgreSQL for cloud-hosted database
- **UI Components**: Radix UI for accessible, unstyled components
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: TanStack Query for server state synchronization
- **Form Handling**: React Hook Form with Zod validation
- **Date Handling**: date-fns for date manipulation and formatting

### Development Dependencies
- **Build Tools**: Vite for fast development and optimized builds
- **Type Checking**: TypeScript for static type checking
- **Database Management**: Drizzle Kit for database migrations
- **Development Experience**: Replit-specific plugins for enhanced development

### Optional Future Integrations
- **Proxy Services**: Planned integration with Crawlbase, ScraperAPI
- **Authentication**: OAuth providers, SAML for enterprise
- **Export Destinations**: S3, Google Sheets, FTP, webhooks
- **Monitoring**: Error tracking and performance monitoring

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express backend
- **Database**: Neon PostgreSQL connection via environment variables
- **Hot Reload**: Integrated frontend and backend development experience
- **Environment Variables**: DATABASE_URL for database connection

### Production Deployment
- **Build Process**: Vite builds frontend to dist/public, esbuild bundles backend
- **Static Assets**: Frontend served as static files from Express
- **Database**: PostgreSQL connection with connection pooling
- **Process Management**: Single Node.js process serving both frontend and API

### Configuration Management
- **Environment Variables**: DATABASE_URL for database connection
- **Build Configuration**: Separate build commands for frontend and backend
- **Asset Management**: Integrated asset serving from Express server
- **Error Handling**: Comprehensive error handling with structured logging

### Scalability Considerations
- **Database**: PostgreSQL with connection pooling for concurrent requests
- **File Storage**: Local filesystem for MVP, cloud storage for production
- **Job Queue**: In-memory job processing with database persistence
- **Caching**: Query caching via TanStack Query on frontend