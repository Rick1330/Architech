@echo off
setlocal enabledelayedexpansion

REM Architech Environment Setup Script for Windows
REM This script helps developers set up their environment variables

echo 🚀 Setting up Architech development environment...

REM Check if .env already exists
if exist ".env" (
    echo ⚠️  .env file already exists. Creating backup as .env.backup
    copy ".env" ".env.backup" >nul
)

REM Create .env from template
echo 📝 Creating .env file from .env.example...
copy ".env.example" ".env" >nul

REM Generate random values using PowerShell
for /f "delims=" %%i in ('powershell -command "[System.Web.Security.Membership]::GeneratePassword(16, 4)"') do set DB_PASSWORD=%%i
for /f "delims=" %%i in ('powershell -command "[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString()))"') do set JWT_SECRET=%%i

REM Update .env with generated values (basic replacement - manual editing recommended)
powershell -command "(Get-Content .env) -replace 'your-jwt-secret-key', '!JWT_SECRET!' | Set-Content .env"
powershell -command "(Get-Content .env) -replace 'architech_password', '!DB_PASSWORD!' | Set-Content .env"

echo ✅ Environment file created with secure defaults!
echo.
echo 📋 Generated configuration:
echo    Database password: !DB_PASSWORD!
echo    JWT secret: [GENERATED]
echo.
echo 🔧 Next steps:
echo    1. Review and customize .env file if needed
echo    2. Set up frontend environment:
echo       cd frontend ^&^& copy .env.example .env.local
echo    3. Start the services:
echo       docker-compose up --build
echo.
echo ⚠️  SECURITY NOTE:
echo    - Change these passwords in production
echo    - Never commit .env files to version control
echo    - Use proper secrets management in production

pause