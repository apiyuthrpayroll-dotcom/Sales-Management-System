import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import QuotationManagement from './components/QuotationManagement';
import './index.css';

createRoot(document.getElementById('react-quotations')!).render(
  <StrictMode>
    <QuotationManagement />
  </StrictMode>
);
