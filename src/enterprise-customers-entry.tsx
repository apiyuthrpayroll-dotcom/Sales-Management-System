import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import EnterpriseCustomerDB from './components/EnterpriseCustomerDB';
import './index.css';

createRoot(document.getElementById('react-enterprise-customers')!).render(
  <StrictMode>
    <EnterpriseCustomerDB />
  </StrictMode>
);
