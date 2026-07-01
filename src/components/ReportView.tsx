import React, { useState, useMemo } from 'react';
import { Customer, Opportunity, OpportunityStatus } from '../types';
import { SAMPLE_SALES_PERSONS } from '../supabaseService';
import { 
  FileSpreadsheet, 
  Printer, 
  Search, 
  Calendar, 
  Filter, 
  Users, 
  Target, 
  TrendingUp, 
  ChevronRight,
  RefreshCw,
  Building2,
  FileText
} from 'lucide-react';

interface ReportViewProps {
  customers: Customer[];
  opportunities: Opportunity[];
  onToast: (msg: string, type: 'success' | 'err') => void;
}

export default function ReportView({ customers, opportunities, onToast }: ReportViewProps) {
  // Report type switch
  const [reportType, setReportType] = useState<'customer' | 'opportunity'>('opportunity');

  // Commom Filtering states
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [customerFilter, setCustomerFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [salesFilter, setSalesFilter] = useState('All');

  // Sales staff mapping
  const salesStaffMap = useMemo(() => {
    return new Map(SAMPLE_SALES_PERSONS.map(s => [s.id, s.name]));
  }, []);

  // 1. Compute Customer Report Data
  const customerReportData = useMemo(() => {
    return customers.filter(c => {
      // 1. Date Range
      if (c.created_at) {
        const createDate = c.created_at.split('T')[0];
        if (createDate < startDate || createDate > endDate) return false;
      }

      // 2. Status
      if (statusFilter !== 'All' && statusFilter !== 'Active' && statusFilter !== 'Inactive') {
        // irrelevant condition for customer
      } else if (statusFilter !== 'All' && c.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [customers, startDate, endDate, statusFilter]);

  // 2. Compute Opportunity Report Data
  const opportunityReportData = useMemo(() => {
    return opportunities.filter(o => {
      // 1. Date filter (Based on expected close date or created date)
      if (o.expected_close_date) {
        if (o.expected_close_date < startDate || o.expected_close_date > endDate) return false;
      }

      // 2. Customer filter
      if (customerFilter !== 'All' && o.customer_id !== customerFilter) return false;

      // 3. Status filter
      if (statusFilter !== 'All' && o.status !== statusFilter) return false;

      // 4. Sales Person
      if (salesFilter !== 'All' && o.sales_person_id !== salesFilter) return false;

      return true;
    });
  }, [opportunities, startDate, endDate, customerFilter, statusFilter, salesFilter]);

  // Report calculations aggregates
  const reportsStats = useMemo(() => {
    if (reportType === 'customer') {
      const activeCount = customerReportData.filter(c => c.status === 'Active').length;
      return {
        totalSelected: customerReportData.length,
        active: activeCount,
        inactive: customerReportData.length - activeCount,
        totalContactsCount: customerReportData.reduce((sum, c) => sum + (c.contacts?.length || 0), 0)
      };
    } else {
      const totalOppValue = opportunityReportData.reduce((sum, o) => sum + o.estimated_value, 0);
      const wonOpps = opportunityReportData.filter(o => o.status === 'Won');
      const totalWeighted = opportunityReportData.reduce((sum, o) => sum + (o.estimated_value * (o.success_probability / 100)), 0);

      return {
        totalSelected: opportunityReportData.length,
        totalValue: totalOppValue,
        totalWeighted,
        wonCount: wonOpps.length,
        wonValue: wonOpps.reduce((sum, o) => sum + o.estimated_value, 0)
      };
    }
  }, [reportType, customerReportData, opportunityReportData]);

  // EXCEL CSV DOWNLOAD
  const handleExportCSV = () => {
    let csvHeaders: string[] = [];
    let rows: any[][] = [];
    let filename = '';

    if (reportType === 'customer') {
      filename = `Customer_Report_${new Date().toISOString().split('T')[0]}.csv`;
      csvHeaders = ['รหัสลูกค้า', 'ชื่อผู้ประกอบการลูกค้า', 'เลขผู้เสียภาษี', 'กลุ่มอุตสาหกรรม', 'เงื่อนไขเครดิต', 'เบอร์โทรศัพท์', 'อีเมล', 'จำนวนผู้ประสานงานติดต่อ', 'สถานะบัญชี'];
      rows = customerReportData.map(c => [
        c.customer_code,
        c.customer_name,
        c.tax_id,
        c.industry_type,
        c.payment_term,
        c.phone,
        c.email,
        c.contacts?.length || 0,
        c.status
      ]);
    } else {
      filename = `Opportunity_Report_${new Date().toISOString().split('T')[0]}.csv`;
      csvHeaders = ['เลขที่โอกาสทางการขาย', 'ชื่อลูกค้า / บริษัท', 'โครงการนำเสนอพัฒนา', 'กลุ่มประเภทบริการ', 'มูลค่างบประมาณร่วม', 'ความน่าจะเป็นสำเร็จ %', 'วัตถุประสงค์วันปิดดีล', 'เจ้าหน้าที่ฝ่ายขาย AM', 'สถานะขั้นตอน'];
      rows = opportunityReportData.map(o => [
        o.opportunity_no,
        o.customer?.customer_name || '',
        o.project_name,
        o.service_type,
        o.estimated_value,
        o.success_probability + '%',
        o.expected_close_date,
        salesStaffMap.get(o.sales_person_id) || '',
        o.status
      ]);
    }

    // Process BOM Download links
    const csvContent = "\uFEFF" + [
      csvHeaders.join(","),
      ...rows.map(e => e.map(val => {
        const escaped = String(val ?? '').replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.className = "hidden";
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onToast('ส่งออกรายงาน Excel/CSV เรียบร้อย', 'success');
  };

  // PDF Printing trigger
  const handlePrintPDF = () => {
    window.print();
  };

  // Reset filters
  const handleResetFilters = () => {
    setStartDate('2026-01-01');
    setEndDate('2026-12-31');
    setCustomerFilter('All');
    setStatusFilter('All');
    setSalesFilter('All');
    onToast('รีเซ็ตเงื่อนไขกรองรายงานทั้งหมด', 'success');
  };

  // Format currency helper
  const formatTHB = (num: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="space-y-6 print:p-0 print:space-y-4">
      
      {/* Hide on printing */}
      <div className="print:hidden space-y-6">
        
        {/* Main tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-800">ศูนย์รายงานวิเคราะห์ธุรกิจ (CRM Reports Console)</h2>
            <p className="text-slate-400 text-xs mt-0.5">ออกรายงานสำหรับฝ่ายบริหาร ดึงสรุปรายชื่อลูกค้า และประเมินโอกาสทางการขายพร้อมกัน</p>
          </div>
          
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => { setReportType('opportunity'); setStatusFilter('All'); }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer ${reportType === 'opportunity' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}
            >
              <Target className="w-4 h-4" />
              รายงานโอกาสการขาย
            </button>
            <button
              onClick={() => { setReportType('customer'); setStatusFilter('All'); }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer ${reportType === 'customer' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}
            >
              <Users className="w-4 h-4" />
              รายงานข้อมูลลูกค้า
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-slate-800 border-b pb-2">
            <span className="text-sm font-bold flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-blue-500" />
              ตั้งเงื่อนไขกรองรายงาน (Query Filter)
            </span>
            <button
              onClick={handleResetFilters}
              className="text-xs font-medium text-slate-400 hover:text-blue-600 flex items-center gap-1 border-none bg-none outline-none cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              รีเซ็ตตัวกรอง
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-700">
            {/* Start Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">เริ่มต้นตั้งแต่วันที่</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-mono text-xs focus:outline-none"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">ถึงเป้าหมายวันที่</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-mono text-xs focus:outline-none"
              />
            </div>

            {/* Conditional Filter 1: Customer (Only in Opp report) */}
            {reportType === 'opportunity' ? (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 block">คัดกรองเฉพาะลูกค้า</label>
                <select
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  className="w-full p-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none text-slate-700 text-xs font-sans cursor-pointer"
                >
                  <option value="All">ดึงข้อมูลลูกค้าทั้งหมด</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.customer_name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 block">สัญญาลูกค้า (Credit Term)</label>
                <select
                  disabled
                  className="w-full p-2 border border-slate-200 bg-slate-100 rounded-lg text-slate-400 text-xs font-sans"
                >
                  <option>ไม่ได้ใช้งานสำหรับลูกค้า</option>
                </select>
              </div>
            )}

            {/* Conditional Filter 2: Status */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">เจาะจงขั้นตอนสถานะ</label>
              {reportType === 'customer' ? (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none text-slate-700 text-xs font-sans cursor-pointer"
                >
                  <option value="All">ทุกสถานะลูกค้า</option>
                  <option value="Active">Active บัญชีเปิดใช้งาน</option>
                  <option value="Inactive">Inactive บัญชีปิดใช้งาน</option>
                </select>
              ) : (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none text-slate-700 text-xs font-sans cursor-pointer"
                >
                  <option value="All">ทุกขั้นตอนความคืบหน้า</option>
                  <option value="Lead">Lead (มีลีด)</option>
                  <option value="Qualified">Qualified (ผ่านเกณฑ์)</option>
                  <option value="Proposal">Proposal (เสนอราคา)</option>
                  <option value="Negotiation">Negotiation (เจรจาต่อรอง)</option>
                  <option value="Won">Won (ปิดการขายสำเร็จ)</option>
                  <option value="Lost">Lost (พ่ายแพ้ดีล)</option>
                  <option value="Cancelled">Cancelled (ยกเลิกดีล)</option>
                </select>
              )}
            </div>

            {/* Conditional Filter 3: Sales Person Staff */}
            {reportType === 'opportunity' && (
              <div className="space-y-1 lg:col-start-4">
                <label className="text-xs font-semibold text-slate-500 block">พนักงานการขายผู้รับผิดชอบ</label>
                <select
                  value={salesFilter}
                  onChange={(e) => setSalesFilter(e.target.value)}
                  className="w-full p-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none text-slate-700 text-xs font-sans cursor-pointer"
                >
                  <option value="All">เจ้าหน้าที่ทุกคนทั้งหมด</option>
                  {SAMPLE_SALES_PERSONS.map(staff => (
                    <option key={staff.id} value={staff.id}>{staff.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Download & Print bars */}
          <div className="flex border-t border-slate-100 pt-4 justify-end gap-2.5">
            <button
              onClick={handlePrintPDF}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs flex items-center gap-1.5 focus:outline-none cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              พิมพ์รายงาน / บันทึก PDF (Print)
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 focus:outline-none cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              ส่งออกสรุป Excel (CSV)
            </button>
          </div>
        </div>

      </div>

      {/* --- RENDER REPORT AREA (OPTIMIZED FOR WEB DISPLAY & PRINT TO PDF) --- */}
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm print:shadow-none print:border-none print:p-0 space-y-6">
        
        {/* Printable Report Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              {reportType === 'customer' ? 'รายงานตรวจสอบข้อมูลลูกค้าผู้ประกอบการ' : 'รายงานวิเคราะห์คาดคะเนโอกาสทางการขายหลัก'}
            </h1>
            <p className="text-xs text-slate-400 font-sans">
              ระบบตรวจสอบสถิติลีดภายในองค์กร CRM Sales System Phase 1 | พิมพ์เมื่อวันที่ {new Date().toLocaleDateString('th-TH')}
            </p>
          </div>
          <div className="text-xs text-slate-500 md:text-right font-mono space-y-0.5">
            <div>ช่วงขอบเขตข้อมูลวิจับ: {startDate} ถึง {endDate}</div>
            <div>ประเภทรายงานสถานะ: {statusFilter === 'All' ? 'ดึงทุกสถานะ' : statusFilter}</div>
          </div>
        </div>

        {/* Aggregate KPI boxes for the target printed document */}
        {reportType === 'customer' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-1">
              <span className="text-xs font-medium text-slate-400 block">ลูกค้ารวมในขอบเขต</span>
              <span className="font-mono text-xl font-bold text-slate-800 block">{reportsStats.totalSelected}</span>
            </div>
            <div className="p-4 bg-green-50/50 rounded-xl border border-green-100/50 text-center space-y-1">
              <span className="text-xs font-medium text-green-600 block">สัญญายังคงอยู่ (Active)</span>
              <span className="font-mono text-xl font-bold text-green-700 block">{reportsStats.active}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-1">
              <span className="text-xs font-medium text-slate-400 block font-sans">ปิดบัญชีชั่วคราว (Inactive)</span>
              <span className="font-mono text-xl font-bold text-slate-500 block">{reportsStats.inactive}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-1">
              <span className="text-xs font-medium text-slate-400 block font-sans">บุคคลผู้ประสานงานรวม</span>
              <span className="font-mono text-xl font-bold text-blue-700 block">{reportsStats.totalContactsCount} คน</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-1">
              <span className="text-xs font-medium text-slate-400 block">ปริมาณโครงการที่ประเมิน</span>
              <span className="font-mono text-lg font-bold text-slate-800 block">{reportsStats.totalSelected} รายการ</span>
            </div>
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 text-center space-y-1 col-span-1">
              <span className="text-xs font-medium text-blue-600 block">มูลค่างบประมาณที่บันทึก</span>
              <span className="font-mono text-base font-bold text-blue-700 block">{formatTHB(reportsStats.totalValue || 0)}</span>
            </div>
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-center space-y-1">
              <span className="text-xs font-medium text-indigo-500 block font-sans">มูลค่าถ่วงตามโอกาส % (Weighted)</span>
              <span className="font-mono text-base font-bold text-indigo-700 block">{formatTHB(reportsStats.totalWeighted || 0)}</span>
            </div>
            <div className="p-4 bg-green-50/50 rounded-xl border border-green-100/50 text-center space-y-1">
              <span className="text-xs font-medium text-green-600 block">ปิดดีลชนะสำเร็จ (Won)</span>
              <span className="font-mono text-sm font-bold text-green-700 block">
                {reportsStats.wonCount} งาน ({formatTHB(reportsStats.wonValue || 0)})
              </span>
            </div>
          </div>
        )}

        {/* Printable tabular content */}
        <div className="overflow-x-auto">
          {reportType === 'customer' ? (
            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="p-3 border border-slate-200 w-24">รหัสลูกค้า</th>
                  <th className="p-3 border border-slate-200">ชื่อสถานประกอบการหลัก</th>
                  <th className="p-3 border border-slate-200 w-28">เลขประจำตัวผู้เสียภาษี</th>
                  <th className="p-3 border border-slate-200 w-32">กลุ่มอุตสาหกรรม</th>
                  <th className="p-3 border border-slate-200 w-24">เครดิตเทอม</th>
                  <th className="p-3 border border-slate-200 w-28">เบอร์ติดต่อ</th>
                  <th className="p-3 border border-slate-200 w-20 text-center">สัญญาย่อย</th>
                  <th className="p-3 border border-slate-200 w-20 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {customerReportData.length > 0 ? (
                  customerReportData.map(c => (
                    <tr key={c.id}>
                      <td className="p-3 border border-slate-200 font-mono font-bold text-slate-800">{c.customer_code}</td>
                      <td className="p-3 border border-slate-200 font-medium text-slate-900">{c.customer_name}</td>
                      <td className="p-3 border border-slate-200 font-mono">{c.tax_id}</td>
                      <td className="p-3 border border-slate-200">{c.industry_type}</td>
                      <td className="p-3 border border-slate-200">{c.payment_term}</td>
                      <td className="p-3 border border-slate-200 font-mono">{c.phone}</td>
                      <td className="p-3 border border-slate-200 text-center font-mono">{c.contacts?.length || 0}</td>
                      <td className="p-3 border border-slate-200 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${c.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-sans border border-slate-200">
                      ไม่พบผลลัพธ์ข้อมูลรายงานตามขอบเขตกหนดค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="p-3 border border-slate-200 w-24">เลขที่ลีด</th>
                  <th className="p-3 border border-slate-200">ชื่อบริษัทลูกค้า</th>
                  <th className="p-3 border border-slate-200">โครงการเสนอขาย/จัดซื้อ</th>
                  <th className="p-3 border border-slate-200 w-28">ประเภทกลุ่มบริการ</th>
                  <th className="p-3 border border-slate-200 w-28 text-right">งบประมาณเสนอ</th>
                  <th className="p-3 border border-slate-200 w-16 text-center">ชนะ %</th>
                  <th className="p-3 border border-slate-200 w-20 text-center">วันปิดเป้าหมาย</th>
                  <th className="p-3 border border-slate-200 w-32">พนักงานขาย</th>
                  <th className="p-3 border border-slate-200 w-20 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {opportunityReportData.length > 0 ? (
                  opportunityReportData.map(o => (
                    <tr key={o.id}>
                      <td className="p-3 border border-slate-200 font-mono font-semibold">{o.opportunity_no}</td>
                      <td className="p-3 border border-slate-200 font-medium">{o.customer?.customer_name || '-'}</td>
                      <td className="p-3 border border-slate-200 font-medium text-slate-900">{o.project_name}</td>
                      <td className="p-3 border border-slate-200">{o.service_type}</td>
                      <td className="p-3 border border-slate-200 text-right font-mono font-bold text-slate-800">{formatTHB(o.estimated_value)}</td>
                      <td className="p-3 border border-slate-200 text-center font-mono">{o.success_probability}%</td>
                      <td className="p-3 border border-slate-200 text-center font-mono text-[10px]">{o.expected_close_date || '-'}</td>
                      <td className="p-3 border border-slate-200 text-xs">{salesStaffMap.get(o.sales_person_id) || '-'}</td>
                      <td className="p-3 border border-slate-200 text-center">
                        <span className="text-[10px] font-bold font-mono">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400 font-sans border border-slate-200">
                      ไม่พบผลลัพธ์ข้อมูลรายงานตามขอบเขตกหนดค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Printable Signature space for physical approval in custom dashboard style */}
        <div className="hidden print:grid grid-cols-2 gap-12 pt-16 text-xs text-slate-500 font-sans text-center">
          <div className="space-y-12">
            <div className="w-48 border-b border-slate-350 mx-auto"></div>
            <p>ผู้พิจารณาจัดทำข้อมูล (Sales Manager Signature)</p>
          </div>
          <div className="space-y-12">
            <div className="w-48 border-b border-slate-350 mx-auto"></div>
            <p>ผู้อนุมัติเอกสารฝ่ายบริหาร (Director Signature)</p>
          </div>
        </div>

      </div>

    </div>
  );
}
