# Directory Microservice

Central hub within the EduCore system for finding, managing, and interacting with entities (trainers, courses, internal resources) across multiple microservices.

## Project Overview

- **Purpose:** Central hub for managing employees, companies, training requests, and learning paths
- **Scale (MVP):** 10 companies, 5-20 employees each (~200-500 concurrent users)
- **Platforms:** Desktop, tablet, and mobile web browsers (responsive design)

## Technology Stack

### Frontend
- **Framework:** React (JavaScript ES6 only - no TypeScript)
- **Styling:** Tailwind CSS (utility classes only)
- **Deployment:** Vercel

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** JavaScript (ES6) only - no TypeScript
- **Deployment:** Railway

### Database
- **Database:** PostgreSQL
- **Hosting:** Supabase
- **Migrations:** SQL migration files in `database/migrations/`

### CI/CD
- **Platform:** GitHub Actions
- **Workflow:** `.github/workflows/deploy.yml`

## Project Structure

```
Directory_Project/
├── frontend/          # React frontend application
├── backend/           # Node.js/Express backend API
├── database/          # Database migrations and schema
├── mockData/         # Mock data for fallback scenarios
├── docs/             # Documentation and artifacts
└── .github/          # GitHub Actions workflows
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL (or Supabase account)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Directory_Project
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Set up environment variables**
   - Copy `.env.example` to `.env` in both `frontend/` and `backend/`
   - Fill in all required environment variables

5. **Set up database**
   - Connect to Supabase
   - Run migrations from `database/migrations/`

### Development

**Frontend:**
```bash
cd frontend
npm start
```
Runs on `http://localhost:3000`

**Backend:**
```bash
cd backend
npm start
```
Runs on `http://localhost:5000`

## Documentation

- **Requirements:** `requirements.md`
- **Flow:** `flow.md`
- **Architecture:** `architecture.md`
- **Roadmap:** `roadmap.json`
- **UI/UX Requirements:** `docs/ui_ux_requirements.md`

## Features

See `requirements.md` for complete feature list (56 features total).

Key features:
- Company Registration (Two-step process)
- Employee Profile Management
- Skill Verification
- Training Request Management
- Learning Path Management
- Role-Based Access Control (RBAC)

## Deployment

### Quick Start

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial deployment-ready version"
   git push origin main
   ```

2. **Deploy Backend (Railway):**
   - See `docs/railway_deployment_setup.md` for detailed instructions
   - Set environment variables (see `docs/environment_variables_reference.md`)
   - Get backend URL after deployment

3. **Deploy Frontend (Vercel):**
   - See `docs/vercel_deployment_setup.md` for detailed instructions
   - Set `REACT_APP_API_URL` environment variable
   - Get frontend URL after deployment

4. **Update Environment Variables:**
   - Update `CORS_ORIGIN` in Railway with Vercel URL
   - Update `REACT_APP_API_URL` in Vercel with Railway URL
   - Redeploy both services

### Detailed Guides

- **Full Deployment Guide:** `docs/deployment_guide.md`
- **Railway Setup:** `docs/railway_deployment_setup.md`
- **Vercel Setup:** `docs/vercel_deployment_setup.md`
- **Environment Variables:** `docs/environment_variables_reference.md`

### Platforms

- **Frontend:** Deployed to Vercel
- **Backend:** Deployed to Railway
- **Database:** Hosted on Supabase
- **CI/CD:** GitHub Actions (see `.github/workflows/deploy.yml`)

## Contributing

Follow the roadmap and feature implementation guidelines in `roadmap.json`.

## License

[Your License Here]

