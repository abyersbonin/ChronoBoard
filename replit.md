# Personal Dashboard Application

## Overview

This is a full-stack personal dashboard application built with React, Express, and PostgreSQL. It provides users with a customizable dashboard featuring calendar integration, weather information, and various personal productivity tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Calendar Event Fixes (July 26, 2025)
- Fixed recurring calendar events not displaying properly
- Added proper handling for RRULE (recurring rule) processing 
- Implemented deduplication logic to prevent duplicate events
- Enhanced event parsing to handle daily recurring events (like 4pm daily events)
- Fixed event ID generation for recurring instances to make them unique
- Identified that some "duplicates" are actually legitimate recurring events at different times
- Found real duplicate issues where same events appear multiple times at exact same time
- Working on improved deduplication based on title, start time, and end time normalization

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