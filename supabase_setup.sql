-- ==========================================
-- CRM Sales Management System - Full Schema 100%
-- Copy and paste this script into your Supabase SQL Editor
-- ==========================================

-- 1. Create CUSTOMERS Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50),
    industry_type VARCHAR(100),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    payment_term VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Active', -- 'Active', 'Inactive'
    contacts JSONB DEFAULT '[]'::jsonb, -- Array of contact persons (legacy JSONB)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.customers FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.customers FOR DELETE USING (true);


-- 2. Create CUSTOMER CONTACTS Table
CREATE TABLE IF NOT EXISTS public.customer_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    contact_name VARCHAR(255) NOT NULL,
    position VARCHAR(150),
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.customer_contacts FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.customer_contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.customer_contacts FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.customer_contacts FOR DELETE USING (true);


-- 3. Create OPPORTUNITIES Table
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_no VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    project_name VARCHAR(255) NOT NULL,
    service_type VARCHAR(100) NOT NULL, -- 'Testing Service', 'Equipment Rental', 'Manpower Supply', 'Engineering Service', 'Other'
    lead_source VARCHAR(100) NOT NULL,  -- 'Walk In', 'Call In', 'Call Out', 'Existing Customer', 'Referral', 'Connection', 'Website', 'Email Inquiry', 'Tender', 'Other'
    estimated_value NUMERIC(15, 2) DEFAULT 0.00,
    success_probability INT DEFAULT 0,  -- 0 to 100
    expected_close_date DATE,
    sales_person_id VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Lead',  -- 'Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost', 'Cancelled'
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.opportunities FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.opportunities FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.opportunities FOR DELETE USING (true);


-- 4. Create QUOTATIONS Table
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_no VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
    title VARCHAR(255),
    quotation_date DATE,
    validity_days INT DEFAULT 30,
    payment_term VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Draft', -- 'Draft', 'Sent', 'Approved', 'Rejected'
    sales_person VARCHAR(100),
    items JSONB DEFAULT '[]'::jsonb,
    total_value NUMERIC(15, 2) DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) DEFAULT 7.00,
    grand_total NUMERIC(15, 2) DEFAULT 0.00,
    terms_conditions TEXT,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.quotations FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.quotations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.quotations FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.quotations FOR DELETE USING (true);


-- 5. Create INVOICES Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    quotation_no VARCHAR(50),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    po_reference VARCHAR(100),
    project_name VARCHAR(255),
    invoice_date DATE,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'Unpaid', -- 'Unpaid', 'Overdue', 'Paid', 'Cancelled'
    sales_person VARCHAR(100),
    items JSONB DEFAULT '[]'::jsonb,
    total_value NUMERIC(15, 2) DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) DEFAULT 7.00,
    grand_total NUMERIC(15, 2) DEFAULT 0.00,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.invoices FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.invoices FOR DELETE USING (true);


-- ==========================================
-- SEED DATA (Simple initial dataset)
-- ==========================================

INSERT INTO public.customers (id, customer_code, customer_name, tax_id, industry_type, address, phone, email, payment_term, status)
VALUES 
('c1ef4942-83b3-4f9e-bbb4-7a0df47a0001', 'CUS-260001', 'บริษัท ปตท. จำกัด (มหาชน)', '0107544000108', 'Energy & Utilities', '555 ถ.วิภาวดีรังสิต', '02-537-2000', 'info@pttplc.com', '30 Days', 'Active'),
('c2ef4942-83b3-4f9e-bbb4-7a0df47a0002', 'CUS-260002', 'บริษัท ปูนซิเมนต์ไทย จำกัด (มหาชน)', '0107537000958', 'Manufacturing', '1 ถ.ปูนซิเมนต์ไทย', '02-586-3333', 'contact@scg.com', '45 Days', 'Active')
ON CONFLICT (customer_code) DO NOTHING;

INSERT INTO public.customer_contacts (id, customer_id, contact_name, position, phone, email)
VALUES 
('con1ef49-83b3-4f9e-bbb4-7a0df47a0001', 'c1ef4942-83b3-4f9e-bbb4-7a0df47a0001', 'สมชาย รักดี', 'Procurement Specialist', '081-234-5678', 'somchai.r@pttplc.com'),
('con3ef49-83b3-4f9e-bbb4-7a0df47a0003', 'c2ef4942-83b3-4f9e-bbb4-7a0df47a0002', 'อภิชาต วรวิทย์', 'Engineering Team Lead', '083-456-7890', 'apichat@scg.com')
ON CONFLICT DO NOTHING;

INSERT INTO public.opportunities (id, opportunity_no, customer_id, project_name, service_type, lead_source, estimated_value, success_probability, expected_close_date, sales_person_id, status)
VALUES 
('o1ef4942-83b3-4f9e-bbb4-7a0df4700001', 'OPP-260001', 'c1ef4942-83b3-4f9e-bbb4-7a0df47a0001', 'Tank Storage Inspection', 'Testing Service', 'Tender', 1250000.00, 70, '2026-08-30', 'S03', 'Lead'),
('o3ef4942-83b3-4f9e-bbb4-7a0df4700003', 'OPP-260003', 'c2ef4942-83b3-4f9e-bbb4-7a0df47a0002', 'Welding Support Service', 'Manpower Supply', 'Existing Customer', 850000.00, 80, '2026-09-10', 'S02', 'Negotiation')
ON CONFLICT (opportunity_no) DO NOTHING;

INSERT INTO public.quotations (id, quotation_no, customer_id, opportunity_id, title, quotation_date, total_value, tax_rate, grand_total, status)
VALUES 
('q1ef4942-83b3-4f9e-bbb4-7a0df47ab001', 'QT-0001-26', 'c1ef4942-83b3-4f9e-bbb4-7a0df47a0001', 'o1ef4942-83b3-4f9e-bbb4-7a0df4700001', 'Tank Storage Inspection Service', '2026-06-16', 1250000.00, 7.00, 1337500.00, 'Sent')
ON CONFLICT (quotation_no) DO NOTHING;

INSERT INTO public.invoices (id, invoice_no, quotation_no, customer_id, project_name, invoice_date, due_date, status, total_value, tax_rate, grand_total)
VALUES 
('i1ef4942-83b3-4f9e-bbb4-7a0df47ac001', 'INV-0001-26', 'QT-0001-26', 'c1ef4942-83b3-4f9e-bbb4-7a0df47a0001', 'Tank Storage Inspection Service Ph1', '2026-06-17', '2026-07-17', 'Unpaid', 500000.00, 7.00, 535000.00)
ON CONFLICT (invoice_no) DO NOTHING;

-- Reload Supabase Schema Cache
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS remarks TEXT;
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS revision_number INT DEFAULT 0;
NOTIFY pgrst, 'reload schema';
