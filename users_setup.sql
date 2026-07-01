-- ==========================================================
-- CRM System - Users Schema Setup & Transaction Relations
-- ==========================================================

-- 1. Create USERS Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    fullname VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'Sales Rep',
    status VARCHAR(50) DEFAULT 'Active', -- 'Active', 'Suspended'
    password VARCHAR(255) DEFAULT 'crm123456',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Alter table to add password if it already exists
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password VARCHAR(255) DEFAULT 'crm123456';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';


-- Enable Row Level Security (RLS) for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.users FOR DELETE USING (true);

-- 2. Seed Default Users (Matches "Active System Accounts" list)
INSERT INTO public.users (id, username, fullname, email, role, status)
VALUES 
('d1ef4942-83b3-4f9e-bbb4-7a0df47ab001', 'apiyut', 'Apiyut (Admin)', 'Apiyut.noeikhiaw@th.ikm.com', 'Admin', 'Active'),
('d2ef4942-83b3-4f9e-bbb4-7a0df47ab002', 'pimjai', 'พิมพ์ใจ กิตติคุณ', 'pimjai.k@ikm-testing.co.th', 'Sales Manager', 'Active'),
('d3ef4942-83b3-4f9e-bbb4-7a0df47ab003', 'wiriya', 'วิริยะ สว่างงาม', 'wiriya.s@ikm-testing.co.th', 'Sales Rep', 'Active'),
('d4ef4942-83b3-4f9e-bbb4-7a0df47ab004', 'somsri', 'สมศรี จิตรประสงค์', 'somsri.j@ikm-testing.co.th', 'Auditor', 'Active')
ON CONFLICT (username) DO NOTHING;

-- 3. Add audit fields to Transaction Tables (Opportunities, Quotations, Invoices)
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- 4. Sample Queries joining with USERS to display Usernames instead of IDs/UUIDs

-- A. Query Opportunities joining creators and updaters
SELECT 
    o.opportunity_no,
    o.project_name,
    o.estimated_value,
    o.status,
    creator.username AS created_by_username,
    creator.fullname AS created_by_name,
    updater.username AS updated_by_username,
    updater.fullname AS updated_by_name
FROM public.opportunities o
LEFT JOIN public.users creator ON o.created_by = creator.id
LEFT JOIN public.users updater ON o.updated_by = updater.id;

-- B. Query Quotations joining creators and updaters
SELECT 
    q.quotation_no,
    q.subject,
    q.grand_total,
    q.status,
    creator.username AS created_by_username,
    creator.fullname AS created_by_name,
    updater.username AS updated_by_username,
    updater.fullname AS updated_by_name
FROM public.quotations q
LEFT JOIN public.users creator ON q.created_by = creator.id
LEFT JOIN public.users updater ON q.updated_by = updater.id;

-- C. Query Invoices joining creators and updaters
SELECT 
    i.invoice_no,
    i.project_name,
    i.grand_total,
    i.status,
    creator.username AS created_by_username,
    creator.fullname AS created_by_name,
    updater.username AS updated_by_username,
    updater.fullname AS updated_by_name
FROM public.invoices i
LEFT JOIN public.users creator ON i.created_by = creator.id
LEFT JOIN public.users updater ON i.updated_by = updater.id;
