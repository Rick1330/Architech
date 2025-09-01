# Frontend-Backend Integration Setup

This document describes how the Architech frontend and backend services are configured to work together.

## Environment Configuration

### 1. Root Environment Variables

**For security, create environment files from templates:**

```bash
# Root project environment
cp .env.example .env

# Or use the setup script (Linux/Mac)
chmod +x setup-env.sh
./setup-env.sh
```

**⚠️ SECURITY IMPORTANT:**
- **Never commit** `.env` files to version control
- **Change default passwords** in production
- **Use secure secrets management** (AWS Secrets Manager, Azure Key Vault, etc.) in production
- **Rotate secrets regularly**

### 2. Frontend Environment Variables

Copy the example environment file and configure it for your setup:

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local` with your specific configuration:

- `VITE_API_BASE_URL`: Base URL for the API Gateway (default: http://localhost:8000)
- `VITE_API_GATEWAY_URL`: Full API Gateway URL with version (default: http://localhost:8000/api/v1)
- `VITE_WS_URL`: WebSocket URL for real-time updates (default: ws://localhost:8000/ws)
- `VITE_SIMULATION_ENGINE_URL`: Direct simulation engine URL (default: http://localhost:8080)

### 2. Development vs Production

**Development:**
- Uses Vite dev server with proxy configuration
- CORS is configured to allow localhost origins
- Hot reload enabled for all services
- Debug logging enabled

**Production:**
- Static files served by nginx
- CORS restricted to specific domains
- Optimized builds with minification
- Error tracking and monitoring enabled

## Running the Application

### Option 1: Full Docker Compose (Recommended)

```bash
# 1. Set up environment variables
cp .env.example .env
# Edit .env and change default passwords!

# 2. Run all services including frontend
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

Services will be available at:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8000
- Individual services: 8001-8004
- Simulation Engine: http://localhost:8080

### Option 2: Development Mode

```bash
# Run backend services
docker-compose up postgres redis kafka zookeeper api-gateway user-service project-service design-service simulation-orchestration-service simulation-engine

# Run frontend locally
cd frontend
npm install
npm run dev
```

Frontend will be available at http://localhost:12000 with hot reload.

### Option 3: Development Override

```bash
# Use development-specific configuration
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## API Integration

### Proxy Configuration

The Vite development server is configured to proxy API requests:

- `/api/*` → Backend API Gateway (port 8000)
- `/ws/*` → WebSocket connections
- `/simulation/*` → Direct simulation engine (port 8080)

### CORS Configuration

The API Gateway is configured to accept requests from:
- `http://localhost:3000` (Docker frontend)
- `http://localhost:12000` (Vite dev server)
- `http://frontend:3000` (Docker container name)

### Authentication

- JWT tokens are managed by the API client
- Tokens are automatically included in requests
- WebSocket connections include auth tokens
- Token refresh is handled automatically

## Service Communication

```
Frontend (3000/12000) 
    ↓ HTTP/WebSocket
API Gateway (8000)
    ↓ Internal HTTP
Backend Services (8001-8004)
    ↓ Database/Cache
PostgreSQL (5432) + Redis (6379)

Simulation Engine (8080) ←→ Kafka (9092)
```

## Development Workflow

1. **Start backend services:**
   ```bash
   docker-compose up -d postgres redis kafka zookeeper api-gateway simulation-engine
   ```

2. **Start individual backend services for development:**
   ```bash
   docker-compose up user-service project-service design-service simulation-orchestration-service
   ```

3. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:12000
   - API Documentation: http://localhost:8000/docs
   - Database: localhost:5432

## Troubleshooting

### CORS Issues
- Check that the frontend URL is included in the API Gateway CORS configuration
- Ensure the correct API base URL is set in environment variables

### Connection Issues
- Verify all services are running: `docker-compose ps`
- Check service logs: `docker-compose logs [service-name]`
- Ensure network connectivity: `docker network ls`

### Environment Variables
- Run `npm run dev` and check browser console for configuration logs
- Verify `.env.local` file exists and has correct values
- Check that environment variables are properly loaded in `config/environment.ts`

### Database Issues
- Ensure PostgreSQL is running: `docker-compose ps postgres`
- Check database initialization: `docker-compose logs postgres`
- Verify connection string in backend service environment variables

## Production Deployment

For production deployment:

1. Update CORS origins in API Gateway to production domains
2. Set appropriate environment variables for production
3. Use production-optimized Docker images
4. Configure SSL/TLS certificates
5. Set up proper logging and monitoring
6. Use secrets management for sensitive data

## Next Steps

- Set up CI/CD pipeline for integrated testing
- Add end-to-end tests covering frontend-backend integration
- Implement proper error handling and retry logic
- Add performance monitoring and logging
- Configure health checks for all services