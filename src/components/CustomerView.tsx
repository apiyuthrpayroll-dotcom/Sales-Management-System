import React, { useState, useMemo, useEffect } from 'react';
import { Customer, ContactPerson, Opportunity, Activity, OpportunityAttachment, AuditLog, UserRole } from '../types';
import { CRMService } from '../supabaseService';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Briefcase, 
  CreditCard, 
  Globe, 
  FileText,
  UserPlus,
  User,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
  FileCheck2,
  Calendar,
  History,
  Paperclip,
  CheckSquare,
  Lock
} from 'lucide-react';

interface CustomerViewProps {
  customers: Customer[];
  opportunities: Opportunity[];
  onAdd: (customer: Omit<Customer, 'id' | 'customer_code'>) => Promise<any>;
  onUpdate: (id: string, updates: Partial<Customer>) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
  onToast: (msg: string, type: 'success' | 'err') => void;
  currentRole?: UserRole;
  currentUserId?: string;
}

const INDUSTRY_TYPES = [
  'Energy & Utilities',
  'Manufacturing',
  'Retail',
  'Telecommunication',
  'Food & Beverage',
  'Construction',
  'Healthcare',
  'Financial Services',
  'Education',
  'Other'
];

const PAYMENT_TERMS = [
  'Cash',
  '7 Days',
  '15 Days',
  '30 Days',
  '45 Days',
  '60 Days',
  '90 Days',
];

export default function CustomerView({ 
  customers, 
  opportunities, 
  onAdd, 
  onUpdate, 
  onDelete, 
  onToast,
  currentRole = 'System Administrator',
  currentUserId = '3'
}: CustomerViewProps) {
  const canModifyCustomer = currentRole !== 'Management';
  const canDeleteCustomer = currentRole === 'Admin' || currentRole === 'System Administrator';

  // Lists and Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modal control
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Detail Modal control
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [detailTab, setDetailTab] = useState<'info' | 'contacts' | 'opportunities' | 'activities' | 'attachments' | 'audit'>('info');

  // Related data loaded dynamically on drawer open
  const [customerActivities, setCustomerActivities] = useState<Activity[]>([]);
  const [customerAttachments, setCustomerAttachments] = useState<OpportunityAttachment[]>([]);
  const [customerAuditLogs, setCustomerAuditLogs] = useState<AuditLog[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Activity Creator State in Customer Drawer
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [newActType, setNewActType] = useState<'Phone Call' | 'Meeting' | 'Email' | 'Site Visit' | 'Other'>('Phone Call');
  const [newActSubject, setNewActSubject] = useState('');
  const [newActDesc, setNewActDesc] = useState('');

  // Contact person sub-state
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [editingContactIndex, setEditingContactIndex] = useState<number | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactPosition, setContactPosition] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Main Form fields
  const [formName, setFormName] = useState('');
  const [formTaxId, setFormTaxId] = useState('');
  const [formIndustry, setFormIndustry] = useState('Manufacturing');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPaymentTerm, setFormPaymentTerm] = useState('30 Days');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  
  // Validation Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load related customer data when viewing customer or raw opportunities change
  useEffect(() => {
    if (viewingCustomer) {
      const loadRelatedData = async () => {
        setLoadingDetails(true);
        try {
          const customerOpps = opportunities.filter(o => o.customer_id === viewingCustomer.id);
          const oppIds = customerOpps.map(o => o.id);

          // Get raw collections
          const [allActs, allAtts, allLogs] = await Promise.all([
            CRMService.fetchActivities(),
            CRMService.fetchAttachments(),
            CRMService.fetchAuditLogs()
          ]);

          // Filter by aggregated customer context
          const filteredActs = allActs.filter(a => oppIds.includes(a.opportunity_id));
          const filteredAtts = allAtts.filter(at => oppIds.includes(at.opportunity_id));
          const filteredLogs = allLogs.filter(log => 
            log.target_id === viewingCustomer.id || 
            oppIds.includes(log.target_id || '')
          );

          setCustomerActivities(filteredActs);
          setCustomerAttachments(filteredAtts);
          setCustomerAuditLogs(filteredLogs);
        } catch (err) {
          console.error('Error loading customer related records:', err);
        } finally {
          setLoadingDetails(false);
        }
      };
      loadRelatedData();
    }
  }, [viewingCustomer, opportunities]);

  // 1. Search and Filtering logic
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = 
        c.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customer_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tax_id.includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm);

      const matchesIndustry = selectedIndustry === 'All' || c.industry_type === selectedIndustry;
      const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;

      return matchesSearch && matchesIndustry && matchesStatus;
    });
  }, [customers, searchTerm, selectedIndustry, selectedStatus]);

  // Compute live KPI metrics for a chosen customer company
  const customerStats = useMemo(() => {
    if (!viewingCustomer) return { count: 0, wonCount: 0, totalValue: 0, wonValue: 0, weightedValue: 0, winRate: 0 };
    const custOpps = opportunities.filter(o => o.customer_id === viewingCustomer.id);
    const count = custOpps.length;
    const wonList = custOpps.filter(o => o.status === 'Won');
    const wonCount = wonList.length;
    const totalValue = custOpps.reduce((sum, o) => sum + o.estimated_value, 0);
    const wonValue = wonList.reduce((sum, o) => sum + o.estimated_value, 0);
    const weightedValue = custOpps.reduce((sum, o) => sum + (o.weighted_value ?? (o.estimated_value * (o.success_probability / 100))), 0);
    const winRate = count > 0 ? Math.round((wonCount / count) * 100) : 0;
    return { count, wonCount, totalValue, wonValue, weightedValue, winRate };
  }, [viewingCustomer, opportunities]);

  // Open Form to ADD new
  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormTaxId('');
    setFormIndustry('Manufacturing');
    setFormAddress('');
    setFormPhone('');
    setFormEmail('');
    setFormPaymentTerm('30 Days');
    setFormStatus('Active');
    setErrors({});
    setIsFormOpen(true);
  };

  // Open Form to EDIT existing
  const handleOpenEdit = (customer: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCustomer(customer);
    setFormName(customer.customer_name);
    setFormTaxId(customer.tax_id);
    setFormIndustry(customer.industry_type);
    setFormAddress(customer.address);
    setFormPhone(customer.phone);
    setFormEmail(customer.email);
    setFormPaymentTerm(customer.payment_term);
    setFormStatus(customer.status);
    setErrors({});
    setIsFormOpen(true);
  };

  // Validate form
  const validateForm = () => {
    const errs: { [key: string]: string } = {};
    if (!formName.trim()) errs.name = 'กรุณากรอกชื่อลูกค้า';
    if (!formTaxId.trim()) {
      errs.taxId = 'กรุณากรอกเลขผู้เสียภาษี';
    } else if (!/^\d{13}$/.test(formTaxId.trim())) {
      errs.taxId = 'เลขผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก';
    }
    if (!formPhone.trim()) errs.phone = 'กรุณากรอกเบอร์โทรศัพท์';
    if (!formEmail.trim()) {
      errs.email = 'กรุณากรอกอีเมล';
    } else if (!/\S+@\S+\.\S+/.test(formEmail)) {
      errs.email = 'รูปแบบอีเมลไม่สอดคล้อง';
    }
    if (!formAddress.trim()) errs.address = 'กรุณากรอกที่อยู่คลัง/สำนักงาน';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle saving customer
  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canModifyCustomer) {
      onToast('คุณไม่มีสิทธิ์สร้างหรือแก้ไขข้อมูลบริษัทลูกค้า (ติดต่อแอดมินระบบหรือเปลี่ยนบทบาทเป็น Sales หรือ Manager)', 'err');
      return;
    }
    if (!validateForm()) return;

    const payload = {
      customer_name: formName,
      tax_id: formTaxId,
      industry_type: formIndustry,
      address: formAddress,
      phone: formPhone,
      email: formEmail,
      payment_term: formPaymentTerm,
      status: formStatus,
      contacts: editingCustomer ? editingCustomer.contacts : [] // Carry over if editing
    };

    try {
      if (editingCustomer) {
        await onUpdate(editingCustomer.id, payload);
        onToast('อัปเดตข้อมูลลูกค้าสำเร็จ', 'success');
        // Refresh detail view if currently open
        if (viewingCustomer && viewingCustomer.id === editingCustomer.id) {
          setViewingCustomer({ ...viewingCustomer, ...payload });
        }
      } else {
        await onAdd(payload);
        onToast('สร้างบัญชีลูกค้าใหม่สำเร็จ', 'success');
      }
      setIsFormOpen(false);
    } catch {
      onToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'err');
    }
  };

  // Handle deleting customer
  const handleDeleteCustomer = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canDeleteCustomer) {
      onToast('ปฏิเสธการดำเนินการ: คุณจำเป็นต้องได้รับบทบาทผู้ดูแลระบบ (Admin) เพื่อลบรายชื่อบริษัทลูกค้าองค์กรได้', 'err');
      return;
    }
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลลูกค้ารายนี้? สัญญา/ดีลทั้งหมดของลูกค้ารายนี้จะถูกลบไปด้วย')) {
      try {
        await onDelete(id);
        onToast('ลบข้อมูลลูกค้าเรียบร้อยแล้ว', 'success');
        if (viewingCustomer && viewingCustomer.id === id) {
          setViewingCustomer(null);
        }
      } catch {
        onToast('ไม่สามารถลบข้อมูลลูกค้าได้', 'err');
      }
    }
  };

  // --- CONTACT PERSON LOGIC ---
  const handleOpenContactForm = (idx: number | null = null) => {
    if (idx !== null && viewingCustomer) {
      const contact = viewingCustomer.contacts[idx];
      setEditingContactIndex(idx);
      setContactName(contact.contact_name);
      setContactPosition(contact.position);
      setContactPhone(contact.phone);
      setContactEmail(contact.email);
    } else {
      setEditingContactIndex(null);
      setContactName('');
      setContactPosition('');
      setContactPhone('');
      setContactEmail('');
    }
    setIsContactFormOpen(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingCustomer) return;
    if (!contactName.trim() || !contactPhone.trim()) {
      alert('กรุณากรอกชื่อและเบอร์โทรติดต่อ');
      return;
    }

    const newContact: ContactPerson = {
      contact_name: contactName,
      position: contactPosition,
      phone: contactPhone,
      email: contactEmail
    };

    let updatedContacts = [...viewingCustomer.contacts];
    if (editingContactIndex !== null) {
      updatedContacts[editingContactIndex] = newContact;
    } else {
      updatedContacts.push(newContact);
    }

    try {
      await onUpdate(viewingCustomer.id, { contacts: updatedContacts });
      setViewingCustomer({ ...viewingCustomer, contacts: updatedContacts });
      setIsContactFormOpen(false);
      onToast('บันทึกข้อมูลผู้ติดต่อสำเร็จ', 'success');
    } catch {
      onToast('เกิดข้อผิดพลาดในการบันทึกผู้ติดต่อ', 'err');
    }
  };

  const handleDeleteContact = async (idx: number) => {
    if (!viewingCustomer) return;
    if (confirm('ยืนยันลบผู้ติดต่อนี้?')) {
      const updatedContacts = viewingCustomer.contacts.filter((_, i) => i !== idx);
      try {
        await onUpdate(viewingCustomer.id, { contacts: updatedContacts });
        setViewingCustomer({ ...viewingCustomer, contacts: updatedContacts });
        onToast('ลบผู้ติดต่อเรียบร้อย', 'success');
      } catch {
        onToast('ลบไม่สำเร็จ', 'err');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">จัดการข้อมูลลูกค้า (Customers)</h2>
          <p className="text-slate-400 text-xs mt-0.5">ค้นหา กรอง และแก้ไขรายชื่อบริษัทคู่ค้าทั้งหมดของระบบ</p>
        </div>
        <button
          id="btn-add-customer"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-1.5 focus:outline-none"
        >
          <Plus className="w-4 h-4" />
          เพิ่มลูกค้าใหม่
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="w-full md:flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
          <input
            id="search-customer"
            type="text"
            placeholder="ค้นหาชื่อลูกค้า, รหัส, เบอร์โทร, เลขผู้เสียภาษี..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 transition-all font-sans"
          />
        </div>

        {/* Industry Filter */}
        <div className="w-full md:w-56 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            id="filter-industry"
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="w-full text-sm border border-slate-200 bg-slate-50 p-2 rounded-lg focus:outline-none text-slate-700 font-sans"
          >
            <option value="All">ทุกอุตสาหกรรม</option>
            {INDUSTRY_TYPES.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <select
            id="filter-customer-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full text-sm border border-slate-200 bg-slate-50 p-2 rounded-lg focus:outline-none text-slate-700 font-sans"
          >
            <option value="All">สถานะสัญญาทั้งหมด</option>
            <option value="Active">Active (เปิดใช้งาน)</option>
            <option value="Inactive">Inactive (ปิดใช้งาน)</option>
          </select>
        </div>
      </div>

      {/* Customer Grid & Table (Google Sheets Style) */}
      <div className="bg-[#f8f9fa] border border-slate-300 rounded-lg shadow-sm overflow-hidden font-sans">
        {/* Google Sheets Sheets Tab styling & Formula Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-300 bg-[#f8f9fa] divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          <div className="flex items-center px-4 py-2 flex-grow min-w-0">
            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px] mr-2">fx</span>
            <div className="font-mono text-[11px] text-slate-600 bg-white border border-slate-200 py-1 px-2.5 rounded-sm flex-1 truncate select-all" title="Google Sheets Formula Simulator">
              =FILTER(CUSTOMER_DATABASE, SEARCH(&quot;{searchTerm || '*'}&quot;, CustomerName) * IndustryType=&quot;{selectedIndustry}&quot; * Status=&quot;{selectedStatus}&quot;)
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white sm:bg-transparent text-xs text-slate-500">
            <span className="font-medium bg-[#E8EAED] px-2 py-1 rounded border border-slate-200 text-slate-700 select-none">Sheet1</span>
            <span className="text-slate-400">|</span>
            <span className="font-mono font-semibold text-emerald-600">{filteredCustomers.length} แถว (Rows)</span>
          </div>
        </div>

        <div className="overflow-x-auto bg-white border-t border-slate-300">
          <table className="w-full text-left border-collapse table-fixed min-w-[950px]">
            <thead>
              {/* Header Columns inside the spreadsheet */}
              <tr className="bg-[#f3f3f3] border-b border-slate-300 text-xs font-bold text-slate-700">
                <th className="px-2 py-2 w-12 text-center border-r border-slate-300 shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)]">#</th>
                <th className="px-3 py-2 w-32 border-r border-slate-300 shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)]">รหัสลูกค้า</th>
                <th className="px-3 py-2 w-64 border-r border-slate-300 shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)]">ชื่อบริษัท / นิติบุคคล</th>
                <th className="px-3 py-2 w-40 border-r border-slate-300 shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)]">กลุ่มธุรกิจ</th>
                <th className="px-3 py-2 w-40 border-r border-slate-300 shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)]">เบอร์ติดต่อ</th>
                <th className="px-3 py-2 w-48 border-r border-slate-300 shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)]">อีเมลหลัก</th>
                <th className="px-3 py-2 w-28 border-r border-slate-300 text-center shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)]">สถานะ</th>
                <th className="px-3 py-2 w-40 text-center border-r border-slate-300 shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)]">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-800">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer, idx) => (
                  <tr 
                    key={customer.id} 
                    className={`hover:bg-blue-50/50 border-b border-slate-300 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fa]'}`}
                  >
                    <td className="px-2 py-2 text-center text-slate-500 font-mono text-xs border-r border-slate-300 bg-[#f3f3f3] select-none">{idx + 1}</td>
                    <td className="px-3 py-2 border-r border-slate-300 font-mono text-slate-600 text-xs truncate">{customer.customer_code}</td>
                    <td className="px-3 py-2 border-r border-slate-300 font-medium truncate">
                      <div className="truncate text-sm" title={customer.customer_name}>{customer.customer_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 font-normal">Tax ID: {customer.tax_id}</div>
                    </td>
                    <td className="px-3 py-2 border-r border-slate-300 truncate text-xs text-slate-600">{customer.industry_type}</td>
                    <td className="px-3 py-2 border-r border-slate-300 font-mono text-xs text-slate-600">{customer.phone}</td>
                    <td className="px-3 py-2 border-r border-slate-300 truncate font-mono text-xs text-blue-600 underline decoration-blue-200 underline-offset-2 cursor-pointer hover:text-blue-800">{customer.email}</td>
                    <td className="px-3 py-2 border-r border-slate-300 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${customer.status === 'Active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 border-r border-slate-300 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          title="ดูรายละเอียด"
                          onClick={() => { setViewingCustomer(customer); setDetailTab('info'); }}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:text-blue-600 rounded shadow-sm transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-500" />
                          ดูข้อมูล
                        </button>
                        <button
                          title="แก้ไขข้อมูล"
                          onClick={(e) => handleOpenEdit(customer, e)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:text-amber-600 rounded shadow-sm transition-colors flex items-center gap-1.5"
                        >
                          <Edit className="w-3.5 h-3.5 text-amber-500" />
                          แก้ไข
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 border-b border-slate-300 bg-white">ไม่พบข้อมูลลูกค้าในระบบ</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- FORM ADD/EDIT CUSTOMER MODAL --- */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 sm:p-6 z-50 backdrop-blur-xs transition-opacity animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-scale-up flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-blue-700 bg-blue-600 text-white shrink-0">
              <h3 className="text-lg font-bold">
                {editingCustomer ? `แก้ไขข้อมูลลูกค้า: ${editingCustomer.customer_code}` : 'เพิ่มทะเบียนลูกค้ารายใหม่'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto bg-slate-50/30">
              <form id="customer-form" onSubmit={handleSaveCustomer} className="p-6 sm:p-8 space-y-8">
                
                {/* Section Header */}
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                  <div className="bg-blue-600 text-white text-sm font-bold px-4 py-1.5 rounded-md shadow-sm">
                    1. รายละเอียดข้อมูลนิติบุคคล / ลูกค้าหลัก
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                  {/* Name */}
                  <div className="md:col-span-2 lg:col-span-3 space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 block">ชื่อบริษัท / นิติบุคคลลูกค้า <span className="text-red-500">*</span></label>
                    <input
                      id="form-customer-name"
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="ระบุชื่อบริษัทเต็ม (เช่น บริษัท ปตท. จำกัด (มหาชน))"
                      className={`w-full p-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-colors ${errors.name ? 'border-red-400 bg-red-50/50' : 'border-slate-300 bg-white'}`}
                    />
                    {errors.name && <span className="text-[11px] text-red-500 block">{errors.name}</span>}
                  </div>

                  {/* Tax ID */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 block">เลขประจำตัวผู้เสียภาษี (Tax ID) <span className="text-red-500">*</span></label>
                    <input
                      id="form-customer-taxid"
                      type="text"
                      maxLength={13}
                      value={formTaxId}
                      onChange={(e) => setFormTaxId(e.target.value.replace(/\D/g, ''))}
                      placeholder="ตัวเลข 13 หลัก"
                      className={`w-full p-2.5 text-sm border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-colors ${errors.taxId ? 'border-red-400 bg-red-50/50' : 'border-slate-300 bg-white'}`}
                    />
                    {errors.taxId && <span className="text-[11px] text-red-500 block">{errors.taxId}</span>}
                  </div>

                  {/* Industry */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 block">กลุ่มอุตสาหกรรมธุรกิจ <span className="text-red-500">*</span></label>
                    <select
                      id="form-customer-industry"
                      value={formIndustry}
                      onChange={(e) => setFormIndustry(e.target.value)}
                      className="w-full p-2.5 text-sm border border-slate-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                    >
                      {INDUSTRY_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Payment terms */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 block">เครดิตเทอมชำระเงิน (วัน) <span className="text-red-500">*</span></label>
                    <select
                      id="form-customer-paymentterm"
                      value={formPaymentTerm}
                      onChange={(e) => setFormPaymentTerm(e.target.value)}
                      className="w-full p-2.5 text-sm border border-slate-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                    >
                      {PAYMENT_TERMS.map(term => (
                        <option key={term} value={term}>{term}</option>
                      ))}
                    </select>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 block font-sans">เบอร์โทรศัพท์สำนักงาน <span className="text-red-500">*</span></label>
                    <input
                      id="form-customer-phone"
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="เช่น 02-123-4567"
                      className={`w-full p-2.5 text-sm border font-mono rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-colors ${errors.phone ? 'border-red-400 bg-red-50/50' : 'border-slate-300 bg-white'}`}
                    />
                    {errors.phone && <span className="text-[11px] text-red-500 block">{errors.phone}</span>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5 lg:col-span-2">
                    <label className="text-sm font-bold text-slate-700 block font-sans">อีเมลจัดซื้อกลางสำนักงาน <span className="text-red-500">*</span></label>
                    <input
                      id="form-customer-email"
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="เช่น procurement@company.com"
                      className={`w-full p-2.5 text-sm border font-mono rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-colors ${errors.email ? 'border-red-400 bg-red-50/50' : 'border-slate-300 bg-white'}`}
                    />
                    {errors.email && <span className="text-[11px] text-red-500 block">{errors.email}</span>}
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2 lg:col-span-3 space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 block">ที่อยู่ตามใบรับรองภาษีอากรภพ.20 <span className="text-red-500">*</span></label>
                    <textarea
                      id="form-customer-address"
                      rows={3}
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      placeholder="ระบุเลขที่อาคาร ชั้น ถนน แขวง เขต จังหวัด และรหัสไปรษณีย์อย่างชัดเจน"
                      className={`w-full p-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-colors resize-y ${errors.address ? 'border-red-400 bg-red-50/50' : 'border-slate-300 bg-white'}`}
                    />
                    {errors.address && <span className="text-[11px] text-red-500 block">{errors.address}</span>}
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2 lg:col-span-3 space-y-1.5 mt-2">
                    <label className="text-sm font-bold text-slate-700 block">สถานะปัจจุบันของลูกค้าองค์กร</label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="customer-status"
                          value="Active"
                          checked={formStatus === 'Active'}
                          onChange={(e) => setFormStatus(e.target.value as any)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-slate-700">Active (ดำเนินธุรกิจปกติ)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="customer-status"
                          value="Inactive"
                          checked={formStatus === 'Inactive'}
                          onChange={(e) => setFormStatus(e.target.value as any)}
                          className="w-4 h-4 text-slate-400 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-slate-700">Inactive (ระงับการติดต่อ)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Pinned Action Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-all focus:outline-none shadow-sm"
              >
                ยกเลิก
              </button>
              <button
                form="customer-form"
                id="btn-submit-customer"
                type="submit"
                className="px-8 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 border border-blue-700 rounded-lg transition-all shadow-md hover:shadow-lg focus:outline-none flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                บันทึกข้อมูลลูกค้า
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DETAILED CUSTOMER VIEW & CONTACT PERSON TAB PANEL --- */}
      {viewingCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 flex justify-end z-50 backdrop-blur-xs transition-all animate-fade-in">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden animate-slide-left">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full uppercase">
                  {viewingCustomer.customer_code}
                </span>
                <h3 className="text-base font-bold text-slate-800 mt-1 truncate max-w-[400px]">
                  {viewingCustomer.customer_name}
                </h3>
                <div className="text-xs text-slate-500 font-mono mt-1">
                  Customer ID: <span className="font-semibold text-slate-700">{viewingCustomer.id.slice(0, 8)}</span>
                </div>
              </div>
              <button 
                onClick={() => setViewingCustomer(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-full focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dynamic tabs */}
            <div className="flex border-b border-slate-100 text-[11px] sm:text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap bg-slate-50/50">
              <button 
                id="tab-customer-info"
                onClick={() => setDetailTab('info')}
                className={`px-4 py-3 text-center transition-colors border-b-2 focus:outline-none shrink-0 ${detailTab === 'info' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent hover:text-slate-800'}`}
              >
                ข้อมูลบริษัท
              </button>
              <button 
                id="tab-customer-contacts"
                onClick={() => setDetailTab('contacts')}
                className={`px-4 py-3 text-center transition-colors border-b-2 focus:outline-none shrink-0 ${detailTab === 'contacts' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent hover:text-slate-800'}`}
              >
                ผู้ติดต่อ ({viewingCustomer.contacts.length})
              </button>
              <button 
                id="tab-customer-opportunities"
                onClick={() => setDetailTab('opportunities')}
                className={`px-4 py-3 text-center transition-colors border-b-2 focus:outline-none shrink-0 ${detailTab === 'opportunities' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent hover:text-slate-800'}`}
              >
                ดีลงาน ({opportunities.filter(o => o.customer_id === viewingCustomer.id).length})
              </button>
              <button 
                id="tab-customer-activities"
                onClick={() => setDetailTab('activities')}
                className={`px-4 py-3 text-center transition-colors border-b-2 focus:outline-none shrink-0 ${detailTab === 'activities' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent hover:text-slate-800'}`}
              >
                ไทม์ไลน์ ({customerActivities.length})
              </button>
              <button 
                id="tab-customer-attachments"
                onClick={() => setDetailTab('attachments')}
                className={`px-4 py-3 text-center transition-colors border-b-2 focus:outline-none shrink-0 ${detailTab === 'attachments' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent hover:text-slate-800'}`}
              >
                ไฟล์แนบ ({customerAttachments.length})
              </button>
              <button 
                id="tab-customer-audit"
                onClick={() => setDetailTab('audit')}
                className={`px-4 py-3 text-center transition-colors border-b-2 focus:outline-none shrink-0 ${detailTab === 'audit' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent hover:text-slate-800'}`}
              >
                แทร็คออดิท ({customerAuditLogs.length})
              </button>
            </div>

            {/* Drawer Body - Tab content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {loadingDetails && (
                <div className="flex items-center justify-center gap-2.5 py-8 text-neutral-500 text-xs">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>กำลังเรียกสรุปกิจกรรมและประวัติลูกค้า...</span>
                </div>
              )}

              {/* TAB 1: INFO */}
              {detailTab === 'info' && (
                <div className="space-y-4 text-sm">
                  {/* Performance KPI Cards */}
                  <div className="grid grid-cols-2 gap-3 pb-2 select-none">
                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl relative overflow-hidden">
                      <span className="text-[10px] font-bold text-slate-400 block tracking-tight">จำนวนดีลทั้งหมด (Total)</span>
                      <span className="font-mono text-lg font-black text-blue-700 block mt-1">{customerStats.count} โครงการ</span>
                      <Target className="w-8 h-8 opacity-10 absolute right-2 bottom-1 text-blue-600" />
                    </div>
                    
                    <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl relative overflow-hidden">
                      <span className="text-[10px] font-bold text-slate-400 block tracking-tight">คัดกรองWonสถิติยอดสำเร็จ (Won Rate)</span>
                      <span className="font-mono text-lg font-black text-emerald-700 block mt-1">{customerStats.winRate}% ({customerStats.wonCount})</span>
                      <TrendingUp className="w-8 h-8 opacity-10 absolute right-2 bottom-1 text-emerald-600" />
                    </div>

                    <div className="p-3 bg-violet-50/50 border border-violet-100 rounded-xl relative overflow-hidden col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 block">มูลค่างบประมาณรวมสะสม (Total Pipeline Accumulate)</span>
                      <span className="font-mono text-base font-black text-violet-700 block mt-1">
                        {new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(customerStats.weightedValue)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-slate-700">
                      <div>
                        <span className="text-xs text-slate-400 block">กลุ่มอุตสาหกรรม</span>
                        <span className="font-semibold">{viewingCustomer.industry_type}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block font-sans">เลขผู้เสียภาษี (Tax ID)</span>
                        <span className="font-semibold font-mono">{viewingCustomer.tax_id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 px-1 text-slate-600">
                    <div className="flex gap-3">
                      <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs text-slate-400 block">ที่อยู่สัญญาสถานประกอบการ</span>
                        <span className="text-slate-800">{viewingCustomer.address}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Phone className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs text-slate-400 block">เบอร์โทรศัพท์ติดต่อกลาง</span>
                        <span className="font-mono text-slate-800">{viewingCustomer.phone}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Mail className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs text-slate-400 block">อีเมลหลัก</span>
                        <span className="font-mono text-slate-800">{viewingCustomer.email}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <CreditCard className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs text-slate-400 block">Credit Term</span>
                        <span className="text-slate-800 font-semibold">{viewingCustomer.payment_term}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CONTACTS */}
              {detailTab === 'contacts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">รายชื่อบุคคลติดต่อตัวแทนของทางบริษัท</span>
                    <button
                      id="btn-add-contact"
                      onClick={() => handleOpenContactForm()}
                      className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition-colors focus:outline-none"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      เพิ่มผู้ติดต่อ
                    </button>
                  </div>

                  {viewingCustomer.contacts && viewingCustomer.contacts.length > 0 ? (
                    <div className="space-y-3">
                      {viewingCustomer.contacts.map((contact, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all text-sm relative group">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                <User className="w-4 h-4 text-slate-400 shrink-0" />
                                {contact.contact_name}
                              </div>
                              <div className="text-xs text-slate-500 font-sans mt-0.5 pl-5.5">
                                ตำแหน่ง: <span className="font-medium text-slate-700">{contact.position || '-'}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleOpenContactForm(idx)}
                                className="p-1 text-slate-500 hover:text-amber-600 hover:bg-white rounded border border-slate-100 cursor-pointer"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteContact(idx)}
                                className="p-1 text-slate-500 hover:text-red-600 hover:bg-white rounded border border-slate-100 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 font-mono border-t border-slate-200/50 pt-2.5 pl-5.5">
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              {contact.phone}
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              {contact.email || '-'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                      <p className="text-xs text-slate-400">ยังไม่มีข้อมูลบุคคลสำหรับผู้ติดต่อนอกบริษัท</p>
                      <button
                        onClick={() => handleOpenContactForm()}
                        className="mt-3 text-xs font-semibold text-blue-600 hover:underline inline-block focus:outline-none"
                      >
                        ต้องการกรอกข้อมูลคนแรกในทันที?
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: OPPORTUNITIES */}
              {detailTab === 'opportunities' && (
                <div className="space-y-4">
                  <span className="text-xs text-slate-400 block mb-1">สถิติและรายการดีลทั้งหมดของลูกค้ารายนี้</span>
                  {opportunities.filter(o => o.customer_id === viewingCustomer.id).length > 0 ? (
                    opportunities.filter(o => o.customer_id === viewingCustomer.id).map(opp => (
                      <div key={opp.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl hover:bg-slate-100/50 hover:border-slate-300 transition duration-150 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-extrabold uppercase">{opp.opportunity_no}</span>
                            <h4 className="text-sm font-bold text-slate-800 mt-1">{opp.project_name}</h4>
                            <span className="text-xs text-slate-500 block mt-0.5">{opp.service_type}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            opp.status === 'Won' ? 'bg-green-50 text-green-700 border-green-200' :
                            opp.status === 'Lost' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}>
                            {opp.status}
                          </span>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex justify-between text-slate-500 font-mono">
                          <div>งบประมาณ: <span className="font-bold text-slate-800">{new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(opp.estimated_value)}</span></div>
                          <div>โอกาสสำเร็จ: <span className="font-bold text-slate-800">{opp.success_probability}%</span></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                      <p className="text-xs text-slate-400">ยังไม่มีประวัติการได้รับดีลหรือสร้างแผนลีดให้ลูกค้ารายนี้</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ACTIVITIES */}
              {detailTab === 'activities' && (
                <div className="space-y-4">
                  {/* Quick form toggle */}
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-400">ประวัติบันทึกการติดตามและสื่อสาร (Activities History)</span>
                    <button 
                      onClick={() => setShowActivityForm(!showActivityForm)}
                      className="text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded font-bold transition focus:outline-none"
                    >
                      {showActivityForm ? 'ปิดหน้าฟอร์ม' : 'บันทึกประวัติใหม่'}
                    </button>
                  </div>

                  {showActivityForm && (
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const custOpps = opportunities.filter(o => o.customer_id === viewingCustomer.id);
                      if (custOpps.length === 0) {
                        alert('กรุณาสร้างโอกาสทางการขาย (Opportunity) ของลูกค้ารายนี้อย่างน้อย 1 รายการก่อนระบุบันทึกติดตามสิทธิ์');
                        return;
                      }
                      if (!newActSubject.trim() || !newActDesc.trim()) {
                        alert('กรุณากรอกหัวข้อและคำชี้แจงในการติดตามงาน');
                        return;
                      }
                      try {
                        const res = await CRMService.insertActivity({
                          opportunity_id: custOpps[0].id, // bind to first available opportunity
                          activity_type: newActType,
                          activity_date: new Date().toISOString().split('T')[0],
                          subject: newActSubject,
                          description: newActDesc,
                          owner: 'Sales AM'
                        });
                        setCustomerActivities([res, ...customerActivities]);
                        setNewActSubject('');
                        setNewActDesc('');
                        setShowActivityForm(false);
                        onToast('บันทึกความคืบหน้าติดตามสำเร็จ', 'success');
                        
                        await CRMService.insertAuditLog({
                          action_by: currentUserId || '00000000-0000-0000-0000-000000000000',
                          role: currentRole || 'Sales',
                          action: 'เพิ่มบันทึกกิจกรรมลูกค้า',
                          target_type: 'customer',
                          target_id: viewingCustomer.id,
                          details: `บันทึกกิจกรรม: ${newActType} - ${newActSubject}`
                        }, currentUserId || '00000000-0000-0000-0000-000000000000');
                      } catch {
                        onToast('ไม่สามารถบันทึกกิจกรรมได้', 'err');
                      }
                    }} className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs space-y-3">
                      <h5 className="font-bold text-slate-800">กรอกประวัติบันทึกกิจกรรมล่าสุด</h5>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-400 block mb-0.5">ประเภทกิจกรรม</label>
                          <select 
                            value={newActType} 
                            onChange={(e: any) => setNewActType(e.target.value)}
                            className="w-full bg-white border border-slate-200 p-1.5 rounded focus:outline-none"
                          >
                            <option value="Phone Call">Phone Call (โทรศัพท์)</option>
                            <option value="Meeting">Meeting (ประชุม)</option>
                            <option value="Email">Email (อีเมล)</option>
                            <option value="Site Visit">Site Visit (เข้าพบ)</option>
                            <option value="Other">Other (อื่นๆ)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-0.5">หัวข้อประสานดีล</label>
                          <input 
                            type="text" 
                            value={newActSubject} 
                            placeholder="ส่งเอกสาร / โทรเสนอโปรเจกต์"
                            onChange={(e) => setNewActSubject(e.target.value)}
                            className="w-full bg-white border border-slate-200 p-1.5 rounded focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-0.5 font-sans">รายละเอียดการคุยประสานสิทธิ์</label>
                        <textarea 
                          rows={2} 
                          value={newActDesc} 
                          placeholder="ระบุข้อความประกอบบทสนทนา..."
                          onChange={(e) => setNewActDesc(e.target.value)}
                          className="w-full bg-white border border-slate-200 p-1.5 rounded focus:outline-none resize-none"
                        />
                      </div>
                      <div className="flex justify-end gap-1.5">
                        <button type="button" onClick={() => setShowActivityForm(false)} className="px-2 py-1 bg-slate-250 text-slate-700 rounded">ยกเลิก</button>
                        <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded font-bold">บันทึกประวัติ</button>
                      </div>
                    </form>
                  )}

                  {customerActivities.length > 0 ? (
                    <div className="relative border-l border-slate-200 pl-4 space-y-4 ml-2 mt-2">
                      {customerActivities.map(act => (
                        <div key={act.id} className="relative text-xs">
                          <span className="absolute -left-6 top-1.5 bg-blue-600 w-2.5 h-2.5 rounded-full border-2 border-white"></span>
                          <span className="text-[10px] text-slate-400 font-mono block">{act.activity_date} | {act.owner}</span>
                          <span className="font-bold text-slate-800 text-sm block mt-0.5">{act.subject} ({act.activity_type})</span>
                          <p className="text-slate-600 mt-1 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">{act.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                      <p className="text-xs text-slate-400">ยังไม่มีประวัติสัมพันธภาพหรือการพบปะพูดคุยที่อัปเดตลงโปรเจกต์ของลูกค้าแห่งนี้</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: ATTACHMENTS */}
              {detailTab === 'attachments' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-400">คลังสัญญากลางและอกสารสำคัญผู้เสียภาษี (Customer Files)</span>
                    <button 
                      onClick={async () => {
                        const custOpps = opportunities.filter(o => o.customer_id === viewingCustomer.id);
                        if (custOpps.length === 0) {
                          alert('กรุณาสร้างโอการทางการขาย (Opportunity) ของลูกค้ารายนี้อย่างน้อย 1 รายการก่อนระบุกิจกรรมแนบเอกสาร');
                          return;
                        }
                        const mockFiles = [
                          'Company_VAT_Certificate.pdf',
                          'Tender_Commercial_Contract_v2.docx',
                          'BoQ_Engineering_Estimation.xlsx',
                          'Power_of_Attorney_Form14.pdf'
                        ];
                        const fName = prompt('จำลองการเลือกอัปโหลดเอกสาร - พิมพ์ชื่อเอกสารที่คุณต้องการ:', mockFiles[Math.floor(Math.random() * mockFiles.length)]);
                        if (fName) {
                          try {
                            const res = await CRMService.insertAttachment({
                              opportunity_id: custOpps[0].id,
                              file_name: fName,
                              file_size: Math.round(Math.random() * 2000) + 120,
                              file_type: fName.split('.').pop() || 'pdf',
                              uploaded_by: 'Sales Representative',
                              file_url: '#'
                            });
                            setCustomerAttachments([res, ...customerAttachments]);
                            onToast('จำลองการเก็บเอกสารสัญญาสมบูรณ์', 'success');
                            
                            await CRMService.insertAuditLog({
                              action_by: currentUserId || '00000000-0000-0000-0000-000000000000',
                              role: currentRole || 'Sales',
                              action: 'อัปโหลดสัญญากลางลูกค้า',
                              target_type: 'customer',
                              target_id: viewingCustomer.id,
                              details: `อัปโหลดไฟล์แนบ: ${fName} (ขนาด: ${res.file_size} KB)`
                            }, currentUserId || '00000000-0000-0000-0000-000000000000');
                          } catch {
                            onToast('ไม่สามารถจัดเก็บข้อมูลไฟล์แนบได้', 'err');
                          }
                        }
                      }}
                      className="text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded font-bold transition focus:outline-none flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                       แนบเอกสารใหม่
                    </button>
                  </div>

                  {customerAttachments.length > 0 ? (
                    <div className="space-y-2">
                      {customerAttachments.map(at => (
                        <div key={at.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-150 text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                            <div className="truncate">
                              <span className="font-bold text-slate-700 block truncate" title={at.file_name}>{at.file_name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">ขนาด: {at.file_size} KB | โดย: {at.uploaded_by}</span>
                            </div>
                          </div>
                          <button 
                            onClick={async () => {
                              if (confirm('ยืนยันลบเอกสารไฟล์แนบล้างระบบ?')) {
                                try {
                                  await CRMService.deleteAttachment(at.id);
                                  setCustomerAttachments(customerAttachments.filter(x => x.id !== at.id));
                                  onToast('นำสัญญออกจากระบบสมบูรณ์', 'success');
                                } catch {
                                  onToast('เกิดข้อผิดพลาดในการรัดสิทธิ์เอกสาร', 'err');
                                }
                              }
                            }}
                            className="text-slate-405 hover:text-red-600 p-1 rounded hover:bg-slate-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                      <p className="text-xs text-slate-400">ยังไม่มีหนังสือสำคัญ ทะเบียนภพ.20 หรือเอกสารสัญญาสงเคราะห์เก็บแบบดิจิทัล</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: AUDIT TRAIL */}
              {detailTab === 'audit' && (
                <div className="space-y-3">
                  <span className="text-xs text-slate-400 block mb-1 font-sans">ประวัติการปฏิบัติกรรมเปลี่ยนโครงสร้างสิทธิ์ (Audit Trail Logging)</span>
                  {customerAuditLogs.length > 0 ? (
                    <div className="space-y-2">
                      {customerAuditLogs.map(log => (
                        <div key={log.id} className="p-3 bg-slate-50/70 rounded-lg border border-slate-200 text-xs flex flex-col gap-1">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono border-b border-dashed pb-1">
                            <span>ผู้แก้ไข: {log.action_by} ({log.role})</span>
                            <span>{log.created_at.split('T')[0]} {log.created_at.split('T')[1]?.slice(0, 5) || ''}</span>
                          </div>
                          <div className="font-bold text-slate-800 text-[13px] mt-0.5">{log.action}</div>
                          <p className="text-slate-500 font-sans leading-relaxed text-[11px] bg-white p-2 rounded border border-slate-100">{log.details}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                      <p className="text-xs text-slate-400">ไม่พบบันทึกการดัดแปลงข้อมูลประวัติหรือรอยนิ้วมือการอัปโหลดเกี่ยวกับลูกค้ารายนี้</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* --- SUB MODAL FORM CONTACT PERSON --- */}
      {isContactFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[60] backdrop-blur-xs transition-opacity overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h4 className="text-sm font-bold text-slate-800">
                {editingContactIndex !== null ? 'แก้ไขผู้ติดต่อประสานงาน' : 'เพิ่มบุคคลผู้ติดต่อใหม่'}
              </h4>
              <button 
                onClick={() => setIsContactFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="p-6 space-y-4">
              {/* Contact Name */}
              <div className="space-y-1 text-sm">
                <label className="text-xs font-semibold text-slate-500 block">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                <input
                  id="form-contact-name"
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="คุณกิตติศักดิ์ ใจดี"
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Position */}
              <div className="space-y-1 text-sm">
                <label className="text-xs font-semibold text-slate-500 block">ตำแหน่งงาน</label>
                <input
                  id="form-contact-position"
                  type="text"
                  value={contactPosition}
                  onChange={(e) => setContactPosition(e.target.value)}
                  placeholder="จัดซื้อและพัสดุ / หัวหน้าฝ่ายวิศวกรรม"
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1 text-sm">
                <label className="text-xs font-semibold text-slate-500 block">เบอร์มือถือ <span className="text-red-500">*</span></label>
                <input
                  id="form-contact-phone"
                  type="text"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="081-xxxxxxx"
                  className="w-full p-2.5 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Email */}
              <div className="space-y-1 text-sm">
                <label className="text-xs font-semibold text-slate-500 block">อีเมลติดต่อตรง</label>
                <input
                  id="form-contact-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="kittisak@company.com"
                  className="w-full p-2.5 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsContactFormOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none"
                >
                  ยกเลิก
                </button>
                <button
                  id="btn-submit-contact"
                  type="submit"
                  className="px-4 py-2 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm focus:outline-none"
                >
                  บันทึกผู้ติดต่อ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
