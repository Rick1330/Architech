import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { validateEnvironment } from './config/environment.ts'

// Validate environment variables on startup
validateEnvironment();

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Failed to find the root element. Make sure there is a div with id="root" in your HTML.');
}

createRoot(rootElement).render(<App />);
