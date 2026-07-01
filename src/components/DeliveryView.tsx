import React, { useState, useMemo } from 'react';
import { Customer, SalesOrder, DeliveryJob, UserRole } from '../types';
import { Truck, Plus, Search, Filter, Trash2, Eye, Printer, Edit2, FileText, Check, Clock, ShieldCheck, MapPin, Navigation, X, Lock } from 'lucide-react';

interface DeliveryViewProps {
  deliveryJobs: DeliveryJob[];
  salesOrders: SalesOrder[];
  customers: Customer[];
  onAdd: (payload: Omit<DeliveryJob, 'id' | 'delivery_no' | 'created_at'>) => Promise<any>;
  onUpdate: (id: string, updates: Partial<DeliveryJob>) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
  onToast: (msg: string, type: 'success' | 'err') => void;
  currentRole: UserRole;
  currentUserId: string;
}

export default function DeliveryView({
  deliveryJobs,
  salesOrders,
  customers,
  onAdd,
  onUpdate,
  onDelete,
  onToast,
  currentRole,
  currentUserId
}: DeliveryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<DeliveryJob | null>(null);
  const [viewingJob, setViewingJob] = useState<DeliveryJob | null>(null);

  // Form State
  const [soId, setSoId] = useState('');
  const [custId, setCustId] = useState('');
  const [carrierName, setCarrierName] = useState('');
  const [trackingNo, setTrackingNo] = useState('');
  const [deliveredBy, setDeliveredBy] = useState('');
  const [actualDeliveryDate, setActualDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'Scheduled' | 'In Transit' | 'Delivered' | 'Failed'>('Scheduled');

  const canModify = currentRole !== 'Management';
  const canDelete = currentRole === 'Admin' || currentRole === 'System Administrator';

  const handleSOChange = (id: string) => {
    setSoId(id);
    const so = salesOrders.find(item => item.id === id);
    if (so) {
      setCustId(so.customer_id);
    }
  };

  const handleOpenAddForm = () => {
    setEditingJob(null);
    setSoId('');
    setCustId('');
    setCarrierName('ทีมจัดส่งวิศวกรเครือข่าย');
    setTrackingNo(`TRK${Math.floor(100000000 + Math.random() * 900000000)}`);
    setDeliveredBy('คุณสุรเดช สว่างวงศ์ (วิศวกรอาวุโส)');
    setActualDeliveryDate(new Date().toISOString().split('T')[0]);
    setStatus('Scheduled');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (job: DeliveryJob) => {
    setEditingJob(job);
    setSoId(job.sales_order_id);
    setCustId(job.customer_id);
    setCarrierName(job.carrier_name || '');
    setTrackingNo(job.tracking_no || '');
    setDeliveredBy(job.delivered_by || '');
    setActualDeliveryDate(job.actual_delivery_date || '');
    setStatus(job.status);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!soId || !custId || !deliveredBy) {
      onToast('กรุณาระบุใบสั่งขาย และวิศวกรผู้ส่งมอบงานให้ครบถ้วน', 'err');
      return;
    }

    const payload = {
      sales_order_id: soId,
      customer_id: custId,
      carrier_name: carrierName,
      tracking_no: trackingNo,
      delivered_by: deliveredBy,
      actual_delivery_date: actualDeliveryDate,
      status
    };

    try {
      if (editingJob) {
        await onUpdate(editingJob.id, payload);
        onToast(`แก้ไขข้อมูลงานส่งมอบ ${editingJob.delivery_no} ลงโมดูลเรียบร้อย`, 'success');
      } else {
        await onAdd(payload);
        onToast(`บันทึกแผนออกตารางส่งมอบงาน (Dispatch Job) สำเร็จ`, 'success');
      }
      setIsFormOpen(false);
    } catch {
      onToast('บันทึกแผนงานขนส่งระบบขัดข้อง', 'err');
    }
  };

  const filteredJobs = useMemo(() => {
    return deliveryJobs.filter(job => {
      const matchSearch =
        job.delivery_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.tracking_no && job.tracking_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (job.project_name && job.project_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (job.customer_name && job.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = selectedStatus === 'All' || job.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [deliveryJobs, searchTerm, selectedStatus]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="delivery-module">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-150 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">Delivery / Ongoing Job Management (การติดตามและนัดส่งมอบงาน)</h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">โมดูลที่ 6: ออกเอกสารใบนำส่งแผนจัดสรรวิศวกร และส่งมอบอุปกรณ์บำรุงรักษาหน้างานทางโปรเจกต์</p>
          </div>
        </div>
        {canModify && (
          <button
            onClick={handleOpenAddForm}
            className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all cursor-pointer shadow-xs text-sm"
          >
            <Plus className="w-4 h-4" />
            ส่งมอบงานใหม่ / New Delivery Job
          </button>
        )}
      </div>

      {/* Filter and search */}
      <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่ใบส่ง, รหัสพัสดุด้านตรวจสอบ, วิศวกรผู้ดำเนินงาน หรือผู้ว่าจ้าง..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-550/25 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="text-slate-400 w-4 h-4 shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full md:w-48 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none cursor-pointer font-bold"
          >
            <option value="All">ทุกสถานะส่งมอบ</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Spreadsheet Tab simulation bar */}
      <div className="bg-[#f8f9fa] border border-slate-200 border-b-0 px-4 py-2 flex items-center justify-between text-xs select-none rounded-t-xl">
        <div className="flex items-center gap-3">
          <span className="font-medium bg-[#E8EAED] px-2.5 py-1 rounded border border-slate-200 text-slate-700 select-none">Sheet1</span>
          <span className="text-slate-400">|</span>
          <span className="font-mono font-semibold text-emerald-600">{filteredJobs.length} แถว (Rows)</span>
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
                <th className="border border-slate-200 text-center w-48">C</th>
                <th className="border border-slate-200 text-center w-40">D</th>
                <th className="border border-slate-200 text-center w-36">E</th>
                <th className="border border-slate-200 text-center w-28">F</th>
                <th className="border border-slate-200 text-center w-36">G</th>
              </tr>
              {/* Header Columns inside the spreadsheet */}
              <tr className="bg-[#F8F9FA] border-b-2 border-slate-300 text-xs font-semibold text-slate-600">
                <th className="border border-slate-200 bg-[#E8EAED] text-center w-10 font-mono select-none"></th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700">รหัสแผนส่งมอบ</th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700">โครงการงานบริการที่จัดสรร</th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700">ขนส่ง / วิศวกรผู้ดูแล</th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700">รหัส Tracking พัสดุ</th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700">วันที่ทำแผนจัดของ</th>
                <th className="border border-slate-200 px-3 py-2 text-center text-slate-700">คิวสถานะ</th>
                <th className="border border-slate-200 px-3 py-2 text-right text-slate-700">เข้าคำสั่ง</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-700">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 text-xs border border-slate-200">
                    ไม่พบตารางข้อมูลจองเวลาส่งวิศวกรลงบริการสถานที่ระบุ
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job, idx) => (
                  <tr 
                    key={job.id} 
                    className={`hover:bg-blue-50/45 cursor-pointer transition-colors border-b border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]/70'}`}
                  >
                    {/* Index row background (spreadsheet numbering) */}
                    <td className="border border-slate-200 bg-[#F1F3F4] text-[#5f6368] text-center font-mono text-[10px] select-none py-1.5">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 font-mono font-bold text-slate-800">
                      {job.delivery_no}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5">
                      <span className="font-extrabold text-slate-800 block">{job.project_name || 'งานบริการรับจ้าง'}</span>
                      <span className="text-xs text-slate-400 font-normal">ลูกค้า: {job.customer_name}</span>
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5">
                      <span className="font-bold text-slate-700 block">{job.delivered_by || '-'}</span>
                      <span className="text-[11px] text-slate-400 font-normal">{job.carrier_name || 'จัดรถโมบายพิเศษ'}</span>
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 font-mono text-xs text-indigo-600 font-bold">
                      {job.tracking_no || 'N/A'}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 text-slate-600">
                      {job.actual_delivery_date || '-'}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold leading-none ${
                        job.status === 'Delivered' ? 'bg-green-50 text-green-700 border border-green-150' :
                        job.status === 'In Transit' ? 'bg-blue-50 text-blue-700 border border-blue-150' :
                        job.status === 'Scheduled' ? 'bg-amber-50 text-amber-700 border border-amber-150' :
                        job.status === 'Failed' ? 'bg-rose-50 text-rose-700 border border-rose-150' :
                        'bg-slate-50 text-slate-600 border border-slate-200'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingJob(job)}
                          title="ดูแผนผังส่งงาน / และพิมพ์ใบส่ง"
                          className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {canModify && (
                          <button
                            onClick={() => handleOpenEditForm(job)}
                            title="ปรับปรุงสถานะส่งของหรือวิศวกร"
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canDelete ? (
                          <button
                            onClick={async () => {
                              if (confirm(`คุณต้องการยกเลิกแผนตารางถอดถอนผู้ส่งมอบใบนี้ ${job.delivery_no} หรือไม่?`)) {
                                await onDelete(job.id);
                                onToast('ถอนแผนตารางส่งมอบงานและลบออกสำเร็จ', 'success');
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
                <h3 className="text-base font-extrabold text-slate-800 font-sans">
                  {editingJob ? `ปรับปรุงกำหนดแผนจราจรขนส่งงานบริการ: ${editingJob.delivery_no}` : 'เตรียมเปิดเอกสารนัดหมายส่งมอบวิศวกร (Dispatch Engineer)'}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">บันทึกขั้นตอนกระจายตัวผู้ดูแลหน้างาน หรือระบุหมายเลขขนส่งสำหรับสวัสดิการพัสดุ</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded bg-white border border-slate-150">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Reference active Sales Orders */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">อ้างอิงโครงการใบสั่งขาย SO *</label>
                <select
                  required
                  value={soId}
                  onChange={(e) => handleSOChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">-- กรุณาเลือกใบสั่งขายที่อ้างอิง --</option>
                  {salesOrders.map(so => (
                    <option key={so.id} value={so.id}>{so.so_no} - {so.project_name}</option>
                  ))}
                </select>
              </div>

              {/* Customer selection */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">ผู้ซื้อ / องค์กรคู่ร่วมมือปลายทาง</label>
                <select
                  required
                  disabled={!!soId}
                  value={custId}
                  onChange={(e) => setCustId(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none cursor-not-allowed"
                >
                  <option value="">-- จะดึงรายชื่อลูกค้าปลายโครงการอัตโนมัติ --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.customer_name}</option>
                  ))}
                </select>
              </div>

              {/* Carrier & tracking code */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">วิธีขนส่ง / หน่วยปฏิบัติงาน</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ทีมรถตู้คิวสารสนเทศ"
                    value={carrierName}
                    onChange={(e) => setCarrierName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">หมายเลขพัสดุ / บริการ Tracking Code</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น TRK9012301"
                    value={trackingNo}
                    onChange={(e) => setTrackingNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-sm focus:outline-none font-mono text-xs"
                  />
                </div>
              </div>

              {/* Engineer / dispatcher name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">วิศวกรผู้คุมทีมจัดส่งมอบงานหน้างาน *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น คุณดนัย พิทยประจักษ์ (ผู้ชำนาญการ)"
                  value={deliveredBy}
                  onChange={(e) => setDeliveredBy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm"
                />
              </div>

              {/* Dates and transit statuses */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">วันที่ออกเดินทางส่งของ / ออกหน้างาน</label>
                  <input
                    type="date"
                    required
                    value={actualDeliveryDate}
                    onChange={(e) => setActualDeliveryDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">สถานะความคืบหน้า</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm cursor-pointer focus:outline-none"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Failed">Failed</option>
                  </select>
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
                  className="bg-emerald-600 text-white font-bold px-5 py-2 rounded-xl text-xs hover:bg-emerald-700 shadow-xs transition-style flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  ยืนยันออกแผนจัดส่ง / Assign Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visual elegant dispatch ticket preview modal */}
      {viewingJob && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-3xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in print:bg-white print:p-0 print:absolute">
          <div className="bg-white rounded-2xl shadow-3xl w-full max-w-3xl overflow-hidden my-8 animate-scale-up print:shadow-none print:my-0 print:rounded-none">
            
            {/* Control toolbar */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-150 flex items-center justify-between print:hidden">
              <span className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <Printer className="w-4.5 h-4.5 text-emerald-600" />
                ใบนำส่งงานการซ่อมบำรุงวิศวกร / Engineer Dispatch Ticket ({viewingJob.delivery_no})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded-lg text-xs cursor-pointer flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  พิมพ์เอกสารนำรับ
                </button>
                <button onClick={() => setViewingJob(null)} className="p-1 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Print canvas */}
            <div className="p-8 md:p-12 space-y-8 font-sans bg-white print:p-0 text-slate-800">
              
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <h1 className="text-emerald-600 font-extrabold text-2xl tracking-tight uppercase leading-none">DELIVERY NOTE</h1>
                  <span className="text-xs text-slate-400 block mt-1">ใบรับงานติดตั้งวิศวกรรมสิทธิบัตรและตรวจขอบเขตหน้างาน</span>
                  <div className="text-xs font-medium text-slate-700 mt-4 leading-relaxed font-mono">
                    <strong>บริษัท ควอลิที เทค แอนด์ เซอร์วิส จำกัด</strong><br />
                    1024/9 อาคารศูนย์ไอทีอาร์ สาทร พญาไท กรุงเทพมหานคร 10400<br />
                    ทะเบียนสถิติเสียภาษีอากร: 0105658091234
                  </div>
                </div>
                <div className="text-right space-y-1 text-xs">
                  <div className="text-[11px] font-bold text-slate-400">เลขส่งมอบแผนงาน / Dispatch Job No.</div>
                  <div className="font-mono text-base font-extrabold text-slate-800">{viewingJob.delivery_no}</div>
                  <div className="text-[11px] font-bold text-slate-400 pt-2">รหัส Tracking เครื่องมือ / Tools Code</div>
                  <div className="font-mono text-xs font-bold text-slate-600">{viewingJob.tracking_no || 'N/A'}</div>
                  <div className="text-[11px] font-bold text-slate-400 pt-2">กำหนดลงเวลาปฏิบัติการ / Job Service Date</div>
                  <div className="font-bold">{viewingJob.actual_delivery_date}</div>
                </div>
              </div>

              {/* Transit tracking status flow widget inside detail */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 text-center">คิวไทม์ไลน์สถานะขนส่ง / TRANSIT TIMELINE STATE</h4>
                <div className="flex items-center justify-between text-xs max-w-lg mx-auto relative pl-4 pr-4">
                  <div className="flex flex-col items-center gap-1.5 z-10">
                    <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-[10px]">1</div>
                    <span className="font-semibold text-slate-700">Scheduled</span>
                  </div>
                  <div className={`flex-1 h-1 ${['In Transit', 'Delivered'].includes(viewingJob.status) ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                  <div className="flex flex-col items-center gap-1.5 z-10">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${['In Transit', 'Delivered'].includes(viewingJob.status) ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'}`}>2</div>
                    <span className="font-semibold text-slate-700">In Transit</span>
                  </div>
                  <div className={`flex-1 h-1 ${viewingJob.status === 'Delivered' ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                  <div className="flex flex-col items-center gap-1.5 z-10">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${viewingJob.status === 'Delivered' ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'}`}>3</div>
                    <span className="font-semibold text-slate-700">Delivered</span>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-2 gap-8 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="text-[11px] uppercase font-bold text-slate-400 mb-1.5">สถานที่จอดรถบำรุงรักษาพิกัดงาน / Delivery Destination:</div>
                  <div className="text-slate-800 font-extrabold text-sm">{viewingJob.customer_name}</div>
                  <div className="text-slate-500 mt-2 leading-relaxed">
                    ที่อยู่โครงการสภานงาน: {customers.find(c => c.id === viewingJob.customer_id)?.address || '-'}<br />
                    ผู้ประสานงานจัดซื้อ: {customers.find(c => c.id === viewingJob.customer_id)?.contacts?.[0]?.contact_name || 'วิศวกรศูนย์พลังงาน'} / {customers.find(c => c.id === viewingJob.customer_id)?.contacts?.[0]?.phone || '-'}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <div className="text-[11px] uppercase font-bold text-slate-400 mb-1">ข้อมูลบุคลากรและขนส่งหลัก / Dispatch Carrier details:</div>
                  <div className="text-slate-700 font-bold">{viewingJob.delivered_by || 'วิศวกรประจำทีมโมบายพิเศษ'}</div>
                  <div className="text-[11px] leading-relaxed text-slate-500 mt-2">
                    หน่วยงานยานพาหนะ: {viewingJob.carrier_name || 'ทีมขนส่งวิศวกรประจำบริษัท'}<br />
                    ใบขอสิทธิการตรวจซ่อมรหัส: <strong>{viewingJob.sales_order_id}</strong><br />
                    ระเบียบปฏิบัติหน้างาน: ตรวจสอบความร้อนของหม้อต้ม รื้อถอนสายสัญญาณที่ชำรุด และส่งมอบประวัติวิศวกรที่มีลิขสิทธิ์
                  </div>
                </div>
              </div>

              {/* Signed confirmations */}
              <div className="grid grid-cols-2 gap-12 pt-16 text-center text-xs">
                <div className="space-y-12">
                  <span className="text-slate-400 font-medium block">ลงลายมือชื่อพยานวิศวกรจัดส่ง / Dispatched By:</span>
                  <div className="border-b border-slate-300 w-48 mx-auto pb-1 text-slate-700 font-semibold font-mono">
                    {viewingJob.delivered_by}
                  </div>
                  <span className="text-[10px] text-slate-400 block">วันที่ออกสนาม / Date: ............................................</span>
                </div>
                <div className="space-y-12">
                  <span className="text-slate-400 font-medium block">ลงชื่อประทับยืนยันรับงานเสร็จสิ้น / Client Representative:</span>
                  <div className="border-b border-slate-300 w-48 mx-auto pb-1 text-slate-700 font-semibold">
                    ...........................................................................
                  </div>
                  <span className="text-[10px] text-slate-400 block">วันที่รับทราบงาน / Date: ............................................</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
