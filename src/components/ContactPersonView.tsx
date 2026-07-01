import React, { useState, useMemo } from 'react';
import { Customer, ContactPerson, UserRole } from '../types';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  PlusCircle,
  Eye,
  CheckCircle,
  AlertCircle,
  Hash,
  X
} from 'lucide-react';

interface ContactPersonViewProps {
  customers: Customer[];
  currentRole: UserRole;
  currentUserId: string;
  onUpdateCustomer: (id: string, updates: Partial<Customer>) => Promise<any>;
  onToast: (msg: string, type: 'success' | 'err') => void;
  onViewCustomer: (customer: Customer) => void;
}

const DEPARTMENTS = [
  'Procurement (จัดซื้อ)',
  'Maintenance (ซ่อมบำรุง)',
  'Engineering (วิศวกรรม)',
  'Management (ผู้บริหาร)',
  'Operations (ปฏิบัติการหน้างาน)',
  'Safety (ฝ่ายความปลอยภัย)',
  'Finance/Accounting (การเงิน)',
  'Other (อื่นๆ)'
];

const CONTACT_METHODS = ['Phone', 'Email', 'Line', 'Meeting'];

export default function ContactPersonView({ 
  customers, 
  currentRole, 
  onUpdateCustomer, 
  onToast,
  onViewCustomer 
}: ContactPersonViewProps) {
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedMethod, setSelectedMethod] = useState('All');

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [editingContact, setEditingContact] = useState<{ customerId: string; index: number } | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formPosition, setFormPosition] = useState('');
  const [formDept, setFormDept] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formOfficePhone, setFormOfficePhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formLineId, setFormLineId] = useState('');
  const [formMethod, setFormMethod] = useState<'Phone' | 'Line' | 'Email' | 'Meeting'>('Email');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Permission Checks
  const canEdit = currentRole !== 'Management';

  // Flatten all contacts from all customers
  const allContacts = useMemo(() => {
    const list: any[] = [];
    customers.forEach(cust => {
      if (Array.isArray(cust.contacts)) {
        cust.contacts.forEach((contact, idx) => {
          list.push({
            ...contact,
            customer_id: cust.id,
            customer_name: cust.customer_name,
            customer_code: cust.customer_code,
            contact_index: idx
          });
        });
      }
    });
    return list;
  }, [customers]);

  // Filter contacts
  const filteredContacts = useMemo(() => {
    return allContacts.filter(c => {
      const matchesSearch = 
        c.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.department && c.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = selectedDept === 'All' || c.department === selectedDept;
      const matchesStatus = selectedStatus === 'All' || (c.status || 'Active') === selectedStatus;
      const matchesMethod = selectedMethod === 'All' || c.preferred_contact === selectedMethod;

      return matchesSearch && matchesDept && matchesStatus && matchesMethod;
    });
  }, [allContacts, searchTerm, selectedDept, selectedStatus, selectedMethod]);

  // Open Add Contact Modal
  const handleOpenAdd = () => {
    if (customers.length === 0) {
      onToast('กรุณาสร้างข้อมูลลูกค้าอย่างน้อย 1 รายการก่อนเพิ่มผู้ติดต่อ', 'err');
      return;
    }
    setEditingContact(null);
    setSelectedCustomerId(customers[0].id);
    setFormName('');
    setFormPosition('');
    setFormDept('Procurement (จัดซื้อ)');
    setFormPhone('');
    setFormOfficePhone('');
    setFormEmail('');
    setFormLineId('');
    setFormMethod('Email');
    setFormStatus('Active');
    setErrors({});
    setIsFormOpen(true);
  };

  // Open Edit Contact Modal
  const handleOpenEdit = (contact: any) => {
    setEditingContact({ customerId: contact.customer_id, index: contact.contact_index });
    setSelectedCustomerId(contact.customer_id);
    setFormName(contact.contact_name);
    setFormPosition(contact.position);
    setFormDept(contact.department || 'Procurement (จัดซื้อ)');
    setFormPhone(contact.phone);
    setFormOfficePhone(contact.office_phone || '');
    setFormEmail(contact.email);
    setFormLineId(contact.line_id || '');
    setFormMethod(contact.preferred_contact || 'Email');
    setFormStatus(contact.status || 'Active');
    setErrors({});
    setIsFormOpen(true);
  };

  const validateForm = () => {
    const errs: { [key: string]: string } = {};
    if (!formName.trim()) errs.name = 'กรุณากรอกชื่อผู้ติดต่อ';
    if (!formPosition.trim()) errs.position = 'กรุณากรอกตำแหน่งงาน';
    if (!formPhone.trim()) errs.phone = 'กรุณากรอกเบอร์มือถือ';
    if (!formEmail.trim()) {
      errs.email = 'กรุณากรอกอีเมล';
    } else if (!/\S+@\S+\.\S+/.test(formEmail)) {
      errs.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Save changes
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!canEdit) {
      onToast('ขออภัย คุณไม่ได้รับสิทธิ์ให้ดำเนินการเพิ่ม/แก้ไขข้อมูล', 'err');
      return;
    }

    const payload: ContactPerson = {
      contact_name: formName,
      position: formPosition,
      department: formDept,
      phone: formPhone,
      office_phone: formOfficePhone || undefined,
      email: formEmail,
      line_id: formLineId || undefined,
      preferred_contact: formMethod,
      status: formStatus
    };

    try {
      if (editingContact) {
        // Edit flow
        const parentCust = customers.find(c => c.id === editingContact.customerId);
        if (!parentCust) throw new Error('Parent customer not found');

        const updatedContacts = [...parentCust.contacts];
        
        // Remove or update
        if (editingContact.customerId === selectedCustomerId) {
          // Stayed in same customer
          updatedContacts[editingContact.index] = payload;
          await onUpdateCustomer(selectedCustomerId, { contacts: updatedContacts });
        } else {
          // Moved to another customer: delete from old, push to new
          const oldUpdatedContacts = updatedContacts.filter((_, idx) => idx !== editingContact.index);
          await onUpdateCustomer(editingContact.customerId, { contacts: oldUpdatedContacts });

          const newParent = customers.find(c => c.id === selectedCustomerId);
          if (newParent) {
            const newContacts = [...(newParent.contacts || []), payload];
            await onUpdateCustomer(selectedCustomerId, { contacts: newContacts });
          }
        }
        onToast('แก้ไขข้อมูลผู้ติดต่อเรียบร้อย', 'success');
      } else {
        // Create flow
        const parentCust = customers.find(c => c.id === selectedCustomerId);
        if (!parentCust) throw new Error('Parent customer not found');

        const updatedContacts = [...(parentCust.contacts || []), payload];
        await onUpdateCustomer(selectedCustomerId, { contacts: updatedContacts });
        onToast('เพิ่มข้อมูลผู้ติดต่อใหม่เรียบร้อย', 'success');
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      onToast('มีข้อผิดพลาดบางอย่างเกิดขึ้นในการบันทึกมูล', 'err');
    }
  };

  // Delete contact person
  const handleDeleteContact = async (contact: any) => {
    if (!canEdit) {
      onToast('ขออภัย คุณไม่ได้รับสิทธิ์ให้ลบผู้ติดต่อ', 'err');
      return;
    }

    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ติดต่อ "${contact.contact_name}"?`)) {
      try {
        const parentCust = customers.find(c => c.id === contact.customer_id);
        if (!parentCust) throw new Error('Parent customer not found');

        const updatedContacts = parentCust.contacts.filter((_, idx) => idx !== contact.contact_index);
        await onUpdateCustomer(contact.customer_id, { contacts: updatedContacts });
        onToast('ลบข้อมูลผู้ติดต่อเรียบร้อย', 'success');
      } catch (err) {
        console.error(err);
        onToast('ไม่สามารถลบข้อมูลผู้ติดต่อได้', 'err');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">รายชื่อผู้ติดต่อลูกค้า (Contact Persons)</h2>
          <p className="text-slate-400 text-xs mt-0.5">รวมประวัติผู้ติดต่อประสานงานทั้งหมด ค้นหาง่าย และเชื่อมสัมพันธ์ตรงกับองค์กรพันธมิตร</p>
        </div>
        {canEdit && (
          <button
            id="btn-add-contact-global"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            เพิ่มผู้ประสานงานใหม่
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col xl:flex-row gap-3 items-center">
        {/* Search */}
        <div className="w-full xl:flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้ติดต่อ, ฝ่าย, ตำแหน่ง, บริษัทลูกค้า, อีเมล, มือถือ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 transition-all font-sans"
          />
        </div>

        <div className="w-full xl:w-auto flex flex-col md:flex-row gap-2 shrink-0">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5 border border-slate-200 px-2 pl-3 py-1 bg-slate-50 rounded-lg">
            <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs font-semibold bg-transparent text-slate-700 focus:outline-none"
            >
              <option value="All">ทุกแผนกจัดซื้อ-วิศวกรรม</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Preferred Method Filter */}
          <div className="flex items-center gap-1.5 border border-slate-200 px-2 pl-3 py-1 bg-slate-50 rounded-lg">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="text-xs font-semibold bg-transparent text-slate-700 focus:outline-none"
            >
              <option value="All">ทุกช่องทางติดต่อที่ชอบ</option>
              {CONTACT_METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 border border-slate-200 px-2 pl-3 py-1 bg-slate-50 rounded-lg">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs font-semibold bg-transparent text-slate-705 focus:outline-none"
            >
              <option value="All">ทุกสถานะ (Status)</option>
              <option value="Active">ใช้งานจริง (Active)</option>
              <option value="Inactive">ปิดชั่วคราว (Inactive)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Global Table list (Google Sheets Style) */}
      <div className="bg-[#f8f9fa] border border-slate-300 rounded-lg shadow-sm overflow-hidden font-sans">
        {/* Google Sheets Sheets Tab styling & Formula Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-300 bg-[#f8f9fa] divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          <div className="flex items-center px-4 py-2 flex-grow min-w-0">
            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px] mr-2">fx</span>
            <div className="font-mono text-[11px] text-slate-600 bg-white border border-slate-200 py-1 px-2.5 rounded-sm flex-1 truncate select-all" title="Google Sheets Formula Simulator">
              =FILTER(CONTACTS_DATABASE, SEARCH(&quot;{searchTerm || '*'}&quot;, ContactName) * Status=&quot;{selectedStatus}&quot;)
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white sm:bg-transparent text-xs text-slate-500 font-sans">
            <span className="font-medium bg-[#E8EAED] px-2 py-1 rounded border border-slate-200 text-slate-700 select-none">Contacts_Data</span>
            <span className="text-slate-400">|</span>
            <span className="font-mono font-semibold text-emerald-600">{filteredContacts.length} แถว (Rows)</span>
          </div>
        </div>

        <div className="overflow-x-auto bg-white bg-opacity-100">
          <table className="w-full text-left border-collapse border border-slate-200">
            <thead>
              {/* Excel Column Headers A, B, C... */}
              <tr className="bg-[#F8F9FA] border-b border-slate-300 text-[10px] font-mono text-slate-400 select-none">
                <th className="border border-slate-200 bg-[#E8EAED] text-center w-10 py-1"></th>
                <th className="border border-slate-200 px-3 text-center">A</th>
                <th className="border border-slate-200 px-3 text-center">B</th>
                <th className="border border-slate-200 px-3 text-center">C</th>
                <th className="border border-slate-200 px-3 text-center">D</th>
                <th className="border border-slate-200 px-3 text-center">E</th>
                <th className="border border-slate-200 px-3 text-center">F</th>
                <th className="border border-slate-200 px-3 text-center">G</th>
                {canEdit && <th className="border border-slate-200 px-3 text-center">H</th>}
              </tr>
              {/* Header Columns inside the spreadsheet */}
              <tr className="bg-[#F8F9FA] border-b-2 border-slate-300 text-xs font-bold text-slate-600 select-none">
                <th className="border border-slate-200 bg-[#E8EAED] text-center w-10 font-mono"></th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700 font-semibold">ชื่อผู้ประสานงาน</th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700 font-semibold">บริษัทลูกค้าสังกัด</th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700 font-semibold">ตำแหน่ง / ฝ่ายงาน</th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700 font-semibold">เบอร์มือถือ</th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700 font-semibold">อีเมลประสานงาน</th>
                <th className="border border-slate-200 px-3 py-2 text-center text-slate-700 font-semibold">ช่องทางที่ชอบ</th>
                <th className="border border-slate-200 px-3 py-2 text-center text-slate-700 font-semibold">สถานะ</th>
                {canEdit && <th className="border border-slate-200 px-3 py-2 text-right text-slate-700 font-semibold">จัดการ</th>}
              </tr>
            </thead>
            <tbody className="text-xs text-slate-700">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact, idx) => {
                  const parentCustomer = customers.find(c => c.id === contact.customer_id);
                  return (
                    <tr 
                      key={`${contact.customer_id}-${idx}`} 
                      className={`hover:bg-blue-50/45 transition-colors border-b border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]/70'}`}
                    >
                      {/* Index row background (spreadsheet numbering) */}
                      <td className="border border-slate-200 bg-[#F1F3F4] text-[#5f6368] text-center font-mono text-[10px] select-none py-1.5">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-200 px-3 py-1.5 font-bold text-slate-800">
                        {contact.contact_name}
                      </td>
                      <td className="border border-slate-200 px-3 py-1.5">
                        <button
                          onClick={() => parentCustomer && onViewCustomer(parentCustomer)}
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium cursor-pointer text-left focus:outline-none"
                        >
                          <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span>{contact.customer_name}</span>
                          <span className="font-mono text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                            {contact.customer_code}
                          </span>
                        </button>
                      </td>
                      <td className="border border-slate-200 px-3 py-1.5">
                        <div className="font-medium text-slate-700">{contact.position}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{contact.department || 'ไม่ระบุแผนก'}</div>
                      </td>
                      <td className="border border-slate-200 px-3 py-1.5 font-mono text-slate-600 text-[11px] font-medium">
                        {contact.phone}
                        {contact.office_phone && (
                          <span className="block text-[10px] text-slate-400">สนง: {contact.office_phone}</span>
                        )}
                      </td>
                      <td className="border border-slate-200 px-3 py-1.5 font-mono text-slate-550 text-[11px]">
                        {contact.email}
                        {contact.line_id && (
                          <span className="block text-[10px] text-slate-400">Line: {contact.line_id}</span>
                        )}
                      </td>
                      <td className="border border-slate-200 px-3 py-1.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          contact.preferred_contact === 'Phone' ? 'bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]' :
                          contact.preferred_contact === 'Email' ? 'bg-[#E8F0FE] text-[#1A73E8] border border-[#D2E3FC]' :
                          contact.preferred_contact === 'Line' ? 'bg-[#E6F4EA] text-[#137333] border border-[#C2E7CD]' :
                          'bg-[#F3E5F5] text-[#4A148C] border border-[#E1BEE7]'
                        }`}>
                          {contact.preferred_contact || 'Email'}
                        </span>
                      </td>
                      <td className="border border-slate-200 px-3 py-1.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-semibold ${
                          (contact.status || 'Active') === 'Active' 
                            ? 'bg-[#E6F4EA] text-[#137333] border border-[#A3E1B9]' 
                            : 'bg-[#F1F3F4] text-[#3C4043] border border-[#DADCE0]'
                        }`}>
                          {((contact.status || 'Active') === 'Active') ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="border border-slate-200 px-3 py-1.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              title="แก้ไขข้อมูล"
                              onClick={() => handleOpenEdit(contact)}
                              className="p-1 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded transition-colors focus:outline-none cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="ลบผู้ประสานงาน"
                              onClick={() => handleDeleteContact(contact)}
                              className="p-1 text-slate-400 hover:text-red-700 hover:bg-slate-100 rounded transition-colors focus:outline-none cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={canEdit ? 9 : 8} className="p-8 text-center text-slate-400 font-sans border border-slate-200">
                    ไม่พบรายชื่อผู้ประสานงานจัดซื้อหรือวิศวกรรมที่สอดคล้อง
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-[#f8f9fa] px-4 py-2 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500 font-semibold font-mono select-none">
          <span>ALL REGISTERED: {filteredContacts.length} CONTACTS</span>
          <span>ENTERPRISE DATABASE CONNECTED</span>
        </div>
      </div>

      {/* --- REUSE COMPONENT FORM ADD/EDIT CONTACT MODAL --- */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs transition-opacity animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-up border border-slate-150">
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-5 flex items-center justify-between text-base font-bold">
              <span className="flex items-center gap-1.5 font-sans">
                <PlusCircle className="w-5 h-5 text-blue-200" />
                {editingContact ? 'แก้ไขประวัติข้อมูลผู้ประสานงาน' : 'ลงทะเบียนผู้ประสานงานใหม่'}
              </span>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="p-6 space-y-4 font-sans text-xs">
              {/* Customer Selector */}
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">องค์กรลูกค้าคู่ค้าสำคัญ *</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full text-xs border border-slate-200 bg-slate-50 p-2.5 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 font-sans text-slate-700"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.customer_name} ({c.customer_code})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400">เลือกบริษัทลูกค้าผู้ร่วมธุรกิจเพื่อให้ง่ายต่อการประมวลสถิติสรุปดีลงาน</p>
              </div>

              {/* Grid 2-cols */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">ชื่อ-นามสกุลจริง *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น สมชาย รักดี"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                  {errors.name && <p className="text-red-500 text-[9px] font-semibold">{errors.name}</p>}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">ตำแหน่งงานสำคัญ *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น Procurement Manager"
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value)}
                    className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                  {errors.position && <p className="text-red-500 text-[9px] font-semibold">{errors.position}</p>}
                </div>
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">แผนกจัดซื้อ / วิศวกรรม</label>
                <select
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value)}
                  className="w-full text-xs border border-slate-200 bg-slate-50 p-2 rounded-lg focus:outline-none focus:bg-white font-sans text-slate-705"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Phone Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">เบอร์มือถือติดต่อหลัก *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น 081-234-5678"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  {errors.phone && <p className="text-red-500 text-[9px] font-semibold">{errors.phone}</p>}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">เบอร์โทรศัพท์สำนักงาน</label>
                  <input
                    type="text"
                    placeholder="ต่อสายภายใน (ถ้ามี)"
                    value={formOfficePhone}
                    onChange={(e) => setFormOfficePhone(e.target.value)}
                    className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Email & Line */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">ที่อยู่อีเมลทางการ</label>
                  <input
                    type="email"
                    placeholder="somchai@customer.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  {errors.email && <p className="text-red-500 text-[9px] font-semibold">{errors.email}</p>}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Line ID</label>
                  <input
                    type="text"
                    placeholder="ID Line"
                    value={formLineId}
                    onChange={(e) => setFormLineId(e.target.value)}
                    className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 name-mono"
                  />
                </div>
              </div>

              {/* Preferences and Status */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block font-sans">ช่องทางติดต่อหลักที่ถูกใจ</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as any)}
                    className="w-full text-xs border border-slate-200 bg-slate-50 p-2 rounded-lg focus:outline-none focus:bg-white font-sans text-slate-705"
                  >
                    {CONTACT_METHODS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">สถานะการทำงาน</label>
                  <div className="flex gap-4 pt-1 items-center">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 select-none cursor-pointer">
                      <input
                        type="radio"
                        name="contact_status"
                        checked={formStatus === 'Active'}
                        onChange={() => setFormStatus('Active')}
                        className="text-blue-600 focus:ring-0"
                      />
                      Active (ทำงานอยู่)
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 select-none cursor-pointer">
                      <input
                        type="radio"
                        name="contact_status"
                        checked={formStatus === 'Inactive'}
                        onChange={() => setFormStatus('Inactive')}
                        className="text-blue-600 focus:ring-0"
                      />
                      Inactive (ออก/ระงับ)
                    </label>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-xs font-semibold text-slate-650 hover:bg-slate-50 rounded-lg focus:outline-none transition-colors cursor-pointer"
                >
                  ยกเลิกแคนเซิล
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-lg focus:outline-none transition-colors shadow-sm cursor-pointer"
                >
                  {editingContact ? 'อัปเดตผู้ประสานงานหลัก' : 'บันทึกเป็นผู้ติดต่อใหม่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
