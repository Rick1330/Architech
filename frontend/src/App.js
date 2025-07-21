import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Design from './pages/Design';
import Simulation from './pages/Simulation';
import Login from './pages/Login';
import Register from './pages/Register';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  overflow: hidden;
`;

function App() {
  return (
    <Router>
      <AppContainer>
        <Header />
        <MainContent>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:projectId/designs" element={<Design />} />
            <Route path="/projects/:projectId/designs/:designId" element={<Design />} />
            <Route path="/simulations/:sessionId" element={<Simulation />} />
          </Routes>
        </MainContent>
      </AppContainer>
    </Router>
  );
}

export default App;

