-- Database initialization script for Architech
-- This script creates the necessary databases and extensions

-- Create databases for different services if they don't exist
CREATE DATABASE IF NOT EXISTS architech_users;
CREATE DATABASE IF NOT EXISTS architech_projects;
CREATE DATABASE IF NOT EXISTS architech_designs;
CREATE DATABASE IF NOT EXISTS architech_simulations;
CREATE DATABASE IF NOT EXISTS architech_observability;

-- Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create a common user for all services (in production, each service should have its own user)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'architech_service') THEN
        CREATE ROLE architech_service WITH LOGIN PASSWORD 'service_password';
    END IF;
END
$$;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE architech TO architech_service;
GRANT ALL PRIVILEGES ON DATABASE architech_users TO architech_service;
GRANT ALL PRIVILEGES ON DATABASE architech_projects TO architech_service;
GRANT ALL PRIVILEGES ON DATABASE architech_designs TO architech_service;
GRANT ALL PRIVILEGES ON DATABASE architech_simulations TO architech_service;
GRANT ALL PRIVILEGES ON DATABASE architech_observability TO architech_service;

-- Create initial schema structure (will be managed by individual services via migrations)
\c architech;

-- Users table (managed by user-service)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table (managed by project-service)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Designs table (managed by design-service)
CREATE TABLE IF NOT EXISTS designs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    design_data JSONB NOT NULL DEFAULT '{}',
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_designs_project_id ON designs(project_id);
CREATE INDEX IF NOT EXISTS idx_designs_design_data ON designs USING GIN(design_data);

-- Insert some initial data for development
INSERT INTO users (email, hashed_password, full_name, is_verified) 
VALUES ('admin@architech.dev', crypt('admin123', gen_salt('bf')), 'Admin User', TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO projects (name, description, owner_id)
SELECT 'Sample Project', 'A sample project for testing', u.id
FROM users u WHERE u.email = 'admin@architech.dev'
ON CONFLICT DO NOTHING;

