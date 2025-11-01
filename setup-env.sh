#!/bin/bash

# Setup script to create .env files from examples

echo "Setting up environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    if [ -f "backend/env.example" ]; then
        echo "Creating backend/.env from env.example..."
        cp backend/env.example backend/.env
        echo "✓ backend/.env created"
    else
        echo "Creating backend/.env from template..."
        cat > backend/.env << 'EOF'
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
# For local development with Docker (backend locally, DB in Docker)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/battery_compliance

# For Docker Compose (when backend runs in Docker)
# DATABASE_URL=postgresql://postgres:postgres@postgres:5432/battery_compliance
EOF
        echo "✓ backend/.env created"
    fi
else
    echo "⚠ backend/.env already exists, skipping..."
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    if [ -f "frontend/env.example" ]; then
        echo "Creating frontend/.env from env.example..."
        cp frontend/env.example frontend/.env
        echo "✓ frontend/.env created"
    else
        echo "Creating frontend/.env from template..."
        cat > frontend/.env << 'EOF'
# API Configuration
# For local development
VITE_API_URL=http://localhost:5000

# For production (replace with your Railway backend URL)
# VITE_API_URL=https://your-backend.railway.app
EOF
        echo "✓ frontend/.env created"
    fi
else
    echo "⚠ frontend/.env already exists, skipping..."
fi

echo ""
echo "Environment files setup complete!"
echo ""
echo "Please review and update the .env files with your configuration:"
echo "  - backend/.env - Database connection, port, etc."
echo "  - frontend/.env - API URL for backend"
