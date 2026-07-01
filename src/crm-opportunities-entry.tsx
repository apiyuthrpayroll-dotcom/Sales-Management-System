import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import OpportunityManagement from './components/OpportunityManagement';
import './index.css';

createRoot(document.getElementById('react-crm-opportunities')!).render(
  <StrictMode>
    <OpportunityManagement />
  </StrictMode>
);
