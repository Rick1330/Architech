import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import uuid

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
    return uuid.UUID("12345678-1234-5678-9012-123456789012")

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
    return uuid.UUID("12345678-1234-5678-9012-123456789012")

def test_create_project(client, mock_user_id):
    """Test project creation"""
    response = client.post(
        "/api/v1/projects/",
        json={
            "name": "Test Project",
            "description": "A test project for system design"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Project"
    assert data["description"] == "A test project for system design"
    assert data["owner_id"] == mock_user_id
    assert "id" in data
    assert "created_at" in data

def test_get_project(client, mock_user_id):
    """Test getting a specific project"""
    # Create project first
    create_response = client.post(
        "/api/v1/projects/",
        json={
            "name": "Get Test Project",
            "description": "Project for get test"
        }
    )
    project_id = str(create_response.json()["id"])
    
    # Get project
    response = client.get(f"/api/v1/projects/{project_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Get Test Project"
    assert data["id"] == project_id

def test_get_nonexistent_project(client):
    """Test getting a project that doesn't exist"""
    response = client.get("/api/v1/projects/nonexistent-id")
    assert response.status_code == 404

def test_list_projects(client, mock_user_id):
    """Test listing all projects"""
    # Create multiple projects
    for i in range(3):
        client.post(
            "/api/v1/projects/",
            json={
                "name": f"List Test Project {i}",
                "description": f"Project {i} for list test"
            }
        )
    
    # List projects
    response = client.get("/api/v1/projects/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3

def test_list_projects_by_owner(client, mock_user_id):
    """Test listing projects by owner"""
    # Create projects for specific owner
    for i in range(2):
        client.post(
            "/api/v1/projects/",
            json={
                "name": f"Owner Test Project {i}",
                "description": f"Project {i} for owner test"
            }
        )
    
    # List projects by owner
    response = client.get("/api/v1/projects/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2
    for project in data:
        assert project["owner_id"] == mock_user_id

def test_update_project(client, mock_user_id):
    """Test updating a project"""
    # Create project first
    create_response = client.post(
        "/api/v1/projects/",
        json={
            "name": "Update Test Project",
            "description": "Original description"
        }
    )
    project_id = str(create_response.json()["id"])
    
    # Update project
    response = client.put(
        f"/api/v1/projects/{project_id}",
        json={
            "name": "Updated Test Project",
            "description": "Updated description"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Test Project"
    assert data["description"] == "Updated description"
    assert data["id"] == project_id

def test_delete_project(client, mock_user_id):
    """Test deleting a project"""
    # Create project first
    create_response = client.post(
        "/api/v1/projects/",
        json={
            "name": "Delete Test Project",
            "description": "Project to be deleted"
        }
    )
    project_id = str(create_response.json()["id"])
    
    # Delete project
    response = client.delete(f"/api/v1/projects/{project_id}")
    assert response.status_code == 204
    
    # Verify project is deleted
    get_response = client.get(f"/api/v1/projects/{project_id}")
    assert get_response.status_code == 404

def test_add_collaborator(client, mock_user_id):
    """Test adding a collaborator to a project"""
    # Create project first
    create_response = client.post(
        "/api/v1/projects/",
        json={
            "name": "Collaboration Test Project",
            "description": "Project for collaboration test"
        }
    )
    project_id = str(create_response.json()["id"])
    
    # Add collaborator
    collaborator_id = "12345678-1234-5678-9012-123456789013"
    response = client.post(
        f"/api/v1/projects/{project_id}/collaborators",
        json={
            "user_id": collaborator_id,
            "role": "editor"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["user_id"] == collaborator_id
    assert data["role"] == "editor"

def test_health_check(client):
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "project-service"}

