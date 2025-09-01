import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import uuid

from app.main import app
from app.db.database import get_db, Base
from app.api.v1.endpoints.designs import get_current_user_id

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_designs.db"

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
def mock_project_id():
    return uuid.UUID("12345678-1234-5678-9012-123456789012")

def test_create_design(client, mock_project_id):
    """Test design creation"""
    response = client.post(
        "/api/v1/designs/",
        json={
            "name": "Test Design",
            "description": "A test system design",
            "project_id": str(mock_project_id)
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Design"
    assert data["description"] == "A test system design"
    assert data["project_id"] == str(mock_project_id)
    assert data["version"] == 1
    assert "id" in data

def test_get_design(client, mock_project_id):
    """Test getting a specific design"""
    # Create design first
    create_response = client.post(
        "/api/v1/designs/",
        json={
            "name": "Get Test Design",
            "description": "Design for get test",
            "project_id": str(mock_project_id)
        }
    )
    design_id = create_response.json()["id"]
    
    # Get design
    response = client.get(f"/api/v1/designs/{design_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Get Test Design"
    assert data["id"] == design_id

def test_get_nonexistent_design(client):
    """Test getting a design that doesn't exist"""
    response = client.get(f"/api/v1/designs/{uuid.uuid4()}")
    assert response.status_code == 404

def test_list_designs_by_project(client, mock_project_id):
    """Test listing designs by project"""
    # Create multiple designs
    for i in range(3):
        client.post(
            "/api/v1/designs/",
            json={
                "name": f"Project Design {i}",
                "description": f"Design {i} for project test",
                "project_id": str(mock_project_id)
            }
        )
    
    # List designs by project
    response = client.get(f"/api/v1/designs/project/{mock_project_id}")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3
    for design in data:
        assert design["project_id"] == str(mock_project_id)

def test_update_design(client, mock_project_id):
    """Test updating a design"""
    # Create design first
    create_response = client.post(
        "/api/v1/designs/",
        json={
            "name": "Update Test Design",
            "description": "Original description",
            "project_id": str(mock_project_id)
        }
    )
    design_id = create_response.json()["id"]
    
    # Update design
    response = client.put(
        f"/api/v1/designs/{design_id}",
        json={
            "name": "Updated Test Design",
            "description": "Updated description"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Test Design"
    assert data["description"] == "Updated description"
    assert data["id"] == design_id

def test_create_design_version(client, mock_project_id):
    """Test creating a new version of a design"""
    # Create original design
    create_response = client.post(
        "/api/v1/designs/",
        json={
            "name": "Version Test Design",
            "description": "Original version",
            "project_id": str(mock_project_id)
        }
    )
    original_design_id = create_response.json()["id"]
    
    # Create new version
    response = client.post(
        f"/api/v1/designs/{original_design_id}/versions",
        json={
            "version_number": 2,
            "commit_message": "New version"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["version_number"] == 2
    assert data["commit_message"] == "New version"
    
def test_add_component_to_design(client, mock_project_id):
    """Test adding a component to a design"""
    # Create design first
    create_response = client.post(
        "/api/v1/designs/",
        json={
            "name": "Component Test Design",
            "description": "Design for component test",
            "project_id": str(mock_project_id)
        }
    )
    design_id = create_response.json()["id"]
    
    # Add component
    response = client.post(
        f"/api/v1/components/",
        json={
            "name": "Load Balancer",
            "type": "load_balancer",
            "category": "Networking",
            "properties_schema": {}
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Load Balancer"
    assert data["type"] == "load_balancer"

def test_delete_design(client, mock_project_id):
    """Test deleting a design"""
    # Create design first
    create_response = client.post(
        "/api/v1/designs/",
        json={
            "name": "Delete Test Design",
            "description": "Design to be deleted",
            "project_id": str(mock_project_id)
        }
    )
    design_id = create_response.json()["id"]
    
    # Delete design
    response = client.delete(f"/api/v1/designs/{design_id}")
    assert response.status_code == 204
    
    # Verify design is deleted
    get_response = client.get(f"/api/v1/designs/{design_id}")
    assert get_response.status_code == 404

def test_health_check(client):
    """Test health check endpoint"""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

