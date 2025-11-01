# File Management System

A web application for file upload, management, and download with automated file conversion, progress tracking, results management, and PDF report generation.

## Project Structure

```
Project/
├── frontend/          # React application (deploys to Vercel)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   └── package.json
├── backend/           # Node.js/Express API (deploys to Railway)
│   ├── routes/
│   ├── db/
│   └── server.js
└── README.md
```

## Features

- **Dashboard**: Welcome page with upload button
- **Upload**: Drag-and-drop file upload with progress tracking and image preview
- **Results**: List of all uploaded files with download functionality for PDF reports
- **Requirements**: Reference table of file management rules and standards

## Tech Stack

### Frontend
- React 18
- React Router
- Vite
- Axios

### Backend
- Node.js (ES Modules)
- Express.js
- PostgreSQL
- Multer (file uploads)
- PDFKit (PDF generation)

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Docker Desktop (for Docker setup)
- PostgreSQL database (or use Docker)
- npm or yarn

### Quick Setup

1. **Set up environment variables:**
   
   **Windows:**
   ```bash
   setup-env.bat
   ```
   
   **Linux/Mac:**
   ```bash
   chmod +x setup-env.sh
   ./setup-env.sh
   ```
   
   Or manually copy the example files:
   ```bash
   cp backend/env.example backend/.env
   cp frontend/env.example frontend/.env
   ```

2. **Start Docker containers (PostgreSQL):**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Set up backend:**
   ```bash
   cd backend
   npm install
   npm run db:generate
   npm run db:migrate
   npm run dev
   ```

4. **Set up frontend (in a new terminal):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Environment Variables

See [ENV_SETUP.md](ENV_SETUP.md) for detailed environment variable configuration.

**Quick Reference:**

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/file_management
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000
```

### Frontend Setup (Local Development)

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see above)

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup (Local Development)

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see above)

4. Start Docker PostgreSQL (if not already running):
```bash
docker-compose -f docker-compose.dev.yml up -d
```

5. Generate and run migrations:
```bash
npm run db:generate
npm run db:migrate
```

6. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The backend will be available at `http://localhost:5000`

## Deployment

### Frontend Deployment (Vercel)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Navigate to the frontend directory:
```bash
cd frontend
```

3. Deploy:
```bash
vercel
```

4. Set environment variable in Vercel dashboard:
   - `VITE_API_URL`: Your Railway backend URL (e.g., `https://your-app.railway.app`)

### Backend Deployment (Railway)

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Navigate to the backend directory:
```bash
cd backend
```

4. Initialize Railway project:
```bash
railway init
```

5. Add PostgreSQL service in Railway dashboard

6. Set environment variables in Railway:
   - `DATABASE_URL`: Automatically set by Railway PostgreSQL service
   - `PORT`: Railway will set this automatically
   - `NODE_ENV`: `production`

7. Deploy:
```bash
railway up
```

## API Endpoints

### Upload
- `POST /api/upload` - Upload a file
  - Body: Form-data with `file` field
  - Returns: Upload record and result entry

### Results
- `GET /api/results` - Get all results
- `GET /api/results/:id` - Get single result
- `GET /api/results/:id/download` - Download PDF report

### Requirements
- `GET /api/requirements` - Get all requirements
- `GET /api/requirements/:id` - Get single requirement
- `POST /api/requirements` - Create new requirement

## Docker Setup with Drizzle ORM

The project now uses Docker containers and Drizzle ORM for database management. See [DOCKER_SETUP.md](DOCKER_SETUP.md) for detailed instructions.

### Quick Start with Docker

1. **Start PostgreSQL container:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Install dependencies and generate migrations:**
   ```bash
   cd backend
   npm install
   npm run db:generate
   npm run db:migrate
   ```

3. **Start the backend:**
   ```bash
   npm run dev
   ```

4. **Open Drizzle Studio (in another terminal):**
   ```bash
   cd backend
   npm run db:studio
   ```
   
   Visit `http://localhost:4983` to view and manage your database.

## Database Schema (Drizzle ORM)

The database schema is defined in `backend/db/schema.js` using Drizzle ORM:

### uploads
- `id` - Serial primary key
- `filename` - Generated filename
- `originalFilename` - Original filename
- `filePath` - Path to uploaded file
- `fileSize` - File size in bytes
- `fileType` - MIME type
- `uploadedAt` - Timestamp
- `userId` - User identifier

### results
- `id` - Serial primary key
- `uploadId` - Foreign key to uploads
- `configured` - Boolean flag
- `issuesDetected` - Number of issues found
- `reportPath` - Path to generated PDF report
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### requirements
- `id` - Serial primary key
- `description` - Requirement description
- `createdAt` - Timestamp

### Database Commands

```bash
# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate

# Push schema changes (development)
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

## License

MIT
