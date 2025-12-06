import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import axios from 'axios';

// Use Vite proxy for API calls (configured in vite.config.js)
// Axios will use relative URLs which work with the proxy configuration
axios.defaults.baseURL = '';

// Ensure proper headers for CORS
axios.defaults.headers.common['Content-Type'] = 'application/json';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
