import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import './index.css';

createRoot(document.getElementById('react-executive-dashboard')!).render(
  <StrictMode>
    <ExecutiveDashboard />
  </StrictMode>
);
