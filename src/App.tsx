import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Target, 
  LayoutDashboard, 
  BarChart4, 
  Settings, 
  Database, 
  Sparkles, 
  Layers, 
  ChevronDown, 
  Users, 
  FileText, 
  Wallet, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Plus, 
  Copy, 
  Check, 
  Download, 
  TrendingUp, 
  ShieldAlert, 
  ChevronRight,
  Printer,
  FileSpreadsheet,
  FileDown,
  Trash2,
  AlertCircle,
  Eye,
  Send,
  XCircle,
  Ban
} from 'lucide-react';
import { phpCodebase, PHPFile } from './data/phpCodebase';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// Define Interface types for simulation state
interface CustomerSim {
  id: number;
  customer_code: string;
  customer_name: string;
  tax_id: string;
  industry_type: string;
  address: string;
  phone: string;
  email: string;
  payment_term: number;
  status: 'Active' | 'Inactive';
  contacts_list?: string;
}

interface OpportunitySim {
  id: number;
  opportunity_no: string;
  customer_id: number;
  customer_name: string;
  project_name: string;
  service_type: string;
  lead_source: string;
  estimated_value: number;
  success_probability: number;
  expected_close_date: string;
  salesperson_name: string;
  status: 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost' | 'Cancelled';
  remarks: string;
}

interface QuotationSim {
  id: number;
  quotation_no: string;
  customer_id: number;
  customer_name: string;
  project_name: string;
  title: string;
  quotation_date: string;
  validity_days: number;
  payment_term: string;
  total_value: number;
  tax_rate: number;
  grand_total: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Cancelled';
  items?: { name: string; qty: number; unit: string; price: number }[];
}

interface InvoiceSim {
  id: number;
  invoice_no: string;
  customer_id: number;
  customer_name: string;
  quotation_no: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  grand_total: number;
  status: 'Unpaid' | 'Paid' | 'Overdue';
}

interface AuditLogSim {
  id: number;
  action: string;
  fullname: string;
  role: string;
  created_at: string;
  details: string;
  target_type: 'customer' | 'opportunity' | 'quotation' | 'invoice' | 'system';
}

export default function App() {
  // System Main Mode: 'simulation' or 'sourcecode'
  const [systemMode, setSystemMode] = useState<'simulation' | 'sourcecode'>('simulation');

  // Simulation Session State
  const [lang, setLangState] = useState<'TH' | 'EN'>(() => {
    const saved = localStorage.getItem('crm_lang');
    if (saved === 'TH' || saved === 'EN') return saved;
    return 'EN';
  });

  const setLang = (newLang: 'TH' | 'EN') => {
    setLangState(newLang);
    localStorage.setItem('crm_lang', newLang);
  };
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [oppSubView, setOppSubView] = useState<'list' | 'kanban'>('list');

  // Multi-language translation helper
  const t = {
    TH: {
      welcome_hi: 'สวัสดีครับ',
      app_title: 'ระบบจัดการลูกค้าสัมพันธ์ระดับองค์กร',
      local_time: 'เวลาในระบบ',
      dashboard: 'แดชบอร์ดสรุปยอด',
      customers: 'ทะเบียนกลุ่มลูกค้า',
      opportunities: 'ดีลและงานประมูล',
      quotations: 'ระบบเสนอราคา',
      invoices: 'การเงิน / แจ้งหนี้',
      reports: 'สรุปรายงาน BI'
    },
    EN: {
      welcome_hi: 'Welcome',
      app_title: 'Enterprise CRM System Suite',
      local_time: 'System Time',
      dashboard: 'Sales Dashboard',
      customers: 'Customer Masters',
      opportunities: 'Deals & Pipeline',
      quotations: 'Quotation Center',
      invoices: 'Billing & Invoices',
      reports: 'Reports & Analytics'
    }
  }[lang];

  // User details simulation
  const userFullname = 'Apiyut Noeikhiaw';
  const userRole = 'Administrator';
  const userEmail = 'Apiyut.noeikhiaw@th.ikm.com';

  // --- Clock tick simulation ---
  const [systemTime, setSystemTime] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTime(now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Simulated Database Tables ---
  const [customers, setCustomers] = useState<CustomerSim[]>([
    { id: 1, customer_code: 'CUS-000001', customer_name: 'บริษัท ปตท. สำรวจและผลิตปิโตรเลียม จำกัด (มหาชน)', tax_id: '0107535000206', industry_type: 'Energy & Utilities', address: '555/1 ศูนย์เอนเนอร์ยี่คอมเพล็กซ์ กรุงเทพฯ', phone: '02-537-4000', email: 'procurement@pttep.com', payment_term: 30, status: 'Active', contacts_list: 'คุณ สมชาย รักดี (Procurement Manager)' },
    { id: 2, customer_code: 'CUS-000002', customer_name: 'บริษัท ไทยออยล์ จำกัด (มหาชน)', tax_id: '0107537000220', industry_type: 'Energy & Utilities', address: '555/1 ศูนย์เอนเนอร์ยี่คอมเพล็กซ์ กรุงเทพฯ', phone: '02-797-2000', email: 'vendor@thaioilgroup.com', payment_term: 45, status: 'Active', contacts_list: 'คุณ สมศรี มณีรัตน์ (Senior Maintenance Engineer)' },
    { id: 3, customer_code: 'CUS-000003', customer_name: 'บริษัท ปูนซิเมนต์ไทย จำกัด (มหาชน)', tax_id: '0107537000017', industry_type: 'Manufacturing', address: '1 ถนนปูนซิเมนต์ไทย บางซื่อ กรุงเทพฯ', phone: '02-586-4444', email: 'contact@scg.com', payment_term: 30, status: 'Active', contacts_list: 'คุณ อภิสิทธิ์ ใจดี (Site Engineering Director)' }
  ]);

  const [opportunities, setOpportunities] = useState<OpportunitySim[]>([
    { id: 1, opportunity_no: 'OPP-000001', customer_id: 1, customer_name: 'บริษัท ปตท. สำรวจและผลิตปิโตรเลียม จำกัด (มหาชน)', project_name: 'โครงการจัดหาปั๊มไฮโดรเทสความดันสูง คลังน้ำมันระยอง', service_type: 'Equipment Rental', lead_source: 'Tender', estimated_value: 1500000.00, success_probability: 80, expected_close_date: '2026-07-15', salesperson_name: 'Chaloempon Kittisak', status: 'Negotiation', remarks: 'โครงการมีความต้องการเช่าอุปกรณ์ยาว 6 เดือนเป็นกรณีพิเศษ' },
    { id: 2, opportunity_no: 'OPP-000002', customer_id: 2, customer_name: 'บริษัท ไทยออยล์ จำกัด (มหาชน)', project_name: 'บริการงานทดสอบแรงดันระบบท่อส่งน้ำมันหล่อลื่นส่วนต่อขยาย', service_type: 'Testing Service', lead_source: 'Existing Customer', estimated_value: 850000.00, success_probability: 95, expected_close_date: '2026-07-30', salesperson_name: 'Chaloempon Kittisak', status: 'Won', remarks: 'งานตกลงจ้างบริการเรียบร้อยและผ่านการพิจารณาด้านวิศวกรรมแล้ว' },
    { id: 3, opportunity_no: 'OPP-000003', customer_id: 3, customer_name: 'บริษัท ปูนซิเมนต์ไทย จำกัด (มหาชน)', project_name: 'จัดหากำลังพลสนับสนุนสายงานซ่อมบำรุงโรงไฟฟ้าปูนแก่งคอย', service_type: 'Manpower Supply', lead_source: 'Referral', estimated_value: 2400000.00, success_probability: 40, expected_close_date: '2026-08-10', salesperson_name: 'Chaloempon Kittisak', status: 'Proposal', remarks: 'อยู่ระหว่างส่งข้อเสนอประวัติวิศวกรและแผนประกันความปลอดภัย' }
  ]);

  const [quotations, setQuotations] = useState<QuotationSim[]>([
    { 
      id: 1, 
      quotation_no: 'QT-000001', 
      customer_id: 2, 
      customer_name: 'บริษัท ไทยออยล์ จำกัด (มหาชน)', 
      project_name: 'บริการงานทดสอบแรงดันระบบท่อส่งน้ำมันหล่อลื่นส่วนต่อขยาย', 
      title: 'ใบเสนอราคาบริการทดสอบแรงดันระบบท่อส่งน้ำมัน (Testing Service)', 
      quotation_date: '2026-06-15', 
      validity_days: 30, 
      payment_term: 'เครดิต 45 วัน', 
      total_value: 850000.00, 
      tax_rate: 7, 
      grand_total: 909500.00, 
      status: 'Approved',
      items: [{ name: 'บริการงานทดสอบแรงดัน Hydrostatic Testing สำหรับระบบท่อส่งน้ำมันหล่อลื่น', qty: 1, unit: 'Job', price: 850000.00 }]
    },
    { 
      id: 2, 
      quotation_no: 'QT-000002', 
      customer_id: 3, 
      customer_name: 'บริษัท ปูนซิเมนต์ไทย จำกัด (มหาชน)', 
      project_name: 'จัดหากำลังพลสนับสนุนสายงานซ่อมบำรุงโรงไฟฟ้าปูนแก่งคอย', 
      title: 'จัดหากำลังพลสนับสนุนสายงานซ่อมบำรุงวิศวกรรมโรงงาน SCG', 
      quotation_date: '2026-06-25', 
      validity_days: 30, 
      payment_term: 'เครดิต 30 วัน', 
      total_value: 2400000.00, 
      tax_rate: 7, 
      grand_total: 2568000.00, 
      status: 'Sent',
      items: [{ name: 'จัดหากำลังพลสนับสนุนสายงานวิศวกรรมและการซ่อมบำรุงโรงงานแก่งคอย (Engineer & Tech)', qty: 1, unit: 'Job', price: 2400000.00 }]
    }
  ]);

  const [invoices, setInvoices] = useState<InvoiceSim[]>([
    { id: 1, invoice_no: 'INV-000001', customer_id: 2, customer_name: 'บริษัท ไทยออยล์ จำกัด (มหาชน)', quotation_no: 'QT-000001', invoice_date: '2026-06-20', due_date: '2026-08-04', subtotal: 850000.00, tax_amount: 59500.00, grand_total: 909500.00, status: 'Unpaid' }
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLogSim[]>([
    { id: 1, action: 'ติดตั้งระบบฐานข้อมูล (Database Seeding)', fullname: 'Apiyut Noeikhiaw', role: 'Administrator', created_at: '2026-06-30 08:00:00', details: 'ผู้ดูแลระบบทำการอัปโหลดสกีมา SQL และตั้งค่าสิทธิของตระกูลสิทธิ์เรียบร้อย', target_type: 'system' },
    { id: 2, action: 'อัปเกรดความคืบหน้าดีล (Opportunity Updated)', fullname: 'Chaloempon Kittisak', role: 'Sales Representative', created_at: '2026-06-30 09:12:45', details: 'วิศวกร Chaloempon ทำการปรับสถานะโครงการของบริษัทไทยออยล์ เป็น [Won]', target_type: 'opportunity' }
  ]);

  // --- Feedback Notification Toast State ---
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showSimToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // --- Dynamic calculations derived from simulated DB tables ---
  const totalPipeline = opportunities.reduce((sum, o) => sum + o.estimated_value, 0);
  const weightedPipeline = opportunities.reduce((sum, o) => sum + (o.estimated_value * o.success_probability / 100), 0);
  const wonPipeline = opportunities.filter(o => o.status === 'Won').reduce((sum, o) => sum + o.estimated_value, 0);
  const activeCustomersCount = customers.filter(c => c.status === 'Active').length;
  
  const totalDealsCount = opportunities.length;
  const wonDealsCount = opportunities.filter(o => o.status === 'Won').length;
  const winRatio = totalDealsCount > 0 ? ((wonDealsCount / totalDealsCount) * 100).toFixed(1) : '0';

  // Modal displays toggle
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showOppModal, setShowOppModal] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedViewQuotation, setSelectedViewQuotation] = useState<QuotationSim | null>(null);

  // --- 1. Customer Creation Handler ---
  const [custForm, setCustForm] = useState({ name: '', taxId: '', industry: 'Energy & Utilities', term: 30, phone: '', email: '', address: '', contactName: '', contactPosition: '', contactPhone: '', contactEmail: '' });
  const handleCreateCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custForm.name) return;

    const nextId = customers.length + 1;
    const code = `CUS-${String(nextId).padStart(6, '0')}`;
    const newCust: CustomerSim = {
      id: nextId,
      customer_code: code,
      customer_name: custForm.name,
      tax_id: custForm.taxId,
      industry_type: custForm.industry,
      address: custForm.address,
      phone: custForm.phone,
      email: custForm.email,
      payment_term: custForm.term,
      status: 'Active',
      contacts_list: custForm.contactName ? `${custForm.contactName} (${custForm.contactPosition || 'Staff'})` : undefined
    };

    setCustomers([newCust, ...customers]);
    
    // Add audit log
    const newLog: AuditLogSim = {
      id: auditLogs.length + 1,
      action: 'สร้างข้อมูลลูกค้าใหม่ (PHP Create Customer)',
      fullname: userFullname,
      role: userRole,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      details: `เพิ่มลูกค้าองค์กร "${custForm.name}" ตลาดอุตสาหกรรม: ${custForm.industry} พร้อมระเบียบผู้ติดต่อหลัก`,
      target_type: 'customer'
    };
    setAuditLogs([newLog, ...auditLogs]);

    setShowCustomerModal(false);
    showSimToast(`ลงทะเบียนลูกค้าองค์กร "${custForm.name}" สำเร็จเรียบร้อยแล้ว!`, 'success');
    // Reset form
    setCustForm({ name: '', taxId: '', industry: 'Energy & Utilities', term: 30, phone: '', email: '', address: '', contactName: '', contactPosition: '', contactPhone: '', contactEmail: '' });
  };

  // --- 2. Opportunity Creation Handler ---
  const [oppForm, setOppForm] = useState({ customerId: '', projectName: '', serviceType: 'Testing Service', leadSource: 'Existing Customer', value: 0, probability: 20, closeDate: '2026-07-30', remarks: '' });
  const handleCreateOppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oppForm.projectName || !oppForm.customerId) return;

    const selectedCust = customers.find(c => c.id === Number(oppForm.customerId));
    const nextId = opportunities.length + 1;
    const oppNo = `OPP-${String(nextId).padStart(6, '0')}`;

    const newOpp: OpportunitySim = {
      id: nextId,
      opportunity_no: oppNo,
      customer_id: Number(oppForm.customerId),
      customer_name: selectedCust ? selectedCust.customer_name : 'Unknown Customer',
      project_name: oppForm.projectName,
      service_type: oppForm.serviceType,
      lead_source: oppForm.leadSource,
      estimated_value: Number(oppForm.value),
      success_probability: Number(oppForm.probability),
      expected_close_date: oppForm.closeDate,
      salesperson_name: 'Chaloempon Kittisak',
      status: 'Lead',
      remarks: oppForm.remarks
    };

    setOpportunities([newOpp, ...opportunities]);

    const newLog: AuditLogSim = {
      id: auditLogs.length + 1,
      action: 'สร้างโอกาสขายใหม่ (PHP Create Opportunity)',
      fullname: userFullname,
      role: userRole,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      details: `เพิ่มดีล "${oppForm.projectName}" มูลค่าคาดการณ์ ฿${Number(oppForm.value).toLocaleString()}`,
      target_type: 'opportunity'
    };
    setAuditLogs([newLog, ...auditLogs]);

    setShowOppModal(false);
    showSimToast(`ลงทะเบียนโอกาสทางการขายโครงการ "${oppForm.projectName}" สำเร็จเรียบร้อย!`, 'success');
    setOppForm({ customerId: '', projectName: '', serviceType: 'Testing Service', leadSource: 'Existing Customer', value: 0, probability: 20, closeDate: '2026-07-30', remarks: '' });
  };

  // --- 3. Update Opportunity Status Handler (Simulating AJAX Fetch) ---
  const handleUpdateOppStatusSim = (id: number, newStatus: string) => {
    setOpportunities(prev => 
      prev.map(o => o.id === id ? { ...o, status: newStatus as any } : o)
    );
    
    const targetOpp = opportunities.find(o => o.id === id);
    if (!targetOpp) return;

    const newLog: AuditLogSim = {
      id: auditLogs.length + 1,
      action: 'เปลี่ยนสถานะโอกาสขาย (Status Updated)',
      fullname: userFullname,
      role: userRole,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      details: `เปลี่ยนสถานะดีล "${targetOpp.project_name}" (${targetOpp.opportunity_no}) จาก [${targetOpp.status}] เป็น [${newStatus}] ผ่าน AJAX Fetch`,
      target_type: 'opportunity'
    };
    setAuditLogs([newLog, ...auditLogs]);

    showSimToast(`สถานะของโอกาสทางการขายถูกเปลี่ยนเป็น ${newStatus} สำเร็จ!`, 'success');
  };

  // --- 4. Dynamic Quotation Creation Handler ---
  const [quoteForm, setQuoteForm] = useState({ customerId: '', oppId: '', title: '', date: '2026-06-30', validity: 30, term: 'เครดิต 30 วัน' });
  const [quoteItems, setQuoteItems] = useState<{ name: string; qty: number; unit: string; price: number }[]>([
    { name: 'บริการ Hydrotesting บริเวณข้อต่อท่อหลัก', qty: 1, unit: 'Job', price: 0 }
  ]);

  const addQuoteItemRow = () => {
    setQuoteItems([...quoteItems, { name: '', qty: 1, unit: 'Job', price: 0 }]);
  };

  const removeQuoteItemRow = (idx: number) => {
    if (quoteItems.length > 1) {
      setQuoteItems(quoteItems.filter((_, i) => i !== idx));
    } else {
      showSimToast('ใบเสนอราคาต้องมีรายการสินค้าอย่างน้อย 1 แถว!', 'error');
    }
  };

  const handleQuoteItemChange = (idx: number, field: string, value: any) => {
    const updated = quoteItems.map((item, i) => {
      if (i === idx) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setQuoteItems(updated);
  };

  const calculateQuoteSubtotal = () => {
    return quoteItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
  };

  const handleCreateQuotationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteForm.title || !quoteForm.customerId) return;

    const selectedCust = customers.find(c => c.id === Number(quoteForm.customerId));
    const subtotal = calculateQuoteSubtotal();
    const vat = subtotal * 0.07;
    const grand = subtotal + vat;

    const nextId = quotations.length + 1;
    const qNo = `QT-${String(nextId).padStart(6, '0')}`;

    const newQuote: QuotationSim = {
      id: nextId,
      quotation_no: qNo,
      customer_id: Number(quoteForm.customerId),
      customer_name: selectedCust ? selectedCust.customer_name : 'Unknown Customer',
      project_name: quoteForm.oppId ? (opportunities.find(o => o.id === Number(quoteForm.oppId))?.project_name || '') : 'ดีลขายทั่วไป',
      title: quoteForm.title,
      quotation_date: quoteForm.date,
      validity_days: Number(quoteForm.validity),
      payment_term: quoteForm.term,
      total_value: subtotal,
      tax_rate: 7,
      grand_total: grand,
      status: 'Draft', // Set to Draft to allow testing action buttons
      items: [...quoteItems]
    };

    setQuotations([newQuote, ...quotations]);

    const newLog: AuditLogSim = {
      id: auditLogs.length + 1,
      action: 'ออกใบเสนอราคาใหม่ (PHP Create Quotation)',
      fullname: userFullname,
      role: userRole,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      details: `ออกใบเสนอราคาเลขที่ ${qNo} เรื่อง: "${quoteForm.title}" ยอดสุทธิ ฿${grand.toLocaleString()}`,
      target_type: 'quotation'
    };
    setAuditLogs([newLog, ...auditLogs]);

    setShowQuotationModal(false);
    showSimToast(`สร้างใบเสนอราคาเลขที่ "${qNo}" เรียบร้อยแล้ว!`, 'success');
    setQuoteForm({ customerId: '', oppId: '', title: '', date: '2026-06-30', validity: 30, term: 'เครดิต 30 วัน' });
    setQuoteItems([{ name: 'บริการ Hydrotesting บริเวณข้อต่อท่อหลัก', qty: 1, unit: 'Job', price: 0 }]);
  };

  // --- 5. Invoice Creation Handler ---
  const [invForm, setInvForm] = useState({ customerId: '', quotationId: '', date: '2026-06-30', dueDate: '2026-07-30', grandTotal: 0 });
  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invForm.customerId || invForm.grandTotal <= 0) return;

    const selectedCust = customers.find(c => c.id === Number(invForm.customerId));
    const subtotal = invForm.grandTotal / 1.07;
    const tax = invForm.grandTotal - subtotal;

    const nextId = invoices.length + 1;
    const invNo = `INV-${String(nextId).padStart(6, '0')}`;

    const newInv: InvoiceSim = {
      id: nextId,
      invoice_no: invNo,
      customer_id: Number(invForm.customerId),
      customer_name: selectedCust ? selectedCust.customer_name : 'Unknown Customer',
      quotation_no: invForm.quotationId ? (quotations.find(q => q.id === Number(invForm.quotationId))?.quotation_no || '') : '',
      invoice_date: invForm.date,
      due_date: invForm.dueDate,
      subtotal: subtotal,
      tax_amount: tax,
      grand_total: invForm.grandTotal,
      status: 'Unpaid'
    };

    setInvoices([newInv, ...invoices]);

    const newLog: AuditLogSim = {
      id: auditLogs.length + 1,
      action: 'ออกใบแจ้งหนี้ใหม่ (PHP Create Invoice)',
      fullname: userFullname,
      role: userRole,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      details: `ออกใบแจ้งหนี้เลขที่ ${invNo} ยอดสุทธิ ฿${Number(invForm.grandTotal).toLocaleString()} สำหรับองค์กรลูกค้าคู่ค้า`,
      target_type: 'invoice'
    };
    setAuditLogs([newLog, ...auditLogs]);

    setShowInvoiceModal(false);
    showSimToast(`ออกเอกสารใบแจ้งหนี้เลขที่ "${invNo}" สำเร็จเรียบร้อย!`, 'success');
    setInvForm({ customerId: '', quotationId: '', date: '2026-06-30', dueDate: '2026-07-30', grandTotal: 0 });
  };

  // --- Code Explorer State ---
  const [selectedFile, setSelectedFile] = useState<PHPFile>(phpCodebase[0]);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const handleCopyCode = (content: string, path: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(path);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans antialiased">
      
      {/* Dynamic Floating Toast Feedback */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-slate-800 border-l-4 border-emerald-500 text-white p-4 rounded-xl shadow-2xl max-w-md animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-sm font-semibold">{toast.message}</div>
        </div>
      )}

      {/* Main Mode Toggle Header (Simulation vs Source Code Explorer) */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold shadow-md shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider flex items-center gap-1 leading-none">
              <Sparkles className="w-3 h-3 animate-pulse" />
              Senior Full Stack & ERP Architect Mode
            </span>
            <h1 className="text-lg font-black text-white tracking-tight leading-none mt-1">
              PHP + MySQL CRM APP WORKSPACE
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-900 p-1 border border-slate-800 rounded-xl shadow-inner">
          <button 
            onClick={() => setSystemMode('simulation')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${systemMode === 'simulation' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Live APP Simulation
          </button>
          <button 
            onClick={() => setSystemMode('sourcecode')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${systemMode === 'sourcecode' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            <FileText className="w-4 h-4" />
            PHP Source Code Explorer
          </button>
        </div>
      </header>

      {/* Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ========================================================== */}
        {/* MODE A: LIVE PHP APP PREVIEW & INTERACTION                 */}
        {/* ========================================================== */}
        {systemMode === 'simulation' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-900">
            
            {/* Sidebar (AdminLTE menu look) */}
            <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 shrink-0 flex flex-col py-6 justify-between">
              <div className="space-y-6">
                
                {/* Brand Header */}
                <div className="px-6 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-indigo-500 text-white rounded p-1.5 d-flex align-items-center justify-center" style={{ width: '30px', height: '30px' }}>
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-extrabold text-white tracking-tight" style={{ fontSize: '1.05rem', letterSpacing: '-0.5px' }}>SALES MASTER</span>
                  </div>
                </div>

                {/* Nav items list */}
                <div className="px-4 space-y-1">
                  <span className="px-3 text-[9px] uppercase font-bold text-slate-500 tracking-wider block mb-2">{lang === 'TH' ? 'เมนูระบบหลัก' : 'MAIN SYSTEM MENU'}</span>
                  
                  {/* Link 1: Dashboard */}
                  <button 
                    onClick={() => { setActiveTab('dashboard'); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all text-left cursor-pointer ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow font-bold' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                    <span>{t.dashboard}</span>
                  </button>

                  <span className="px-3 text-[9px] uppercase font-bold text-slate-500 tracking-wider block pt-4 mb-2">{lang === 'TH' ? 'นิติบุคคล & โครงการ' : 'CUSTOMERS & PROJECTS'}</span>

                  {/* Link 2: Customers */}
                  <button 
                    onClick={() => { setActiveTab('customers'); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all text-left cursor-pointer ${activeTab === 'customers' ? 'bg-indigo-600 text-white shadow font-bold' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
                  >
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span>{t.customers}</span>
                  </button>

                  {/* Link 3: Opportunities */}
                  <button 
                    onClick={() => { setActiveTab('opportunities'); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all text-left cursor-pointer ${activeTab === 'opportunities' ? 'bg-indigo-600 text-white shadow font-bold' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
                  >
                    <Target className="w-4 h-4 text-amber-400" />
                    <span>{t.opportunities}</span>
                  </button>

                  <span className="px-3 text-[9px] uppercase font-bold text-slate-500 tracking-wider block pt-4 mb-2">{lang === 'TH' ? 'ระบบเสนอราคา & วางบิล' : 'QUOTATION & BILLING'}</span>

                  {/* Link 4: Quotations */}
                  <button 
                    onClick={() => { setActiveTab('quotations'); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all text-left cursor-pointer ${activeTab === 'quotations' ? 'bg-indigo-600 text-white shadow font-bold' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
                  >
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>{t.quotations}</span>
                  </button>

                  {/* Link 5: Invoices */}
                  <button 
                    onClick={() => { setActiveTab('invoices'); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all text-left cursor-pointer ${activeTab === 'invoices' ? 'bg-indigo-600 text-white shadow font-bold' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
                  >
                    <Wallet className="w-4 h-4 text-rose-400" />
                    <span>{t.invoices}</span>
                  </button>

                  <span className="px-3 text-[9px] uppercase font-bold text-slate-500 tracking-wider block pt-4 mb-2">{lang === 'TH' ? 'รายงาน' : 'REPORTS & BI'}</span>

                  {/* Link 6: Reports */}
                  <button 
                    onClick={() => { setActiveTab('reports'); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all text-left cursor-pointer ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow font-bold' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
                  >
                    <BarChart4 className="w-4 h-4 text-amber-400" />
                    <span>{t.reports}</span>
                  </button>
                </div>
              </div>

              {/* Sidebar footer info */}
              <div className="px-6 space-y-3">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-850 text-center select-none font-mono">
                  <span className="text-[9px] text-slate-500 block font-extrabold uppercase tracking-wide">MySQL CONNECTION</span>
                  <span className="text-[10px] text-emerald-400 font-extrabold mt-0.5 inline-block bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900">
                    PDO ACTIVE
                  </span>
                </div>
                <div className="text-[9px] text-slate-500 text-center">
                  Sales Master PHP ERP Suite
                  <div>© 2026 AdminLTE 4</div>
                </div>
              </div>
            </aside>

            {/* Simulated Live View Canvas Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950 text-slate-100 flex flex-col justify-between">
              
              <div>
                {/* Fake Top Nav Bar with multi-language toggle */}
                <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl flex items-center justify-between mb-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-xs text-slate-400 font-bold">XAMPP Server Status:</span>
                    <span className="badge bg-emerald-950/50 text-emerald-400 border border-emerald-900 text-[10px] px-2.5 py-1">Apache/2.4.58 (Win64) PHP/8.2.12</span>
                  </div>

                  <div className="flex items-center gap-3.5">
                    {/* Language Switch */}
                    <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] font-bold">
                      <button onClick={() => setLang('TH')} className={`px-2.5 py-1 rounded-md cursor-pointer ${lang === 'TH' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>TH</button>
                      <button onClick={() => setLang('EN')} className={`px-2.5 py-1 rounded-md cursor-pointer ${lang === 'EN' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>EN</button>
                    </div>

                    {/* Fake Profile Block */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-extrabold text-xs">
                        {userFullname.charAt(0)}
                      </div>
                      <div className="hidden sm:block text-left text-[11px] leading-tight">
                        <div className="font-extrabold text-white">{userFullname}</div>
                        <div className="text-slate-400 uppercase font-bold text-[9px]">{userRole}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ========================================== */}
                {/* 1. DASHBOARD TAB VIEW                      */}
                {/* ========================================== */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    {/* Welcome Banner */}
                    <div className="welcome-hero p-5 rounded-3xl shadow-lg relative overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #4f46e5 100%)' }}>
                      <div className="row align-items-center relative z-10">
                        <div className="col-md-8">
                          <span className="badge bg-white/20 text-white px-2.5 py-1 rounded-full mb-2 text-[9px] uppercase tracking-wider font-extrabold">
                            <i className="fa fa-sparkles text-warning me-1"></i> ENTERPRISE PHP & MYSQL SYSTEM
                          </span>
                          <h2 className="font-black tracking-tight mb-1 text-2xl">
                            {t.welcome_hi}, {userFullname} 👋
                          </h2>
                          <p className="mb-0 opacity-90 text-xs">
                            ยินดีต้อนรับสู่ระบบงานฝ่ายขายและลูกค้าสัมพันธ์ ERP วันนี้มีโอกาสขยายยอดผ่านกลุ่มปั๊มไฮโดรเทสและอุปกรณ์เช่า
                          </p>
                          <div className="mt-3 text-amber-300 flex items-center gap-1.5 text-[11px] bg-black/25 py-1 px-3 rounded-full w-fit">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span className="font-semibold">คำแนะนำกลยุทธ์วันนี้:</span> ติดตามดีลโครงการที่มีมูลค่าสูงในขั้นตอนการเจรจา (Negotiation) และอนุมัติใบเสนอราคาด่วนที่สุด
                          </div>
                        </div>
                        <div className="absolute top-4 right-4 text-right flex flex-col items-end gap-1">
                          <div className="text-white-50 text-[10px] uppercase font-bold tracking-wider opacity-60">{t.local_time}</div>
                          <div className="text-lg font-mono text-warning font-bold flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{systemTime || '--:--:--'}</span>
                          </div>
                          <div className="text-[11px] text-white opacity-75">{new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        </div>
                      </div>
                    </div>

                    {/* KPI Widget Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Total Pipeline */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                          <span>Total Pipeline (พอร์ตรวม)</span>
                          <span className="text-indigo-400 bg-indigo-950 border border-indigo-900 text-[9px] px-2 py-0.5 rounded">Active Deals</span>
                        </div>
                        <div className="font-mono text-xl font-black text-white mt-2">
                          ฿{totalPipeline.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="mt-3.5">
                          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                            <span>ความปลอดภัยพอร์ตรวม</span>
                            <span className="text-indigo-400 font-bold">100%</span>
                          </div>
                        </div>
                      </div>

                      {/* Weighted Pipeline */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                          <span>Weighted Pipeline (ถ่วงน้ำหนัก)</span>
                          <span className="text-amber-400 bg-amber-950 border border-amber-900 text-[9px] px-2 py-0.5 rounded">Prob-Adjusted</span>
                        </div>
                        <div className="font-mono text-xl font-black text-white mt-2">
                          ฿{weightedPipeline.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="mt-3.5">
                          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                            <span>อัตราความสำเร็จถ่วงน้ำหนัก</span>
                            <span className="text-amber-400 font-bold">75%</span>
                          </div>
                        </div>
                      </div>

                      {/* Won Deals */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                          <span>Total Won Deals (ยอดปิดแล้ว)</span>
                          <span className="text-emerald-400 bg-emerald-950 border border-emerald-900 text-[9px] px-2 py-0.5 rounded">Successful</span>
                        </div>
                        <div className="font-mono text-xl font-black text-emerald-400 mt-2">
                          ฿{wonPipeline.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="mt-3.5">
                          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${winRatio}%` }}></div>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                            <span>อัตราส่วนเป้ายอดปิดไตรมาส</span>
                            <span className="text-emerald-400 font-bold">{winRatio}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Active Customers */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                          <span>Active Customers (ลูกค้าหลัก)</span>
                          <span className="text-cyan-400 bg-cyan-950 border border-cyan-900 text-[9px] px-2 py-0.5 rounded">Corporate</span>
                        </div>
                        <div className="font-mono text-xl font-black text-white mt-2">
                          {activeCustomersCount} ราย
                        </div>
                        <div className="mt-3.5">
                          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                            <span>นิติบุคคลที่กำลังรักษาสัญญา</span>
                            <span className="text-cyan-400 font-bold">Active</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick navigation and Action panel */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-950 border border-indigo-900 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-white">อัตราส่วนงานขายประมูลสำเร็จเฉลี่ย: {winRatio}%</h4>
                          <span className="text-[11px] text-slate-400 block">วิเคราะห์แบบเรียลไทม์จากตัวเลขการปิดดีลทั้งหมด (Deals Won / Total Pipeline count)</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => { setActiveTab('customers'); }} className="px-3.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-900 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                          <Users className="w-3.5 h-3.5" /> ลูกค้าองค์กร PHP
                        </button>
                        <button onClick={() => { setActiveTab('opportunities'); }} className="px-3.5 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-900 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                          <Target className="w-3.5 h-3.5" /> โอกาสงานขาย PHP
                        </button>
                      </div>
                    </div>

                    {/* Timeline Log and Status Distribution Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Left: Opportunities Summary List */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl lg:col-span-7 p-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                          <h3 className="text-sm font-black text-white flex items-center gap-2">
                            <Target className="w-4 h-4 text-indigo-400" />
                            สถานะการประกวดราคางานประมูลทั้งหมด
                          </h3>
                          <span className="text-[10px] text-indigo-400 font-bold bg-indigo-950/50 border border-indigo-900 py-0.5 px-2.5 rounded-full">MySQL Stream</span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                                <th className="py-2.5">รหัสดีล</th>
                                <th>ชื่อโครงการ / ดีล</th>
                                <th>มูลค่าประเมิน</th>
                                <th className="text-center">ความน่าจะเป็น</th>
                                <th className="text-right">ขั้นตอนปัจจุบัน</th>
                              </tr>
                            </thead>
                            <tbody>
                              {opportunities.map(opp => (
                                <tr key={opp.id} className="border-b border-slate-850 hover:bg-slate-850/30 transition-all">
                                  <td className="py-3 font-mono text-indigo-400 font-bold">{opp.opportunity_no}</td>
                                  <td>
                                    <div className="font-bold text-white">{opp.project_name}</div>
                                    <span className="text-[10px] text-slate-500 block">{opp.customer_name}</span>
                                  </td>
                                  <td className="font-mono text-slate-300 font-bold">฿{opp.estimated_value.toLocaleString('th-TH')}</td>
                                  <td className="text-center font-mono text-indigo-300 font-bold">{opp.success_probability}%</td>
                                  <td className="text-right">
                                    <span className={`inline-block py-1 px-2 rounded-lg text-[9px] font-bold text-white ${
                                      opp.status === 'Won' ? 'bg-emerald-600' : 
                                      opp.status === 'Lost' ? 'bg-rose-600' : 
                                      opp.status === 'Negotiation' ? 'bg-amber-600' : 'bg-indigo-600'
                                    }`}>
                                      {opp.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Right: Audit Logs Timeline */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl lg:col-span-5 p-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                          <h3 className="text-sm font-black text-white flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-400" />
                            ประวัติกิจกรรมขายล่าสุด (Audit Trail)
                          </h3>
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/50 border border-emerald-900 py-0.5 px-2.5 rounded-full">PHP Active</span>
                        </div>

                        <div className="space-y-4 max-h-[290px] overflow-y-auto pr-1">
                          {auditLogs.map(log => (
                            <div key={log.id} className="border-b border-slate-850 pb-2.5 last:border-b-0">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-bold text-slate-200">{log.action}</span>
                                <span className="text-[9px] font-mono text-indigo-400">{log.created_at.substring(11, 16)} น.</span>
                              </div>
                              <span className="text-[10px] text-slate-400 block mb-1">โดย {log.fullname} • ({log.role})</span>
                              <p className="text-[11px] text-slate-500 m-0 leading-relaxed">{log.details}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* ========================================== */}
                {/* 2. CUSTOMERS DATABASE VIEW                 */}
                {/* ========================================== */}
                {activeTab === 'customers' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                          <Building2 className="w-5.5 h-5.5 text-indigo-400" />
                          จัดการทะเบียนลูกค้าองค์กร (Customer Master)
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">บันทึกข้อมูลลูกค้านิติบุคคล วงเงินสินเชื่อการค้า และประวัติผู้ประสานงานหลักทั้งหมดในระบบ</p>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => setShowCustomerModal(true)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Plus className="w-4 h-4" /> ลงทะเบียนลูกค้าใหม่
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow">
                      <div className="p-4 bg-slate-850/40 border-b border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-black text-white flex items-center gap-1.5">
                          <Database className="w-4 h-4 text-indigo-400" /> รายชื่อบริษัทและภาคธุรกิจที่ลงทะเบียนแล้ว
                        </span>
                      </div>

                      <div className="p-4 overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                              <th className="py-3 px-3">รหัสลูกค้า</th>
                              <th>ชื่อลูกค้าองค์กร (Corporation Company)</th>
                              <th>ประเภทธุรกิจ</th>
                              <th>โทรศัพท์ / อีเมล</th>
                              <th>ผู้ติดต่อหลัก (Contact Person)</th>
                              <th>เครดิตเทอม</th>
                              <th className="text-center">สถานะ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customers.map(cust => (
                              <tr key={cust.id} className="border-b border-slate-850 hover:bg-slate-850/30 transition-all text-slate-300">
                                <td className="py-4 px-3 font-mono text-indigo-400 font-bold">{cust.customer_code}</td>
                                <td>
                                  <div className="font-extrabold text-white text-[13px]">{cust.customer_name}</div>
                                  <div className="text-[10px] text-slate-500 mt-0.5"><i className="fa fa-map-marker-alt"></i> {cust.address || '-'}</div>
                                </td>
                                <td>
                                  <span className="badge bg-slate-800 text-slate-300 border border-slate-700 text-[10px] py-1 px-2 rounded-md">
                                    {cust.industry_type}
                                  </span>
                                </td>
                                <td>
                                  <div>{cust.phone || '-'}</div>
                                  <div className="text-slate-500 font-mono text-[10px]">{cust.email || '-'}</div>
                                </td>
                                <td>
                                  <span className="text-[11px] font-semibold text-slate-400">
                                    {cust.contacts_list || 'ไม่มีผู้ติดต่อหลัก'}
                                  </span>
                                </td>
                                <td className="font-mono text-slate-300 font-bold text-center">{cust.payment_term} วัน</td>
                                <td className="text-center">
                                  <span className="inline-block py-1 px-2.5 rounded-full text-[9px] font-bold bg-emerald-950/50 text-emerald-400 border border-emerald-900">
                                    {cust.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================== */}
                {/* 3. OPPORTUNITIES VIEW                      */}
                {/* ========================================== */}
                {activeTab === 'opportunities' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                          <Target className="w-5.5 h-5.5 text-indigo-400" />
                          โอกาสขายและการควบคุมดีลประมูล
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">จัดประเภท คาดการณ์สัดส่วนประมูล ชนะหรือสูญเสียโอกาส (Won/Lost) และบันทึกประวัติ</p>
                      </div>

                      <div className="flex gap-2.5">
                        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs font-bold shadow-inner">
                          <button onClick={() => setOppSubView('list')} className={`px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer ${oppSubView === 'list' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>ตาราง</button>
                          <button onClick={() => setOppSubView('kanban')} className={`px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer ${oppSubView === 'kanban' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>คัมบัง</button>
                        </div>
                        <button 
                          onClick={() => setShowOppModal(true)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Plus className="w-4 h-4" /> สร้างดีลโครงการใหม่
                        </button>
                      </div>
                    </div>

                    {/* SUBVIEW A: LIST TABLE */}
                    {oppSubView === 'list' && (
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow">
                        <div className="p-4 bg-slate-850/40 border-b border-slate-800 flex items-center justify-between">
                          <span className="text-xs font-black text-white flex items-center gap-1.5">
                            <Database className="w-4 h-4 text-indigo-400" /> รายชื่อโอกาสขายในระบบ MySQL ( opportunities table )
                          </span>
                        </div>

                        <div className="p-4 overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                                <th className="py-3 px-3">รหัสโครงการ</th>
                                <th>ชื่อดีลประมูลโครงการ / ลูกค้า</th>
                                <th>เซกเมนต์บริการ</th>
                                <th>มูลค่าคาดการณ์ (Estimated Value)</th>
                                <th>ความน่าจะเป็น</th>
                                <th>กำหนดวันปิดงาน</th>
                                <th>สถานะปัจจุบัน</th>
                                <th className="text-center" style={{ width: '150px' }}>ปรับสถานะ</th>
                              </tr>
                            </thead>
                            <tbody>
                              {opportunities.map(opp => (
                                <tr key={opp.id} className="border-b border-slate-850 hover:bg-slate-850/30 transition-all text-slate-300">
                                  <td className="py-4 px-3 font-mono text-indigo-400 font-bold">{opp.opportunity_no}</td>
                                  <td>
                                    <div className="font-extrabold text-white text-[13px]">{opp.project_name}</div>
                                    <span className="text-[10px] text-slate-500 block">{opp.customer_name}</span>
                                  </td>
                                  <td>
                                    <span className="badge bg-slate-800 text-slate-300 border border-slate-700 text-[10px] py-1 px-2.5 rounded-md">
                                      {opp.service_type}
                                    </span>
                                  </td>
                                  <td className="font-mono text-white font-bold text-[13px]">฿{opp.estimated_value.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                                  <td className="font-mono text-indigo-300 font-bold text-center">
                                    <div className="flex items-center gap-1">
                                      <div className="w-12 bg-slate-950 h-1 rounded-full overflow-hidden">
                                        <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${opp.success_probability}%` }}></div>
                                      </div>
                                      <span>{opp.success_probability}%</span>
                                    </div>
                                  </td>
                                  <td>{opp.expected_close_date}</td>
                                  <td>
                                    <span className={`inline-block py-1 px-2 rounded-lg text-[9px] font-bold text-white ${
                                      opp.status === 'Won' ? 'bg-emerald-600' : 
                                      opp.status === 'Lost' ? 'bg-rose-600' : 
                                      opp.status === 'Negotiation' ? 'bg-amber-600' : 'bg-indigo-600'
                                    }`}>
                                      {opp.status}
                                    </span>
                                  </td>
                                  <td className="text-center">
                                    <select 
                                      value={opp.status}
                                      onChange={(e) => handleUpdateOppStatusSim(opp.id, e.target.value)}
                                      className="bg-slate-950 text-slate-300 text-[10px] font-bold py-1 px-2 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                                    >
                                      <option value="Lead">Lead</option>
                                      <option value="Qualified">Qualified</option>
                                      <option value="Proposal">Proposal</option>
                                      <option value="Negotiation">Negotiation</option>
                                      <option value="Won">Won</option>
                                      <option value="Lost">Lost</option>
                                    </select>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* SUBVIEW B: KANBAN BOARD */}
                    {oppSubView === 'kanban' && (
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-3.5 flex-nowrap overflow-x-auto pb-4">
                        {['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'].map(stage => {
                          const stageOpps = opportunities.filter(o => o.status === stage);
                          return (
                            <div key={stage} className="bg-slate-900 border border-slate-800 rounded-2xl p-3 min-w-[220px]">
                              {/* Stage Header */}
                              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3.5">
                                <span className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase">
                                  <span className={`w-2 h-2 rounded-full ${
                                    stage === 'Won' ? 'bg-emerald-500' : stage === 'Lost' ? 'bg-rose-500' : stage === 'Negotiation' ? 'bg-amber-500' : 'bg-indigo-500'
                                  }`}></span>
                                  {stage}
                                </span>
                                <span className="badge bg-slate-850 text-slate-400 border border-slate-800 text-[10px] py-0.5 px-2 rounded-full font-bold">{stageOpps.length}</span>
                              </div>

                              {/* Stage Cards */}
                              <div className="space-y-2.5">
                                {stageOpps.length === 0 ? (
                                  <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-slate-500 text-[10px]">ไม่มีข้อมูลดีล</div>
                                ) : (
                                  stageOpps.map(opp => (
                                    <div key={opp.id} className="bg-slate-950 border border-slate-850 rounded-xl p-3 hover:border-indigo-500 transition-all cursor-pointer">
                                      <span className="text-[9px] font-mono text-indigo-400 font-bold block mb-1">{opp.opportunity_no}</span>
                                      <h4 className="text-[11px] font-extrabold text-white line-clamp-2 leading-relaxed mb-1.5">{opp.project_name}</h4>
                                      <span className="text-[9px] text-slate-500 block mb-2"><i className="fa fa-building"></i> {opp.customer_name}</span>
                                      
                                      <div className="flex items-center justify-between border-t border-slate-900 pt-2 mt-2">
                                        <span className="font-mono text-[11px] text-emerald-400 font-extrabold">฿{(opp.estimated_value / 1000).toFixed(0)}K</span>
                                        <span className="badge bg-slate-900 text-slate-400 border border-slate-850 text-[9px] px-1.5 py-0.5 rounded-md font-bold">{opp.success_probability}%</span>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ========================================== */}
                {/* 4. QUOTATIONS CENTER TAB VIEW               */}
                {/* ========================================== */}
                {activeTab === 'quotations' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                          <FileText className="w-5.5 h-5.5 text-indigo-400" />
                          ระบบจัดทำเอกสารใบเสนอราคา (Quotation Suite)
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">บริหารจัดการรายการราคาและวิศวกรรมบริการ กำหนดภาษี VAT 7% และสิทธิขั้นสูง</p>
                      </div>

                      <button 
                        onClick={() => setShowQuotationModal(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md w-fit"
                      >
                        <Plus className="w-4 h-4" /> สร้างใบเสนอราคาใหม่
                      </button>
                    </div>

                    {/* Quotation Mini Dashboard */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Card 1: Total Quotations */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
                        <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                          <span>มูลค่าเสนอราคารวมสุทธิ</span>
                          <span className="text-indigo-400 bg-indigo-950 border border-indigo-900 text-[9px] px-2 py-0.5 rounded">Total Quoted</span>
                        </div>
                        <div className="font-mono text-xl font-black text-white mt-2">
                          ฿{quotations.reduce((sum, q) => sum + q.grand_total, 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="mt-3.5">
                          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                            <span>จำนวนเอกสารทั้งหมด</span>
                            <span className="text-indigo-400 font-bold">{quotations.length} ใบ</span>
                          </div>
                        </div>
                      </div>

                      {/* Card 2: Approved Quotations */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
                        <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                          <span>อนุมัติและทำสัญญาแล้ว</span>
                          <span className="text-emerald-400 bg-emerald-950 border border-emerald-900 text-[9px] px-2 py-0.5 rounded">Approved & Signed</span>
                        </div>
                        <div className="font-mono text-xl font-black text-white mt-2">
                          ฿{quotations.filter(q => q.status === 'Approved').reduce((sum, q) => sum + q.grand_total, 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="mt-3.5">
                          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ 
                              width: quotations.length > 0 
                                ? `${(quotations.filter(q => q.status === 'Approved').length / quotations.length) * 100}%` 
                                : '0%' 
                            }}></div>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                            <span>อนุมัติไปแล้ว</span>
                            <span className="text-emerald-400 font-bold">
                              {quotations.filter(q => q.status === 'Approved').length} ใบ ({quotations.length > 0 ? ((quotations.filter(q => q.status === 'Approved').length / quotations.length) * 100).toFixed(0) : 0}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card 3: Pending/Sent/Draft */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
                        <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                          <span>อยู่ระหว่างเสนอ / รอผล</span>
                          <span className="text-amber-400 bg-amber-950 border border-amber-900 text-[9px] px-2 py-0.5 rounded">Pending Decisions</span>
                        </div>
                        <div className="font-mono text-xl font-black text-white mt-2">
                          ฿{quotations.filter(q => q.status === 'Sent' || q.status === 'Draft').reduce((sum, q) => sum + q.grand_total, 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="mt-3.5">
                          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-amber-500 h-1.5 rounded-full" style={{ 
                              width: quotations.length > 0 
                                ? `${(quotations.filter(q => q.status === 'Sent' || q.status === 'Draft').length / quotations.length) * 100}%` 
                                : '0%' 
                            }}></div>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                            <span>ร่าง + ส่งแล้ว</span>
                            <span className="text-amber-400 font-bold">
                              {quotations.filter(q => q.status === 'Sent' || q.status === 'Draft').length} ใบ ({quotations.length > 0 ? ((quotations.filter(q => q.status === 'Sent' || q.status === 'Draft').length / quotations.length) * 100).toFixed(0) : 0}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card 4: Rejected/Cancelled */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
                        <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                          <span>ถูกปฏิเสธ / ยกเลิก</span>
                          <span className="text-rose-400 bg-rose-950 border border-rose-900 text-[9px] px-2 py-0.5 rounded">Rejected / Cancelled</span>
                        </div>
                        <div className="font-mono text-xl font-black text-white mt-2">
                          ฿{quotations.filter(q => q.status === 'Rejected' || q.status === 'Cancelled').reduce((sum, q) => sum + q.grand_total, 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="mt-3.5">
                          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-rose-500 h-1.5 rounded-full" style={{ 
                              width: quotations.length > 0 
                                ? `${(quotations.filter(q => q.status === 'Rejected' || q.status === 'Cancelled').length / quotations.length) * 100}%` 
                                : '0%' 
                            }}></div>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                            <span>ปฏิเสธสัญญา</span>
                            <span className="text-rose-400 font-bold">
                              {quotations.filter(q => q.status === 'Rejected' || q.status === 'Cancelled').length} ใบ ({quotations.length > 0 ? ((quotations.filter(q => q.status === 'Rejected' || q.status === 'Cancelled').length / quotations.length) * 100).toFixed(0) : 0}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quotation Beautiful Table */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow">
                      <div className="p-4 bg-slate-850/40 border-b border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-black text-white flex items-center gap-1.5">
                          <Database className="w-4 h-4 text-indigo-400" /> แฟ้มรายการเอกสารเสนอราคาทั้งหมด (MySQL quotations)
                        </span>
                      </div>

                      <div className="p-4 overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                              <th className="py-3 px-3">เลขที่เอกสาร / วันที่</th>
                              <th>รายละเอียดชื่อโครงการ / ลูกค้า</th>
                              <th>เชื่อมโยงโอกาสดีล</th>
                              <th>ยอดรวมสุทธิ (Grand Total)</th>
                              <th className="text-center">สถานะ</th>
                              <th className="text-right pr-6">ดำเนินการ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {quotations.map(q => (
                              <tr key={q.id} className="border-b border-slate-850 hover:bg-slate-850/30 transition-all text-slate-300">
                                <td className="py-4 px-3 font-mono">
                                  <div className="text-emerald-400 font-bold">{q.quotation_no}</div>
                                  <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3 h-3 text-slate-600" /> {q.quotation_date}
                                  </div>
                                </td>
                                <td>
                                  <div className="font-extrabold text-white text-[13px]">{q.title}</div>
                                  <span className="text-[10px] text-slate-500 block">{q.customer_name}</span>
                                </td>
                                <td>
                                  <span className="text-slate-400 text-xs">{q.project_name || 'ดีลทั่วไป'}</span>
                                </td>
                                <td>
                                  <div className="font-mono text-emerald-400 font-extrabold text-[13px]">
                                    ฿{q.grand_total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    ก่อนภาษี: ฿{q.total_value.toLocaleString('th-TH', { minimumFractionDigits: 2 })} (VAT 7%)
                                  </div>
                                </td>
                                <td className="text-center">
                                  <span className={`inline-block py-1 px-2.5 rounded-full text-[9px] font-bold ${
                                    q.status === 'Approved' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900' :
                                    q.status === 'Sent' ? 'bg-indigo-950/50 text-indigo-400 border border-indigo-900' :
                                    q.status === 'Draft' ? 'bg-amber-950/50 text-amber-400 border border-amber-900' :
                                    q.status === 'Rejected' ? 'bg-rose-950/50 text-rose-400 border border-rose-900' :
                                    'bg-slate-950/50 text-slate-400 border border-slate-900'
                                  }`}>
                                    {q.status === 'Approved' ? '✓ Approved' : 
                                     q.status === 'Sent' ? '✉ Sent' : 
                                     q.status === 'Draft' ? '✎ Draft' : 
                                     q.status === 'Rejected' ? '✕ Rejected' : q.status}
                                  </span>
                                </td>
                                <td className="text-right py-4 pr-6">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {/* Action View */}
                                    <button 
                                      onClick={() => setSelectedViewQuotation(q)}
                                      title="พิมพ์ / ดูตัวอย่างใบเสนอราคา"
                                      className="p-1.5 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 rounded-lg transition-all cursor-pointer"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>

                                    {/* Action Approve (Draft/Sent -> Approved) */}
                                    {(q.status === 'Sent' || q.status === 'Draft') && (
                                      <button 
                                        onClick={() => {
                                          const updated = quotations.map(item => item.id === q.id ? { ...item, status: 'Approved' as const } : item);
                                          setQuotations(updated);
                                          showSimToast(`อนุมัติใบเสนอราคา ${q.quotation_no} สำเร็จเรียบร้อย!`, 'success');
                                          // add log
                                          const newLog: AuditLogSim = {
                                            id: auditLogs.length + 1,
                                            action: 'อนุมัติใบเสนอราคา (PHP Approve Quotation)',
                                            fullname: userFullname,
                                            role: userRole,
                                            created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                            details: `อนุมัติข้อเสนอใบเสนอราคาเลขที่ ${q.quotation_no} มูลค่า ฿${q.grand_total.toLocaleString()}`,
                                            target_type: 'quotation'
                                          };
                                          setAuditLogs([newLog, ...auditLogs]);
                                        }}
                                        title="อนุมัติใบเสนอราคา"
                                        className="p-1.5 bg-emerald-950 hover:bg-emerald-900 hover:text-white text-emerald-400 rounded-lg transition-all border border-emerald-900 cursor-pointer"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                    )}

                                    {/* Action Reject (Draft/Sent -> Rejected) */}
                                    {(q.status === 'Sent' || q.status === 'Draft') && (
                                      <button 
                                        onClick={() => {
                                          const updated = quotations.map(item => item.id === q.id ? { ...item, status: 'Rejected' as const } : item);
                                          setQuotations(updated);
                                          showSimToast(`ปฏิเสธข้อเสนอใบเสนอราคา ${q.quotation_no} เรียบร้อย`, 'info');
                                          // add log
                                          const newLog: AuditLogSim = {
                                            id: auditLogs.length + 1,
                                            action: 'ปฏิเสธใบเสนอราคา (PHP Reject Quotation)',
                                            fullname: userFullname,
                                            role: userRole,
                                            created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                            details: `ทำเรื่องปฏิเสธใบเสนอราคาเลขที่ ${q.quotation_no} สำหรับดีลลูกค้า ${q.customer_name}`,
                                            target_type: 'quotation'
                                          };
                                          setAuditLogs([newLog, ...auditLogs]);
                                        }}
                                        title="ปฏิเสธใบเสนอราคา"
                                        className="p-1.5 bg-rose-950 hover:bg-rose-900 hover:text-white text-rose-400 rounded-lg transition-all border border-rose-900 cursor-pointer"
                                      >
                                        <Ban className="w-4 h-4" />
                                      </button>
                                    )}

                                    {/* Action Delete */}
                                    <button 
                                      onClick={() => {
                                        if (confirm(`คุณต้องการลบเอกสารใบเสนอราคา ${q.quotation_no} ใช่หรือไม่?`)) {
                                          const updated = quotations.filter(item => item.id !== q.id);
                                          setQuotations(updated);
                                          showSimToast(`ลบใบเสนอราคา ${q.quotation_no} สำเร็จ`, 'info');
                                          // add log
                                          const newLog: AuditLogSim = {
                                            id: auditLogs.length + 1,
                                            action: 'ลบใบเสนอราคา (PHP Delete Quotation)',
                                            fullname: userFullname,
                                            role: userRole,
                                            created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
                                            details: `ลบข้อมูลใบเสนอราคาเลขที่ ${q.quotation_no} ออกจากระบบถาวร`,
                                            target_type: 'quotation'
                                          };
                                          setAuditLogs([newLog, ...auditLogs]);
                                        }
                                      }}
                                      title="ลบเอกสาร"
                                      className="p-1.5 bg-slate-950 hover:bg-rose-900 hover:text-white text-slate-500 rounded-lg transition-all cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================== */}
                {/* 5. INVOICES / BILLINGS TAB VIEW            */}
                {/* ========================================== */}
                {activeTab === 'invoices' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                          <Wallet className="w-5.5 h-5.5 text-indigo-400" />
                          การเงินและใบแจ้งหนี้ (Billing Center)
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">จัดทำเอกสารเรียกเก็บเงิน วางบิล ติดตามสถานะจ่ายค้างและครบวันชำระค่าสัญญางานบริการ</p>
                      </div>

                      <button 
                        onClick={() => setShowInvoiceModal(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md w-fit"
                      >
                        <Plus className="w-4 h-4" /> ออกใบแจ้งหนี้ใหม่
                      </button>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow">
                      <div className="p-4 bg-slate-850/40 border-b border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-black text-white flex items-center gap-1.5">
                          <Database className="w-4 h-4 text-indigo-400" /> ประวัติการวางบิลลูกค้านิติบุคคล (MySQL invoices)
                        </span>
                      </div>

                      <div className="p-4 overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                              <th className="py-3 px-3">เลขที่ใบสำคัญ</th>
                              <th>ชื่อลูกค้านิติบุคคล (Corporate Partner)</th>
                              <th>ใบเสนอราคาอ้างอิง</th>
                              <th>วันที่วางบิล</th>
                              <th>วันที่ครบกำหนด (Due Date)</th>
                              <th>ฐานภาษีก่อน VAT</th>
                              <th>ยอดรวมวางบิลรวมภาษี</th>
                              <th className="text-center">สถานะชำระเงิน</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoices.map(inv => (
                              <tr key={inv.id} className="border-b border-slate-850 hover:bg-slate-850/30 transition-all text-slate-300">
                                <td className="py-4 px-3 font-mono text-rose-400 font-bold">{inv.invoice_no}</td>
                                <td className="font-extrabold text-white">{inv.customer_name}</td>
                                <td>
                                  {inv.quotation_no ? (
                                    <span className="badge bg-slate-800 text-slate-300 border border-slate-700 text-[9px] font-mono py-1 px-1.5 rounded">
                                      {inv.quotation_no}
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">วางบิลตรง</span>
                                  )}
                                </td>
                                <td>{inv.invoice_date}</td>
                                <td>
                                  <span className={`font-semibold ${new Date(inv.due_date) < new Date() && inv.status === 'Unpaid' ? 'text-rose-400' : ''}`}>
                                    {inv.due_date}
                                  </span>
                                </td>
                                <td className="font-mono">฿{inv.subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                                <td className="font-mono text-rose-400 font-extrabold text-[13px]">฿{inv.grand_total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                                <td className="text-center">
                                  <span className={`inline-block py-1 px-2.5 rounded-full text-[9px] font-bold ${
                                    inv.status === 'Paid' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900' : 'bg-amber-950/50 text-amber-400 border border-amber-900'
                                  }`}>
                                    {inv.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================== */}
                {/* 6. BI REPORTS TAB VIEW                     */}
                {/* ========================================== */}
                {activeTab === 'reports' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <BarChart4 className="w-5.5 h-5.5 text-indigo-400" />
                        ศูนย์วิเคราะห์รายงานผลการขายและการตลาด (BI Reports)
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">วิเคราะห์สัดส่วนสินค้าที่ได้รับการสั่งจ้างงานเสนอราคาสูงสุดและยอดรวมแบ่งค่ายลูกค้านิติบุคคล</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Pie/Doughnut Chart: Service Segment share */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                        <h3 className="text-sm font-black text-white mb-4"><i className="fas fa-chart-pie text-indigo-400 me-1.5"></i> สัดส่วนบริการ (Service Segment Share)</h3>
                        <div className="h-64 flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Testing Service', value: opportunities.filter(o => o.service_type === 'Testing Service').reduce((sum, o) => sum + o.estimated_value, 0) },
                                  { name: 'Equipment Rental', value: opportunities.filter(o => o.service_type === 'Equipment Rental').reduce((sum, o) => sum + o.estimated_value, 0) },
                                  { name: 'Manpower Supply', value: opportunities.filter(o => o.service_type === 'Manpower Supply').reduce((sum, o) => sum + o.estimated_value, 0) }
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                <Cell fill="#4f46e5" />
                                <Cell fill="#10b981" />
                                <Cell fill="#f59e0b" />
                              </Pie>
                              <Tooltip formatter={(value) => `฿${Number(value).toLocaleString()}`} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Bar Chart: Opportunities estimated value distribution */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                        <h3 className="text-sm font-black text-white mb-4"><i className="fas fa-chart-bar text-emerald-400 me-1.5"></i> สรุปดีลประมูลงานขายรวมแยกขั้นปัจจุบัน (Opportunity Value by Stage)</h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'].map(stage => ({
                                name: stage,
                                value: opportunities.filter(o => o.status === stage).reduce((sum, o) => sum + o.estimated_value, 0)
                              }))}
                              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                              <YAxis stroke="#64748b" fontSize={11} />
                              <Tooltip formatter={(value) => `฿${Number(value).toLocaleString()}`} />
                              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* Top 5 accounts table */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                      <h3 className="text-sm font-black text-white mb-4"><i className="fas fa-crown text-amber-400 me-1.5"></i> 5 อันดับแรกคู่ค้าธุรกิจพอร์ตรวมสูงสุด (Top Corporate Partners)</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                              <th className="py-2.5 px-3">รหัสลูกค้า</th>
                              <th>ชื่อลูกค้าองค์กร</th>
                              <th>ประเภทธุรกิจอุตสาหกรรม</th>
                              <th className="text-center">จำนวนดีลประมูล</th>
                              <th className="text-right">พอร์ตรวมมูลค่าสะสม (฿)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customers.map((c, i) => {
                              const dealCount = opportunities.filter(opp => opp.customer_id === c.id).length;
                              const portfolioTotal = opportunities.filter(opp => opp.customer_id === c.id).reduce((sum, o) => sum + o.estimated_value, 0);
                              return (
                                <tr key={c.id} className="border-b border-slate-850 hover:bg-slate-850/30 transition-all text-slate-300">
                                  <td className="py-3.5 px-3 font-mono text-indigo-400 font-bold">{c.customer_code}</td>
                                  <td className="font-extrabold text-white">
                                    <span className="badge bg-amber-950 text-amber-400 border border-amber-900 text-[9px] font-bold me-1.5">Top {i + 1}</span>
                                    {c.customer_name}
                                  </td>
                                  <td><span className="text-slate-400">{c.industry_type}</span></td>
                                  <td className="text-center font-mono text-slate-400">{dealCount} ดีล</td>
                                  <td className="text-right font-mono font-extrabold text-emerald-400 text-[13px]">฿{portfolioTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Fake Shared Footer */}
              <footer className="mt-8 pt-4 border-t border-slate-800/60 text-center text-slate-500 text-[11px]">
                <div>ระบบจำลองการทำงานฝ่ายขายและลูกค้าสัมพันธ์ระดับองค์กร (AdminLTE 4 + MySQL Sandbox)</div>
                <div className="mt-1">สงวนลิขสิทธิ์ระบบ ERP 2026 อย่างสมบูรณ์แบบ</div>
              </footer>

            </main>

          </div>
        )}

        {/* ========================================================== */}
        {/* MODE B: PHP CODE CODE EXPLORER (SOURCE PREVIEW)           */}
        {/* ========================================================== */}
        {systemMode === 'sourcecode' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-900">
            
            {/* File Explorer Tree Panel on Left */}
            <aside className="w-full md:w-80 bg-slate-950 border-r border-slate-800 shrink-0 flex flex-col py-5 px-4 overflow-y-auto">
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block mb-3">PHP SOURCE CODE TREE</span>
              
              <div className="space-y-4">
                {/* Configuration Files */}
                <div>
                  <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-1 px-1 flex items-center gap-1">
                    <Database className="w-3.5 h-3.5" />
                    ฐานข้อมูลและคอนฟิก
                  </h4>
                  <div className="space-y-1">
                    {phpCodebase.filter(f => f.category === 'Configuration').map(file => (
                      <button 
                        key={file.filepath}
                        onClick={() => setSelectedFile(file)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold tracking-tight text-left cursor-pointer transition-all ${selectedFile.filepath === file.filepath ? 'bg-indigo-600/25 border-l-3 border-indigo-500 text-white font-bold' : 'text-slate-400 hover:bg-slate-900/45 hover:text-white'}`}
                      >
                        <span className="font-mono">{file.filepath}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layout Files */}
                <div>
                  <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-1 px-1 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    เลย์เอาต์ร่วม (Layouts)
                  </h4>
                  <div className="space-y-1">
                    {phpCodebase.filter(f => f.category === 'Layout').map(file => (
                      <button 
                        key={file.filepath}
                        onClick={() => setSelectedFile(file)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold tracking-tight text-left cursor-pointer transition-all ${selectedFile.filepath === file.filepath ? 'bg-indigo-600/25 border-l-3 border-indigo-500 text-white font-bold' : 'text-slate-400 hover:bg-slate-900/45 hover:text-white'}`}
                      >
                        <span className="font-mono">{file.filepath}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Pages */}
                <div>
                  <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-1 px-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    หน้าหลักและการประมวลผล
                  </h4>
                  <div className="space-y-1">
                    {phpCodebase.filter(f => f.category === 'Main Page').map(file => (
                      <button 
                        key={file.filepath}
                        onClick={() => setSelectedFile(file)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold tracking-tight text-left cursor-pointer transition-all ${selectedFile.filepath === file.filepath ? 'bg-indigo-600/25 border-l-3 border-indigo-500 text-white font-bold' : 'text-slate-400 hover:bg-slate-900/45 hover:text-white'}`}
                      >
                        <span className="font-mono">{file.filepath}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* API Endpoints */}
                <div>
                  <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-1 px-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    AJAX / API เกตเวย์
                  </h4>
                  <div className="space-y-1">
                    {phpCodebase.filter(f => f.category === 'API').map(file => (
                      <button 
                        key={file.filepath}
                        onClick={() => setSelectedFile(file)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold tracking-tight text-left cursor-pointer transition-all ${selectedFile.filepath === file.filepath ? 'bg-indigo-600/25 border-l-3 border-indigo-500 text-white font-bold' : 'text-slate-400 hover:bg-slate-900/45 hover:text-white'}`}
                      >
                        <span className="font-mono">{file.filepath}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* XAMPP Installation Guidelines box */}
              <div className="mt-8 p-3.5 bg-indigo-950/40 border border-indigo-900/50 rounded-2xl">
                <h5 className="text-[11px] font-black text-white flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-indigo-400" />
                  XAMPP Setup Guide
                </h5>
                <ol className="text-[10px] text-slate-400 space-y-2.5 mt-2.5 list-decimal pl-4 leading-relaxed">
                  <li>ดาวน์โหลดและติดตั้ง XAMPP</li>
                  <li>ก๊อปปี้สคริปต์ PHP ทั้งหมดใส่โฟลเดอร์ <code className="text-indigo-300 font-mono bg-indigo-950/80 px-1 rounded">htdocs/sales-master-crm</code></li>
                  <li>เปิด phpMyAdmin และสร้างชื่อฐานข้อมูล <code className="text-indigo-300 font-mono bg-indigo-950/80 px-1 rounded">sales_master_crm</code></li>
                  <li>นำเข้าคัดลอกคำสั่งในไฟล์ <code className="text-indigo-300 font-mono bg-indigo-950/80 px-1 rounded">database.sql</code> ไปเปิดรัน SQL รัน Seeding</li>
                  <li>รันเปิดผ่านเบราว์เซอร์: <code className="text-indigo-300 font-mono bg-indigo-950/80 px-1 rounded">localhost/sales-master-crm</code></li>
                </ol>
              </div>
            </aside>

            {/* Source Code Code Viewer display */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-900 flex flex-col justify-between">
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-900 uppercase font-mono">{selectedFile.category}</span>
                    <h2 className="text-base font-black text-white mt-1.5 font-mono flex items-center gap-2">
                      {selectedFile.filepath}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">{selectedFile.description}</p>
                  </div>

                  <button 
                    onClick={() => handleCopyCode(selectedFile.content, selectedFile.filepath)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow self-start sm:self-center"
                  >
                    {copiedFile === selectedFile.filepath ? <Check className="w-4 h-4 text-emerald-300 animate-pulse" /> : <Copy className="w-4 h-4" />}
                    {copiedFile === selectedFile.filepath ? 'คัดลอกแล้ว!' : 'คัดลอกสคริปต์'}
                  </button>
                </div>

                {/* Preformatted code output */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 shadow-inner overflow-x-auto">
                  <pre className="font-mono text-xs text-indigo-200 leading-relaxed overflow-x-auto whitespace-pre select-all">
                    {selectedFile.content}
                  </pre>
                </div>
              </div>

            </main>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 7. ALL MODALS (BOOTSTRAP STYLED DESIGN FOR HIGH FIDELITY PREVIEW)        */}
      {/* ========================================================================= */}
      
      {/* A. Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up">
            <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-1.5"><Plus className="w-4 h-4" /> ลงทะเบียนลูกค้าองค์กรใหม่ (Customer Register)</h3>
              <button onClick={() => setShowCustomerModal(false)} className="text-white hover:opacity-75 focus:outline-none cursor-pointer">✕</button>
            </div>
            
            <form onSubmit={handleCreateCustomerSubmit} className="p-5 text-xs text-slate-300 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block mb-1 font-bold text-slate-400">ชื่อบริษัทลูกค้าองค์กร *</label>
                  <input type="text" required placeholder="เช่น บริษัท ปตท. จำกัด (มหาชน)" value={custForm.name} onChange={e => setCustForm({ ...custForm, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block mb-1 font-bold text-slate-400">เลขประจำตัวผู้เสียภาษี</label>
                  <input type="text" placeholder="เลขประจำตัว 13 หลัก" value={custForm.taxId} onChange={e => setCustForm({ ...custForm, taxId: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block mb-1 font-bold text-slate-400">ประเภทอุตสาหกรรม</label>
                  <select value={custForm.industry} onChange={e => setCustForm({ ...custForm, industry: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500">
                    <option value="Energy & Utilities">Energy & Utilities (พลังงาน)</option>
                    <option value="Manufacturing">Manufacturing (ภาคผลิต)</option>
                    <option value="Retail">Retail (ภาคค้าปลีก)</option>
                    <option value="Construction">Construction (ก่อสร้าง)</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-bold text-slate-400">เบอร์โทรศัพท์ติดต่อองค์กร</label>
                  <input type="text" placeholder="เช่น 02-537-XXXX" value={custForm.phone} onChange={e => setCustForm({ ...custForm, phone: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block mb-1 font-bold text-slate-400">เครดิตเทอมการชำระเงิน</label>
                  <select value={custForm.term} onChange={e => setCustForm({ ...custForm, term: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500">
                    <option value="30">30 วัน (Net 30)</option>
                    <option value="45">45 วัน (Net 45)</option>
                    <option value="60">60 วัน (Net 60)</option>
                  </select>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block mb-1 font-bold text-slate-400">ที่อยู่สำนักงานและที่ตั้งส่งบิล</label>
                  <textarea rows={2} placeholder="เลขที่ ถนน เขต แขวง..." value={custForm.address} onChange={e => setCustForm({ ...custForm, address: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500" />
                </div>

                <div className="col-span-1 sm:col-span-2 border-t border-slate-800 pt-3 mt-1">
                  <h4 className="font-extrabold text-white mb-2"><i className="fa fa-user-circle"></i> รายละเอียดผู้ประสานงานหลัก (Primary Contact)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 font-bold text-slate-500">ชื่อ-นามสกุล ผู้ประสานงาน</label>
                      <input type="text" placeholder="เช่น คุณ สมศักดิ์ มั่นคง" value={custForm.contactName} onChange={e => setCustForm({ ...custForm, contactName: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block mb-1 font-bold text-slate-500">ตำแหน่งงาน</label>
                      <input type="text" placeholder="Procurement Staff" value={custForm.contactPosition} onChange={e => setCustForm({ ...custForm, contactPosition: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowCustomerModal(false)} className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-400 rounded-xl font-bold cursor-pointer">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer">บันทึกข้อมูลลูกค้า</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* B. Opportunity Modal */}
      {showOppModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-scale-up">
            <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-1.5"><Plus className="w-4 h-4" /> บันทึกดีลโครงการ / งานประมูลใหม่</h3>
              <button onClick={() => setShowOppModal(false)} className="text-white hover:opacity-75 focus:outline-none cursor-pointer">✕</button>
            </div>
            
            <form onSubmit={handleCreateOppSubmit} className="p-5 text-xs text-slate-300 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-400">เลือกองค์กรคู่ค้าลูกค้า *</label>
                  <select required value={oppForm.customerId} onChange={e => setOppForm({ ...oppForm, customerId: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none">
                    <option value="">-- เลือกองค์กรผู้ติดต่อ --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.customer_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-400">ชื่อโครงการ / ดีลประมูล *</label>
                  <input type="text" required placeholder="เช่น โครงการทดสอบท่อ PTT ระยอง" value={oppForm.projectName} onChange={e => setOppForm({ ...oppForm, projectName: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-bold text-slate-400">ประเภทบริการ</label>
                    <select value={oppForm.serviceType} onChange={e => setOppForm({ ...oppForm, serviceType: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none">
                      <option value="Testing Service">Testing Service (ทดสอบแรงดัน)</option>
                      <option value="Equipment Rental">Equipment Rental (เช่าอุปกรณ์)</option>
                      <option value="Manpower Supply">Manpower Supply (กำลังพลวิศวกรรม)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-bold text-slate-400">ที่มาของดีล (Lead Source)</label>
                    <select value={oppForm.leadSource} onChange={e => setOppForm({ ...oppForm, leadSource: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none">
                      <option value="Existing Customer">Existing Customer (ลูกค้าเก่า)</option>
                      <option value="Tender">Tender (ยื่นประมูลบอร์ด)</option>
                      <option value="Referral">Referral (การแนะนำปากต่อปาก)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1 font-bold text-slate-400">มูลค่าคาดการณ์ (Estimated Value)</label>
                    <input type="number" required value={oppForm.value} onChange={e => setOppForm({ ...oppForm, value: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block mb-1 font-bold text-slate-400">ความสำเร็จ (%)</label>
                    <input type="number" min="0" max="100" required value={oppForm.probability} onChange={e => setOppForm({ ...oppForm, probability: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block mb-1 font-bold text-slate-400">กำหนดคาดปิดดีล</label>
                    <input type="date" required value={oppForm.closeDate} onChange={e => setOppForm({ ...oppForm, closeDate: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-400">ขอบเขตงานและหมายเหตุเพิ่มเติม</label>
                  <textarea rows={2} placeholder="ระบุขอบเขตวิศวกรรม... " value={oppForm.remarks} onChange={e => setOppForm({ ...oppForm, remarks: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowOppModal(false)} className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-400 rounded-xl font-bold cursor-pointer">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer">บันทึกดีลโครงการ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* C. Quotation Modal */}
      {showQuotationModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-scale-up text-slate-300">
            <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-1.5"><Plus className="w-4 h-4" /> ออกเอกสารข้อเสนอใบเสนอราคา (Quotation Creator)</h3>
              <button onClick={() => setShowQuotationModal(false)} className="text-white hover:opacity-75 focus:outline-none cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateQuotationSubmit} className="p-5 text-xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-400">เลือกบริษัทลูกค้า *</label>
                  <select required value={quoteForm.customerId} onChange={e => setQuoteForm({ ...quoteForm, customerId: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white">
                    <option value="">-- เลือกบริษัทลูกค้า --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.customer_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-bold text-slate-400">เชื่อมโยงโอกาสการขาย</label>
                  <select value={quoteForm.oppId} onChange={e => setQuoteForm({ ...quoteForm, oppId: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white">
                    <option value="">-- ไม่ระบุดีล (งานทั่วไป) --</option>
                    {opportunities.map(o => (
                      <option key={o.id} value={o.id}>{o.project_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-bold text-slate-400">วันที่ออกใบเสนอราคา</label>
                  <input type="date" required value={quoteForm.date} onChange={e => setQuoteForm({ ...quoteForm, date: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block mb-1 font-bold text-slate-400">หัวข้อนำเสนอโครงการเด่น *</label>
                  <input type="text" required placeholder="เช่น บริการดูแลระบบและตรวจสอบแรงดัน..." value={quoteForm.title} onChange={e => setQuoteForm({ ...quoteForm, title: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
                </div>
                <div>
                  <label className="block mb-1 font-bold text-slate-400">ยืนราคา (วัน)</label>
                  <input type="number" required value={quoteForm.validity} onChange={e => setQuoteForm({ ...quoteForm, validity: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
                </div>
              </div>

              {/* Dynamic quotation items table block */}
              <div className="border border-slate-800 rounded-xl p-3 bg-slate-950/40">
                <div className="flex items-center justify-between pb-2 border-b border-slate-850 mb-3">
                  <span className="font-extrabold text-white text-[11px]"><i className="fa fa-list"></i> รายการสินค้าและบริการ (Dynamic Item Rows)</span>
                  <button type="button" onClick={addQuoteItemRow} className="px-3 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-900 text-emerald-400 rounded-md text-[10px] font-bold cursor-pointer">✕ เพิ่มแถวรายการ</button>
                </div>

                <div className="space-y-2">
                  {quoteItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <input type="text" required placeholder="เช่น บริการ Hydrotest ด้วยรถปั๊มเคลื่อนที่" value={item.name} onChange={e => handleQuoteItemChange(idx, 'name', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white" />
                      </div>
                      <div className="col-span-2">
                        <input type="number" required value={item.qty} onChange={e => { handleQuoteItemChange(idx, 'qty', Number(e.target.value)); }} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white" />
                      </div>
                      <div className="col-span-1.5">
                        <input type="text" value={item.unit} onChange={e => handleQuoteItemChange(idx, 'unit', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white" />
                      </div>
                      <div className="col-span-2">
                        <input type="number" required value={item.price} onChange={e => { handleQuoteItemChange(idx, 'price', Number(e.target.value)); }} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white" />
                      </div>
                      <div className="col-span-1 text-right font-mono text-emerald-400 font-bold">
                        ฿{(item.qty * item.price).toLocaleString()}
                      </div>
                      <div className="col-span-0.5 text-center">
                        <button type="button" onClick={() => removeQuoteItemRow(idx)} className="text-rose-500 hover:text-rose-400 focus:outline-none cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotals & Taxes */}
                <div className="flex justify-end pt-4 mt-4 border-t border-slate-850">
                  <div className="w-72 bg-slate-950/80 p-3.5 rounded-xl border border-slate-850 space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[10px]">มูลค่ารวมสินค้า:</span>
                      <span className="text-white font-bold">฿{calculateQuoteSubtotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[10px]">ภาษีมูลค่าเพิ่ม VAT (7%):</span>
                      <span className="text-white font-bold">฿{(calculateQuoteSubtotal() * 0.07).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-1.5">
                      <span className="text-slate-200 text-xs font-bold">ยอดสุทธิ (Grand Total):</span>
                      <span className="text-emerald-400 font-black">฿{(calculateQuoteSubtotal() * 1.07).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowQuotationModal(false)} className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-400 rounded-xl font-bold cursor-pointer">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer">บันทึกร่างใบเสนอราคา (Save Draft)</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* D. Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up text-slate-300">
            <div className="bg-rose-600 text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-1.5"><Plus className="w-4 h-4" /> จัดทำเอกสารใบแจ้งหนี้ / ใบวางบิลใหม่</h3>
              <button onClick={() => setShowInvoiceModal(false)} className="text-white hover:opacity-75 focus:outline-none cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="p-5 text-xs space-y-4">
              <div>
                <label className="block mb-1 font-bold text-slate-400">เลือกองค์กรคู่ค้าลูกค้า *</label>
                <select required value={invForm.customerId} onChange={e => setInvForm({ ...invForm, customerId: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white">
                  <option value="">-- เลือกบริษัทลูกค้า --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.customer_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-400">อ้างอิงใบเสนอราคาเสนอที่ได้รับการอนุมัติ</label>
                <select 
                  value={invForm.quotationId} 
                  onChange={e => {
                    const qId = e.target.value;
                    const qAmt = quotations.find(qt => qt.id === Number(qId))?.grand_total || 0;
                    const qCust = quotations.find(qt => qt.id === Number(qId))?.customer_id || '';
                    setInvForm({ ...invForm, quotationId: qId, grandTotal: qAmt, customerId: String(qCust) });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="">-- ไม่เชื่อมโยง (วางบิลตรงทั่วไป) --</option>
                  {quotations.filter(q => q.status === 'Approved').map(q => (
                    <option key={q.id} value={q.id}>{q.quotation_no} (ยอด ฿{q.grand_total.toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-400">วันที่วางบิล</label>
                  <input type="date" required value={invForm.date} onChange={e => setInvForm({ ...invForm, date: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
                </div>
                <div>
                  <label className="block mb-1 font-bold text-slate-400">กำหนดครบชำระ</label>
                  <input type="date" required value={invForm.dueDate} onChange={e => setInvForm({ ...invForm, dueDate: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white" />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-400">ยอดเงินรวมสุทธิวางบิล (Grand Total) *</label>
                <input type="number" required value={invForm.grandTotal} onChange={e => setInvForm({ ...invForm, grandTotal: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-end" />
                <span className="text-[10px] text-slate-500 mt-1.5 block"><i className="fa fa-info-circle"></i> ระบบจะคำนวณถอดแยก VAT 7% จากยอดเงินวางบิลนี้ใน MySQL แบบเรียลไทม์</span>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowInvoiceModal(false)} className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-400 rounded-xl font-bold cursor-pointer">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer">บันทึกและสร้างเอกสาร</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quotation Viewer Modal */}
      {selectedViewQuotation && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-scale-up text-slate-300 flex flex-col max-h-[90vh]">
            <div className="bg-slate-850 p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <h3 className="font-extrabold text-sm flex items-center gap-1.5 text-indigo-400">
                <FileText className="w-4 h-4" /> ดูเอกสารใบเสนอราคา (Quotation Document View)
              </h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()} 
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Printer className="w-3.5 h-3.5" /> พิมพ์เอกสาร (Print)
                </button>
                <button 
                  onClick={() => setSelectedViewQuotation(null)} 
                  className="text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-full focus:outline-none cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-100 text-slate-850 font-sans text-xs flex-1">
              {/* Actual printable paper layout */}
              <div className="border border-slate-200 p-8 rounded-xl shadow-lg space-y-6 bg-white max-w-3xl mx-auto printable-area">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                  <div>
                    <h4 className="text-base font-black text-slate-950">บริษัท นอร์ทเทิร์น อินดัสเตรียล เซอร์วิสเซส จำกัด</h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      99/9 หมู่ 4 ต.หนองป่าครั่ง อ.เมืองเชียงใหม่ จ.เชียงใหม่ 50000<br />
                      โทร: 053-123-456 | เลขประจำตัวผู้เสียภาษี: 0105560001234
                    </p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-black text-indigo-600 uppercase tracking-widest">ใบเสนอราคา</h3>
                    <span className="text-slate-500 font-bold block text-[10px] mt-1">QUOTATION</span>
                    <div className="mt-2 font-mono text-[10px] space-y-0.5">
                      <div><strong className="text-slate-900">เลขที่ / No:</strong> <span className="text-indigo-600 font-bold">{selectedViewQuotation.quotation_no}</span></div>
                      <div><strong className="text-slate-900">วันที่ / Date:</strong> {selectedViewQuotation.quotation_date}</div>
                    </div>
                  </div>
                </div>

                {/* Info Blocks */}
                <div className="grid grid-cols-2 gap-6 text-[10px]">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                    <strong className="text-xs text-slate-900 block mb-1">ข้อมูลลูกค้า / Customer Info:</strong>
                    <div><span className="font-bold text-slate-800">{selectedViewQuotation.customer_name}</span></div>
                    {(() => {
                      const matchingCust = customers.find(c => c.id === selectedViewQuotation.customer_id);
                      return matchingCust ? (
                        <>
                          <div><strong>เลขผู้เสียภาษี:</strong> {matchingCust.tax_id}</div>
                          <div><strong>ที่อยู่:</strong> {matchingCust.address}</div>
                          <div><strong>โทรศัพท์:</strong> {matchingCust.phone} | <strong>อีเมล:</strong> {matchingCust.email}</div>
                        </>
                      ) : (
                        <div className="text-slate-400">ข้อมูลดีลทั่วไปนิติบุคคล</div>
                      );
                    })()}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                    <strong className="text-xs text-slate-900 block mb-1">เงื่อนไขข้อเสนอ / Conditions:</strong>
                    <div><strong>ชื่องานโครงการ:</strong> <span className="font-bold text-slate-800">{selectedViewQuotation.project_name || 'ดีลงานบริการทั่วไป'}</span></div>
                    <div><strong>หัวข้อข้อเสนอ:</strong> {selectedViewQuotation.title}</div>
                    <div><strong>เงื่อนไขการชำระเงิน:</strong> {selectedViewQuotation.payment_term}</div>
                    <div><strong>ระยะเวลากำหนดยืนราคา:</strong> {selectedViewQuotation.validity_days} วันนับจากวันที่ออกเอกสาร</div>
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="py-2 px-2 text-center w-12">ลำดับ</th>
                        <th className="py-2 px-2">รายการสินค้า / บริการวิศวกรรม</th>
                        <th className="py-2 px-2 text-center w-16">จำนวน</th>
                        <th className="py-2 px-2 text-center w-16">หน่วย</th>
                        <th className="py-2 px-2 text-right w-24">ราคาต่อหน่วย</th>
                        <th className="py-2 px-2 text-right w-28">จำนวนเงิน (บาท)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedViewQuotation.items && selectedViewQuotation.items.length > 0 ? (
                        selectedViewQuotation.items.map((item, index) => (
                          <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 text-slate-800">
                            <td className="py-2.5 px-2 text-center text-slate-400 font-mono">{index + 1}</td>
                            <td className="py-2.5 px-2 font-bold text-slate-950">{item.name}</td>
                            <td className="py-2.5 px-2 text-center font-mono">{item.qty}</td>
                            <td className="py-2.5 px-2 text-center text-slate-500">{item.unit}</td>
                            <td className="py-2.5 px-2 text-right font-mono">฿{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-950">฿{(item.qty * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-b border-slate-100 hover:bg-slate-50 text-slate-800">
                          <td className="py-2.5 px-2 text-center text-slate-400 font-mono">1</td>
                          <td className="py-2.5 px-2 font-bold text-slate-950">{selectedViewQuotation.title}</td>
                          <td className="py-2.5 px-2 text-center font-mono">1</td>
                          <td className="py-2.5 px-2 text-center text-slate-500">Job</td>
                          <td className="py-2.5 px-2 text-right font-mono">฿{selectedViewQuotation.total_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-950">฿{selectedViewQuotation.total_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Calculation Footer */}
                <div className="flex justify-end pt-2">
                  <div className="w-80 space-y-1.5 font-mono text-[10px]">
                    <div className="flex justify-between text-slate-600">
                      <span>มูลค่ารวมสินค้า / Services Subtotal:</span>
                      <span className="font-bold text-slate-900">฿{selectedViewQuotation.total_value.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>ภาษีมูลค่าเพิ่ม / VAT ({selectedViewQuotation.tax_rate}%):</span>
                      <span className="font-bold text-slate-900">฿{(selectedViewQuotation.total_value * (selectedViewQuotation.tax_rate / 100)).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 text-xs">
                      <span className="font-bold text-slate-900">ยอดเงินรวมสุทธิ / Grand Total:</span>
                      <span className="font-extrabold text-indigo-600 text-[13px]">฿{selectedViewQuotation.grand_total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-4 pt-10 text-[9px] text-center text-slate-500">
                  <div className="space-y-6">
                    <div>............................................................</div>
                    <div>
                      <strong>ผู้เสนอราคา (Quoter)</strong><br />
                      วันที่ {selectedViewQuotation.quotation_date}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>............................................................</div>
                    <div>
                      <strong>ผู้อนุมัติฝ่ายวิศวกรรม (Engineering Approved)</strong><br />
                      วันที่ {selectedViewQuotation.quotation_date}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>............................................................</div>
                    <div>
                      <strong>ผู้รับข้อเสนอ (Client Signature)</strong><br />
                      วันที่ ........ / ........ / ........
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-850 border-t border-slate-800 flex justify-end shrink-0">
              <button 
                onClick={() => setSelectedViewQuotation(null)} 
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer text-xs"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
