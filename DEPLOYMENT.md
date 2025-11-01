# Deployment Guide

This guide provides step-by-step instructions for deploying the frontend to Vercel and backend to Railway.

## Frontend Deployment (Vercel)

### Prerequisites
- A GitHub account
- Node.js installed locally

### Steps

1. **Create a GitHub repository** and push your frontend code:
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your repository
   - Set the following:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

3. **Configure Environment Variables**:
   - In Vercel dashboard, go to Project Settings > Environment Variables
   - Add: `VITE_API_URL` = `https://your-railway-backend.railway.app`

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

## Backend Deployment (Railway)

### Prerequisites
- A Railway account
- Railway CLI installed (optional): `npm i -g @railway/cli`

### Steps

1. **Create a Railway project**:
   - Go to [railway.app](https://railway.app)
   - Sign in with your GitHub account
   - Click "New Project"
   - Select "Deploy from GitHub repo" or "Empty Project"

2. **Add PostgreSQL database**:
   - In your Railway project, click "New" → "Database" → "Add PostgreSQL"
   - Railway will automatically create a PostgreSQL instance
   - Note the connection details (automatically available as `DATABASE_URL`)

3. **Connect your repository**:
   - If using GitHub integration:
     - Click "New" → "GitHub Repo"
     - Select your repository
     - Set the root directory to `backend`
   - Or use Railway CLI:
     ```bash
     cd backend
     railway login
     railway init
     railway link
     ```

4. **Configure Environment Variables**:
   - In Railway dashboard, go to Variables tab
   - Add the following:
     - `DATABASE_URL`: Automatically set by Railway PostgreSQL service
     - `PORT`: Automatically set by Railway (usually 5000)
     - `NODE_ENV`: `production`
     - `CORS_ORIGIN`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)

5. **Configure Build Settings**:
   - Railway will auto-detect Node.js
   - Make sure the root directory is set to `backend`
   - Build command: `npm install`
   - Start command: `npm start`

6. **Deploy**:
   - Railway will automatically deploy on git push
   - Or click "Deploy" in the dashboard

7. **Get your backend URL**:
   - After deployment, Railway provides a public URL
   - Format: `https://your-project-name.railway.app`
   - Update your frontend's `VITE_API_URL` with this URL

## Post-Deployment Checklist

- [ ] Frontend deployed on Vercel
- [ ] Backend deployed on Railway
- [ ] PostgreSQL database connected
- [ ] Environment variables configured
- [ ] Frontend `VITE_API_URL` points to Railway backend
- [ ] Backend CORS configured to allow frontend origin
- [ ] Test file upload functionality
- [ ] Test PDF download functionality
- [ ] Verify database tables are created

## Troubleshooting

### CORS Issues
If you see CORS errors:
- Ensure `VITE_API_URL` in Vercel matches your Railway backend URL
- Check that Railway backend has CORS middleware enabled (already in code)
- Verify the origin in CORS settings

### Database Connection Issues
- Verify `DATABASE_URL` is set in Railway
- Check that PostgreSQL service is running
- Ensure database tables are created (should happen automatically)

### File Upload Issues
- Check that `uploads/` directory is writable
- Verify file size limits (20MB max)
- Check file type restrictions

### PDF Generation Issues
- Verify PDFKit is installed
- Check that reports directory is accessible
- Verify response headers are set correctly

## Local Development vs Production

### Local Development
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Database: Local PostgreSQL or Railway PostgreSQL

### Production
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-project.railway.app`
- Database: Railway PostgreSQL

## Updating Deployments

### Frontend (Vercel)
- Push changes to GitHub
- Vercel automatically redeploys
- Or manually trigger from Vercel dashboard

### Backend (Railway)
- Push changes to GitHub
- Railway automatically redeploys
- Or manually trigger from Railway dashboard
- For database migrations, they run automatically on startup

## Monitoring

### Vercel
- View logs in Vercel dashboard
- Monitor analytics and performance

### Railway
- View logs in Railway dashboard
- Monitor resource usage
- Set up alerts if needed

## Cost Considerations

### Vercel
- Free tier: 100GB bandwidth/month
- Suitable for most projects

### Railway
- Free tier: $5 credit/month
- Pay-as-you-go pricing
- PostgreSQL included in project pricing

