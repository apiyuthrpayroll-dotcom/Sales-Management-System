import React, { useState, useMemo } from 'react';
import { Customer, Opportunity, Quotation, UserRole } from '../types';
import { FileText, Plus, Search, Filter, Trash2, Eye, Printer, Edit2, Calendar, FileCheck, Check, Ban, Clock, X, Lock, Copy } from 'lucide-react';

interface QuotationViewProps {
  quotations: Quotation[];
  customers: Customer[];
  opportunities: Opportunity[];
  onAdd: (payload: Omit<Quotation, 'id' | 'quotation_no' | 'created_at'>) => Promise<any>;
  onUpdate: (id: string, updates: Partial<Quotation>) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
  onToast: (msg: string, type: 'success' | 'err') => void;
  currentRole: UserRole;
  currentUserId: string;
}

export default function QuotationView({
  quotations,
  customers,
  opportunities,
  onAdd,
  onUpdate,
  onDelete,
  onToast,
  currentRole,
  currentUserId
}: QuotationViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quotation | null>(null);
  const [viewingQuote, setViewingQuote] = useState<Quotation | null>(null);

  // Form State
  const [oppId, setOppId] = useState('');
  const [custId, setCustId] = useState('');
  const [subject, setSubject] = useState('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [remarks, setRemarks] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Expired'>('Draft');

  const canModify = currentRole !== 'Management';
  const canDelete = currentRole === 'Admin' || currentRole === 'System Administrator';

  // Handle Opportunity Selection to auto-fill Customer and Subject
  const handleOppChange = (id: string) => {
    setOppId(id);
    const opp = opportunities.find(o => o.id === id);
    if (opp) {
      setCustId(opp.customer_id);
      setSubject(`ใบเสนอราคาสำหรับ ${opp.project_name}`);
      setTotalAmount(opp.estimated_value);
    }
  };

  const handleOpenAddForm = () => {
    setEditingQuote(null);
    setOppId('');
    setCustId('');
    setSubject('');
    setTotalAmount(0);
    setIssueDate(new Date().toISOString().split('T')[0]);
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setValidUntil(d.toISOString().split('T')[0]);
    setRemarks('');
    setStatus('Draft');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (q: Quotation) => {
    setEditingQuote(q);
    setOppId(q.opportunity_id);
    setCustId(q.customer_id);
    setSubject(q.subject);
    setTotalAmount(q.total_amount);
    setIssueDate(q.issue_date);
    setValidUntil(q.valid_until);
    setRemarks(q.remarks || '');
    setStatus(q.status);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custId || !subject || totalAmount <= 0) {
      onToast('กรุณากรอกข้อมูลลูกค้า หัวข้อ และมูลค่ารวมให้ครบถ้วน', 'err');
      return;
    }

    const vat = Math.round(totalAmount * 0.07);
    const grand = totalAmount + vat;

    const payload = {
      opportunity_id: oppId,
      customer_id: custId,
      subject,
      total_amount: Number(totalAmount),
      vat_amount: vat,
      grand_total: grand,
      status,
      issue_date: issueDate,
      valid_until: validUntil,
      remarks
    };

    try {
      if (editingQuote) {
        await onUpdate(editingQuote.id, payload);
        onToast(`แก้ไขใบเสนอราคา ${editingQuote.quotation_no} สำเร็จ`, 'success');
      } else {
        await onAdd(payload);
        onToast(`สร้างใบเสนอราคาใหม่สำเร็จ`, 'success');
      }
      setIsFormOpen(false);
    } catch {
      onToast('เกิดข้อผิดพลาดในการบันทึกข้อมูลใบเสนอราคา', 'err');
    }
  };

  const handleDuplicateQuotation = async (q: Quotation) => {
    if (!confirm(`คุณมั่นใจหรือไม่ที่จะทำสำเนาใบเสนอราคา ${q.quotation_no} เป็นฉบับร่างใหม่?`)) {
      return;
    }

    const payload = {
      opportunity_id: q.opportunity_id || '',
      customer_id: q.customer_id,
      subject: q.subject,
      total_amount: q.total_amount,
      vat_amount: q.vat_amount,
      grand_total: q.grand_total,
      status: 'Draft' as const,
      issue_date: new Date().toISOString().split('T')[0],
      valid_until: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d.toISOString().split('T')[0];
      })(),
      remarks: q.remarks || '',
      items: q.items ? q.items.map(it => ({ ...it })) : []
    };

    try {
      await onAdd(payload);
      onToast(`คัดลอกใบเสนอราคา ${q.quotation_no} สำเร็จ (ฉบับร่าง)`, 'success');
    } catch {
      onToast('เกิดข้อผิดพลาดในการคัดลอกใบเสนอราคา', 'err');
    }
  };

  const filteredQuotes = useMemo(() => {
    return quotations.filter(q => {
      const matchSearch = 
        q.quotation_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.customer_name && q.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = selectedStatus === 'All' || q.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [quotations, searchTerm, selectedStatus]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="quotation-module">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-150 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">Quotation Management (บริหารใบเสนอราคา)</h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">โมดูลที่ 4: ออกใบเสนอราคา เปรียบเทียบ และอนุมัติโปรเจกต์งานบริการล่วงหน้า</p>
          </div>
        </div>
        {canModify && (
          <button
            onClick={handleOpenAddForm}
            className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all cursor-pointer shadow-xs text-sm"
          >
            <Plus className="w-4 h-4" />
            ออกใบเสนอราคาใหม่ / New Quote
          </button>
        )}
      </div>

      {/* Filter and Search Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่ใบเสนอราคา, หัวเรื่อง, หรือชื่อองค์กรลูกค้า..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="text-slate-400 w-4 h-4 shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 cursor-pointer font-bold"
          >
            <option value="All">ทุกสถานะใบเสนอราคา</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Spreadsheet Tab simulation bar */}
      <div className="bg-[#f8f9fa] border border-slate-200 border-b-0 px-4 py-2 flex items-center justify-between text-xs select-none rounded-t-xl">
        <div className="flex items-center gap-3">
          <span className="font-medium bg-[#E8EAED] px-2.5 py-1 rounded border border-slate-200 text-slate-700 select-none">Sheet1</span>
          <span className="text-slate-400">|</span>
          <span className="font-mono font-semibold text-emerald-600">{filteredQuotes.length} แถว (Rows)</span>
        </div>
      </div>

      {/* Main Table Grid in Google Sheet style */}
      <div className="bg-white rounded-b-2xl border border-[#DADCE0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              {/* Excel Column Headers A, B, C... */}
              <tr className="bg-[#F8F9FA] border-b border-slate-250 text-[10px] font-mono text-slate-400 select-none">
                <th className="border border-slate-200 bg-[#E8EAED] text-center w-10 py-1"></th>
                <th className="border border-slate-200 text-center w-36">A</th>
                <th className="border border-slate-200 text-center w-40">B1</th>
                <th className="border border-slate-200 text-center">B2</th>
                <th className="border border-slate-200 text-center w-40">C</th>
                <th className="border border-slate-200 text-center w-40">D</th>
                <th className="border border-slate-200 text-center w-44">E</th>
                <th className="border border-slate-200 text-center w-32">F</th>
                <th className="border border-slate-200 text-center w-36">G</th>
              </tr>
              {/* Header Columns inside the spreadsheet */}
              <tr className="bg-[#F8F9FA] border-b-2 border-slate-300 text-xs font-semibold text-slate-600">
                <th className="border border-slate-200 bg-[#E8EAED] text-center w-10 font-mono select-none"></th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700">เอกสาร</th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700">ตัวแทนขาย (Sale Rep)</th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700">องค์กรลูกค้า / โครงการ</th>
                <th className="border border-slate-200 px-3 py-2 text-right text-slate-700">ยอดรวม (ก่อน VAT)</th>
                <th className="border border-slate-200 px-3 py-2 text-right text-slate-900 font-extrabold">ยอดสุทธิ (รวม VAT)</th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700">วันที่ออก / สิ้นสุด</th>
                <th className="border border-slate-200 px-3 py-2 text-center text-slate-700">สถานะ</th>
                <th className="border border-slate-200 px-3 py-2 text-right text-slate-700">เครื่องมือ</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-700">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400 text-xs border border-slate-200">
                    ไม่พบข้อมูลใบเสนอราคาตามช่วงคำค้นหาที่ระบุ
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q, idx) => (
                  <tr 
                    key={q.id} 
                    className={`hover:bg-blue-50/45 cursor-pointer transition-colors border-b border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]/70'}`}
                  >
                    {/* Index row background (spreadsheet numbering) */}
                    <td className="border border-slate-200 bg-[#F1F3F4] text-[#5f6368] text-center font-mono text-[10px] select-none py-1.5">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 font-mono text-slate-600 truncate">
                      {q.quotation_no}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 text-slate-700 font-medium">
                      {q.sales_person || "ธนพล คำดี (S03)"}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5">
                      <span className="font-bold text-slate-800 block">{q.customer_name}</span>
                      <span className="text-[10px] text-slate-400 font-normal block max-w-xs truncate mt-0.5" title={q.subject}>{q.subject}</span>
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 text-right font-mono font-medium text-slate-600">
                      ฿{q.total_amount.toLocaleString()}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 text-right font-mono font-bold text-indigo-600">
                      ฿{q.grand_total.toLocaleString()}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5">
                      <span className="text-[11px] block font-bold text-slate-600">{q.issue_date}</span>
                      <span className="text-[10px] text-rose-500 block font-semibold mt-0.5">Exp: {q.valid_until}</span>
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold leading-none ${
                        q.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' :
                        q.status === 'Sent' ? 'bg-blue-50 text-blue-700 border border-blue-150' :
                        q.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-150' :
                        q.status === 'Expired' ? 'bg-amber-50 text-amber-700 border border-amber-150' :
                        'bg-slate-50 text-slate-600 border border-slate-200'
                      }`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingQuote(q)}
                          title="ดูและพิมพ์"
                          className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {canModify && (
                          <>
                            <button
                              onClick={() => handleOpenEditForm(q)}
                              title="แก้ไขรายละเอียด"
                              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicateQuotation(q)}
                              title="คัดลอกเป็นฉบับใหม่ (Duplicate)"
                              className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {canDelete ? (
                          <button
                            onClick={async () => {
                              if (confirm(`คุณมั่นใจหรือไม่ที่จะถอดถอนและลบใบเสนอราคา ${q.quotation_no} ออกจากพอร์ทัล?`)) {
                                await onDelete(q.id);
                                onToast('ถอนลบข้อมูลใบเสนอราคาสำเร็จ', 'success');
                              }
                            }}
                            title="ลบออก"
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

      {/* Form / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up">
            <div className="bg-slate-50 p-6 border-b border-slate-150 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">
                  {editingQuote ? `แก้ไขรายละเอียดใบเสนอราคา ${editingQuote.quotation_no}` : 'ออกใบเสนอราคาใบใหม่'}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">กรอกข้อมูลราคาประเมินและสัดส่วนเงื่อนไขระยะเวลาโครงการทางการค้า</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded bg-white border border-slate-150 hover:bg-slate-50">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Link to Opportunity */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">เชื่อมโยงโอกาสทางการขาย (Optional)</label>
                  <select
                    value={oppId}
                    onChange={(e) => handleOppChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">-- ไม่ระบุโอกาสทางการขาย --</option>
                    {opportunities.map(o => (
                      <option key={o.id} value={o.id}>{o.opportunity_no} - {o.project_name}</option>
                    ))}
                  </select>
                </div>

                {/* Link to Customer */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">ลูกค้าองค์กรผู้รับบริการ *</label>
                  <select
                    value={custId}
                    onChange={(e) => setCustId(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">-- กรุณาเลือกองค์กรลูกค้า --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.customer_name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">หัวข้อรายละเอียดโครงการธุรกิจ *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น เสนอตรวจเช็คประสิทธิภาพหม้อต้มความดันสูญญากาศ"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">มูลค่ารวมก่อนภาษี (฿) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="ใส่ตัวเลขค่าอุปกรณ์งานบริการ"
                    value={totalAmount || ''}
                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <span className="text-[10px] text-indigo-500 block mt-1 font-bold">ภาษีมูลค่าเพิ่มจะถูกคำนวณอัตโนมัติ (7% VAT)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">ขั้นตอนสถานะใบเสนอราคา</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">วันที่ออกเอกสาร (Issue Date)</label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">วันที่หมดอายุข้อเสนอ (Valid Until)</label>
                  <input
                    type="date"
                    required
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">หมายเหตุพิเศษ / เงื่อนไขชำระเงินเพิ่มเติม</label>
                  <textarea
                    rows={2}
                    placeholder="ระบุข้อกำหนดเพิ่มเติม (เช่น เครดิตเทอม 30 วันการค้า หรือ ประกันช้างสิบหกวิเคราห์)..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-slate-50 border border-slate-200 text-slate-600 font-bold px-5 py-2 rounded-xl text-xs hover:bg-slate-100 transition-all"
                >
                  ยกเลิก / Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white font-bold px-5 py-2 rounded-xl text-xs hover:bg-indigo-700 shadow-xs transition-all flex items-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4" />
                  บันทึกข้อมูล / Save Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Professional Printed Template Preview Modal */}
      {viewingQuote && (() => {
        const clientObj = customers.find(c => c.id === viewingQuote.customer_id);
        const attentionName = clientObj?.contacts?.[0]?.contact_name || "Khun Sawit Kong-ngoen";
        const printItems = (viewingQuote.items && viewingQuote.items.length > 0)
          ? viewingQuote.items
          : [{
              id: "fallback",
              item_no: 1,
              qty: 1,
              unit: "Lot",
              description: viewingQuote.subject,
              duration_days: 1,
              unit_rate: viewingQuote.total_amount,
              total_price: viewingQuote.total_amount
            }];

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-3xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in print-modal-overlay print:bg-white print:p-0 print:absolute print:inset-0">
            <div className="bg-white rounded-2xl shadow-3xl w-full max-w-[210mm] overflow-hidden my-8 animate-scale-up print-modal-content print:shadow-none print:my-0 print:rounded-none print:w-[210mm] print:min-h-[297mm]">
              
              {/* Header control toolbar (Hidden in print) */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-150 flex items-center justify-between print:hidden">
                <span className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Printer className="w-4.5 h-4.5 text-blue-600" />
                  ใบเสนอราคาต้นฉบับดราฟต์ / Print Preview ({viewingQuote.quotation_no})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    สั่งพิมพ์แบบฟอร์ม / Print PDF
                  </button>
                  <button onClick={() => setViewingQuote(null)} className="p-1 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Print canvas sheets */}
              <div 
                className="print-area bg-white mx-auto print:shadow-none print:border-none print:p-0 text-slate-800"
                style={{
                  width: "210mm",
                  minHeight: "297mm",
                  padding: "18mm 18mm",
                  boxSizing: "border-box",
                  position: "relative",
                }}
              >
                <style>{`
                  @import url('https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,500&family=Inter:wght@300;400;500;600;700;800&family=Alex+Brush&display=swap');
                  
                  @media print {
                    @page { 
                      size: A4 portrait; 
                      margin: 0; 
                    }
                    body { 
                      background: white !important; 
                      -webkit-print-color-adjust: exact; 
                      print-color-adjust: exact; 
                    }
                    /* Hide layout wrappers and dashboard elements */
                    .app-wrapper, .wrapper, .app-main, footer, nav, aside, header, .app-footer, .no-print, #navbar-shell, #sidebar-shell {
                      display: none !important;
                    }
                    #quotation-module > *:not(.print-modal-overlay) {
                      display: none !important;
                    }
                    /* Expand parent blocks to be clean */
                    html, body, #react-quotations, #quotation-module {
                      margin: 0 !important;
                      padding: 0 !important;
                      background: white !important;
                      height: auto !important;
                      min-height: 100% !important;
                      overflow: visible !important;
                      box-shadow: none !important;
                      border: none !important;
                    }
                    .app-main {
                      margin-left: 0 !important;
                    }
                    /* Frame the overlay modal perfectly */
                    .print-modal-overlay {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 210mm !important;
                      height: auto !important;
                      min-height: 297mm !important;
                      background: white !important;
                      padding: 0 !important;
                      margin: 0 !important;
                      z-index: 99999 !important;
                      display: block !important;
                      overflow: visible !important;
                      box-shadow: none !important;
                      border: none !important;
                    }
                    .print-modal-content {
                      width: 210mm !important;
                      min-height: 297mm !important;
                      border: none !important;
                      box-shadow: none !important;
                      margin: 0 !important;
                      padding: 0 !important;
                      background: white !important;
                    }
                    .print-area { 
                      border: none !important; 
                      box-shadow: none !important; 
                      padding: 15mm 15mm !important; 
                    }
                  }
                  
                  .print-area, .print-area table, .print-area td, .print-area th, .print-area div, .print-area span, .print-area p {
                    font-family: 'Inter', 'Sarabun', sans-serif !important;
                  }

                  .font-signature {
                    font-family: 'Alex Brush', cursive !important;
                  }
                `}</style>

                {/* Elegant Header with Logo & Brand details */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 pr-6 text-left">
                    <div className="text-[14px] font-bold text-black uppercase tracking-wide">
                      IKM TESTING (THAILAND) CO., LTD.
                    </div>
                    <div className="text-[10px] leading-relaxed text-slate-700 mt-1">
                      <p>155/167 Moo 5, Samnakthon Sub-district, Banchang District, Rayong Province</p>
                      <p>Thailand 21130</p>
                      <p className="mt-1">Tel : + 66 38 601 996 to 8</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <img
                      src="https://lh3.googleusercontent.com/d/133co_Er6IxolsybTkqnn4Ez570c4Aa56"
                      alt="IKM Logo"
                      className="h-[80px] object-contain select-none"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Thick solid black divider line */}
                <div className="border-b-2 border-black mb-3"></div>

                {/* Centered Document Title */}
                <div className="text-center mb-4">
                  <h2 className="text-[8px] font-bold tracking-[0.25em] text-black">
                    QUOTATION
                  </h2>
                </div>

                {/* Two Column Customer Info & Quotation Metadata Cards */}
                <div className="grid grid-cols-2 gap-8 text-[11px] mb-4 text-left">
                  {/* Left side Grid */}
                  <div className="grid grid-cols-[55px_15px_1fr] gap-y-1 align-start">
                    <div className="font-semibold text-slate-800">To</div>
                    <div className="text-slate-600">:</div>
                    <div className="text-black font-medium">{clientObj?.customer_name || viewingQuote.customer_name || "STP&I Company Limited"}</div>

                    <div className="font-semibold text-slate-800">Attn</div>
                    <div className="text-slate-600">:</div>
                    <div className="text-black">{attentionName}</div>

                    <div className="font-semibold text-slate-800">Tel</div>
                    <div className="text-slate-600">:</div>
                    <div className="text-black">{clientObj?.phone || "+66(0)93-296-9151"}</div>

                    <div className="font-semibold text-slate-800">Email</div>
                    <div className="text-slate-600">:</div>
                    <div className="text-black break-all">{clientObj?.email || "sawit.k@stpi.co.th"}</div>

                    {/* Spacer */}
                    <div className="col-span-3 h-2"></div>

                    <div className="font-semibold text-slate-800">From</div>
                    <div className="text-slate-600">:</div>
                    <div className="text-black">{viewingQuote.sales_person || "ธนพล คำดี (S03)"}</div>

                    <div className="font-semibold text-slate-800">CC</div>
                    <div className="text-slate-600">:</div>
                    <div className="text-black">-</div>

                    <div className="font-semibold text-slate-800">Subject</div>
                    <div className="text-slate-600">:</div>
                    <div className="text-black font-bold break-words">{viewingQuote.subject}</div>
                  </div>

                  {/* Right side Grid */}
                  <div className="grid grid-cols-[80px_15px_1fr] gap-y-1 align-start">
                    <div className="font-semibold text-slate-800">Our Ref.</div>
                    <div className="text-slate-600">:</div>
                    <div className="text-black font-bold">{viewingQuote.quotation_no}</div>

                    <div className="font-semibold text-slate-800">Date</div>
                    <div className="text-slate-600">:</div>
                    <div className="text-black">
                      {new Date(viewingQuote.issue_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>

                    {/* Spacer matching left column Tel row */}
                    <div className="col-span-3 h-[18px]"></div>

                    <div className="font-semibold text-slate-800">No. of Page</div>
                    <div className="text-slate-600">:</div>
                    <div className="text-black">1 of 1</div>
                  </div>
                </div>

                {/* Rigid Table with solid black borders */}
                <table className="w-full border-collapse border border-black text-black bg-white table-fixed mb-2" style={{ minHeight: "440px" }}>
                  <colgroup>
                    <col className="w-[45px]" />
                    <col className="w-[45px]" />
                    <col className="w-[55px]" />
                    <col />
                    <col className="w-[85px]" />
                    <col className="w-[100px]" />
                    <col className="w-[110px]" />
                  </colgroup>
                  <thead>
                    <tr className="h-[36px] text-[10px] font-bold">
                      <th className="border-l border-r border-b-2 border-black font-bold p-1 text-center align-middle">ITEM</th>
                      <th className="border-l border-r border-b-2 border-black font-bold p-1 text-center align-middle">QTY</th>
                      <th className="border-l border-r border-b-2 border-black font-bold p-1 text-center align-middle">UNIT</th>
                      <th className="border-l border-r border-b-2 border-black font-bold p-1 text-center align-middle">DESCRIPTION</th>
                      <th className="border-l border-r border-b-2 border-black font-bold p-1 text-center align-middle">
                        <div className="flex flex-col items-center justify-center">
                          <span>DURATION</span>
                          <span className="text-[8px] font-normal lowercase">Days</span>
                        </div>
                      </th>
                      <th className="border-l border-r border-b-2 border-black font-bold p-1 text-center align-middle">
                        <div className="flex flex-col items-center justify-center">
                          <span>UNIT RATE</span>
                          <span className="text-[8px] font-normal">Per Day</span>
                        </div>
                      </th>
                      <th className="border-l border-r border-b-2 border-black font-bold p-1 text-center align-middle">TOTAL PRICE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Item Rows */}
                    {printItems.map((it: any, idx: number) => (
                      <tr key={it.id || idx} className={`text-[10.5px] h-[28px] align-middle ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                        <td className="border-l border-r border-black text-center font-mono font-medium text-slate-700 p-1">{idx + 1}</td>
                        <td className="border-l border-r border-black text-center font-mono font-medium p-1">{it.qty}</td>
                        <td className="border-l border-r border-black text-center p-1">{it.unit}</td>
                        <td className="border-l border-r border-black px-3 py-1.5 text-left whitespace-pre-wrap leading-relaxed font-medium break-words">{it.description}</td>
                        <td className="border-l border-r border-black text-center font-mono p-1">{it.duration_days || it.duration || "1"}</td>
                        <td className="border-l border-r border-black text-right px-2 font-mono p-1">{it.unit_rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="border-l border-r border-black text-right px-2 font-mono font-semibold p-1">{it.total_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}

                    {/* Filler rows continuing vertical and horizontal borders */}
                    {Array.from({ length: Math.max(1, 10 - printItems.length) }).map((_, idx) => (
                      <tr key={`empty-${idx}`} className={`text-[10.5px] h-[28px] align-middle ${(printItems.length + idx) % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                        <td className="border-l border-r border-black text-center font-mono font-medium text-slate-700 p-1"></td>
                        <td className="border-l border-r border-black text-center font-mono font-medium p-1"></td>
                        <td className="border-l border-r border-black text-center p-1"></td>
                        <td className="border-l border-r border-black px-3 py-1.5 text-left text-[10px] italic font-semibold text-slate-500 leading-relaxed align-top whitespace-pre-wrap">
                          {idx === 0 ? "Note : Air Compressor, Electrical, Water, Loading and Lifting Equipment at Client Side By client." : ""}
                        </td>
                        <td className="border-l border-r border-black text-center font-mono p-1"></td>
                        <td className="border-l border-r border-black text-right px-2 font-mono p-1"></td>
                        <td className="border-l border-r border-black text-right px-2 font-mono font-semibold p-1"></td>
                      </tr>
                    ))}

                    {/* *** LAST ENTRY *** Row */}
                    <tr className="text-[9px] font-bold tracking-[0.25em] text-slate-400 uppercase select-none h-[24px] bg-white">
                      <td className="border-l border-r border-b border-black"></td>
                      <td className="border-l border-r border-b border-black"></td>
                      <td className="border-l border-r border-b border-black"></td>
                      <td className="border-l border-r border-b border-black text-center align-middle">*** LAST ENTRY ***</td>
                      <td className="border-l border-r border-b border-black"></td>
                      <td className="border-l border-r border-b border-black"></td>
                      <td className="border-l border-r border-b border-black"></td>
                    </tr>
                  </tbody>
                </table>

                {/* Total Value aligned right */}
                <div className="flex justify-end items-center mb-4">
                  <span className="text-[11px] font-bold text-black mr-6">Total Value</span>
                  <div className="border border-black w-[110px] py-1 px-2 text-right font-mono font-bold text-[11px] bg-white">
                    {viewingQuote.total_amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                </div>

                {/* Terms / Remarks Blocks */}
                <div className="text-[9.5px] leading-[1.25] text-left space-y-0.5 text-slate-700 pl-4 mb-3">
                  <div className="font-bold text-black">Terms & Conditions:</div>
                  <div className="space-y-[1px]">
                    <p>- 30 days validity from date of quotation.</p>
                    <p>- All prices above are quoted in THB</p>
                    <p>- All prices does not include 7% VAT</p>
                    <p>- Payment term: 30 Days from date of invoice.</p>
                    <p>- Please state our IKM reference no. on your work/purchase order.</p>
                    <p>- IKM Testing shall not be liable for loss or damage or delay or failure in performance hereunder arising or resulting directly</p>
                    <p className="pl-3">or indirectly from amongst other things such as epidemics and/or quarantine restrictions.</p>
                    <p>- If contract or PO is cancelled after mobilization has started, then all expenses incurred shall be invoiced to Client.</p>
                    <p>- Above price will be charged by unit rate and actual</p>
                  </div>
                </div>

                {/* Dual Signatures Section */}
                <div className="grid grid-cols-2 gap-12 text-[11px] pt-4 text-left">
                  <div className="flex flex-col justify-between h-[120px]">
                    <div className="text-slate-800">Thanks and Regards</div>
                    
                    <div className="mt-auto">
                      <div className="border-b border-black w-[200px] mb-1"></div>
                      <div className="font-bold text-black">IKM Testing (Thailand) Co., Ltd.</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-between h-[120px] pl-6">
                    <div className="font-bold text-black">CONFIRMED AND ACCEPTED BY</div>
                    
                    <div className="mt-auto">
                      <div className="border-b border-black w-[220px] mb-1"></div>
                      <div className="text-black font-semibold uppercase tracking-wide text-[9px]">SIGNATURE & COMPANY STAMP</div>
                      <div className="text-[10px] text-slate-700 mt-1">
                        <span>DATE :</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Page Numbering Footer */}
                <div className="absolute bottom-[10px] left-0 w-full px-8 flex justify-between text-[9px] text-slate-500 font-medium">
                  <div>Location: BDS Folder</div>
                  <div>Page 1 of 1</div>
                  <div className="text-right leading-tight">
                    <div>TH-BDS-FRM-003 Rev 0</div>
                    <div>Effective Date: 01 Jul 2026</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
