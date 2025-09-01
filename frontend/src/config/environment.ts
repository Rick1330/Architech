// Frontend environment configuration and validation
export const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  apiGatewayUrl: import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8000/api/v1',
  
  // WebSocket Configuration
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws',
  
  // Simulation Engine
  simulationEngineUrl: import.meta.env.VITE_SIMULATION_ENGINE_URL || 'http://localhost:8080',
  
  // Development Configuration
  isDev: import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV,
  isDebug: import.meta.env.VITE_DEBUG_MODE === 'true',
  
  // Feature Flags
  features: {
    simulationCanvas: import.meta.env.VITE_ENABLE_SIMULATION_CANVAS !== 'false',
    realTimeUpdates: import.meta.env.VITE_ENABLE_REAL_TIME_UPDATES !== 'false',
    componentPalette: import.meta.env.VITE_ENABLE_COMPONENT_PALETTE !== 'false',
  },
  
  // Analytics & Monitoring
  analytics: {
    enabled: import.meta.env.VITE_ANALYTICS_ENABLED === 'true',
    performanceMonitoring: import.meta.env.VITE_PERFORMANCE_MONITORING === 'true',
  },
  
  // Build Configuration
  buildVersion: import.meta.env.VITE_BUILD_VERSION || '1.0.0',
  appTitle: import.meta.env.VITE_APP_TITLE || 'Architech - System Architecture Simulator',
} as const;

// Validation function to ensure required environment variables are set
export const validateEnvironment = () => {
  const requiredVars = [
    'VITE_API_BASE_URL',
    'VITE_API_GATEWAY_URL',
  ];
  
  const missingVars = requiredVars.filter(
    varName => !import.meta.env[varName] && !process.env[varName]
  );
  
  if (missingVars.length > 0) {
    console.warn(
      `Missing environment variables: ${missingVars.join(', ')}. ` +
      'Some features may not work correctly. ' +
      'Copy .env.example to .env.local and configure the values.'
    );
  }
  
  // Log configuration in development
  if (config.isDev) {
    console.log('Frontend Configuration:', {
      apiBaseUrl: config.apiBaseUrl,
      apiGatewayUrl: config.apiGatewayUrl,
      wsUrl: config.wsUrl,
      simulationEngineUrl: config.simulationEngineUrl,
      features: config.features,
      isDev: config.isDev,
      isDebug: config.isDebug,
    });
  }
};

export default config;