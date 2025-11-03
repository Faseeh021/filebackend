# File Management System - Frontend

React frontend application for the File Management System.

## Tech Stack

- React 18
- React Router
- Vite
- Axios

## Prerequisites

- Node.js 18+
- Backend server running (see backend README)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your backend API URL
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port shown in terminal)

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: `http://localhost:5000`)

## Deployment

### Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variable in Vercel dashboard:
   - `VITE_API_URL`: Your backend URL

## Project Structure

```
frontend/
├── src/
│   ├── components/    # Reusable components
│   ├── pages/         # Page components
│   ├── utils/         # Utility functions (API, etc.)
│   └── main.jsx       # Entry point
├── public/            # Static files
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
