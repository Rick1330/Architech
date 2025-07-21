import React from 'react';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
`;

const WelcomeCard = styled.div`
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  padding: 3rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  text-align: center;
`;

const WelcomeTitle = styled.h2`
  margin: 0 0 1rem 0;
  font-size: 2.5rem;
`;

const WelcomeSubtitle = styled.p`
  margin: 0;
  font-size: 1.2rem;
  opacity: 0.9;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const FeatureCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #e0e0e0;
`;

const FeatureTitle = styled.h3`
  color: #333;
  margin: 0 0 1rem 0;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

function Dashboard() {
  return (
    <DashboardContainer>
      <WelcomeCard>
        <WelcomeTitle>Welcome to Architech</WelcomeTitle>
        <WelcomeSubtitle>
          Design, simulate, and validate distributed systems with confidence
        </WelcomeSubtitle>
      </WelcomeCard>

      <Title>Platform Features</Title>
      <FeatureGrid>
        <FeatureCard>
          <FeatureTitle>Visual Design Canvas</FeatureTitle>
          <FeatureDescription>
            Drag-and-drop components to create system architectures. 
            Connect services, databases, and infrastructure with intuitive visual tools.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureTitle>Real-time Simulation</FeatureTitle>
          <FeatureDescription>
            Run high-fidelity simulations of your designs. 
            Observe system behavior, performance metrics, and identify bottlenecks.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureTitle>Fault Injection</FeatureTitle>
          <FeatureDescription>
            Test system resilience by injecting failures. 
            Simulate network partitions, component crashes, and latency spikes.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureTitle>AI-Powered Insights</FeatureTitle>
          <FeatureDescription>
            Get intelligent feedback on your designs. 
            Detect anti-patterns and receive optimization recommendations.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureTitle>Comprehensive Observability</FeatureTitle>
          <FeatureDescription>
            Monitor logs, metrics, and traces during simulations. 
            Gain deep insights into system behavior and performance.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureTitle>Collaborative Design</FeatureTitle>
          <FeatureDescription>
            Work together with your team in real-time. 
            Share designs, review changes, and iterate collaboratively.
          </FeatureDescription>
        </FeatureCard>
      </FeatureGrid>
    </DashboardContainer>
  );
}

export default Dashboard;

