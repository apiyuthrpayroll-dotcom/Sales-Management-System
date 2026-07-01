import React, { useState, useMemo } from 'react';
import { Customer, Quotation, SalesOrder, UserRole, Opportunity, Invoice } from '../types';
import { Briefcase, Plus, Search, Filter, Trash2, Eye, Printer, Edit2, FileText, Check, Calendar, Settings2, ShieldAlert, X, Lock } from 'lucide-react';

interface SalesOrderViewProps {
  salesOrders: SalesOrder[];
  quotations: Quotation[];
  customers: Customer[];
  opportunities: Opportunity[];
  invoices: Invoice[];
  onAdd: (payload: Omit<SalesOrder, 'id' | 'so_no' | 'created_at'>) => Promise<any>;
  onUpdate: (id: string, updates: Partial<SalesOrder>) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
  onToast: (msg: string, type: 'success' | 'err') => void;
  currentRole: UserRole;
  currentUserId: string;
}

export default function SalesOrderView({
  salesOrders,
  quotations,
  customers,
  opportunities,
  invoices,
  onAdd,
  onUpdate,
  onDelete,
  onToast,
  currentRole,
  currentUserId
}: SalesOrderViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSO, setEditingSO] = useState<SalesOrder | null>(null);
  const [viewingSO, setViewingSO] = useState<SalesOrder | null>(null);

  // Form State
  const [quoteId, setQuoteId] = useState('');
  const [custId, setCustId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDeliveryDate, setTargetDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return d.toISOString().split('T')[0];
  });
  const [status, setStatus] = useState<SalesOrder['status']>('Pending');
  const [jobNo, setJobNo] = useState('');
  const [poNo, setPoNo] = useState('');

  const canModify = currentRole !== 'Management';
  const canDelete = currentRole === 'Admin' || currentRole === 'System Administrator';

  // Extract only Approved/Sent quotations to create Sales Orders
  const validQuotations = useMemo(() => {
    return quotations.filter(q => q.status === 'Approved' || q.status === 'Sent');
  }, [quotations]);

  const handleQuoteChange = (id: string) => {
    setQuoteId(id);
    const q = quotations.find(item => item.id === id);
    if (q) {
      setCustId(q.customer_id);
      setProjectName(q.subject);
      setTotalAmount(q.total_amount);
    }
  };

  const handleOpenAddForm = () => {
    setEditingSO(null);
    setQuoteId('');
    setCustId('');
    setProjectName('');
    setTotalAmount(0);
    setOrderDate(new Date().toISOString().split('T')[0]);
    const d = new Date();
    d.setDate(d.getDate() + 60);
    setTargetDeliveryDate(d.toISOString().split('T')[0]);
    setStatus('Pending');
    setJobNo('');
    setPoNo('');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (so: SalesOrder) => {
    setEditingSO(so);
    setQuoteId(so.quotation_id);
    setCustId(so.customer_id);
    setProjectName(so.project_name);
    setTotalAmount(so.total_amount);
    setOrderDate(so.order_date);
    setTargetDeliveryDate(so.target_delivery_date);
    setStatus(so.status);
    setJobNo(so.job_no || '');
    setPoNo(so.po_no || '');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custId || !projectName || totalAmount <= 0) {
      onToast('กรุณากรอกข้อมูลลูกค้า ชื่อโครงการ และยอดเงินเป้าหมายให้ครบถ้วน', 'err');
      return;
    }

    const payload = {
      quotation_id: quoteId,
      customer_id: custId,
      project_name: projectName,
      total_amount: Number(totalAmount),
      status,
      order_date: orderDate,
      target_delivery_date: targetDeliveryDate,
      job_no: jobNo,
      po_no: poNo
    };

    try {
      if (editingSO) {
        await onUpdate(editingSO.id, payload);
        onToast(`แก้ไขใบสั่งสั่งขาย ${editingSO.so_no} ลงระบบเรียบร้อย`, 'success');
      } else {
        await onAdd(payload);
        onToast(`สร้างบันทึกใบสั่งขาย (Sales Order) ใหม่สำเร็จ`, 'success');
      }
      setIsFormOpen(false);
    } catch {
      onToast('เกิดข้อผิดพลาดในการเชื่อมต่อคลาวด์/จัดเก็บข้อมูล', 'err');
    }
  };

  // Multiple filter states
  const [selectedJob, setSelectedJob] = useState('All');
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState('All');
  const [selectedService, setSelectedService] = useState('All');

  // Dynamic values extractor for filter selection dropdowns
  const existingJobs = useMemo(() => {
    const list = salesOrders.map(so => so.job_no).filter(Boolean) as string[];
    return Array.from(new Set(list));
  }, [salesOrders]);

  const existingCustomersList = useMemo(() => {
    const list = salesOrders.map(so => so.customer_name).filter(Boolean) as string[];
    return Array.from(new Set(list));
  }, [salesOrders]);

  const existingServicesList = useMemo(() => {
    const list = salesOrders.map(so => {
      const q = quotations.find(quote => quote.id === so.quotation_id || quote.quotation_no === so.quotation_id);
      if (!q) return '';
      const opp = opportunities.find(o => o.id === q.opportunity_id || o.opportunity_no === q.opportunity_id);
      return opp?.service_type || '';
    }).filter(Boolean) as string[];
    return Array.from(new Set(list));
  }, [salesOrders, quotations, opportunities]);

  const filteredSalesOrders = useMemo(() => {
    return salesOrders.filter(so => {
      const matchSearch = 
        so.so_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        so.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (so.customer_name && so.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (so.job_no && so.job_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (so.po_no && so.po_no.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = selectedStatus === 'All' || so.status === selectedStatus;
      const matchJob = selectedJob === 'All' || so.job_no === selectedJob;
      const matchCustomer = selectedCustomerFilter === 'All' || so.customer_name === selectedCustomerFilter;
      
      const soService = (() => {
        const q = quotations.find(quote => quote.id === so.quotation_id || quote.quotation_no === so.quotation_id);
        if (!q) return 'งานบริการทั่วไป';
        const opp = opportunities.find(o => o.id === q.opportunity_id || o.opportunity_no === q.opportunity_id);
        return opp?.service_type || 'งานบริการทั่วไป';
      })();
      const matchService = selectedService === 'All' || soService === selectedService;

      return matchSearch && matchStatus && matchJob && matchCustomer && matchService;
    });
  }, [salesOrders, searchTerm, selectedStatus, selectedJob, selectedCustomerFilter, selectedService, quotations, opportunities]);

  const relatedInvoices = useMemo(() => {
    if (!viewingSO) return [];
    return invoices.filter(inv => inv.sales_order_id === viewingSO.id || inv.sales_order_id === viewingSO.so_no);
  }, [viewingSO, invoices]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="salesorder-module">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-150 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">Sales Order Management (ออกใบสั่งขายและ Job งานจ้าง)</h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">โมดูลที่ 5: จัดการใบสั่งงาน คอนเฟิร์มดีลโครงการค้าขาย และเริ่มจัดแผนโครงสร้างปฏิบัติการ</p>
          </div>
        </div>
        {canModify && (
          <button
            onClick={handleOpenAddForm}
            className="flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all cursor-pointer shadow-xs text-sm"
          >
            <Plus className="w-4 h-4" />
            เปิดใบสั่งขาย SO / New Sales Order
          </button>
        )}
      </div>

      {/* filter tools */}
      <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs space-y-4">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่ใบสั่งขาย SO, เลขที่งาน Job No., ชื่อแคมเปญโครงการ หรือชื่อบริษัทลูกค้า..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/25 transition-all"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          {/* Status Filter */}
          <div className="space-y-1 bg-white p-2 rounded-lg border border-slate-200/60 shadow-xxs">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">สถานะใบสั่งขาย / Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-transparent border-0 text-xs focus:outline-none cursor-pointer font-extrabold text-slate-700 mt-0.5"
            >
              <option value="All">ทั้งหมด (ทุกสถานะ)</option>
              <option value="Pending">Pending</option>
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Partially Invoiced">Partially Invoiced</option>
              <option value="Fully Invoiced">Fully Invoiced</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Customer Filter */}
          <div className="space-y-1 bg-white p-2 rounded-lg border border-slate-200/60 shadow-xxs">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">บริษัทคู่ค้า / Customer:</span>
            <select
              value={selectedCustomerFilter}
              onChange={(e) => setSelectedCustomerFilter(e.target.value)}
              className="w-full bg-transparent border-0 text-xs focus:outline-none cursor-pointer font-extrabold text-slate-700 mt-0.5"
            >
              <option value="All">ทั้งหมด (ทุกบริษัทลูกค้า)</option>
              {existingCustomersList.map(cust => (
                <option key={cust} value={cust}>{cust}</option>
              ))}
            </select>
          </div>

          {/* Job No Filter */}
          <div className="space-y-1 bg-white p-2 rounded-lg border border-slate-200/60 shadow-xxs">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">เลขที่งาน / Job No:</span>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full bg-transparent border-0 text-xs focus:outline-none cursor-pointer font-extrabold text-slate-700 mt-0.5"
            >
              <option value="All">ทั้งหมด (ทุกเลขที่งาน Job)</option>
              {existingJobs.map(job => (
                <option key={job} value={job}>{job}</option>
              ))}
            </select>
          </div>

          {/* Service Type Filter */}
          <div className="space-y-1 bg-white p-2 rounded-lg border border-slate-200/60 shadow-xxs">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">ประเภทบริการ / Service:</span>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full bg-transparent border-0 text-xs focus:outline-none cursor-pointer font-extrabold text-slate-700 mt-0.5"
            >
              <option value="All">ทั้งหมด (ทุกประเภทบริการ)</option>
              {existingServicesList.map(srv => (
                <option key={srv} value={srv}>{srv}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Spreadsheet Tab simulation bar */}
      <div className="bg-[#f8f9fa] border border-slate-200 border-b-0 px-4 py-2 flex items-center justify-between text-xs select-none rounded-t-xl">
        <div className="flex items-center gap-3">
          <span className="font-medium bg-[#E8EAED] px-2.5 py-1 rounded border border-slate-200 text-slate-700 select-none">Sheet1</span>
          <span className="text-slate-400">|</span>
          <span className="font-mono font-semibold text-emerald-600">{filteredSalesOrders.length} แถว (Rows)</span>
        </div>
      </div>

      {/* Main Grid table in Google Sheet style */}
      <div className="bg-white rounded-b-2xl border border-[#DADCE0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              {/* Excel Column Headers A, B, C... */}
              <tr className="bg-[#F8F9FA] border-b border-slate-250 text-[10px] font-mono text-slate-400 select-none">
                <th className="border border-slate-200 bg-[#E8EAED] text-center w-10 py-1"></th>
                <th className="border border-slate-200 text-center w-40">A</th>
                <th className="border border-slate-200 text-center">B</th>
                <th className="border border-slate-200 text-center w-44">C</th>
                <th className="border border-slate-200 text-center w-44">D</th>
                <th className="border border-slate-200 text-center w-36">E</th>
                <th className="border border-slate-200 text-center w-36">F</th>
              </tr>
              {/* Header Columns inside the spreadsheet */}
              <tr className="bg-[#F8F9FA] border-b-2 border-slate-300 text-xs font-semibold text-slate-600">
                <th className="border border-slate-200 bg-[#E8EAED] text-center w-10 font-mono select-none"></th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700">รหัสใบสั่งขาย</th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700">แคมเปญโครงการ / บริษัทคู่ค้า</th>
                <th className="border border-slate-200 px-3 py-2 text-right text-slate-700">มูลค่างบประมาณรวม</th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700">วันที่รับจ้าง / กำหนดสำเร็จ</th>
                <th className="border border-slate-200 px-3 py-2 text-center text-slate-700">คิวสถานะ</th>
                <th className="border border-slate-200 px-3 py-2 text-right text-slate-700">การสั่งการ</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-700">
              {filteredSalesOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-xs border border-slate-200">
                    ไม่พบข้อมูลประวัติใบสั่งสั่งขายทางการค้าในรอบพอร์ทัล
                  </td>
                </tr>
              ) : (
                filteredSalesOrders.map((so, idx) => (
                  <tr 
                    key={so.id} 
                    className={`hover:bg-blue-50/45 cursor-pointer transition-colors border-b border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]/70'}`}
                  >
                    {/* Index row background (spreadsheet numbering) */}
                    <td className="border border-slate-200 bg-[#F1F3F4] text-[#5f6368] text-center font-mono text-[10px] select-none py-1.5">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 font-mono font-bold text-slate-800">
                      {so.so_no}
                    </td>
                    <td className="border border-slate-200 px-3 py-2.5">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="font-extrabold text-slate-800 text-sm block">{so.project_name}</span>
                        {so.job_no ? (
                          <span className="inline-flex items-center gap-1 bg-[#FFF9E6] text-[#B76E00] font-mono font-bold px-1.5 py-0.5 rounded border border-[#FFE299] text-[10px]" title="Job Number">
                            Job: {so.job_no}
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-slate-50 text-slate-400 font-mono px-1 py-0.5 rounded border border-slate-200 text-[10px]">
                            No Job Ref
                          </span>
                        )}
                        {so.po_no && (
                          <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 font-mono font-bold px-1.5 py-0.5 rounded border border-teal-200 text-[10px]" title="Customer PO Number">
                            PO: {so.po_no}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-semibold block">ลูกค้า: {so.customer_name}</span>

                      {so.items && so.items.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-dashed border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">รายการสัดส่วนและยอดคงเหลือ / Invoiced Items & Remaining:</span>
                          <div className="space-y-1">
                            {so.items.map((it, idx) => (
                              <div key={idx} className="flex flex-col sm:flex-row sm:justify-between gap-1 text-[11px] bg-slate-50/50 p-1.5 rounded border border-slate-100">
                                <span className="text-slate-600 font-medium">{it.item_no}. {it.description}</span>
                                <span className={`font-mono font-bold whitespace-nowrap px-1.5 py-0.2 rounded ${it.remaining_qty === 0 ? 'text-green-700 bg-green-50 border border-green-100' : 'text-amber-700 bg-amber-50 border border-amber-100'}`}>
                                  คงเหลือ: {it.remaining_qty} / {it.qty} {it.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 text-right font-mono font-bold text-slate-900">
                      ฿{so.total_amount.toLocaleString()}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5">
                      <span className="text-xs block text-slate-600 font-bold">เริ่ม: {so.order_date}</span>
                      <span className="text-[10px] text-teal-600 block font-semibold mt-0.5">แผนเสร็จ: {so.target_delivery_date}</span>
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold leading-none ${
                        so.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-150' :
                        so.status === 'In Progress' ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' :
                        so.status === 'Planning' ? 'bg-blue-50 text-blue-700 border border-blue-150' :
                        so.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-150' :
                        'bg-slate-50 text-slate-600 border border-slate-200'
                      }`}>
                        {so.status}
                      </span>
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingSO(so)}
                          title="ดูแบบฟอร์มเชิงลึก / พิมพ์ใบสั่งงาน"
                          className="p-1 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {canModify && (
                          <button
                            onClick={() => handleOpenEditForm(so)}
                            title="แก้ไขขั้นตอนหรือวันกำหนดการ"
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          >
                            <Settings2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canDelete ? (
                          <button
                            onClick={async () => {
                              if (confirm(`คุณแน่ใจว่าต้องการยกเลิกและลบประวัติใบสั่งขาย ${so.so_no} หรือไม่?`)) {
                                await onDelete(so.id);
                                onToast('ถอดถอนลบข้อมูลใบสั่งขายเรียบร้อย', 'success');
                              }
                            }}
                            title="ลบข้อมูล"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            disabled
                            title="จำกัดสิทธิ์เฉพาะ Admin เท่านั้น"
                            className="p-1 text-slate-300 cursor-not-allowed rounded"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-slide-up">
            <div className="bg-slate-50 p-6 border-b border-slate-150 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">
                  {editingSO ? `ปรับขั้นตอนการทำงานใบสั่งจ้าง SO: ${editingSO.so_no}` : 'ขึ้นทะเบียนใบสั่งขาย Sales Order (รับมอบงาน)'}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">บันทึกข้อตกลงงานวิศวกรรมเฉพาะทาง หรือจัดหาทรัพยากรกำลังคน</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded bg-white border border-slate-150">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Quotation Ref */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">อ้างอิงใบเสนอราคาที่ได้รับอนุมัติ *</label>
                <select
                  required
                  value={quoteId}
                  onChange={(e) => handleQuoteChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="">-- เลือกอ้างอิงใบเสนอราคาคู่ชำระ --</option>
                  {validQuotations.map(q => (
                    <option key={q.id} value={q.id}>{q.quotation_no} - {q.subject}</option>
                  ))}
                </select>
              </div>

              {/* Customer selection */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">องค์กรลูกค้าหลัก</label>
                <select
                  required
                  disabled={!!quoteId}
                  value={custId}
                  onChange={(e) => setCustId(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none cursor-not-allowed"
                >
                  <option value="">-- จะดึงบริษัทอิงตามข้อมูลเสนอราคา --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.customer_name}</option>
                  ))}
                </select>
              </div>

              {/* Project name input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">ชื่อแคมเปญโครงการ/งานบริการที่ระบุ *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น โครงการตรวจแก้หม้อแก๊สโรงไฟฟ้า PTT"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Job No Combobox Input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  หมายเลขงาน / Job No. <span className="text-slate-400 font-normal">(พิมพ์เปิดเลขใหม่ หรือกดเลือกจากรายกลุ่มที่มีเพื่อผูกดีลเดียวกัน)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="form-job-datalist"
                    placeholder="เช่น JOB-26001, PM-TANK02"
                    value={jobNo}
                    onChange={(e) => setJobNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                  <datalist id="form-job-datalist">
                    {existingJobs.map(job => (
                      <option key={job} value={job} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Customer PO Number Input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  เลขที่ใบสั่งซื้อลูกค้า / Customer PO No. <span className="text-slate-450 font-normal">(ระบุเลขที่เอกสาร PO ที่ได้รับจากลูกค้าเพื่อใช้คุยงานร่วมกัน)</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น PO-681903, PO-2026-610"
                  value={poNo}
                  onChange={(e) => setPoNo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Amount and Status and Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">ยอดงบประมาณจัดจ้าง (฿) *</label>
                  <input
                    type="number"
                    required
                    placeholder="เช่น 1200000"
                    value={totalAmount || ''}
                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">รหัสคิวสถานะดีลงาน</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">วันที่ตกลงสั่งจ้าง / Order Date</label>
                  <input
                    type="date"
                    required
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">กำหนดส่งมอบแผนงาน / Delivery Date</label>
                  <input
                    type="date"
                    required
                    value={targetDeliveryDate}
                    onChange={(e) => setTargetDeliveryDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-slate-50 border border-slate-200 text-slate-600 font-bold px-5 py-2 rounded-xl text-xs hover:bg-slate-100 transition-all"
                >
                  ออก
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 text-white font-bold px-5 py-2 rounded-xl text-xs hover:bg-teal-700 shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  อนุมัติคำสั่งสั่งขาย / Issue SO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visual Printed Sales Order Doc Modal */}
      {viewingSO && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-3xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in print:bg-white print:p-0 print:absolute">
          <div className="bg-white rounded-2xl shadow-3xl w-full max-w-3xl overflow-hidden my-8 animate-scale-up print:shadow-none print:my-0 print:rounded-none">
            
            {/* Header control toolbar (Hidden in print) */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-150 flex items-center justify-between print:hidden">
              <span className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <Printer className="w-4.5 h-4.5 text-teal-600" />
                ใบสั่งจ้างปาดและรับงาน / Original Sales Order View ({viewingSO.so_no})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  พิมพ์แบบฟอร์มใบงาน
                </button>
                <button onClick={() => setViewingSO(null)} className="p-1 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Print canvas page */}
            <div className="p-8 md:p-12 space-y-8 font-sans bg-white print:p-0 text-slate-800">
              
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <h1 className="text-teal-600 font-extrabold text-2xl tracking-tight uppercase leading-none">SALES ORDER</h1>
                  <span className="text-xs text-slate-400 block mt-1">ใบสั่งจ้างและบันทึกข้อตกลงงานบริการวิศวกรรม</span>
                  <div className="text-xs font-medium text-slate-700 mt-4 leading-relaxed font-mono">
                    <strong>บริษัท ควอลิที เทค แอนด์ เซอร์วิส จำกัด</strong><br />
                    1024/9 อาคารศูนย์ไอทีอาร์ สาทร พญาไท กรุงเทพมหานคร 10400<br />
                    ทะเบียนประจำตัวผู้เสียภาษีอากร: 0105658091234
                  </div>
                </div>
                <div className="text-right space-y-1 text-xs">
                  <div className="text-[11px] font-bold text-slate-400">เลขที่ใบสั่งขาย / SO Identifier</div>
                  <div className="font-mono text-base font-extrabold text-slate-800">{viewingSO.so_no}</div>
                  
                  {viewingSO.job_no && (
                    <>
                      <div className="text-[11px] font-bold text-slate-400 pt-2">รหัสโครงการกลุ่มงาน / Job No.</div>
                      <div className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 inline-block rounded border border-amber-200">{viewingSO.job_no}</div>
                    </>
                  )}

                  {viewingSO.po_no && (
                    <>
                      <div className="text-[11px] font-bold text-slate-400 pt-2">เลขที่ใบสั่งซื้อลูกค้า / Customer PO No.</div>
                      <div className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 inline-block rounded border border-teal-200">{viewingSO.po_no}</div>
                    </>
                  )}

                  <div className="text-[11px] font-bold text-slate-400 pt-2">อ้างอิงใบเสนอราคา / Quote Ref.</div>
                  <div className="font-mono text-xs font-bold text-slate-600">{quotations.find(q => q.id === viewingSO.quotation_id)?.quotation_no || 'ไม่พบการอ้างอิงแยก'}</div>
                  <div className="text-[11px] font-bold text-slate-400 pt-2">ลงวันที่เริ่มรับงาน / Date Assigned</div>
                  <div className="font-bold">{viewingSO.order_date}</div>
                </div>
              </div>

              {/* Addresses section */}
              <div className="grid grid-cols-2 gap-8 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="text-[11px] uppercase font-bold text-slate-400 mb-1.5">บริษัทผู้ว่าจ้าง / Account Entity:</div>
                  <div className="text-slate-800 font-extrabold text-sm">{viewingSO.customer_name}</div>
                  <div className="text-slate-500 mt-2 leading-relaxed">
                    เลขผู้เสียภาษี: {customers.find(c => c.id === viewingSO.customer_id)?.tax_id || '-'}<br />
                    เครดิตเทอม: {customers.find(c => c.id === viewingSO.customer_id)?.payment_term || '30 วันการค้า'}<br />
                    วงเงินความร่วมมือสูงสุด: ฿{(customers.find(c => c.id === viewingSO.customer_id)?.credit_limit || 0).toLocaleString()} บาท
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <div className="text-[11px] uppercase font-bold text-slate-400 mb-1">เป้าหมายงบประมาณการตรวจสอบ / Deliverables:</div>
                  <div className="text-xs text-slate-700 font-bold">{viewingSO.project_name}</div>
                  <div className="text-[11.5px] leading-relaxed text-slate-500 mt-2">
                    กำหนดขอบเขตจัดส่งรายงาน: <strong>{viewingSO.target_delivery_date}</strong><br />
                    ระเบียบประกันภัย: กำหนดให้พนักงานที่จัดส่งไปต้องสวมหมวกนิรภัย (PPE Standard) ตลอดความร่วมมือในพื้นที่โรงงานควบคุม
                  </div>
                </div>
              </div>

              {/* Items Summary list */}
              <table className="w-full text-xs text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-600">
                    <th className="px-3 py-2.5">รายการลักษณะงานรับจ้างการค้า / Project Milestones</th>
                    {viewingSO.items && viewingSO.items.length > 0 ? (
                      <>
                        <th className="px-3 py-2.5 text-center w-28">จำนวนจ้าง</th>
                        <th className="px-3 py-2.5 text-center w-32">คงเหลือยังไม่แจ้งหนี้</th>
                        <th className="px-3 py-2.5 text-right w-28">ราคาต่อหน่วย</th>
                        <th className="px-3 py-2.5 text-right w-36">รวมมูลค่างาน</th>
                      </>
                    ) : (
                      <>
                        <th className="px-3 py-2.5 text-right w-56">กำหนดแล้วเสร็จเป้าหมาย / Duration</th>
                        <th className="px-3 py-2.5 text-right w-44">ยอดเงินงบประมาณ (฿)</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {viewingSO.items && viewingSO.items.length > 0 ? (
                    viewingSO.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-3 py-3">
                          <span className="font-bold text-slate-800 block">{it.item_no}. {it.description}</span>
                        </td>
                         <td className="px-3 py-3 text-center font-mono">{it.qty} {it.unit}</td>
                         <td className="px-3 py-3 text-center font-mono">
                           <span className={`px-1.5 py-0.5 rounded text-[11px] font-extrabold ${it.remaining_qty === 0 ? 'text-green-700 bg-green-50' : 'text-amber-700 bg-amber-50'}`}>
                             {it.remaining_qty} {it.unit}
                           </span>
                         </td>
                         <td className="px-3 py-3 text-right font-mono">฿{it.unit_price.toLocaleString()}</td>
                         <td className="px-3 py-3 text-right font-mono font-bold text-slate-900">฿{(it.qty * it.unit_price).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-4">
                        <span className="font-bold text-slate-800 block">{viewingSO.project_name}</span>
                        <span className="text-[10px] text-slate-400 block mt-1">อิงตามข้อตกลงและเงื่อนไขเทคนิคหลักของใบเสนอเลขรหัส {viewingSO.quotation_id}</span>
                      </td>
                      <td className="px-4 py-4 text-right">ภายใน {viewingSO.target_delivery_date}</td>
                      <td className="px-4 py-4 text-right font-mono font-extrabold text-teal-700">฿{viewingSO.total_amount.toLocaleString()}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Historical Invoice Billing Records linked to Sales Order */}
              {viewingSO && relatedInvoices.length > 0 && (
                <div className="mt-8 p-5 bg-slate-50/80 rounded-xl border border-slate-200/60 print:break-inside-avoid text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">ประวัติการแจ้งหนี้และสัดส่วนที่ออก (Invoiced History Log for {viewingSO.so_no})</span>
                  </div>
                  <div className="space-y-2">
                    {relatedInvoices.map((inv, idx) => (
                      <div key={inv.id} className="bg-white p-3 rounded-lg border border-slate-150 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs shadow-xxs">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-extrabold text-slate-800">ครั้งที่ {idx + 1}</span>
                            <span className="font-mono font-extrabold text-teal-700 bg-teal-50 border border-teal-100 px-1.5 py-0.2 rounded text-[11px]">{inv.invoice_no}</span>
                            <span className={`inline-flex px-1.5 py-0.2 text-[10px] font-bold rounded ${inv.status === 'Paid' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                              {inv.status === 'Paid' ? 'ชำระแล้ว / Paid' : 'ค้างชำระ / Unpaid'}
                            </span>
                          </div>
                          <div className="text-slate-500 font-medium">
                            ออกบิลวันที่: {inv.invoice_date} | ครบดิวชำระ: {inv.due_date}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-slate-900">
                            มูลค่าสุทธิ: ฿{inv.grand_total.toLocaleString()}
                          </div>
                          {inv.items && inv.items.length > 0 && (
                            <div className="text-[10px] text-slate-500 font-medium mt-1">
                              รายการเบิก: {inv.items.map(it => `${it.quantity} x "${it.description.split('\n')[0]}"`).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Signatures execution */}
              <div className="grid grid-cols-2 gap-12 pt-20 text-center text-xs">
                <div className="space-y-12">
                  <span className="text-slate-400 font-medium block">จัดแผนคิวบริการโดย / Project Planner:</span>
                  <div className="border-b border-slate-300 w-48 mx-auto pb-1 text-slate-700 font-semibold">
                    ( ทีมวิศวกรผู้ดูแลระบบคิว )
                  </div>
                  <span className="text-[10px] text-slate-400 block">วันที่ / Date: ............................................</span>
                </div>
                <div className="space-y-12">
                  <span className="text-slate-400 font-medium block">ตัวแทนผู้มีอำนาจเซ็นต์รับทราบใบงาน / Auth Representative:</span>
                  <div className="border-b border-slate-300 w-48 mx-auto pb-1 text-slate-700 font-semibold">
                    ...........................................................................
                  </div>
                  <span className="text-[10px] text-slate-400 block">วันที่ / Date: ............................................</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
