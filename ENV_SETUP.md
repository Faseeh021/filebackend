# Environment Variables Setup

This guide explains how to set up environment variables for the project.

## Quick Setup

### Automatic Setup

**Linux/Mac:**
```bash
chmod +x setup-env.sh
./setup-env.sh
```

**Windows:**
```cmd
setup-env.bat
```

### Manual Setup

1. **Backend Environment Variables**

   Create `backend/.env` file:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   # For local development (without Docker)
   # DATABASE_URL=postgresql://postgres:postgres@localhost:5432/battery_compliance

   # For Docker Compose (when backend runs in Docker)
   DATABASE_URL=postgresql://postgres:postgres@postgres:5432/battery_compliance

   # For local development with Docker (backend locally, DB in Docker)
   # DATABASE_URL=postgresql://postgres:postgres@localhost:5432/battery_compliance
   ```

2. **Frontend Environment Variables**

   Create `frontend/.env` file:
   ```env
   # API Configuration
   # For local development
   VITE_API_URL=http://localhost:5000

   # For production (replace with your Railway backend URL)
   # VITE_API_URL=https://your-backend.railway.app
   ```

## Environment Variables Reference

### Backend (`.env`)

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `PORT` | Server port | `5000` | `5000` |
| `NODE_ENV` | Environment mode | `development` | `development`, `production` |
| `DATABASE_URL` | PostgreSQL connection string | - | `postgresql://user:pass@host:5432/dbname` |

**DATABASE_URL Format:**
```
postgresql://username:password@host:port/database_name
```

**Common Configurations:**

1. **Local Development (no Docker):**
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/battery_compliance
   ```

2. **Local Backend + Docker Database:**
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/battery_compliance
   ```

3. **Both Backend and DB in Docker:**
   ```env
   DATABASE_URL=postgresql://postgres:postgres@postgres:5432/battery_compliance
   ```
   (Note: `postgres` is the service name in docker-compose)

4. **Production (Railway):**
   ```env
   DATABASE_URL=<provided_by_railway>
   ```

### Frontend (`.env`)

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` | `http://localhost:5000` |

**Important:** All frontend environment variables must be prefixed with `VITE_` to be accessible in the browser.

## Environment-Specific Configurations

### Development (Local)

**Backend:**
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/battery_compliance
```

**Frontend:**
```env
VITE_API_URL=http://localhost:5000
```

### Development (Docker)

**Backend:**
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/battery_compliance
```

**Frontend:**
```env
VITE_API_URL=http://localhost:5000
```

### Production

**Backend (Railway):**
```env
PORT=5000
NODE_ENV=production
DATABASE_URL=<railway_provided_url>
```

**Frontend (Vercel):**
```env
VITE_API_URL=https://your-backend.railway.app
```

## Troubleshooting

### Backend can't connect to database

1. **Check DATABASE_URL format:**
   - Should start with `postgresql://`
   - Check username, password, host, port, and database name

2. **For Docker setup:**
   - If backend is in Docker: use service name `postgres` as host
   - If backend is local: use `localhost` as host
   - Ensure PostgreSQL container is running: `docker-compose ps`

3. **Check PostgreSQL is accessible:**
   ```bash
   # Test connection
   psql "postgresql://postgres:postgres@localhost:5432/battery_compliance"
   ```

### Frontend can't reach backend

1. **Check VITE_API_URL:**
   - Ensure it starts with `http://` or `https://`
   - Verify the backend is running on that port
   - Check CORS settings if needed

2. **Clear Vite cache:**
   ```bash
   cd frontend
   rm -rf node_modules/.vite
   npm run dev
   ```

### Environment variables not loading

1. **Backend:**
   - Ensure `dotenv` is installed and configured
   - Check `.env` file is in `backend/` directory
   - Restart the server after changing `.env`

2. **Frontend:**
   - Variables must be prefixed with `VITE_`
   - Restart dev server after changing `.env`
   - Access via `import.meta.env.VITE_VARIABLE_NAME`

## Security Notes

⚠️ **Never commit `.env` files to version control!**

- `.env` files are gitignored by default
- Use `.env.example` as a template
- For production, set environment variables in your hosting platform:
  - **Vercel**: Project Settings > Environment Variables
  - **Railway**: Variables tab

## Example .env Files

See:
- `backend/.env.example` - Backend template
- `frontend/.env.example` - Frontend template

These files contain default values and can be copied to create your actual `.env` files.
