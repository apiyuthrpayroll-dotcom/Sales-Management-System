import React, { useState, useMemo } from 'react';
import { Customer, Invoice, Receipt, UserRole } from '../types';
import { CreditCard, Plus, Search, Filter, Trash2, Eye, Printer, Edit2, FileText, Check, DollarSign, Wallet, Calendar, X, Lock } from 'lucide-react';

interface ReceiptViewProps {
  receipts: Receipt[];
  invoices: Invoice[];
  customers: Customer[];
  onAdd: (payload: Omit<Receipt, 'id' | 'receipt_no' | 'created_at'>) => Promise<any>;
  onUpdate: (id: string, updates: Partial<Receipt>) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
  onToast: (msg: string, type: 'success' | 'err') => void;
  currentRole: UserRole;
  currentUserId: string;
}

export default function ReceiptView({
  receipts,
  invoices,
  customers,
  onAdd,
  onUpdate,
  onDelete,
  onToast,
  currentRole,
  currentUserId
}: ReceiptViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);

  // Form State
  const [invoiceId, setInvoiceId] = useState('');
  const [custId, setCustId] = useState('');
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Transfer' | 'Cash' | 'Cheque' | 'Credit Card'>('Transfer');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const canModify = currentRole !== 'Management';
  const canDelete = currentRole === 'Admin' || currentRole === 'System Administrator';

  const handleInvoiceChange = (id: string) => {
    setInvoiceId(id);
    const inv = invoices.find(item => item.id === id);
    if (inv) {
      setCustId(inv.customer_id);
      setReceivedAmount(inv.grand_total);
    }
  };

  const handleOpenAddForm = () => {
    setEditingReceipt(null);
    setInvoiceId('');
    setCustId('');
    setReceivedAmount(0);
    setPaymentMethod('Transfer');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (rec: Receipt) => {
    setEditingReceipt(rec);
    setInvoiceId(rec.invoice_id);
    setCustId(rec.customer_id);
    setReceivedAmount(rec.received_amount);
    setPaymentMethod(rec.payment_method);
    setPaymentDate(rec.payment_date);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custId || receivedAmount <= 0) {
      onToast('กรุณาระบุใบแจ้งหนี้เพื่อจับคู่วางรับชำระและยอดเงินหลัก', 'err');
      return;
    }

    const payload = {
      invoice_id: invoiceId,
      customer_id: custId,
      received_amount: Number(receivedAmount),
      payment_method: paymentMethod,
      payment_date: paymentDate
    };

    try {
      if (editingReceipt) {
        await onUpdate(editingReceipt.id, payload);
        onToast(`แก้ไขข้อมูลใบรับเงินเลขที่ ${editingReceipt.receipt_no} สำเร็จ`, 'success');
      } else {
        await onAdd(payload);
        onToast(`สร้างเอกสารใบเสร็จชำระหนี้ (Receipt Issued) สำเร็จ`, 'success');
      }
      setIsFormOpen(false);
    } catch {
      onToast('ระบบบันทึกความสมดุลการทอนชำระเงินทางคลาวด์ขัดข้อง', 'err');
    }
  };

  const filteredReceipts = useMemo(() => {
    return receipts.filter(rec => {
      const matchSearch =
        rec.receipt_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rec.customer_name && rec.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchMethod = selectedMethod === 'All' || rec.payment_method === selectedMethod;
      return matchSearch && matchMethod;
    });
  }, [receipts, searchTerm, selectedMethod]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="receipt-module">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-150 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">Receipt Management (บันทึกรับเงิน / ออกใบเสร็จรับเงิน)</h2>
            <p className="text-xs text-slate-400 mt-1 font-medium font-sans">โมดูลที่ 8: บันทึกปิดรอบการชำระ ออกใบเสร็จรับเงินพร้อมใบกำกับภาษี จัดเรียงกลุ่มตรวจสอบงบดุล</p>
          </div>
        </div>
        {canModify && (
          <button
            onClick={handleOpenAddForm}
            className="flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-750 text-white font-bold py-2.5 px-5 rounded-xl transition-all cursor-pointer shadow-xs text-sm"
          >
            <Plus className="w-4 h-4" />
            ออกใบเสร็จรับเงินใหม่ / New Receipt
          </button>
        )}
      </div>

      {/* filter panel selection */}
      <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="ค้นหาตามเลขที่รับเงิน RE, ชื่อบริษัทคู่สัญญา หรือใบแจ้งหนี้ INV อ้างอิง..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="text-slate-400 w-4 h-4 shrink-0" />
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="w-full md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
          >
            <option value="All">ทุกช่องทางการโอน</option>
            <option value="Transfer">Transfer</option>
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
            <option value="Credit Card">Credit Card</option>
          </select>
        </div>
      </div>

      {/* Spreadsheet Tab simulation bar */}
      <div className="bg-[#f8f9fa] border border-slate-200 border-b-0 px-4 py-2 flex items-center justify-between text-xs select-none rounded-t-xl">
        <div className="flex items-center gap-3">
          <span className="font-medium bg-[#E8EAED] px-2.5 py-1 rounded border border-slate-200 text-slate-700 select-none">Sheet1</span>
          <span className="text-slate-400">|</span>
          <span className="font-mono font-semibold text-emerald-600">{filteredReceipts.length} แถว (Rows)</span>
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
                <th className="border border-slate-200 text-center w-48">D</th>
                <th className="border border-slate-200 text-center w-40">E</th>
                <th className="border border-slate-200 text-center w-36">F</th>
              </tr>
              {/* Header Columns inside the spreadsheet */}
              <tr className="bg-[#F8F9FA] border-b-2 border-slate-300 text-xs font-semibold text-slate-600">
                <th className="border border-slate-200 bg-[#E8EAED] text-center w-10 font-mono select-none"></th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700">หมายเลขใบรับเงิน</th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700">ผู้จ่ายเงิน / องค์กรที่ชำระ</th>
                <th className="border border-slate-200 px-3 py-2 text-right text-slate-700">ยอดรับเข้าสุทธิ</th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700">ประเภทจ่าย / ชำระเข้ามา</th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700">ลงวันชำระและประทับ RE</th>
                <th className="border border-slate-200 px-3 py-2 text-right text-slate-700">ปฏิบัติการ</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-700">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-xs border border-slate-200">
                    ไม่พบรายการบันทึกรับเงินของฝ่ายบัญชีและสถิติคลังโอนสิทธิ
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((rec, idx) => (
                  <tr 
                    key={rec.id} 
                    className={`hover:bg-blue-50/45 cursor-pointer transition-colors border-b border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]/70'}`}
                  >
                    {/* Index row background (spreadsheet numbering) */}
                    <td className="border border-slate-200 bg-[#F1F3F4] text-[#5f6368] text-center font-mono text-[10px] select-none py-1.5">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 font-mono font-bold text-slate-800">
                      {rec.receipt_no}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5">
                      <span className="font-extrabold text-slate-800 block">{rec.customer_name}</span>
                      <span className="text-xs text-slate-400 font-normal">อ้างอิงใบแจ้งหนี้: {rec.invoice_id}</span>
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 text-right font-extrabold text-purple-600">
                      ฿{rec.received_amount.toLocaleString()}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] border font-bold ${
                        rec.payment_method === 'Transfer' ? 'bg-indigo-50 border-indigo-150 text-indigo-700' :
                        rec.payment_method === 'Credit Card' ? 'bg-blue-50 border-blue-150 text-blue-700' :
                        rec.payment_method === 'Cash' ? 'bg-green-50 border-green-150 text-green-700' :
                        'bg-slate-50 border-slate-200 text-slate-700'
                      }`}>
                        {rec.payment_method}
                      </span>
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 text-slate-600 font-bold">
                      {rec.payment_date}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingReceipt(rec)}
                          title="ดูแบบฟอร์มปิดงบและพิมพ์"
                          className="p-1 text-slate-500 hover:text-purple-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {canModify && (
                          <button
                            onClick={() => handleOpenEditForm(rec)}
                            title="แก้ไขบันทึกยอดโอนเงิน"
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canDelete ? (
                          <button
                            onClick={async () => {
                              if (confirm(`คุณต้องการยกเลิกประวัติใบรับเงินแท็กซี่ฟลอร์นี้หรือไม่ ${rec.receipt_no}?`)) {
                                await onDelete(rec.id);
                                onToast('ถอนลบข้อมูลใบเสร็จรับเงินเสร็จสิ้นแล้ว', 'success');
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

      {/* Adding / Editing Modal form details */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-slide-up">
            <div className="bg-slate-50 p-6 border-b border-slate-150 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">
                  {editingReceipt ? `ปรับปรุงรายละเอียดรับปิดประวัติชำระเงิน: ${editingReceipt.receipt_no}` : 'บันทึกประมวลผลรับเงินเข้าและพิมพ์ประทับชำระ RE'}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">จัดแผนการบันทึกงบปิดสมานเครดิตการค้าของแคมเปญผู้ประสานงานหลัก</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded bg-white border border-slate-150">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Reference to Invoices */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">จับคู่ใบวางบิลค้างรับชำระเงิน (Invoice Ref) *</label>
                <select
                  required
                  value={invoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="">-- เลือกใบแจ้งหนี้เพื่อหักชำระ --</option>
                  {invoices.map(inv => (
                    <option key={inv.id} value={inv.id}>{inv.invoice_no} - (ยอดสะสม: ฿{inv.grand_total.toLocaleString()})</option>
                  ))}
                </select>
              </div>

              {/* Reference customer */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">บริษัทผู้จ่ายชำระภาษีหลัก</label>
                <select
                  required
                  disabled={true}
                  value={custId}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs cursor-not-allowed text-slate-500"
                >
                  <option value="">-- จะดึงชื่องานปลายโครงการชำระอัตโนมัติ --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.customer_name}</option>
                  ))}
                </select>
              </div>

              {/* Amounts and payment methods */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 font-sans">จำนวนเงินที่ได้รับล่วงหน้า (฿) *</label>
                  <input
                    type="number"
                    required
                    placeholder="ใส่จำนวนเงินที่ได้รับจริง"
                    value={receivedAmount || ''}
                    onChange={(e) => setReceivedAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-purple-500/25"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 font-sans">ประเภทการชำระเงินโอน</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="Transfer">Transfer (โอนเงินธนาคาร)</option>
                    <option value="Cash">Cash (เงินสดหน้างาน)</option>
                    <option value="Cheque">Cheque (เช็คการค้า)</option>
                    <option value="Credit Card">Credit Card (บัตรเครดิต)</option>
                  </select>
                </div>
              </div>

              {/* Payment dates */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">วันที่ตรวจพิจารณาชำระจริง / Receipt Date</label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-slate-50 border border-slate-200 text-slate-600 font-bold px-5 py-2 rounded-xl text-xs hover:bg-slate-100 transition-all font-sans"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 text-white font-bold px-5 py-2 rounded-xl text-xs hover:bg-purple-750 shadow-xs transition-behavior flex items-center gap-1.5 font-sans"
                >
                  <Check className="w-4 h-4" />
                  บันทึกปิดใบเสร็จ / Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visual professional Printed Receipt template preview modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-3xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in print:bg-white print:p-0 print:absolute animate-fade-in">
          <div className="bg-white rounded-2xl shadow-3xl w-full max-w-3xl overflow-hidden my-8 animate-scale-up print:shadow-none print:my-0 print:rounded-none">
            
            {/* Toolbar */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-150 flex items-center justify-between print:hidden">
              <span className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <Printer className="w-4.5 h-4.5 text-purple-600" />
                ใบเสร็จรับเงินแวตบิลเงินและใบกํากับภาษีอย่างย่อกากเดี่ยว ({viewingReceipt.receipt_no})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded-lg text-xs cursor-pointer flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  พิมพ์เอกสารใบกำกับ
                </button>
                <button onClick={() => setViewingReceipt(null)} className="p-1 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* printsheet */}
            <div className="p-8 md:p-12 space-y-8 font-sans bg-white print:p-0 text-slate-800">
              
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <h1 className="text-purple-600 font-extrabold text-2xl tracking-tight uppercase leading-none">RECEIPT / TAX INVOICE</h1>
                  <span className="text-xs text-slate-400 block mt-1">ใบเสร็จรับเงินประจำบิลค่านายหน้าและรวมเงินโครงการชำระอากร</span>
                  <div className="text-xs font-medium text-slate-700 mt-4 leading-relaxed font-mono">
                    <strong>บริษัท ควอลิที เทค แอนด์ เซอร์วิส จำกัด</strong><br />
                    1024/9 อาคารศูนย์ไอทีอาร์ สาทร พญาไท กรุงเทพมหานคร 10400<br />
                    สถิติเลขเสียอากรผู้ประกอบการค้า: 0105658091234
                  </div>
                </div>
                <div className="text-right space-y-1 text-xs">
                  <div className="text-[11px] font-bold text-slate-400">เลขส่งใบคุมรับ / RE Doc ID</div>
                  <div className="font-mono text-base font-extrabold text-slate-800">{viewingReceipt.receipt_no}</div>
                  <div className="text-[11px] font-bold text-slate-400 pt-2">รหัสสัญญารับบิลวางหนี้ / INV Reference Code</div>
                  <div className="font-mono text-xs font-bold text-slate-600">{invoices.find(v => v.id === viewingReceipt.invoice_id)?.invoice_no || 'N/A'}</div>
                  <div className="text-[11px] font-bold text-slate-400 pt-2">ลงวันพิจารณาชำระเด่น / Payment Date</div>
                  <div className="font-bold">{viewingReceipt.payment_date}</div>
                </div>
              </div>

              {/* Addresses section */}
              <div className="grid grid-cols-2 gap-8 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="text-[11px] uppercase font-bold text-slate-400 mb-1.5">บริษัทวิชาสัมพันธภาพชำระ / Debtor account payee:</div>
                  <div className="text-slate-800 font-extrabold text-sm">{viewingReceipt.customer_name}</div>
                  <div className="text-slate-500 mt-2 leading-relaxed">
                    ประจำตัวสำนักงานภาษี: {customers.find(c => c.id === viewingReceipt.customer_id)?.tax_id || '-'}<br />
                    ช่องทางยืนโอนของ: {viewingReceipt.payment_method || 'ผ่านระบบโอนผ่านเครือข่ายแอปธนาคาร'}<br />
                    ที่อยู่องค์กรจ่ายเงิน: {customers.find(c => c.id === viewingReceipt.customer_id)?.address || '-'}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <div className="text-[11px] uppercase font-bold text-slate-400 mb-1">ข้อมูลคัดลงรายงานรายรับผู้บริโภค / Treasury ledger info:</div>
                  <div className="text-xs text-slate-700 font-bold leading-normal">
                    การทำธุรกรรมลงบันทึกรับเงินปิดดีลมูลชำระอากร ได้ประมวลผลรับสุทธิลงรายงานสถิติบัญชีรายวันหน้างานแล้ว
                    สปอตใบกำกับฉบับนี้ส่งมอบลูกค้าอย่างเป็นสิตเพื่อเป็นส่วนลดหักตารางลดหย่อนภาษี
                  </div>
                </div>
              </div>

              {/* pricing table listing */}
              <table className="w-full text-xs text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-600 animate-pulse">
                    <th className="px-4 py-2.5">รายการลักษณะโครงการค่านายหน้างบคลัง / Completed Deliverables</th>
                    <th className="px-4 py-2.5 text-right w-44">จำนวนเงินที่หักรับแล้วสำเร็จ (฿)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                  <tr>
                    <td className="px-4 py-4">
                      <span className="font-extrabold text-slate-800 block">ปิดงบชำระอ้างอิงรหัสใบวางตรวจรับบิลหักหนี้ {viewingReceipt.invoice_id}</span>
                      <span className="text-[10px] text-slate-400 block mt-1 font-normal">สิทธิยืนยันการรับเงินค่าปฏิบัติงานซ่อมติดตั้งระบบโครงสร้างวิศวกรโรงงานแบบครบวงจร</span>
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-purple-700 font-bold">฿{viewingReceipt.received_amount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              {/* Summary table */}
              <div className="flex justify-between items-start text-xs pt-4">
                <div className="max-w-md text-emerald-600 font-extrabold flex items-center gap-1.5 bg-emerald-50 border border-emerald-150 p-2.5 rounded-xl">
                  <Check className="w-4.5 h-4.5 text-emerald-600" />
                  <span>ประทับตราอนุมัติปิดสลิปยืนชำระ [PAID FULL - ได้รับชำระเงินเต็มจำนวนแล้ว]</span>
                </div>
                <div className="w-64 space-y-1.5 border-t border-slate-200 pt-3 font-semibold">
                  <div className="flex justify-between text-slate-500">
                    <span>ยอดรับชำระสุทธิก่อนอากร:</span>
                    <span>฿{Math.round(viewingReceipt.received_amount / 1.07).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>ยอดหักภาษีรับฝากสะสม (7%):</span>
                    <span>฿{Math.round((viewingReceipt.received_amount / 1.07) * 0.07).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-purple-600 font-extrabold text-sm">
                    <span>ยอดสุทธิที่ปิดบิลสำเร็จ / Received Total:</span>
                    <span className="font-mono text-base">฿{viewingReceipt.received_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Signature lines */}
              <div className="grid grid-cols-2 gap-12 pt-20 text-center text-xs">
                <div className="space-y-12">
                  <span className="text-slate-400 font-medium block">พนักงานผู้มีหน้าที่รับเงิน / Received and Approved By:</span>
                  <div className="border-b border-slate-300 w-48 mx-auto pb-1 text-slate-700 font-semibold font-sans">
                    ( ทีมวางแผนและประมวลรายรับบัญชี )
                  </div>
                  <span className="text-[10px] text-slate-400 block">วันที่ประทับตรา / Date: ............................................</span>
                </div>
                <div className="space-y-12">
                  <span className="text-slate-400 font-medium block">พัสดุตราสัญญารับมอบกลับไป / Client Payee:</span>
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
