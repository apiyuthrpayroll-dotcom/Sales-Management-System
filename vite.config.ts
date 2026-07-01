import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          executive: path.resolve(__dirname, 'executive.html'),
          enterpriseCustomers: path.resolve(__dirname, 'enterprise-customers.html'),
          crmOpportunities: path.resolve(__dirname, 'crm-opportunities.html'),
          customers: path.resolve(__dirname, 'customers.html'),
          invoices: path.resolve(__dirname, 'invoices.html'),
          leads: path.resolve(__dirname, 'leads.html'),
          opportunities: path.resolve(__dirname, 'opportunities.html'),
          'opportunity-form': path.resolve(__dirname, 'opportunity-form.html'),
          'opportunity-kanban': path.resolve(__dirname, 'opportunity-kanban.html'),
          quotations: path.resolve(__dirname, 'quotations.html'),
          'reports-bi': path.resolve(__dirname, 'reports-bi.html'),
          'sales-orders': path.resolve(__dirname, 'sales-orders.html'),
          search: path.resolve(__dirname, 'search.html'),
          'strategic-corp': path.resolve(__dirname, 'strategic-corp.html'),
          'support-desk': path.resolve(__dirname, 'support-desk.html'),
          users: path.resolve(__dirname, 'users.html'),
          login: path.resolve(__dirname, 'login.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
