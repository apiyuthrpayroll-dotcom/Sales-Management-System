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
                <th className="border border-slate-200 text-center">B</th>
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
                  <td colSpan={8} className="text-center py-12 text-slate-400 text-xs border border-slate-200">
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
      {viewingQuote && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-3xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in print:bg-white print:p-0 print:absolute">
          <div className="bg-white rounded-2xl shadow-3xl w-full max-w-3xl overflow-hidden my-8 animate-scale-up print:shadow-none print:my-0 print:rounded-none">
            
            {/* Header control toolbar (Hidden in print) */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-150 flex items-center justify-between print:hidden">
              <span className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <Printer className="w-4.5 h-4.5 text-indigo-600" />
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
            <div className="p-8 md:p-10 space-y-6 font-sans bg-white print:p-0 text-slate-800">
              
              {/* Document Banner */}
              <div className="flex justify-between items-start border-b-2 border-rose-600 pb-5">
                <div className="flex gap-4">
                  <img src="https://drive.google.com/uc?export=view&id=1u2v-GT6YDaWZZoravixstbtyQkvudkbw" alt="IKM Logo" className="h-16 w-auto object-contain shrink-0" referrerPolicy="no-referrer" />
                  <div>
                    <h1 className="text-slate-950 font-black text-lg uppercase tracking-wider leading-none">IKM Testing (Thailand) Co., Ltd.</h1>
                    <span className="text-[10px] text-slate-500 block mt-1 leading-relaxed">
                      110/3 Moo 2, Ban-Chang, Ban-Chang, Rayong 21130 THAILAND<br />
                      Tel: +66 (0) 38 604 186 / Fax: +66 (0) 38 604 189
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono mt-0.5">TAX ID: 0105552089123 (Head Office) | Email: info@ikmtesting.co.th</span>
                  </div>
                </div>
                <div className="text-right space-y-0.5">
                  <h2 className="text-rose-600 font-extrabold text-2xl tracking-wider leading-none uppercase">QUOTATION</h2>
                  <span className="text-[11px] font-bold text-slate-400 block pb-1">ใบเสนอราคา</span>
                  <div className="text-[11px] bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg space-y-0.5 text-left inline-block min-w-[180px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Doc No.:</span>
                      <span className="font-mono font-bold text-slate-800">{viewingQuote.quotation_no}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Date:</span>
                      <span className="font-bold text-slate-800">{viewingQuote.issue_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Valid Until:</span>
                      <span className="font-bold text-amber-600">{viewingQuote.valid_until}</span>
                    </div>
                  </div>
                  <div className="text-left bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg mt-1 max-w-[240px] inline-block w-full">
                    <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Subject / เรื่อง:</span>
                    <span className="text-[11px] font-black text-slate-800 block break-words leading-tight mt-0.5">{viewingQuote.subject}</span>
                  </div>
                </div>
              </div>

              {/* Bill To Info */}
              <div className="grid grid-cols-2 gap-6 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">ผู้รับบริการ / CUSTOMER INFO:</div>
                  <div className="text-slate-900 font-black text-sm">{viewingQuote.customer_name}</div>
                  <div className="text-slate-600 leading-relaxed space-y-0.5">
                    <div><strong>Tax ID:</strong> {customers.find(c => c.id === viewingQuote.customer_id)?.tax_id || '-'}</div>
                    <div><strong>Phone:</strong> {customers.find(c => c.id === viewingQuote.customer_id)?.phone || '-'}</div>
                    <div><strong>Address:</strong> {customers.find(c => c.id === viewingQuote.customer_id)?.address || '-'}</div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400">ขอบเขตบริการ / PROJECT SCOPE:</div>
                  <div className="text-slate-900 font-extrabold text-xs">{viewingQuote.subject}</div>
                  <div className="text-slate-500 leading-relaxed text-[11px]">
                    <strong>Scope & Details:</strong> This proposal represents professional testing services, manpower supply, or technical rental conforming exactly to structural requirements.
                  </div>
                </div>
              </div>

              {/* Items Table details */}
              <div className="overflow-hidden border border-slate-300 rounded-lg">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold uppercase text-slate-700">
                      <th className="px-3 py-2 border-r border-slate-300 text-center w-12 text-[10px]">ลำดับ<br/>(No.)</th>
                      <th className="px-3 py-2 border-r border-slate-300 text-[10px]">รายละเอียดงาน<br/>(Description of Services)</th>
                      <th className="px-3 py-2 border-r border-slate-300 text-center w-14 text-[10px]">จำนวน<br/>(Qty)</th>
                      <th className="px-3 py-2 border-r border-slate-300 text-center w-14 text-[10px]">หน่วย<br/>(Unit)</th>
                      <th className="px-3 py-2 border-r border-slate-300 text-center w-14 text-[10px]">ระยะเวลางาน<br/>(Days)</th>
                      <th className="px-3 py-2 border-r border-slate-300 text-right w-24 text-[10px]">ราคาต่อหน่วย<br/>(Rate THB)</th>
                      <th className="px-3 py-2 text-right w-28 text-[10px]">จำนวนเงิน<br/>(Total THB)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {viewingQuote.items && viewingQuote.items.length > 0 ? (
                      viewingQuote.items.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50/40">
                          <td className="px-3 py-2.5 border-r border-slate-200 text-center font-mono">{idx + 1}</td>
                          <td className="px-3 py-2.5 border-r border-slate-200 whitespace-pre-line tracking-tight leading-relaxed">
                            {item.description}
                          </td>
                          <td className="px-3 py-2.5 border-r border-slate-200 text-center font-mono font-bold">{item.qty}</td>
                          <td className="px-3 py-2.5 border-r border-slate-200 text-center">{item.unit}</td>
                          <td className="px-3 py-2.5 border-r border-slate-200 text-center font-mono">{item.duration_days || '1'}</td>
                          <td className="px-3 py-2.5 border-r border-slate-200 text-right font-mono">
                            {item.unit_rate ? item.unit_rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold">
                            {item.total_price ? item.total_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="hover:bg-slate-50/40">
                        <td className="px-3 py-3 border-r border-slate-200 text-center font-mono">1</td>
                        <td className="px-3 py-3 border-r border-slate-200">
                          <span className="font-extrabold text-slate-900 block">{viewingQuote.subject}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Project code / Ref: {viewingQuote.opportunity_id || 'CRM-REF'}</span>
                        </td>
                        <td className="px-3 py-3 border-r border-slate-200 text-center font-mono">1</td>
                        <td className="px-3 py-3 border-r border-slate-200 text-center">Lot</td>
                        <td className="px-3 py-3 border-r border-slate-200 text-center font-mono">1</td>
                        <td className="px-3 py-3 border-r border-slate-200 text-right font-mono">
                          {viewingQuote.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-3 text-right font-mono font-bold">
                          {viewingQuote.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Calculation Summaries */}
              <div className="flex justify-between items-start text-xs pt-2">
                <div className="max-w-md text-slate-500 font-medium leading-relaxed bg-slate-50 p-3 border border-slate-200 rounded-xl">
                  <div className="text-slate-800 font-bold mb-1">TERMS & CONDITIONS:</div>
                  <div className="text-[10px] space-y-0.5 whitespace-pre-line text-slate-500 font-mono">
                    {viewingQuote.remarks ? `Remarks: ${viewingQuote.remarks}\n` : ''}
                    - Price holds for 30 days from date of printing.<br />
                    - Standard credit payment terms: 30 days unless specified otherwise.<br />
                    - Standard VAT of 7% applies to aggregate totals.
                  </div>
                </div>
                <div className="w-72 space-y-1.5 border border-slate-300 p-4 rounded-xl bg-slate-50">
                  <div className="flex justify-between text-slate-600">
                    <span>รวมเป็นเงิน / Subtotal (THB):</span>
                    <span className="font-mono font-bold">{viewingQuote.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>ภาษีมูลค่าเพิ่ม / VAT (7%):</span>
                    <span className="font-mono font-bold">{viewingQuote.vat_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-300 pt-2 text-rose-600 font-black text-sm">
                    <span>ยอดสุทธิ / Grand Total:</span>
                    <span className="font-mono">{viewingQuote.grand_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Authorized execution block */}
              <div className="grid grid-cols-2 gap-12 pt-10 text-center text-xs">
                <div className="space-y-10">
                  <span className="text-slate-400 font-black uppercase tracking-wider block">PREPARED & APPROVED BY:</span>
                  <div className="border-b border-slate-300 w-52 mx-auto pb-1 text-slate-700 font-extrabold uppercase font-mono">
                    IKM TECHNICAL TEAM
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block">Authorized Signatory & Stamp</span>
                </div>
                <div className="space-y-10">
                  <span className="text-slate-400 font-black uppercase tracking-wider block">ACCEPTED BY CUSTOMER:</span>
                  <div className="border-b border-slate-300 w-52 mx-auto pb-1 text-slate-700 font-semibold font-mono">
                    .....................................................
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block">Signature & Company Seal</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
