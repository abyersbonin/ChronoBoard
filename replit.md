# Personal Dashboard Application

## Overview

This is a full-stack personal dashboard application built with React, Express, and PostgreSQL. It provides users with a customizable dashboard featuring calendar integration, weather information, and various personal productivity tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Admin Authentication System Implementation (July 26, 2025)
- ✓ **COMPLETED: Full admin authentication system with login/logout functionality**
- ✓ Implemented session-based authentication using express-session middleware
- ✓ Added admin authentication routes (/api/auth/login, /api/auth/logout, /api/auth/status)
- ✓ Protected calendar sync and settings endpoints with admin authentication middleware
- ✓ Created beautiful spa-themed background with animated elements and gradients
- ✓ **Replaced "Change Background" button with "Login" button (admin/admin credentials)**
- ✓ Implemented permanent Spa Eastman background across all dashboard views
- ✓ Created two-tier access system:
  - **Public users**: See full-page event display with spa background
  - **Admin users**: Access calendar sync ("Calendriers iCal") and settings ("Paramètres")
- ✓ Updated all UI components with transparent glass-morphism styling over spa background
- ✓ Enhanced login dialog with French localization and proper error handling
- ✓ Protected side panel - only visible to logged-in administrators
- ✓ All event components now use spa-themed styling (backdrop blur, transparent backgrounds)

### Calendar Event System (Previously Fixed)
- ✓ Fixed recurring calendar events - events increased from 21 to 42+
- ✓ Implemented proper RRULE processing with node-ical library
- ✓ Fixed "À Présent" section to display ongoing events correctly
- ✓ Timezone handling properly converts Quebec time (America/Toronto) to UTC
- ❌ **Known issue: Some events missing due to iCal EXDATE exclusions**
- → **RECOMMENDATION: Migrate to Google Calendar API for more reliable recurring event handling**

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **File Upload**: Multer for handling image uploads
- **Session Management**: Basic session handling with connect-pg-simple

### Project Structure
- **Monorepo Layout**: Shared schema and types between client and server
- **Client**: React application in `/client` directory
- **Server**: Express API in `/server` directory  
- **Shared**: Common schemas and types in `/shared` directory

## Key Components

### Database Schema
- **Users**: Basic user authentication (username/password)
- **Settings**: User preferences including dashboard customization, weather API keys, calendar tokens
- **Calendar Events**: Event storage with Google Calendar integration support

### Core Features
- **Dashboard Customization**: Header image upload, title customization
- **Calendar Integration**: Google Calendar sync with local event storage
- **Weather Display**: Weather information using external weather APIs
- **Time Display**: Configurable 12/24 hour format
- **Auto-refresh**: Configurable automatic data refresh

### UI Components
- **Comprehensive UI Library**: Full shadcn/ui component set including forms, dialogs, data display
- **Responsive Design**: Mobile-friendly layout with proper breakpoints
- **Dark Theme**: Configured for dark mode interface
- **French Localization**: UI text and date formatting in French

## Data Flow

### Client-Server Communication
- **RESTful API**: Standard HTTP methods for CRUD operations
- **Real-time Updates**: Query invalidation and refetching for live data
- **File Upload**: Multipart form data for image uploads
- **Error Handling**: Centralized error handling with user feedback

### External Integrations
- **Google Calendar API**: OAuth-based calendar synchronization
- **Weather API**: Third-party weather data integration
- **Image Storage**: Local file system storage for uploaded images

## External Dependencies

### Core Runtime
- **Database**: PostgreSQL via Neon Database
- **Authentication**: Google OAuth for calendar access
- **Weather Services**: External weather API (OpenWeatherMap compatible)

### Development Tools
- **TypeScript**: Full type safety across the stack
- **ESLint/Prettier**: Code formatting and linting
- **Drizzle Kit**: Database migrations and schema management

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Date-fns**: Date manipulation and formatting
- **Class Variance Authority**: Component variant management

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized production bundle
- **Backend**: ESBuild compiles TypeScript server code
- **Database**: Drizzle migrations for schema deployment

### Environment Configuration
- **Development**: Vite dev server with HMR and API proxy
- **Production**: Static file serving with Express
- **Database**: Environment-based connection string configuration

### Replit Integration
- **Development Banner**: Automatic development environment detection
- **Error Overlay**: Runtime error handling in development
- **Cartographer**: Replit-specific development tools integration

The application follows a modern full-stack architecture with clear separation of concerns, type safety throughout, and a focus on developer experience and user customization.