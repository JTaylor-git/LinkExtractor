# Clippr: Next-Generation Web Scraping Platform

![Clippr Platform](./attached_assets/image_1752809458656.png)

A comprehensive dual-mode web scraping platform featuring both No-Code and Pro-Code interfaces. Built with enterprise-grade scalability, team collaboration, and advanced analytics capabilities.

## 🚀 Features

### Core Platform
- **Dual-Mode Interface**: No-Code wizard and Pro-Code APIs
- **Clippy Assistant**: AI-powered guide for scraping workflows
- **Multi-Format Export**: JSON, CSV, XML, GeoJSON, KML support
- **Real-time Monitoring**: Live job status and progress tracking
- **Project Management**: Organize and manage scraping projects

### Advanced Capabilities
- **3D Globe Dashboard**: Interactive visualization of global scraping activities
- **Analytics Dashboard**: Historical trends, performance metrics, success rates
- **Plugin Ecosystem**: Dynamic plugin management with registry
- **Team Collaboration**: Multi-tenant RBAC with role-based permissions
- **Scheduler & Watcher**: Recurring and change-detection scrapes
- **Proxy Infrastructure**: Advanced proxy rotation and management

## 🏗 Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for development and builds
- **TanStack Query** for state management
- **Radix UI** components with custom styling
- **Tailwind CSS** with dark theme
- **Three.js** for 3D globe visualization

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** with Drizzle ORM
- **Neon Database** for cloud hosting
- **RESTful API** design
- **WebSocket** support for real-time updates

## 📊 Sprint Completion Status

All 8 development sprints have been successfully completed:

- ✅ **Sprint 1**: Foundation & Core Components
- ✅ **Sprint 2**: Proxy Infrastructure & Advanced Scraping
- ✅ **Sprint 3**: Scheduler & Watcher System
- ✅ **Sprint 4**: Full REST & gRPC API
- ✅ **Sprint 5**: Dynamic Plugin Ecosystem
- ✅ **Sprint 6**: 3D Globe Dashboard
- ✅ **Sprint 7**: Analytics & Reporting Dashboard
- ✅ **Sprint 8**: Team RBAC & Multi-tenant Architecture

## 🔧 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Environment variables configured

### Setup
1. Clone the repository:
```bash
git clone https://github.com/JTaylor-git/LinkExtractor.git
cd LinkExtractor
git checkout Replit  # Use the complete implementation
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
# Database connection
DATABASE_URL=your_postgresql_connection_string
```

4. Push database schema:
```bash
npm run db:push
```

5. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 📖 API Documentation

### Core Endpoints
- `GET /api/v1/projects` - List all projects
- `POST /api/v1/projects` - Create new project
- `GET /api/v1/jobs` - Monitor scraping jobs
- `GET /api/v1/analytics` - Access analytics data
- `GET /api/v1/plugins` - Plugin management
- `GET /api/v1/teams` - Team collaboration

### Authentication
The platform includes comprehensive user authentication and session management with PostgreSQL-backed sessions.

## 🎯 Key Components

### 1. Scraping Wizard
Multi-step interface guiding users through:
- URL input and validation
- Depth and filter configuration
- Real-time job execution
- Download and export options

### 2. Team Management
Enterprise-grade collaboration features:
- **Role-based Access Control**: Owner, Admin, Member, Viewer
- **Invitation System**: Secure token-based invitations
- **Activity Auditing**: Comprehensive action logging
- **Project Visibility**: Private, team-only, or public access

### 3. Plugin Ecosystem
Dynamic plugin architecture supporting:
- Plugin discovery and installation
- Runtime enable/disable capabilities
- Configuration management
- Security sandboxing

### 4. Analytics Suite
Comprehensive reporting dashboard featuring:
- Real-time metrics and KPIs
- Historical trend analysis
- Performance optimization insights
- Custom report generation

### 5. 3D Globe Visualization
Interactive globe displaying:
- Global scraping activity heatmap
- Real-time job distribution
- Geographic performance metrics
- Clickable country/region details

## 🛠 Development

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   └── hooks/          # Custom React hooks
├── server/                 # Express backend
│   ├── api/v1/            # API route handlers
│   ├── engine/            # Scraping engine
│   └── services/          # Business logic
├── shared/                # Shared types and schemas
└── plugins/               # Plugin system
```

### Database Schema
- **Users**: Enhanced user management with profiles
- **Teams**: Organization-level management with plans
- **Projects**: Scraping configuration with team association
- **Jobs**: Individual scraping instances
- **Activity Logs**: Comprehensive audit trail
- **Plugins**: Dynamic plugin registry

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
```bash
DATABASE_URL=postgresql://...
NODE_ENV=production
SESSION_SECRET=your-secret-key
```

## 📝 Documentation

Detailed technical documentation is maintained in [`replit.md`](./replit.md), including:
- System architecture overview
- Component interaction diagrams
- Database schema details
- API specifications
- Deployment strategies

## 🤝 Contributing

This project follows enterprise development standards:
- TypeScript for type safety
- Comprehensive error handling
- Structured logging
- Database migrations via Drizzle
- Component-based architecture

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Demo**: Available on Replit
- **Documentation**: See `replit.md`
- **Issues**: GitHub Issues
- **Discord**: Community support

---

**Clippr** - Transforming web scraping from a technical challenge into an intuitive, scalable solution for teams and enterprises.