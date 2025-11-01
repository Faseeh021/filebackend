# Docker Setup with Drizzle ORM

This guide explains how to set up and use Docker containers with Drizzle ORM for database visualization and management.

## Prerequisites

- Docker Desktop installed
- Docker Compose installed (comes with Docker Desktop)

## Quick Start

1. **Start Docker containers:**
   ```bash
   docker-compose up -d
   ```

2. **Generate and run migrations:**
   ```bash
   cd backend
   npm install
   npm run db:generate
   npm run db:migrate
   ```

3. **Start the backend server:**
   ```bash
   npm run dev
   ```

4. **Open Drizzle Studio (in a new terminal):**
   ```bash
   cd backend
   npm run db:studio
   ```

   Drizzle Studio will open at `http://localhost:4983` where you can:
   - View all database tables
   - Browse and edit data
   - Run queries
   - See relationships between tables

## Docker Services

### PostgreSQL Database
- **Container**: `battery-compliance-db`
- **Port**: `5432`
- **Database**: `battery_compliance`
- **User**: `postgres`
- **Password**: `postgres`
- **Connection String**: `postgresql://postgres:postgres@localhost:5432/battery_compliance`

### Backend API
- **Container**: `battery-compliance-backend`
- **Port**: `5000`
- **Auto-reload**: Enabled (watches for file changes)

## Database Management Commands

### Generate Migration Files
```bash
cd backend
npm run db:generate
```
This creates migration files based on your schema in `backend/drizzle/`.

### Run Migrations
```bash
cd backend
npm run db:migrate
```
Applies pending migrations to the database.

### Push Schema Changes (without migrations)
```bash
cd backend
npm run db:push
```
Directly pushes schema changes to the database (useful for development).

### Open Drizzle Studio
```bash
cd backend
npm run db:studio
```
Opens a web-based database viewer at `http://localhost:4983`.

## Database Schema

The database consists of three main tables:

### `uploads`
Stores file upload information:
- `id` - Primary key
- `filename` - Generated filename
- `originalFilename` - Original filename
- `filePath` - Path to uploaded file
- `fileSize` - File size in bytes
- `fileType` - MIME type
- `uploadedAt` - Timestamp
- `userId` - User identifier

### `results`
Stores compliance check results:
- `id` - Primary key
- `uploadId` - Foreign key to uploads
- `configured` - Boolean flag
- `issuesDetected` - Number of issues found
- `reportPath` - Path to generated PDF report
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### `requirements`
Stores compliance requirements/rules:
- `id` - Primary key
- `description` - Requirement description
- `createdAt` - Timestamp

## Environment Variables

Create a `backend/.env` file with:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/battery_compliance
NODE_ENV=development
```

**Note**: When using Docker Compose, the `DATABASE_URL` uses `postgres` as the hostname (service name) instead of `localhost`.

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL container is running: `docker ps`
- Check database health: `docker-compose ps`
- View logs: `docker-compose logs postgres`

### Migration Issues
- If migrations fail, you may need to reset the database:
  ```bash
  docker-compose down -v
  docker-compose up -d
  npm run db:migrate
  ```

### Drizzle Studio Not Opening
- Ensure port 4983 is not in use
- Check that migrations have been run
- Verify database connection string in `.env`

## Stopping Containers

```bash
# Stop containers (keeps data)
docker-compose stop

# Stop and remove containers (keeps volumes)
docker-compose down

# Stop and remove containers + volumes (deletes data)
docker-compose down -v
```

## Viewing Database in Docker

You can also access the PostgreSQL database directly:

```bash
# Using psql inside the container
docker exec -it battery-compliance-db psql -U postgres -d battery_compliance

# Using Docker Compose
docker-compose exec postgres psql -U postgres -d battery_compliance
```

## Useful SQL Commands

```sql
-- List all tables
\dt

-- Describe a table
\d uploads

-- Select all uploads
SELECT * FROM uploads;

-- Select all results with upload info
SELECT r.*, u.original_filename 
FROM results r 
LEFT JOIN uploads u ON r.upload_id = u.id;
```

## Development Workflow

1. **Make schema changes** in `backend/db/schema.js`
2. **Generate migrations**: `npm run db:generate`
3. **Review migrations** in `backend/drizzle/`
4. **Run migrations**: `npm run db:migrate`
5. **View in Drizzle Studio**: `npm run db:studio`
6. **Test your changes** in the application

## Production Considerations

For production deployment:
- Use environment-specific database credentials
- Don't expose database port publicly
- Use managed database services when possible
- Run migrations as part of deployment process
- Backup database regularly
