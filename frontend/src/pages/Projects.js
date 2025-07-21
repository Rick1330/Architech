import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProjectsContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #333;
  margin: 0;
`;

const CreateButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
  
  &:hover {
    background: #5a6fd8;
  }
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ProjectCard = styled.div`
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const ProjectName = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #333;
`;

const ProjectDescription = styled.p`
  color: #666;
  margin: 0 0 1rem 0;
  line-height: 1.5;
`;

const ProjectMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #888;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  margin: 1rem;
`;

const ModalTitle = styled.h2`
  margin: 0 0 1.5rem 0;
  color: #333;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
`;

const PrimaryButton = styled(Button)`
  background: #667eea;
  color: white;
  
  &:hover {
    background: #5a6fd8;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
  
  &:hover {
    background: #e9ecef;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/projects/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/v1/projects/', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setProjects([...projects, response.data]);
      setShowModal(false);
      setFormData({ name: '', description: '' });
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}/designs`);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <LoadingState>Loading projects...</LoadingState>;
  }

  return (
    <ProjectsContainer>
      <Header>
        <Title>My Projects</Title>
        <CreateButton onClick={() => setShowModal(true)}>
          Create New Project
        </CreateButton>
      </Header>

      {projects.length === 0 ? (
        <EmptyState>
          <h3>No projects yet</h3>
          <p>Create your first project to get started with system design simulations.</p>
        </EmptyState>
      ) : (
        <ProjectGrid>
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
            >
              <ProjectName>{project.name}</ProjectName>
              <ProjectDescription>{project.description}</ProjectDescription>
              <ProjectMeta>
                <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                <span>{project.designs?.length || 0} designs</span>
              </ProjectMeta>
            </ProjectCard>
          ))}
        </ProjectGrid>
      )}

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Create New Project</ModalTitle>
            <form onSubmit={handleCreateProject}>
              <FormGroup>
                <Label htmlFor="name">Project Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="description">Description</Label>
                <TextArea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your project..."
                />
              </FormGroup>
              
              <ButtonGroup>
                <SecondaryButton
                  type="button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Project'}
                </PrimaryButton>
              </ButtonGroup>
            </form>
          </ModalContent>
        </Modal>
      )}
    </ProjectsContainer>
  );
}

export default Projects;

