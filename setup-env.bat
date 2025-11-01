@echo off
REM Setup script to create .env files from examples (Windows)

echo Setting up environment files...

REM Backend .env
if not exist "backend\.env" (
    if exist "backend\env.example" (
        echo Creating backend\.env from env.example...
        copy "backend\env.example" "backend\.env" >nul
    ) else (
        echo Creating backend\.env from template...
        (
            echo # Server Configuration
            echo PORT=5000
            echo NODE_ENV=development
            echo.
            echo # Database Configuration
            echo # For local development with Docker (backend locally, DB in Docker^)
            echo DATABASE_URL=postgresql://postgres:postgres@localhost:5432/battery_compliance
            echo.
            echo # For Docker Compose (when backend runs in Docker^)
            echo # DATABASE_URL=postgresql://postgres:postgres@postgres:5432/battery_compliance
        ) > backend\.env
    )
    echo ✓ backend\.env created
) else (
    echo ⚠ backend\.env already exists, skipping...
)

REM Frontend .env
if not exist "frontend\.env" (
    if exist "frontend\env.example" (
        echo Creating frontend\.env from env.example...
        copy "frontend\env.example" "frontend\.env" >nul
    ) else (
        echo Creating frontend\.env from template...
        (
            echo # API Configuration
            echo # For local development
            echo VITE_API_URL=http://localhost:5000
            echo.
            echo # For production (replace with your Railway backend URL^)
            echo # VITE_API_URL=https://your-backend.railway.app
        ) > frontend\.env
    )
    echo ✓ frontend\.env created
) else (
    echo ⚠ frontend\.env already exists, skipping...
)

echo.
echo Environment files setup complete!
echo.
echo Please review and update the .env files with your configuration:
echo   - backend\.env - Database connection, port, etc.
echo   - frontend\.env - API URL for backend
pause
