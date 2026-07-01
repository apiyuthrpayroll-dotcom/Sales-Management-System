import React, { useState, useEffect } from 'react';
import { getConnectivityMode, setConnectivityMode, CRMService } from '../supabaseService';
import { 
  Database, 
  CheckCircle, 
  HelpCircle, 
  Copy, 
  Check, 
  Terminal, 
  Info, 
  RefreshCcw, 
  CloudLightning,
  AlertTriangle
} from 'lucide-react';

interface SetupViewProps {
  onToast: (msg: string, type: 'success' | 'err') => void;
  onConnectivityChange?: () => void;
}

export default function SetupView({ onToast, onConnectivityChange }: SetupViewProps) {
  const [useCloud, setUseCloud] = useState(getConnectivityMode());
  const [cloudStatus, setCloudStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [copied, setCopied] = useState(false);
  const [customUrl, setCustomUrl] = useState(localStorage.getItem('crm_supabase_url') ? (localStorage.getItem('crm_supabase_url') || '').replace('/rest/v1', '') : '');
  const [customKey, setCustomKey] = useState(localStorage.getItem('crm_supabase_anon_key') || '');

  // SQL Script loaded directly
  const sqlScript = `-- ==========================================
-- CRM Sales Management System - Full Production Schema
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
    province VARCHAR(100),
    country VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    payment_term VARCHAR(50),
    credit_limit NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for Customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create Policies (Allowing Anonymous or Authenticated reading and writing for the DEMO context)
CREATE POLICY "Enable read access for all users" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.customers FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.customers FOR DELETE USING (true);


-- 2. Create CUSTOMER_CONTACTS Table
CREATE TABLE IF NOT EXISTS public.customer_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    contact_name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    office_phone VARCHAR(50),
    email VARCHAR(255) NOT NULL,
    line_id VARCHAR(100),
    preferred_contact VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for Customer Contacts
ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;

-- Create Policies for Customer Contacts
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
    service_type VARCHAR(100) NOT NULL,
    lead_source VARCHAR(100) NOT NULL,
    project_location VARCHAR(50) DEFAULT 'Other',
    estimated_value NUMERIC(15, 2) DEFAULT 0.00,
    success_probability INT DEFAULT 0,
    weighted_value NUMERIC(15, 2) DEFAULT 0.00,
    expected_close_date DATE,
    sales_person_id VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Lead',
    remarks TEXT,
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for Opportunities
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Enable read access for all users" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.opportunities FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.opportunities FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.opportunities FOR DELETE USING (true);


-- 4. Create QUOTATIONS Table
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_no VARCHAR(50) UNIQUE NOT NULL,
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    total_amount NUMERIC(15, 2) DEFAULT 0.00,
    vat_amount NUMERIC(15, 2) DEFAULT 0.00,
    grand_total NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Draft',
    issue_date DATE,
    valid_until DATE,
    remarks TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for Quotations
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- Create Policies for Quotations
CREATE POLICY "Enable read access for all users" ON public.quotations FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.quotations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.quotations FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.quotations FOR DELETE USING (true);


-- 5. Create SALES_ORDERS Table
CREATE TABLE IF NOT EXISTS public.sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    so_no VARCHAR(50) UNIQUE NOT NULL,
    quotation_id UUID, -- References public.quotations(id) ON DELETE SET NULL - stored as general reference or UUID
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    project_name VARCHAR(255) NOT NULL,
    total_amount NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Pending',
    order_date DATE,
    target_delivery_date DATE,
    job_no VARCHAR(100),
    po_no VARCHAR(100),
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for Sales Orders
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;

-- Create Policies for Sales Orders
CREATE POLICY "Enable read access for all users" ON public.sales_orders FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.sales_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.sales_orders FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.sales_orders FOR DELETE USING (true);


-- Ensure correct columns even if tables exist (Migration safety commands)
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS province VARCHAR(100);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS credit_limit NUMERIC(15, 2) DEFAULT 0.00;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.customers DROP COLUMN IF EXISTS contacts;

ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS project_location VARCHAR(50) DEFAULT 'Other';
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS weighted_value NUMERIC(15, 2) DEFAULT 0.00;
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS internal_notes TEXT;

ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS job_no VARCHAR(100);
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS po_no VARCHAR(100);
ALTER TABLE public.sales_orders ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;`;

  // Check cloud connection on load
  const runConnectionCheck = async () => {
    setCloudStatus('checking');
    const connected = await CRMService.checkCloudConnection();
    if (connected) {
      setCloudStatus('connected');
    } else {
      setCloudStatus('disconnected');
    }
  };

  useEffect(() => {
    runConnectionCheck();
  }, [useCloud]);

  const handleToggleMode = (mode: boolean) => {
    setConnectivityMode(mode);
    setUseCloud(mode);
    onToast(mode ? 'เปลี่ยนสลับระบบเข้าใช้ฐานข้อมูลแบบสดคลาวด์' : 'เปลี่ยนสลับระบบเข้าใช้แซนบ็อกซ์ข้อมูลออฟไลน์', 'success');
    if (onConnectivityChange) {
      onConnectivityChange();
    }
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    onToast('คัดลอก SQL Script ลงคลิปบอร์ด', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-500" />
          การตั้งค่าฐานข้อมูล & การเชื่อมต่อคลาวด์ Supabase (Database Link Setup)
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">ระบบ CRM ตัวนี้มาพร้อมระบบสลับข้อมูลออฟไลน์อัตโนมัติ (Fallback Engine) เพื่อรับประกันความเสถียร 100%</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Connection Status panel */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm lg:col-span-1 space-y-6">
          <h3 className="font-bold text-slate-800 text-sm">การตรวจสอบสถานะระบบสด (Real-time Cluster Status)</h3>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl border space-y-3.5 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 block">Supabase Gateway</span>
                
                {cloudStatus === 'checking' && (
                  <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse font-medium">
                    <RefreshCcw className="w-3 h-3 animate-spin" />
                    กำลังตรวจสอบ...
                  </span>
                )}

                {cloudStatus === 'connected' && (
                  <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    เชื่อมต่อเสถียรดีมาก
                  </span>
                )}

                {cloudStatus === 'disconnected' && (
                  <span className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                    <AlertTriangle className="w-3 h-3" />
                    ตรวจไม่พบตารางข้อมูล
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-500 font-mono space-y-1.5 truncate border-t border-slate-100 pt-2.5">
                <div>URL: {localStorage.getItem('crm_supabase_url') ? (localStorage.getItem('crm_supabase_url') || '').replace('/rest/v1', '') : 'https://vrmjdbwdilqitdttzrcq.supabase.co'}</div>
                <div>Table 1: <span className="font-bold">customers</span></div>
                <div>Table 2: <span className="font-bold">opportunities</span></div>
                <div>Table 3: <span className="font-bold">customer_contacts</span></div>
              </div>
            </div>

            {/* Custom Supabase Credentials Form */}
            <div className="border border-slate-200 p-3.5 rounded-xl bg-slate-50 space-y-3">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1 leading-none">
                <Database className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                เชื่อมต่อเซิร์ฟเวอร์ Supabase ส่วนตัว
              </span>
              
              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Project Web URL</label>
                  <input
                    type="text"
                    placeholder="เช่น https://xxxx.supabase.co"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-250 bg-white text-slate-800 rounded-md focus:outline-none focus:border-blue-500 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Anon Public-Key</label>
                  <input
                    type="password"
                    placeholder="เหมะสำหรับเชื่อมต่อเพื่อบันทึกข้อมูล..."
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-250 bg-white text-slate-800 rounded-md focus:outline-none focus:border-blue-500 transition-colors font-mono"
                  />
                </div>
                
                <div className="flex gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={async () => {
                      let urlClean = customUrl.trim();
                      if (urlClean) {
                        if (urlClean.endsWith('/')) urlClean = urlClean.slice(0, -1);
                        if (!urlClean.endsWith('/rest/v1')) urlClean = `${urlClean}/rest/v1`;
                        localStorage.setItem('crm_supabase_url', urlClean);
                      } else {
                        localStorage.removeItem('crm_supabase_url');
                      }

                      if (customKey.trim()) {
                        localStorage.setItem('crm_supabase_anon_key', customKey.trim());
                      } else {
                        localStorage.removeItem('crm_supabase_anon_key');
                      }

                      onToast('อัปเดตช่องทางและสลับเชื่อมข้อมูล เรียบร้อยด่วน!', 'success');
                      if (onConnectivityChange) {
                        onConnectivityChange();
                      }
                      setTimeout(() => {
                        runConnectionCheck();
                      }, 400);
                    }}
                    className="flex-1 py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer transition-colors text-[11px] text-center"
                  >
                    บันทึกข้อมูลเชื่อมต่อ
                  </button>
                  
                  {(localStorage.getItem('crm_supabase_url') || localStorage.getItem('crm_supabase_anon_key')) && (
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem('crm_supabase_url');
                        localStorage.removeItem('crm_supabase_anon_key');
                        setCustomUrl('');
                        setCustomKey('');
                        onToast('คืนค่าเชื่อมต่อเริ่มต้นเรียบร้อย (Reset to default)', 'success');
                        if (onConnectivityChange) {
                          onConnectivityChange();
                        }
                        setTimeout(() => {
                          runConnectionCheck();
                        }, 400);
                      }}
                      className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg cursor-pointer transition-colors text-[11px]"
                    >
                      ล้างค่า
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Storage Toggle Mode Switch */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 block">สลับแหล่งบันทึกข้อมูลหลัก (Primary Adapter)</span>
              
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg">
                <button
                  id="btn-switch-offline"
                  onClick={() => handleToggleMode(false)}
                  className={`py-2 text-xs font-semibold rounded-md focus:outline-none transition-colors duration-150 ${!useCloud ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Offline Sandbox Mode
                </button>
                <button
                  id="btn-switch-cloud"
                  onClick={() => handleToggleMode(true)}
                  className={`py-2 text-xs font-semibold rounded-md focus:outline-none transition-colors duration-150 flex items-center justify-center gap-1 ${useCloud ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <CloudLightning className="w-3.5 h-3.5 shrink-0" />
                  Cloud Sync Mode
                </button>
              </div>

              {!useCloud ? (
                <p className="text-[10px] text-slate-400 leading-relaxed pt-1">
                  *ระบบกำลังใช้งาน `localStorage` ภายในเบราวเซอร์ส่วนตัวของคุณ ซึ่งปลอดภัย บันทึกได้ถาวร และมีความเสถียรรวดเร็วสูง เหมาะสำหรับการพรีวิวเพื่อการทดสอบ
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 leading-relaxed pt-1">
                  *ระบบกำลังพยายามประสานงานและยิง REST Request ตรงเข้าสู่ Supabase ดั้งเดิมของคุณ หากยังไม่พบคอนเทนต์กรุณากดรัน SQL Script ด้านข้างใน SQL Editor
                </p>
              )}
            </div>
            
            {/* Quick manual triggers */}
            <button
              onClick={runConnectionCheck}
              className="w-full py-2 border border-slate-200 text-xs font-medium text-slate-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-1 font-sans focus:outline-none cursor-pointer"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              บังคับตรวจสอบสัญญาณ (Sync Check)
            </button>
          </div>
        </div>

        {/* SQL viewer and Copier */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1">
              <Terminal className="w-4 h-4 text-blue-500" />
              PostgreSQL Table Creation Code (SQL Script)
            </h3>
            <button
              id="btn-copy-sql"
              onClick={handleCopySQL}
              className="px-3 py-1.5 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md font-semibold flex items-center gap-1 focus:outline-none cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'คัดลอกแล้ว' : 'คัดลอกโค้ด SQL'}
            </button>
          </div>

          <div className="relative flex-1">
            <textarea
              readOnly
              value={sqlScript}
              className="w-full h-80 p-4 border border-slate-200 bg-slate-900 text-slate-200 font-mono text-xs rounded-xl focus:outline-none focus:ring-0 leading-relaxed select-all"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-blue-800 text-xs block">ขั้นตอนการติดตั้งอย่างง่าย</span>
              <ol className="list-decimal pl-4 text-[11px] text-blue-700 space-y-1">
                <li>เปิดเว็บไซต์ Supabase Dashboard นำทางไปยังคลัสเตอร์ของคุณ</li>
                <li>ไปที่แถบเมนู **SQL Editor** กดยึดปุ่ม **New Query**</li>
                <li>กดคัดลอก SQL โค้ดด้านบน แล้วนำไปวางในบานหน้าต่างนั้น</li>
                <li>กดปุ่ม **Run** ที่มุมล่างขวาเพื่อกวดล้างฐานข้อมูลในทันที แล้วจึงสลับมาใช้ Cloud Sync Mode!</li>
              </ol>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
