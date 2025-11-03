# Battery Compliance Backend

Backend API for the Battery Compliance Management System.

## Tech Stack

- **Node.js** (v18+)
- **Express.js** - Web framework
- **MongoDB** - Database
- **Multer** - File upload handling

## Prerequisites

- Node.js 18+
- MongoDB installed locally or MongoDB Atlas account

## Environment Variables

Copy `env.example` to `.env` and configure the following:

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - MongoDB connection string (e.g., `mongodb://localhost:27017/project`)
- `CORS_ORIGIN` - Allowed CORS origins (comma-separated)

## Local Development

1. Install MongoDB locally:
   - Windows: Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - Mac: `brew install mongodb-community`
   - Linux: Follow [MongoDB installation guide](https://www.mongodb.com/docs/manual/installation/)

2. Start MongoDB:
   - Windows: MongoDB should start as a service automatically
   - Mac/Linux: `brew services start mongodb-community` or `sudo systemctl start mongod`

3. Install dependencies:
```bash
npm install
```

4. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your local MongoDB connection string
```

5. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The database collections will be automatically initialized on first run.

### API Endpoints

- `GET /` - Health check
- `GET /api/health` - Detailed health check
- `POST /api/upload` - Upload files
- `GET /api/results` - Get analysis results
- `POST /api/requirements` - Manage requirements

## Project Structure

```
backend/
├── db/           # Database configuration and migrations
├── routes/       # API routes
├── uploads/      # Uploaded files (not in git)
├── server.js     # Main server file
└── package.json  # Dependencies and scripts
```
