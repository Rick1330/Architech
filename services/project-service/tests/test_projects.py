import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.database import get_db, Base
from app.api.v1.endpoints.projects import get_current_user_id

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_projects.db"

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

def override_get_current_user_id():
    return "12345678-1234-5678-9012-123456789012"

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user_id] = override_get_current_user_id

@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def mock_user_id():
    return "12345678-1234-5678-9012-123456789012"

def test_create_project(client, mock_user_id):
    """Test project creation"""
    response = client.post(
        "/api/v1/projects/",
        json={
            "name": "Test Project",
            "description": "A test project",
            "is_public": False
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Project"
    assert data["description"] == "A test project"
    assert data["is_public"] == False
    assert data["owner_id"] == mock_user_id

def test_get_projects(client):
    """Test getting user projects"""
    response = client.get("/api/v1/projects/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_project_by_id(client):
    """Test getting a specific project"""
    # First create a project
    create_response = client.post(
        "/api/v1/projects/",
        json={
            "name": "Test Project for Get",
            "description": "A test project for getting",
            "is_public": True
        }
    )
    assert create_response.status_code == 201
    project_id = create_response.json()["id"]
    
    # Then get it
    response = client.get(f"/api/v1/projects/{project_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Project for Get"

def test_update_project(client):
    """Test updating a project"""
    # First create a project
    create_response = client.post(
        "/api/v1/projects/",
        json={
            "name": "Test Project for Update",
            "description": "A test project for updating",
            "is_public": False
        }
    )
    assert create_response.status_code == 201
    project_id = create_response.json()["id"]
    
    # Then update it
    response = client.put(
        f"/api/v1/projects/{project_id}",
        json={
            "name": "Updated Test Project",
            "description": "An updated test project"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Test Project"
    assert data["description"] == "An updated test project"

def test_delete_project(client):
    """Test deleting a project"""
    # First create a project
    create_response = client.post(
        "/api/v1/projects/",
        json={
            "name": "Test Project for Delete",
            "description": "A test project for deleting",
            "is_public": False
        }
    )
    assert create_response.status_code == 201
    project_id = create_response.json()["id"]
    
    # Then delete it
    response = client.delete(f"/api/v1/projects/{project_id}")
    assert response.status_code == 200
    
    # Verify it's deleted
    get_response = client.get(f"/api/v1/projects/{project_id}")
    assert get_response.status_code == 404

def test_get_public_projects(client):
    """Test getting public projects"""
    response = client.get("/api/v1/projects/public")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_project_collaborators(client):
    """Test getting project collaborators"""
    # First create a project
    create_response = client.post(
        "/api/v1/projects/",
        json={
            "name": "Test Project for Collaborators",
            "description": "A test project for collaborators",
            "is_public": False
        }
    )
    assert create_response.status_code == 201
    project_id = create_response.json()["id"]
    
    # Get collaborators
    response = client.get(f"/api/v1/projects/{project_id}/collaborators")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_add_collaborator(client):
    """Test adding a collaborator to a project"""
    # First create a project
    create_response = client.post(
        "/api/v1/projects/",
        json={
            "name": "Test Project for Add Collaborator",
            "description": "A test project for adding collaborator",
            "is_public": False
        }
    )
    assert create_response.status_code == 201
    project_id = create_response.json()["id"]
    
    # Add collaborator
    response = client.post(
        f"/api/v1/projects/{project_id}/collaborators",
        json={
            "user_id": "12345678-1234-5678-9012-123456789013",
            "role": "editor"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["user_id"] == "12345678-1234-5678-9012-123456789013"
    assert data["role"] == "editor"

def test_health_check(client):
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "project-service"

