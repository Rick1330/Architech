import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DesignContainer = styled.div`
  display: flex;
  height: 100%;
`;

const Sidebar = styled.div`
  width: 300px;
  background: #f8f9fa;
  border-right: 1px solid #e1e5e9;
  padding: 1rem;
  overflow-y: auto;
`;

const MainCanvas = styled.div`
  flex: 1;
  background: #fff;
  position: relative;
  overflow: hidden;
`;

const CanvasHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e1e5e9;
  background: white;
`;

const CanvasTitle = styled.h2`
  margin: 0;
  color: #333;
  flex: 1;
`;

const CanvasActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
`;

const PrimaryButton = styled(Button)`
  background: #667eea;
  color: white;
  
  &:hover {
    background: #5a6fd8;
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

const CanvasArea = styled.div`
  height: calc(100% - 80px);
  background: #fafafa;
  position: relative;
  overflow: auto;
`;

const ComponentLibrary = styled.div`
  margin-bottom: 2rem;
`;

const LibraryTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1rem;
`;

const ComponentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
`;

const ComponentItem = styled.div`
  padding: 0.75rem;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  font-size: 0.875rem;
  transition: all 0.2s;
  
  &:hover {
    background: #f0f4ff;
    border-color: #667eea;
  }
`;

const DesignList = styled.div`
  margin-bottom: 2rem;
`;

const DesignItem = styled.div`
  padding: 0.75rem;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f0f4ff;
    border-color: #667eea;
  }
  
  ${props => props.active && `
    background: #f0f4ff;
    border-color: #667eea;
  `}
`;

const DesignName = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
`;

const DesignMeta = styled.div`
  font-size: 0.75rem;
  color: #666;
`;

const CreateDesignButton = styled(PrimaryButton)`
  width: 100%;
  margin-bottom: 1rem;
`;

const PlaceholderCanvas = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
  text-align: center;
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
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
  max-width: 400px;
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

function Design() {
  const { projectId, designId } = useParams();
  const navigate = useNavigate();
  const [designs, setDesigns] = useState([]);
  const [currentDesign, setCurrentDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [creating, setCreating] = useState(false);

  const components = [
    'Load Balancer',
    'Web Server',
    'App Server',
    'Database',
    'Cache',
    'Queue',
    'CDN',
    'API Gateway',
    'Microservice',
    'Message Bus',
    'File Storage',
    'Monitoring'
  ];

  useEffect(() => {
    fetchDesigns();
  }, [projectId]);

  useEffect(() => {
    if (designId && designs.length > 0) {
      const design = designs.find(d => d.id === designId);
      setCurrentDesign(design);
    } else if (designs.length > 0 && !designId) {
      setCurrentDesign(designs[0]);
    }
  }, [designId, designs]);

  const fetchDesigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/v1/designs/project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setDesigns(response.data);
    } catch (error) {
      console.error('Failed to fetch designs:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDesign = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/v1/designs/', {
        ...formData,
        project_id: projectId
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const newDesign = response.data;
      setDesigns([...designs, newDesign]);
      setCurrentDesign(newDesign);
      setShowModal(false);
      setFormData({ name: '' });
      
      // Navigate to the new design
      navigate(`/projects/${projectId}/designs/${newDesign.id}`);
    } catch (error) {
      console.error('Failed to create design:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDesignSelect = (design) => {
    setCurrentDesign(design);
    navigate(`/projects/${projectId}/designs/${design.id}`);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRunSimulation = () => {
    if (currentDesign) {
      // Navigate to simulation page
      navigate(`/simulations/new?designId=${currentDesign.id}`);
    }
  };

  if (loading) {
    return <LoadingState>Loading designs...</LoadingState>;
  }

  return (
    <DesignContainer>
      <Sidebar>
        <CreateDesignButton onClick={() => setShowModal(true)}>
          Create New Design
        </CreateDesignButton>
        
        <DesignList>
          <LibraryTitle>Designs</LibraryTitle>
          {designs.map((design) => (
            <DesignItem
              key={design.id}
              active={currentDesign?.id === design.id}
              onClick={() => handleDesignSelect(design)}
            >
              <DesignName>{design.name}</DesignName>
              <DesignMeta>
                v{design.version} • {new Date(design.updated_at).toLocaleDateString()}
              </DesignMeta>
            </DesignItem>
          ))}
        </DesignList>

        <ComponentLibrary>
          <LibraryTitle>Components</LibraryTitle>
          <ComponentGrid>
            {components.map((component) => (
              <ComponentItem key={component}>
                {component}
              </ComponentItem>
            ))}
          </ComponentGrid>
        </ComponentLibrary>
      </Sidebar>

      <MainCanvas>
        <CanvasHeader>
          <CanvasTitle>
            {currentDesign ? currentDesign.name : 'Select a Design'}
          </CanvasTitle>
          <CanvasActions>
            <SecondaryButton>Save</SecondaryButton>
            <PrimaryButton onClick={handleRunSimulation}>
              Run Simulation
            </PrimaryButton>
          </CanvasActions>
        </CanvasHeader>
        
        <CanvasArea>
          {currentDesign ? (
            <PlaceholderCanvas>
              <div>
                <h3>Design Canvas</h3>
                <p>Drag and drop components from the sidebar to build your system architecture.</p>
                <p><em>Canvas implementation coming in Phase 4</em></p>
              </div>
            </PlaceholderCanvas>
          ) : (
            <PlaceholderCanvas>
              <div>
                <h3>No Design Selected</h3>
                <p>Create a new design or select an existing one to get started.</p>
              </div>
            </PlaceholderCanvas>
          )}
        </CanvasArea>
      </MainCanvas>

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Create New Design</ModalTitle>
            <form onSubmit={handleCreateDesign}>
              <FormGroup>
                <Label htmlFor="name">Design Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., E-commerce Architecture"
                  required
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
                  {creating ? 'Creating...' : 'Create Design'}
                </PrimaryButton>
              </ButtonGroup>
            </form>
          </ModalContent>
        </Modal>
      )}
    </DesignContainer>
  );
}

export default Design;

