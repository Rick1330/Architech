import pytest
import asyncio
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.database import get_db, Base
from app.core.config import settings

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)

def test_register_user(client):
    """Test user registration"""
    response = client.post(
        "/api/v1/users/register",
        json={
            "full_name": "testuser",
            "email": "test@example.com",
            "password": "testpassword123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["full_name"] == "testuser"
    assert data["email"] == "test@example.com"
    assert "id" in data
    assert "password" not in data

def test_register_duplicate_user(client):
    """Test registration with duplicate email"""
    # First registration
    client.post(
        "/api/v1/users/register",
        json={
            "full_name": "user1",
            "email": "duplicate@example.com",
            "password": "password123"
        }
    )
    
    # Duplicate registration
    response = client.post(
        "/api/v1/users/register",
        json={
            "full_name": "user2",
            "email": "duplicate@example.com",
            "password": "password456"
        }
    )
    assert response.status_code == 400

def test_login_user(client):
    """Test user login"""
    # Register user first
    client.post(
        "/api/v1/users/register",
        json={
            "username": "loginuser",
            "email": "login@example.com",
            "password": "loginpassword123"
        }
    )
    
    # Login
    response = client.post(
        "/api/v1/users/login",
        json={
            "email": "login@example.com",
            "password": "loginpassword123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "user" in data

def test_login_invalid_credentials(client):
    """Test login with invalid credentials"""
    response = client.post(
        "/api/v1/users/login",
        json={
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401

def test_get_current_user(client):
    """Test getting current user profile"""
    # Register and login user
    client.post(
        "/api/v1/users/register",
        json={
            "full_name": "profileuser",
            "email": "profile@example.com",
            "password": "profilepassword123"
        }
    )
    
    login_response = client.post(
        "/api/v1/users/login",
        json={
            "email": "profile@example.com",
            "password": "profilepassword123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Get profile
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "profileuser"
    assert data["email"] == "profile@example.com"

def test_get_current_user_unauthorized(client):
    """Test getting current user without token"""
    response = client.get("/api/v1/users/me")
    assert response.status_code == 403

def test_update_user_profile(client):
    """Test updating user profile"""
    # Register and login user
    client.post(
        "/api/v1/users/register",
        json={
            "full_name": "updateuser",
            "email": "update@example.com",
            "password": "updatepassword123"
        }
    )
    
    login_response = client.post(
        "/api/v1/users/login",
        json={
            "email": "update@example.com",
            "password": "updatepassword123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Update profile
    response = client.put(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "full_name": "updateduser",
            "email": "updated@example.com"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "updateduser"
    assert data["email"] == "updated@example.com"

def test_health_check(client):
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "user-service"}

