import React, { useState, useMemo } from 'react';
import { Customer, SalesOrder, Invoice, UserRole, InvoiceItem } from '../types';
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  Printer, 
  Edit2, 
  Check, 
  AlertCircle, 
  Calendar, 
  X, 
  Coins, 
  TrendingUp, 
  FileCheck, 
  Clock, 
  Settings, 
  ChevronRight, 
  DollarSign, 
  Trash, 
  FileText,
  Lock
} from 'lucide-react';

interface InvoiceViewProps {
  invoices: Invoice[];
  salesOrders: SalesOrder[];
  customers: Customer[];
  onAdd: (payload: any) => Promise<any>;
  onUpdate: (id: string, updates: any) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
  onToast: (msg: string, type: 'success' | 'err') => void;
  currentRole: UserRole;
  currentUserId: string;
}

export default function InvoiceView({
  invoices,
  salesOrders,
  customers,
  onAdd,
  onUpdate,
  onDelete,
  onToast,
  currentRole,
  currentUserId
}: InvoiceViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // Document Toggle Controls for professional PRINT template
  const [printDocType, setPrintDocType] = useState<'INVOICE / TAX INVOICE' | 'INVOICE' | 'DEBIT NOTE'>('INVOICE / TAX INVOICE');
  const [printWatermark, setPrintWatermark] = useState<'ORIGINAL' | 'COPY'>('ORIGINAL');

  // Form State
  const [soId, setSoId] = useState('');
  const [custId, setCustId] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [status, setStatus] = useState<'Unpaid' | 'Overdue' | 'Paid' | 'Partially Paid'>('Unpaid');
  const [referencePo, setReferencePo] = useState('');
  const [remarks, setRemarks] = useState('');
  
  // Custom multi-item list state
  const [invoiceItems, setInvoiceItems] = useState<Omit<InvoiceItem, 'id'>[]>([
    { item_no: 1, description: '', quantity: 1, unit_price: 0, tax_rate: 7, amount: 0 }
  ]);

  const canModify = currentRole !== 'Management';
  const canDelete = currentRole === 'Admin' || currentRole === 'System Administrator';

  // Calculate stats for AdminLTE 4 widgets
  const stats = useMemo(() => {
    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalUnpaid = 0;
    let totalOverdue = 0;

    invoices.forEach(inv => {
      totalInvoiced += inv.grand_total || inv.total_amount;
      if (inv.status === 'Paid') {
        totalPaid += inv.grand_total || inv.total_amount;
      } else if (inv.status === 'Unpaid' || inv.status === 'Partially Paid') {
        totalUnpaid += inv.grand_total || inv.total_amount;
      } else if (inv.status === 'Overdue') {
        totalOverdue += inv.grand_total || inv.total_amount;
      }
    });

    return { totalInvoiced, totalPaid, totalUnpaid, totalOverdue };
  }, [invoices]);

  // Handle Sales Order Selection
  const handleSOChange = (id: string) => {
    setSoId(id);
    const so = salesOrders.find(item => item.id === id);
    if (so) {
      setCustId(so.customer_id);
      
      if (so.items && so.items.length > 0) {
        setInvoiceItems(so.items.map(it => ({
          item_no: it.item_no,
          description: it.description,
          quantity: it.remaining_qty,
          unit_price: it.unit_price,
          tax_rate: 7,
          amount: it.remaining_qty * it.unit_price
        })));
      } else {
        // Attempt to construct realistic items
        setInvoiceItems([
          {
            item_no: 1,
            description: `Service fee & project execution for "${so.project_name}"\nContract Ref: ${so.so_no}`,
            quantity: 1,
            unit_price: so.total_amount,
            tax_rate: 7,
            amount: so.total_amount
          }
        ]);
      }
    }
  };

  // Line Item actions
  const handleAddItemRow = () => {
    setInvoiceItems(prev => [
      ...prev,
      {
        item_no: prev.length + 1,
        description: '',
        quantity: 1,
        unit_price: 0,
        tax_rate: 7,
        amount: 0
      }
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (invoiceItems.length === 1) {
      onToast('ส่วนขยายบิลต้องมีรายการทำงานอย่างน้อย 1 รายการ', 'err');
      return;
    }
    const updated = invoiceItems.filter((_, idx) => idx !== index).map((item, idx) => ({
      ...item,
      item_no: idx + 1
    }));
    setInvoiceItems(updated);
  };

  const handleItemFieldChange = (index: number, field: keyof Omit<InvoiceItem, 'id'>, value: any) => {
    const updated = [...invoiceItems];
    const item = { ...updated[index] };

    if (field === 'description') {
      item.description = value;
    } else if (field === 'quantity') {
      item.quantity = Number(value) || 1;
    } else if (field === 'unit_price') {
      item.unit_price = Number(value) || 0;
    } else if (field === 'tax_rate') {
      item.tax_rate = Number(value) || 0;
    }

    item.amount = item.quantity * item.unit_price;
    updated[index] = item;
    setInvoiceItems(updated);
  };

  // Aggregate subtotal, tax and total based on item rows
  const calculatedFormTotals = useMemo(() => {
    const total_amount = invoiceItems.reduce((acc, item) => acc + item.amount, 0);
    // For simplicity we assume 7% tax from row rate
    const vat_amount = Math.round(total_amount * 0.07);
    const grand_total = total_amount + vat_amount;
    return { total_amount, vat_amount, grand_total };
  }, [invoiceItems]);

  const handleOpenAddForm = () => {
    setEditingInvoice(null);
    setSoId('');
    setCustId('');
    setReferencePo('');
    setRemarks('');
    setIssueDate(new Date().toISOString().split('T')[0]);
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setDueDate(d.toISOString().split('T')[0]);
    setStatus('Unpaid');
    setInvoiceItems([
      { item_no: 1, description: '', quantity: 1, unit_price: 0, tax_rate: 7, amount: 0 }
    ]);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (inv: Invoice) => {
    setEditingInvoice(inv);
    setSoId(inv.sales_order_id);
    setCustId(inv.customer_id);
    setIssueDate(inv.issue_date);
    setDueDate(inv.due_date);
    setStatus(inv.status);
    setReferencePo((inv as any).reference_po || '');
    setRemarks((inv as any).remarks || '');
    
    if (inv.items && inv.items.length > 0) {
      setInvoiceItems(inv.items.map(item => ({
        item_no: item.item_no,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate,
        amount: item.amount
      })));
    } else {
      setInvoiceItems([
        {
          item_no: 1,
          description: `Contract Services for: ${inv.customer_name}`,
          quantity: 1,
          unit_price: inv.total_amount,
          tax_rate: 7,
          amount: inv.total_amount
        }
      ]);
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custId) {
      onToast('กรุณาระบุบริษัทลูกค้าผู้ร่วมทำสัญญา', 'err');
      return;
    }

    if (invoiceItems.some(i => !i.description.trim() || i.unit_price <= 0)) {
      onToast('กรุณากรอกรายละเอียดสินค้า/บริการหลักคู่สัญญาค้า และราคาต่อหน่วยให้มากกว่า 0', 'err');
      return;
    }

    // Validate remaining quantities if linked to Sales Order
    let partialInvoiceMsg = '';
    if (soId) {
      const so = salesOrders.find(item => item.id === soId);
      if (so && so.items && so.items.length > 0) {
        for (const invItem of invoiceItems) {
          const targetSOItem = so.items.find(si => si.item_no === invItem.item_no || si.description === invItem.description || si.description.includes(invItem.description) || invItem.description.includes(si.description));
          if (targetSOItem) {
            // Calculate max allowed
            let maxAllowedQty = targetSOItem.remaining_qty;
            if (editingInvoice) {
              const previousMatchedItem = editingInvoice.items?.find(ei => ei.item_no === targetSOItem.item_no || ei.description === targetSOItem.description);
              if (previousMatchedItem) {
                maxAllowedQty += previousMatchedItem.quantity;
              }
            }
            if (invItem.quantity > maxAllowedQty) {
              onToast(`ไม่สามารถออก Invoice ได้เกินยอดคงเหลือ (ยอดคงเหลือ ${maxAllowedQty} ${targetSOItem.unit})`, 'err');
              return;
            }
            const finalRem = maxAllowedQty - invItem.quantity;
            if (finalRem > 0) {
              partialInvoiceMsg = `สร้าง Invoice สำเร็จ ยอดคงเหลือ ${finalRem} ${targetSOItem.unit} สามารถออก Invoice ส่วนที่เหลือได้ในภายหลัง`;
            }
          }
        }
      }
    }

    const { total_amount, vat_amount, grand_total } = calculatedFormTotals;

    // Attach local unique IDs to form items to match backend InvoiceItem schema
    const formattedItems: InvoiceItem[] = invoiceItems.map((item, idx) => ({
      ...item,
      id: `invi_${Date.now()}_${idx}`
    }));

    const payload = {
      sales_order_id: soId,
      customer_id: custId,
      total_amount,
      vat_amount,
      grand_total,
      status,
      issue_date: issueDate,
      due_date: dueDate,
      reference_po: referencePo,
      remarks,
      items: formattedItems
    };

    try {
      if (editingInvoice) {
        await onUpdate(editingInvoice.id, payload);
        onToast(partialInvoiceMsg || `ประสานแก้ไขข้อมูลในใบแจ้งหนี้แบบสรุป (${editingInvoice.invoice_no}) เรียบร้อย`, 'success');
      } else {
        await onAdd(payload);
        onToast(partialInvoiceMsg || `ออกใบแจ้งหนี้ต้นฉบับระบบและบันทึกค้างกองทุนสำเร็จ`, 'success');
      }
      setIsFormOpen(false);
    } catch {
      onToast('เกิดข้อผิดพลาดในการติดต่อกับเซิร์ฟเวอร์ โปรดลองใหม่อีกครั้ง', 'err');
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch =
        inv.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.customer_name && inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ((inv as any).reference_po && (inv as any).reference_po.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = selectedStatus === 'All' || inv.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [invoices, searchTerm, selectedStatus]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans text-slate-800" id="invoice-module">
      
      {/* Title Header / Breadcrumb - AdminLTE 4 Clean Styled */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 bg-white rounded-xl border border-slate-200/80 shadow-xs gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>HOME</span>
            <ChevronRight className="w-3 h-3 text-slate-350" />
            <span>FINANCES</span>
            <ChevronRight className="w-3 h-3 text-slate-350" />
            <span className="text-amber-600 font-extrabold">INVOICES</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            Invoice Management
            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">ระบบวางบิลค้างรับ</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">บริหารจัดการแจ้งหนี้ วางกำหนดเรียกเก็บเงิน ตรวจสอบสถานะลูกหนี้การค้า IKM Testing</p>
        </div>
        
        {canModify && (
          <button
            onClick={handleOpenAddForm}
            className="flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm py-3 px-6 rounded-xl transition-all cursor-pointer shadow-md shadow-rose-600/10 hover:-translate-y-0.5 duration-200"
          >
            <Plus className="w-4 h-4" />
            ออกใบวางบิลชุดใหม่ / New Invoice
          </button>
        )}
      </div>

      {/* AdminLTE v4 Small Box Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Widget 1: Total Invoiced */}
        <div className="relative overflow-hidden bg-white rounded-xl border-l-[5px] border-blue-500 border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all group duration-250">
          <div className="space-y-1">
            <span className="text-xs font-black text-slate-400 tracking-widest uppercase block">Total Invoiced Amount</span>
            <div className="text-xl font-black text-slate-900 font-mono tracking-tight group-hover:text-blue-600 transition-colors">
              ฿{stats.totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-slate-400 font-bold">รวมฐานภาษีและ VAT 7% ของใบแจ้งหนี้ทั้งหมด</p>
          </div>
          <Coins className="absolute top-4 right-4 w-12 h-12 text-blue-100 group-hover:scale-110 group-hover:text-blue-200 transition-all duration-300 pointer-events-none" />
        </div>

        {/* Widget 2: Collected (Paid) */}
        <div className="relative overflow-hidden bg-white rounded-xl border-l-[5px] border-emerald-500 border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all group duration-250">
          <div className="space-y-1">
            <span className="text-xs font-black text-slate-400 tracking-widest uppercase block">Collected Cash (Paid)</span>
            <div className="text-xl font-black text-slate-900 font-mono tracking-tight group-hover:text-emerald-600 transition-colors">
              ฿{stats.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-slate-400 font-bold">ยอดเงินสดที่ทำการตัดรับเงินบิล (Check In) แล้ว</p>
          </div>
          <FileCheck className="absolute top-4 right-4 w-12 h-12 text-emerald-100 group-hover:scale-110 group-hover:text-emerald-200 transition-all duration-300 pointer-events-none" />
        </div>

        {/* Widget 3: Unpaid Accounts */}
        <div className="relative overflow-hidden bg-white rounded-xl border-l-[5px] border-amber-500 border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all group duration-250">
          <div className="space-y-1">
            <span className="text-xs font-black text-slate-400 tracking-widest uppercase block">Pending Collections</span>
            <div className="text-xl font-black text-slate-900 font-mono tracking-tight group-hover:text-amber-600 transition-colors">
              ฿{stats.totalUnpaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-slate-400 font-bold">ใบแจ้งหนี้ทวงถามที่ยังรอการชำระเงินตามดิวดีล</p>
          </div>
          <Clock className="absolute top-4 right-4 w-12 h-12 text-amber-100 group-hover:scale-110 group-hover:text-amber-200 transition-all duration-300 pointer-events-none" />
        </div>

        {/* Widget 4: Overdue Debt */}
        <div className="relative overflow-hidden bg-white rounded-xl border-l-[5px] border-rose-500 border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all group duration-250">
          <div className="space-y-1">
            <span className="text-xs font-black text-slate-400 tracking-widest uppercase block">Overdue Outstanding</span>
            <div className="text-xl font-black text-slate-900 font-mono tracking-tight group-hover:text-rose-600 transition-colors">
              ฿{stats.totalOverdue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-rose-500 font-extrabold flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
              ประเมินเสี่ยงการเรียกชำระล่าช้า (Over 30+ Days)
            </p>
          </div>
          <AlertCircle className="absolute top-4 right-4 w-12 h-12 text-rose-100 group-hover:scale-110 group-hover:text-rose-200 transition-all duration-300 pointer-events-none" />
        </div>

      </div>

      {/* Filter / Search Panel styled like AdminLTE Card Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="ค้นหาใบแจ้งหนี้อิงรหัสอ้างอิง PO, ชื่อบริษัทลูกค้าองค์กร หรือหมายเลข INV..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/15 focus:border-amber-500 transition-all font-medium text-slate-800"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <Filter className="text-slate-400 w-4 h-4" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full md:w-56 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/15 focus:border-amber-500 cursor-pointer font-extrabold text-slate-700"
          >
            <option value="All">ทุกระดับสถานะยอดชำระ / All Status</option>
            <option value="Unpaid">Unpaid (ยังไม่ชำระ)</option>
            <option value="Overdue">Overdue (ค้างชำระเกินกำหนด)</option>
            <option value="Paid">Paid (ชำระภาษีเงินได้เสร็จสิ้น)</option>
            <option value="Partially Paid">Partially Paid (ชำระบางส่วน)</option>
          </select>
        </div>
      </div>

      {/* Spreadsheet Tab simulation bar */}
      <div className="bg-[#f8f9fa] border border-slate-200 border-b-0 px-4 py-2 flex items-center justify-between text-xs select-none rounded-t-xl">
        <div className="flex items-center gap-3">
          <span className="font-medium bg-[#E8EAED] px-2.5 py-1 rounded border border-slate-200 text-slate-700 select-none">Sheet1</span>
          <span className="text-slate-400">|</span>
          <span className="font-mono font-semibold text-emerald-600">{filteredInvoices.length} แถว (Rows)</span>
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
                <th className="border border-slate-200 text-center w-36">C</th>
                <th className="border border-slate-200 text-center w-36">D</th>
                <th className="border border-slate-200 text-center w-40">E</th>
                <th className="border border-slate-200 text-center w-44">F</th>
                <th className="border border-slate-200 text-center w-32">G</th>
                <th className="border border-slate-200 text-center w-36">H</th>
              </tr>
              {/* Header Columns inside the spreadsheet */}
              <tr className="bg-[#F8F9FA] border-b-2 border-slate-300 text-xs font-semibold text-slate-600">
                <th className="border border-slate-200 bg-[#E8EAED] text-center w-10 font-mono select-none"></th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700">Doc Number</th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700">Client Enterprise</th>
                <th className="border border-slate-200 px-3 py-2 text-right text-slate-700">Subtotal</th>
                <th className="border border-slate-200 px-3 py-2 text-right text-slate-700">Tax (VAT 7%)</th>
                <th className="border border-slate-200 px-3 py-2 text-right text-rose-600 font-extrabold">Grand Total</th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700">Terms (Issue / Term Ends)</th>
                <th className="border border-slate-200 px-3 py-2 text-center text-slate-700">Status Badge</th>
                <th className="border border-slate-200 px-3 py-2 text-right text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-14 text-slate-400 font-medium border border-slate-200">
                    ไม่พบทะเบียนข้อมูลใบวางบิลหรือใบแจ้งหนี้ค้างชำระสรรพากร
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv, idx) => (
                  <tr 
                    key={inv.id} 
                    className={`hover:bg-blue-50/45 cursor-pointer transition-colors border-b border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]/70'}`}
                  >
                    {/* Index row background (spreadsheet numbering) */}
                    <td className="border border-slate-200 bg-[#F1F3F4] text-[#5f6368] text-center font-mono text-[10px] select-none py-1.5">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 font-mono text-rose-600 font-bold truncate">
                      {inv.invoice_no}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5">
                      <span className="font-black text-slate-900 block text-xs">{inv.customer_name}</span>
                      <span className="text-[10px] text-slate-400 font-medium block">Job SO Ref: {inv.sales_order_id}</span>
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 text-right font-mono text-slate-600 font-bold">
                      ฿{inv.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 text-right font-mono text-slate-500">
                      ฿{inv.vat_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 text-right font-mono font-bold text-rose-600">
                      ฿{inv.grand_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5">
                      <div className="text-slate-700 font-bold">Issued: {inv.issue_date}</div>
                      <div className="text-emerald-600 font-extrabold mt-0.5">Due: {inv.due_date}</div>
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black tracking-wide ${
                        inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        inv.status === 'Partially Paid' ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' :
                        inv.status === 'Unpaid' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        'bg-rose-50 text-rose-800 border border-rose-200 animate-pulse'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingInvoice(inv)}
                          title="พรีวิวโมเดลพิมพ์จริง / Print Preview"
                          className="p-1 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {canModify && (
                          <button
                            onClick={() => handleOpenEditForm(inv)}
                            title="สิทธิอัปเดต / Edit Invoice"
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canDelete ? (
                          <button
                            onClick={async () => {
                              if (confirm(`คลังกระทรวงยืนยันยกเลิกใบเรียกวางบิล ${inv.invoice_no} ใช่หรือไม่?`)) {
                                await onDelete(inv.id);
                                onToast('ถอนใบแจ้งหนี้เสร็จแก้ไขฐานเรียบร้อย', 'success');
                              }
                            }}
                            title="ลบทิ้ง"
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

      {/* Advanced Full Multi-Item Form Modal (AdminLTE Look with pristine borders) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-3xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl w-full max-w-4xl overflow-hidden my-6 animate-scale-up border-t-8 border-rose-600 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4.5 border-b border-slate-250 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  {editingInvoice ? `Edit Tax Invoice: ${editingInvoice.invoice_no}` : 'อนุมัติออกใบวางบิลเรียกเก็บเงินใหม่ / Issue Tax Invoice'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">กรอกคลังข้อมูลสัญญาเรียกรับเงิน ลูกค้าผู้ซื้ออุตสาหกรรมในสังกัด</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg bg-white border border-slate-200">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              
              {/* Part 1: Contract References */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <h4 className="text-xs font-black tracking-wider text-slate-400 uppercase mb-2">1. ข้อมูลสัญญาสั่งจ้าง / ORDER DEED CODES</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select Sales Order */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">อ้างอิงใบสั่งขาย SO (Sales Order Ref) *</label>
                    <select
                      required
                      value={soId}
                      onChange={(e) => handleSOChange(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-600 font-semibold"
                    >
                      <option value="">-- กรุณาเลือกใบสัญญาจ้างผลิตที่อนุมัติแล้ว --</option>
                      {salesOrders.map(so => (
                        <option key={so.id} value={so.id}>{so.so_no} - {so.project_name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Disable customer auto select */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">บริษัทคู่สัญญา (Auto Customer Mapping)</label>
                    <select
                      required
                      disabled
                      value={custId}
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 cursor-not-allowed"
                    >
                      <option value="">-- จะดึงรายชื่อลูกค้าวิเคราะห์สัญญากรณีระบุ SO --</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.customer_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* PO number reference */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">เลขที่ออกใบสั่งซื้ออ้างอิงลูกค้า (PO / Reference No.)</label>
                    <input
                      type="text"
                      placeholder="เช่น PO-007441/2026 หรือ PO9871"
                      value={referencePo}
                      onChange={(e) => setReferencePo(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono font-bold focus:outline-none focus:border-rose-600"
                    />
                  </div>

                  {/* Status selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">สถานะคิวรอบจัดส่งบิล (Payment Status)</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm cursor-pointer font-bold focus:outline-none"
                    >
                      <option value="Unpaid">Unpaid (ยังไม่ชำระ)</option>
                      <option value="Overdue">Overdue (เลยพ้นกำหนดชำระ)</option>
                      <option value="Paid">Paid (เครดิตตัดเงินเสร็จสิ้น)</option>
                      <option value="Partially Paid">Partially Paid (ชำระมัดจำบางส่วน)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Part 2: Dynamic Multi-item spreadsheet */}
              <div className="border border-slate-200 rounded-xl overflow-hidden p-4 space-y-4 bg-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-black tracking-wider text-slate-400 uppercase">2. รายการคำนวณภาษีด้านใน / ITEMIZED INVOICE LINES</h4>
                    <p className="text-[10px] text-slate-400">กรอกแยกจำลองแถวการผลิต อะไหล่ ค่าบริการ หรือค่าแทรกคีย์บริการ</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="flex items-center gap-1 bg-slate-900 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    เพิ่มแถว / Add Line Item
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-[11px] text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 font-bold uppercase text-slate-600">
                        <th className="px-3 py-2 text-center w-12">ลำดับ</th>
                        <th className="px-3 py-2">คำอธิบายงาน / Description *</th>
                        <th className="px-3 py-2 text-center w-16">จำนวน *</th>
                        <th className="px-3 py-2 text-center w-16">หน่วย *</th>
                        <th className="px-3 py-2 text-right w-28">ราคา/หน่วย (THB) *</th>
                        <th className="px-3 py-2 text-right w-32">จำนวนเงินสะสม</th>
                        <th className="px-3 py-2 text-center w-12">ลบ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {invoiceItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-3 py-2 text-center font-mono font-bold text-slate-400">
                            {item.item_no}
                          </td>
                          <td className="px-3 py-2">
                            <textarea
                              rows={2}
                              required
                              placeholder="เช่น (3000650001) ค่าบริการบริการงานล้างและทำความสะอาด..."
                              value={item.description}
                              onChange={(e) => handleItemFieldChange(idx, 'description', e.target.value)}
                              className="w-full border border-slate-200 bg-white rounded p-1 text-[11px] focus:outline-none focus:border-rose-600 font-medium"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              required
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemFieldChange(idx, 'quantity', e.target.value)}
                              className="w-full border border-slate-200 bg-white rounded p-1 text-center font-mono focus:outline-none"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              required
                              placeholder="เช่น Job, Set"
                              value={item.unit || 'Job'}
                              onChange={(e) => handleItemFieldChange(idx, 'unit' as any, e.target.value)}
                              className="w-full border border-slate-200 bg-white rounded p-1 text-center focus:outline-none"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              required
                              min="0"
                              placeholder="0.00"
                              value={item.unit_rate !== undefined ? item.unit_rate : (item as any).unit_price}
                              onChange={(e) => handleItemFieldChange(idx, 'unit_price', e.target.value)}
                              className="w-full border border-slate-200 bg-white rounded p-1 text-right font-mono font-bold focus:outline-none"
                            />
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-extrabold text-slate-900">
                            ฿{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItemRow(idx)}
                              className="p-1 text-slate-350 hover:text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Sub Total, VAT, Grand totals inside create/edit */}
                <div className="flex justify-end">
                  <div className="w-72 space-y-2 border border-slate-200 p-4 rounded-xl bg-slate-50 text-[11px]">
                    <div className="flex justify-between font-bold text-slate-500">
                      <span>ยอดสุทธิไม่มีภาษี (Subtotal):</span>
                      <span className="font-mono text-slate-800">฿{calculatedFormTotals.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-500">
                      <span>ภาษีมูลค่าเพิ่ม VAT 7%:</span>
                      <span className="font-mono text-slate-800">฿{calculatedFormTotals.vat_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 font-black text-rose-600 text-xs">
                      <span>ยอดสุทธิใบแจ้งหนี้ (Total Due):</span>
                      <span className="font-mono">฿{calculatedFormTotals.grand_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Part 3: Secondary Terms */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <h4 className="text-xs font-black tracking-wider text-slate-400 uppercase mb-2">3. สัญญาเครดิตเทอม / TERMS & DUAL DATES</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">วันที่เริ่มออกใบแจ้ง (Issue Date) *</label>
                    <input
                      type="date"
                      required
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">วันที่ครบกำหนดตัดเงินเครดิต (Due Date) *</label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">หมายเหตุเพิ่มเติมท้ายกระดาษ (Remarks / Bank Transfer descriptions)</label>
                  <textarea
                    rows={2}
                    placeholder="ระบุข้อกำหนดเครดิตเพิ่ม หรือเงื่อนไขหัก ณ ที่จ่าย 3% 5%"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-medium focus:outline-none focus:border-rose-600"
                  />
                </div>
              </div>

              {/* Form Action Controls */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-slate-100 border border-slate-250 text-slate-600 hover:bg-slate-200 font-extrabold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  ออกภายนอก
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 text-white font-extrabold px-6 py-2.5 rounded-xl hover:bg-rose-700 shadow-md shadow-rose-600/10 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {editingInvoice ? 'อัปเดตบันทึก / Save Updates' : 'ออกใบวางบิลเรียกเก็บ / Issue Invoice'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Visual professional Printed Tax Invoice template modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-3xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in print:bg-white print:p-0 print:absolute">
          <div className="bg-white rounded-2xl shadow-3xl w-full max-w-4xl overflow-hidden my-8 animate-scale-up print:shadow-none print:my-0 print:rounded-none">
            
            {/* Control header with real watermarks and copy options */}
            <div className="bg-slate-900 px-6 py-4 border-b border-slate-850 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
              <span className="text-sm font-black text-white flex items-center gap-1.5 font-sans">
                <FileText className="w-5 h-5 text-rose-500 animate-pulse" />
                ใบแจ้งหนี้ / ใบกำกับภาษีต้นฉบับ ({viewingInvoice.invoice_no})
              </span>
              
              {/* Document Option toggles */}
              <div className="flex flex-wrap items-center gap-2.5">
                
                {/* Doc Type Selector */}
                <div className="bg-slate-850 p-1 rounded-lg flex items-center gap-1.5 border border-slate-700">
                  <span className="text-[10px] text-slate-450 font-bold px-1.5">DOC TYPE:</span>
                  {(['INVOICE / TAX INVOICE', 'INVOICE', 'DEBIT NOTE'] as const).map(dt => (
                    <button
                      key={dt}
                      type="button"
                      onClick={() => setPrintDocType(dt)}
                      className={`text-[10px] px-2 py-1 rounded font-bold transition-all cursor-pointer ${
                        printDocType === dt ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {dt}
                    </button>
                  ))}
                </div>

                {/* Original or Copy toggle */}
                <div className="bg-slate-850 p-1 rounded-lg flex items-center gap-1.5 border border-slate-700">
                  <span className="text-[10px] text-slate-450 font-bold px-1.5">STAMP:</span>
                  {(['ORIGINAL', 'COPY'] as const).map(wt => (
                    <button
                      key={wt}
                      type="button"
                      onClick={() => setPrintWatermark(wt)}
                      className={`text-[10px] px-2 py-1 rounded font-bold transition-all cursor-pointer ${
                        printWatermark === wt ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:bg-slate-800'
                      }`}
                      style={{ backgroundColor: printWatermark === wt ? '#f59e0b' : '' }}
                    >
                      {wt}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handlePrint}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2 px-4.5 rounded-lg text-xs cursor-pointer flex items-center gap-1 shadow-md shadow-blue-500/10"
                >
                  <Printer className="w-4 h-4" />
                  พิมพ์ / Print PDF
                </button>
                <button onClick={() => setViewingInvoice(null)} className="p-2 bg-slate-800 border border-slate-700 text-slate-400 hover:text-white rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Print Sheet: Pixel Perfect IKM Testing PDF perfectly */}
            <div className="bg-white print:p-0 print:m-0 text-black font-sans w-[210mm] min-h-[297mm] mx-auto relative select-none" style={{ fontFamily: 'Arial, sans-serif' }}>
              <div className="p-10 md:p-10 w-full h-full pb-20">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  {/* Left Header */}
                  <div>
                    <h1 className="text-[19px] font-normal tracking-wide uppercase mb-2 text-black leading-none">IKM TESTING (THAILAND) CO.,LTD.</h1>
                    <div className="text-[12px] leading-snug font-normal text-black">
                      <span className="block mb-0.5">155/167 Moo 5, Samnakthon Sub-district,</span>
                      <span className="block mb-0.5">Banchang District, Rayong Province 21130</span>
                      <span className="block mb-0.5">Thailand</span>
                      <span className="block mb-2">Tel : +66(0) 38 601 996-7</span>
                      
                      <span className="block mt-4 mb-0.5">Tax ID Number : 0215552000909</span>
                      <span className="block">Head Office</span>
                    </div>
                  </div>
                  
                  {/* Right Header */}
                  <div className="flex flex-col items-end pr-2 pt-1">
                    <div className="text-[#e21836] text-[22px] font-bold tracking-wider mb-2">{printWatermark === 'ORIGINAL' ? 'ORIGINAL' : printWatermark}</div>
                    <img src="https://drive.google.com/uc?export=view&id=1u2v-GT6YDaWZZoravixstbtyQkvudkbw" alt="IKM Logo" className="h-14 w-auto object-contain mr-2 mb-2" referrerPolicy="no-referrer" />
                    <div className="text-[#e21836] text-[19px] font-bold tracking-wider mr-2 mt-4">INVOICE / TAX INVOICE</div>
                  </div>
                </div>

                {/* Customer and Invoice Details Section */}
                <div className="mt-1 flex h-[140px]" style={{ border: '1px solid black', borderRadius: '0px' }}>
                  {/* Left Box (Customer) */}
                  <div className="w-[58%] p-3 relative h-full flex flex-col justify-between" style={{ borderRight: '1px solid black', borderRadius: '0px' }}>
                    <div>
                      <div className="text-[12.5px] mb-3 text-black">Invoice to :</div>
                      <div className="text-[12.5px] text-black">
                        {viewingInvoice.customer_name} {viewingInvoice.customer_name.toLowerCase().includes('head office') ? '' : '(Head Office)'}
                      </div>
                      <div className="text-[12.5px] leading-snug mt-1 max-w-[90%] break-words break-all whitespace-pre-wrap uppercase text-black">
                        {customers.find(c => c.id === viewingInvoice.customer_id)?.address || '-'}
                      </div>
                    </div>
                    <div className="text-[12.5px] leading-none text-black absolute bottom-3 left-3">
                      Tax ID Number {customers.find(c => c.id === viewingInvoice.customer_id)?.tax_id || '-'}
                    </div>
                  </div>

                  {/* Right Box (Invoice details) */}
                  <div className="w-[42%] p-3 relative h-full">
                    <div className="text-[12.5px] leading-snug flex items-center mb-1 text-black">
                      <span className="font-bold w-[130px]">Invoice Date</span> <span className="font-bold mr-1">:</span> {viewingInvoice.issue_date}
                    </div>
                    <div className="text-[12.5px] leading-snug flex items-center mb-5 text-black">
                      <span className="font-bold w-[130px]">Due Date</span> <span className="font-bold mr-1">:</span> {viewingInvoice.due_date}
                    </div>
                    
                    <div className="text-[12.5px] leading-snug flex items-center mb-5 text-black">
                      <span className="font-bold w-[130px]">Invoice Number</span> <span className="font-bold mr-1">:</span> {viewingInvoice.invoice_no}
                    </div>

                    <div className="text-[12.5px] font-bold leading-none mb-1 text-black">Reference</div>
                    <div className="text-[12.5px] leading-none text-black">{(viewingInvoice as any).reference_po || '-'}</div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mt-[20px]">
                  <table className="w-full text-[12.5px] border-collapse" style={{ tableLayout: 'fixed' }}>
                    <thead>
                      <tr className="border-y-[1.5px] border-black text-black">
                        <th className="py-2.5 text-left font-bold w-[46%] pl-1">Description</th>
                        <th className="py-2.5 text-center font-bold w-[12%]">Quantity</th>
                        <th className="py-2.5 text-center font-bold w-[15%]">Unit Price</th>
                        <th className="py-2.5 text-center font-bold w-[10%]">Tax</th>
                        <th className="py-2.5 text-right font-bold w-[17%] pr-1">Amount THB</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingInvoice.items && viewingInvoice.items.length > 0 ? (
                        viewingInvoice.items.map((item, idx) => (
                           <tr key={idx}>
                             <td className="pt-2 pb-0 whitespace-pre-wrap break-words break-all leading-tight text-black pl-1" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{item.description}</td>
                             <td className="pt-2 pb-0 text-center align-top text-black">
                                {item.quantity === parseFloat(item.quantity.toString()) && item.quantity % 1 === 0 ? item.quantity + '.00' : item.quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                             </td>
                             <td className="pt-2 pb-0 text-center align-top text-black">
                                {((item.unit_rate !== undefined ? item.unit_rate : item.unit_price) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                             </td>
                             <td className="pt-2 pb-0 text-center align-top text-black">
                                {item.tax_rate || 7}%
                             </td>
                             <td className="pt-2 pb-0 text-right align-top text-black pr-1">
                                {(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                             </td>
                           </tr>
                        ))
                      ) : (
                        <tr>
                           <td className="pt-2 pb-0 text-black pl-1 break-words break-all" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>(3006050001) Services fee for Contract Work<br/>{(viewingInvoice as any).reference_po}</td>
                           <td className="pt-2 pb-0 text-center align-top text-black">1.00</td>
                           <td className="pt-2 pb-0 text-center align-top text-black">{Math.round(viewingInvoice.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                           <td className="pt-2 pb-0 text-center align-top text-black">7%</td>
                           <td className="pt-2 pb-0 text-right align-top text-black pr-1">{viewingInvoice.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  
                  {/* Spacing for item section similar to reference */}
                  <div className="h-[90px]"></div>
                  
                </div>

                {/* Amount Summary */}
                <div className="flex justify-end pr-1 mt-6">
                  <div className="w-[45%]">
                    <div className="flex border-t border-black pt-1 pb-1">
                      <div className="w-[60%] text-right pr-9 text-[12.5px] text-black">Subtotal</div>
                      <div className="w-[40%] text-right text-[12.5px] text-black">{viewingInvoice.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div className="flex pt-1 pb-1">
                      <div className="w-[60%] text-right pr-9 text-[12.5px] text-black">Total VAT on Sales 7%</div>
                      <div className="w-[40%] text-right text-[12.5px] text-black">{viewingInvoice.vat_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div className="flex border-t border-black pt-1 pb-1">
                      <div className="w-[60%] text-right pr-9 text-[12.5px] text-black">Invoice Total THB</div>
                      <div className="w-[40%] text-right text-[12.5px] text-black">{viewingInvoice.grand_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div className="flex border-b border-black pt-1 pb-[6px]">
                      <div className="w-[60%] text-right pr-9 text-[12.5px] text-black">Total Net Payments THB</div>
                      <div className="w-[40%] text-right text-[12.5px] text-black">0.00</div>
                    </div>
                    <div className="flex pt-[7px] pb-1">
                      <div className="w-[60%] text-right pr-9 text-[12.5px] font-bold text-black">Amount Due THB</div>
                      <div className="w-[40%] text-right text-[12.5px] font-bold text-black">{viewingInvoice.grand_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                  </div>
                </div>

                {/* Remark & Bottom Section */}
                <div className="mt-8 flex justify-between pr-2">
                  <div className="w-[50%]">
                    <div className="text-[12.5px] italic underline text-black underline-offset-[3px] mb-1.5">(Please Deduct Withholding Tax for Service 3% and or Rental 5%)</div>
                    <div className="text-[12px] leading-[1.6] text-black font-normal">
                      General Term &amp; Condition of Sales &amp; Hire apply Note<br />
                      : Late payments, the company charges a penalty of 1.25%<br />
                      per month หมายเหตุ :การชาระเงินเกินกำหนด บริษัทฯ คิดเบี้ยปรับ<br />
                      1.25% ต่อเดือน<br />
                      In the event of discrepancy, Kindly contact<br />
                      our Accounts department within 7 days In writing from the<br />
                      Invoice
                    </div>
                    
                    {/* Signature area */}
                    <div className="mt-[135px] ml-4">
                      <div className="border-t border-black w-[280px] border-dashed">
                         <div className="text-[12px] pt-1 text-black font-normal">Authorised Signature</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-[45%] flex flex-col pt-3">
                     {/* Stamp */}
                     <div className="mb-8 w-full flex pl-6">
                       <svg viewBox="0 0 120 120" className="w-[115px] h-[115px] text-[#335bb2] opacity-85 transform -rotate-[15deg]">
                         <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="1.2" />
                         <circle cx="60" cy="60" r="52.2" fill="none" stroke="currentColor" strokeWidth="0.5" />
                         
                         <path id="top-arc" fill="none" d="M 18 60 A 42 42 0 0 1 102 60" />
                         <path id="bottom-arc" fill="none" d="M 102 60 A 42 42 0 0 1 18 60" />
                         
                         <text className="text-[11px] font-bold fill-current tracking-tighter" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                           <textPath href="#top-arc" startOffset="50%" textAnchor="middle">บริษัท ไอเคเอ็ม เทสติ้ง (ประเทศไทย) จำกัด</textPath>
                         </text>
                         <text className="text-[8.5px] font-bold fill-current tracking-normal" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                           <textPath href="#bottom-arc" startOffset="50%" textAnchor="middle">IKM TESTING (THAILAND) COMPANY LIMITED</textPath>
                         </text>
                         {/* Stars */}
                         <text x="11.5" y="64" className="text-[13px] font-bold fill-current">★</text>
                         <text x="96" y="64" className="text-[13px] font-bold fill-current">★</text>
                       </svg>
                     </div>

                     {/* Bank Details */}
                     <div className="text-[12.5px] leading-[1.6] text-black pr-2">
                        <div>Please make Cheque payable to</div>
                        <div className="mb-4">IKM TESTING (THAILAND) CO.,LTD.</div>
                        
                        <div>Or remit to our bank as follows</div>
                        <div>BANK Account No. 783-3250-60-8</div>
                        <div>Swift code : UOVBTHBK</div>
                        <div>BANK : United Overseas Bank (Thai) public company Limited.</div>
                        <div>51/12 Moo 5 Sukhumvit road, Amphoe Ban chang ,</div>
                        <div>Rayong 21130. THAILAND</div>
                        
                        <div className="mt-4">All local &amp; Oversea bank charges to be borne by Remitter's a/cs</div>
                     </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
