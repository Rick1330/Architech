#!/bin/bash

# Architech Environment Setup Script
# This script helps developers set up their environment variables securely

set -e

echo "🚀 Setting up Architech development environment..."
echo "⚠️  SECURITY: This script generates secure random secrets"
echo ""

# Function to generate a random JWT secret
generate_jwt_secret() {
    openssl rand -base64 64 2>/dev/null || python3 -c "import secrets; print(secrets.token_urlsafe(64))" 2>/dev/null || echo "INSECURE_JWT_SECRET_$(date +%s)_CHANGE_ME"
}

# Function to generate a random password
generate_password() {
    openssl rand -base64 24 2>/dev/null | tr -d "=+/" | cut -c1-24 || echo "INSECURE_PASSWORD_$(date +%s)_CHANGE_ME"
}

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Creating backup as .env.backup"
    cp .env .env.backup
fi

# Create .env from template
echo "📝 Creating .env file from .env.example..."
cp .env.example .env

# Generate secure values
echo "🔐 Generating secure secrets..."
JWT_SECRET=$(generate_jwt_secret)
DB_PASSWORD=$(generate_password)
DB_USER="architech_$(date +%s)"  # Make username unique too

# Update .env with generated values
sed -i "s/CHANGE_ME_GENERATE_SECURE_JWT_SECRET/$JWT_SECRET/g" .env
sed -i "s/CHANGE_ME_\$(date +%s)/$DB_PASSWORD/g" .env
sed -i "s/POSTGRES_USER=architech/POSTGRES_USER=$DB_USER/g" .env

echo "✅ Environment file created with secure generated values!"
echo ""
echo "📋 Generated configuration:"
echo "   Database user: $DB_USER"
echo "   Database password: [GENERATED - 24 chars]"
echo "   JWT secret: [GENERATED - 64 chars]"
echo ""
echo "🔧 Next steps:"
echo "   1. Review and customize .env file if needed"
echo "   2. Set up frontend environment:"
echo "      cd frontend && cp .env.example .env.local"
echo "   3. Start the services:"
echo "      docker-compose up --build"
echo ""
echo "⚠️  SECURITY CRITICAL:"
echo "   - NEVER commit .env files to version control"
echo "   - Change these secrets in production"
echo "   - Use proper secrets management in production (AWS Secrets Manager, etc.)"
echo "   - Rotate secrets regularly"
echo "   - Use strong, unique secrets for each environment"