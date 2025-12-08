# Weave Fullstack Exam – Project Overview

## Project Summary
A fullstack web application built with Laravel (API) and React (frontend), demonstrating:
- RESTful API with Sanctum authentication
- CRUD operations for posts, comments, likes, follows etc.
- Dockerized development environment
- Responsive frontend with React

## Architecture
### Backend
- **Framework**: Laravel (PHP 8.2)
- **Authentication**: Sanctum
- **Database**: MySQL 8.0
- **Image Handling**: GD library (Freetype, JPEG, Webp support)
- **Dependencies**: Composer-managed, including pdo_mysql, mbstring, gd, zip
- **Testing**: PHPUnit for backend tests
- **Environment**: .env-based configuration, auto-generated APP_KEY
- **API Docs**: OpenAPI/Swagger, [API Documentation](https://two025-fullstack-exam-zzdo.onrender.com/swagger)
- **Error Tracking**: Sentry
- **Logging**: Laravel’s built-in logging (stack driver) and Sentry integration for error tracking.

### Frontend
- **Framework**: React (v19.2.0)
- **State Management**: Handled via props and React Query. Local state is managed using React hooks such as useState and useEffect.
- **UI**:
    - Responsive design
    - Icons via react-icons (v5.5.0) & Font Awesome 6.4.0 (via CDN)
    - **Responsive Design**: Mobile-first CSS and responsive layouts.
    - Custom CSS
- **Routing**: react-router-dom (v6.30.2)
- **HTTP Client**: axios (v1.13.2)
- **Date Handling**: moment (v2.30.1)
- **Testing**:
    - @testing-library/react (v16.3.0)
    - @testing-library/jest-dom (v6.9.1)
    - npm test
- **Build Tools**:
    - react-scripts (v5.0.1) for build, start, and test scripts
    - CI= flag in build script for compatibility with CI environments
- **Caching**: Implemented via React Query with `staleTime` and `cacheTime` to cache API responses.

### Infrastructure
- **Docker**: 
    - PHP 8.2 + Apache, MariaDB, and PHP extensions (pdo_mysql, gd, etc.)
    - Custom entrypoint script for container initialization
- **CI/CD**: GitHub Actions for automated testing and deployment to [Render](https://frontend-bezt.onrender.com/)
- **Storage**: Local file uploads (linked storage) + remote image fallbacks (picsum)

## CI/CD Pipelines
### Backend
- **Tests**: Runs PHPUnit on push to main (MySQL 8.0 container)
- **Deployment**: Auto-deploys to Render after successful tests

### Frontend
- **Tests**: Runs npm test on push to main
- **Build**: Creates optimized production build with npm run build
- **Deployment**: Auto-deploys to Render after successful build

## Data Seeding & Defaults
- **Fake Data**: The database is seeded using Faker to generate realistic fake users, posts, comments, likes, follows, and reposts.
- **Images**: Profile and post images use remote picsum.photos URLs as fallbacks.
- **Soft Deletes**: Posts and users use Laravel’s soft delete feature, so deleted data are retained in the database but hidden from the UI.
- **Default Credentials**: All seeded users share the same password (hashed with bcrypt).
- **Data Reset**: The seeder truncates existing data and resets auto-increment IDs for a clean state, with foreign key checks temporarily disabled during the process.
- **Scalability**: Database migrations include indexes for performance-critical columns (e.g., `user_pk`, `post_pk`)

## Security
- **Authentication**: Sanctum is used for secure API authentication, with stateful domains configured for the React frontend.
- **Password Hashing**: All user passwords are hashed using bcrypt.
- **Environment Variables**: Sensitive configuration (e.g., database credentials, API keys) is managed via .env and excluded from version control.
- **CSRF Protection**: Laravel’s built-in CSRF protection is enabled for forms and state-changing operations.
- **CORS**: Configured to restrict API access to trusted frontend domains.
- **HTTPS**: Enforced in production for secure communication.
- **Dependencies**: Regularly updated to patch known vulnerabilities (managed via Composer and npm).
- **Default Credentials**: Seeded users use a default password for demonstration purposes.
- **User accounts & privileges**: MySQL-Account privileges




