import React, { useMemo } from 'react';
import { Customer, Opportunity } from '../types';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target, 
  CheckCircle, 
  Calendar, 
  ArrowUpRight 
} from 'lucide-react';

interface DashboardViewProps {
  customers: Customer[];
  opportunities: Opportunity[];
  currentUserFullname: string;
  onNavigate: (tab: string) => void;
}

export default function DashboardView({ customers, opportunities, currentUserFullname, onNavigate }: DashboardViewProps) {
  // 1. Calculations for KPIs
  const kpis = useMemo(() => {
    const totalEstValue = opportunities.reduce((sum, opp) => {
      // Don't include cancelled or lost for active pipeline but keep them in total log
      if (opp.status !== 'Cancelled') {
        return sum + opp.estimated_value;
      }
      return sum;
    }, 0);

    const weightedPipelineValue = opportunities.reduce((sum, opp) => {
      if (opp.status !== 'Cancelled' && opp.status !== 'Lost') {
        return sum + (opp.estimated_value * (opp.success_probability / 100));
      }
      return sum;
    }, 0);

    const activeOppsCount = opportunities.filter(o => o.status !== 'Cancelled' && o.status !== 'Lost' && o.status !== 'Won').length;
    const wonOpps = opportunities.filter(o => o.status === 'Won');
    const wonOppsCount = wonOpps.length;
    const wonValue = wonOpps.reduce((sum, o) => sum + o.estimated_value, 0);

    const totalCustomers = customers.length;

    return {
      totalEstValue,
      weightedPipelineValue,
      activeOppsCount,
      wonOppsCount,
      wonValue,
      totalCustomers
    };
  }, [customers, opportunities]);

  // 2. Opportunity by Status Data
  const statusData = useMemo(() => {
    const statuses: { [key: string]: { count: number; value: number; color: string; th: string } } = {
      'Lead': { count: 0, value: 0, color: '#94a3b8', th: 'มีลีด (Lead)' },
      'Qualified': { count: 0, value: 0, color: '#3b82f6', th: 'ผ่านการคัดกรอง (Qualified)' },
      'Proposal': { count: 0, value: 0, color: '#f97316', th: 'เสนอราคา (Proposal)' },
      'Negotiation': { count: 0, value: 0, color: '#a855f7', th: 'เจรจาต่อรอง (Negotiation)' },
      'Won': { count: 0, value: 0, color: '#22c55e', th: 'ปิดการขายได้ (Won)' },
      'Lost': { count: 0, value: 0, color: '#ef4444', th: 'พ่ายแพ้ (Lost)' },
      'Cancelled': { count: 0, value: 0, color: '#1e293b', th: 'ยกเลิก (Cancelled)' },
    };

    opportunities.forEach(opp => {
      if (statuses[opp.status]) {
        statuses[opp.status].count += 1;
        statuses[opp.status].value += opp.estimated_value;
      }
    });

    return Object.keys(statuses).map(key => ({
      name: statuses[key].th,
      rawStatus: key,
      value: statuses[key].count,
      valueAmount: statuses[key].value,
      color: statuses[key].color
    })).filter(item => item.value > 0 || item.valueAmount > 0);
  }, [opportunities]);

  // 3. Monthly Pipeline Forecast Data
  const monthlyData = useMemo(() => {
    const monthsThai = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    // Group by Month from expected_close_date
    const groupings: { [key: string]: { name: string; total: number; weighted: number } } = {};

    opportunities.forEach(opp => {
      if (opp.status === 'Cancelled' || opp.status === 'Lost') return;
      if (!opp.expected_close_date) return;
      
      const dateObj = new Date(opp.expected_close_date);
      if (isNaN(dateObj.getTime())) return;

      const year = dateObj.getFullYear();
      const monthIdx = dateObj.getMonth();
      const key = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;

      if (!groupings[key]) {
        groupings[key] = {
          name: `${monthsThai[monthIdx]} ${String(year).substring(2)}`,
          total: 0,
          weighted: 0
        };
      }

      groupings[key].total += opp.estimated_value;
      groupings[key].weighted += opp.estimated_value * (opp.success_probability / 100);
    });

    // Sort keys chronologically
    return Object.keys(groupings)
      .sort()
      .map(key => groupings[key]);
  }, [opportunities]);

  // Format currency helper
  const formatTHB = (num: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Upper Area Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">ภาพรวมแดชบอร์ดฝ่ายขาย</h2>
          <p className="text-slate-500 text-sm mt-1">ยินดีต้อนรับคุณ {currentUserFullname} | วิเคราะห์ข้อมูลความคืบหน้าโอกาสทางการขายและสถานะการทำงานในเฟสที่ 1</p>
        </div>
        <div className="flex gap-2">
          <button 
            id="btn-goto-customers"
            onClick={() => onNavigate('customers')}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5 focus:outline-none"
          >
            <Users className="w-4 h-4" />
            ข้อมูลลูกค้า
          </button>
          <button 
            id="btn-goto-opps"
            onClick={() => onNavigate('opportunities')}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1.5 focus:outline-none"
          >
            <Target className="w-4 h-4" />
            ผู้มุ่งหวัง/โอกาสขาย
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Estimated value (AdminLTE Blue Box) */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-xl shadow-md relative overflow-hidden group hover:shadow-lg transition-all duration-205 pb-10">
          <div className="flex justify-between items-start z-10 relative">
            <div className="space-y-1.5">
              <span className="text-white/85 text-xs font-bold uppercase tracking-wider block">งบประมาณโครงการรวม</span>
              <span className="text-2xl font-black block font-mono tracking-tight">
                {formatTHB(kpis.totalEstValue)}
              </span>
              <span className="text-[11px] text-blue-50 bg-white/15 px-2 py-0.5 rounded-full inline-block font-sans">
                ลีดดำเนินการอยู่ {kpis.activeOppsCount} งาน
              </span>
            </div>
          </div>
          <DollarSign className="absolute -right-4 -bottom-4 w-28 h-28 opacity-15 text-white transform -rotate-12 transition-transform duration-300 group-hover:scale-110" />
          <button 
            onClick={() => onNavigate('opportunities')}
            className="absolute bottom-0 left-0 right-0 py-1.5 bg-black/15 hover:bg-black/30 transition-colors text-[11px] font-semibold flex items-center justify-center gap-1 text-white/95 border-t border-white/5 cursor-pointer focus:outline-none"
          >
            ดูรายละเอียดโอกาสขาย <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* KPI 2: Weighted Pipeline (AdminLTE Green Box) */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-6 rounded-xl shadow-md relative overflow-hidden group hover:shadow-lg transition-all duration-205 pb-10">
          <div className="flex justify-between items-start z-10 relative">
            <div className="space-y-1.5">
              <span className="text-white/85 text-xs font-bold uppercase tracking-wider block">มูลค่าคาดการณ์ถ่วงน้ำหนัก</span>
              <span className="text-2xl font-black block font-mono tracking-tight">
                {formatTHB(kpis.weightedPipelineValue)}
              </span>
              <span className="text-[11px] text-indigo-50 bg-white/15 px-2 py-0.5 rounded-full inline-block font-sans">
                คาดเฉลี่ยความสำเร็จเชิงสถิติ
              </span>
            </div>
          </div>
          <TrendingUp className="absolute -right-4 -bottom-4 w-28 h-28 opacity-15 text-white transform -rotate-12 transition-transform duration-300 group-hover:scale-110" />
          <button 
            onClick={() => onNavigate('opportunities')}
            className="absolute bottom-0 left-0 right-0 py-1.5 bg-black/15 hover:bg-black/30 transition-colors text-[11px] font-semibold flex items-center justify-center gap-1 text-white/95 border-t border-white/5 cursor-pointer focus:outline-none"
          >
            วิเคราะห์ขั้นตอนการขาย <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* KPI 3: Closed Won (AdminLTE Light Blue/Cyan Box) */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-6 rounded-xl shadow-md relative overflow-hidden group hover:shadow-lg transition-all duration-205 pb-10">
          <div className="flex justify-between items-start z-10 relative">
            <div className="space-y-1.5">
              <span className="text-white/85 text-xs font-bold uppercase tracking-wider block">สำเร็จปิดการขายได้ (Won)</span>
              <span className="text-2xl font-black block font-mono tracking-tight">
                {formatTHB(kpis.wonValue)}
              </span>
              <span className="text-[11px] text-emerald-50 bg-white/15 px-2 py-0.5 rounded-full inline-block font-sans">
                ปิดดีลสำเร็จเรียบร้อย {kpis.wonOppsCount} ดีล
              </span>
            </div>
          </div>
          <CheckCircle className="absolute -right-4 -bottom-4 w-28 h-28 opacity-15 text-white transform -rotate-12 transition-transform duration-300 group-hover:scale-110" />
          <button 
            onClick={() => onNavigate('opportunities')}
            className="absolute bottom-0 left-0 right-0 py-1.5 bg-black/15 hover:bg-black/30 transition-colors text-[11px] font-semibold flex items-center justify-center gap-1 text-white/95 border-t border-white/5 cursor-pointer focus:outline-none"
          >
            ดูดีลที่ปิดสำเร็จ <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* KPI 4: Customers (AdminLTE Yellow Box) */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-xl shadow-md relative overflow-hidden group hover:shadow-lg transition-all duration-205 pb-10">
          <div className="flex justify-between items-start z-10 relative">
            <div className="space-y-1.5">
              <span className="text-white/85 text-xs font-bold uppercase tracking-wider block">รายชื่อลูกค้าคู่ค้าหลัก</span>
              <span className="text-2xl font-black block font-mono tracking-tight">
                {kpis.totalCustomers} <span className="text-sm font-normal text-amber-50">รายบริษัท</span>
              </span>
              <span className="text-[11px] text-amber-50 bg-white/15 px-2 py-0.5 rounded-full inline-block font-sans">
                Active: {customers.filter(c => c.status === 'Active').length} | Inactive: {customers.filter(c => c.status === 'Inactive').length}
              </span>
            </div>
          </div>
          <Users className="absolute -right-4 -bottom-4 w-28 h-28 opacity-15 text-white transform -rotate-12 transition-transform duration-300 group-hover:scale-110" />
          <button 
            onClick={() => onNavigate('customers')}
            className="absolute bottom-0 left-0 right-0 py-1.5 bg-black/15 hover:bg-black/30 transition-colors text-[11px] font-semibold flex items-center justify-center gap-1 text-white/95 border-t border-white/5 cursor-pointer focus:outline-none"
          >
            จัดการบัญชีลูกค้าองค์กร <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pie Chart: Status Breakdown (Span 2 to make it beautiful) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">จำนวนโอกาสทางการขายแยกตามสถานะ</h3>
            <p className="text-slate-400 text-xs mt-0.5">แบ่งตามปริมาณความคืบหน้า (สถานะทางการดำเนินงาน)</p>
          </div>

          <div className="h-64 my-4 flex items-center justify-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', zIndex: 1000 }} 
                    formatter={(value: any, name: any, props: any) => [
                      `${value} รายการ (${formatTHB(props.payload.valueAmount)})`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-sm flex flex-col items-center gap-2">
                <Target className="w-8 h-8 text-slate-300 stroke-1" />
                ไม่มีข้อมูลของลูกค้าผู้มุ่งหวัง
              </div>
            )}
          </div>

          <div className="space-y-1.5 text-xs max-h-48 overflow-y-auto pr-1">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="truncate max-w-[150px]">{item.name}</span>
                </div>
                <div className="font-mono text-slate-800 font-bold">{item.value} งาน ({formatTHB(item.valueAmount)})</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart: Value across Statuses */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
          <div>
            <h3 className="text-base font-bold text-slate-800">มูลค่าทางโอกาสธุรกิจเทียบตามแต่ละขั้นตอนการขาย</h3>
            <p className="text-slate-400 text-xs mt-0.5">วิเคราะห์มูลค่าสถิติเม็ดเงินรวมในแต่ละขั้นตอน (บาท)</p>
          </div>

          <div className="h-80 mt-6 select-none">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                <BarChart data={statusData} margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : `${v / 1000}K`}
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'none' }}
                    formatter={(value: any) => [formatTHB(Number(value)), 'มูลค่ารวม']}
                  />
                  <Bar dataKey="valueAmount" maxBarSize={36} radius={[6, 6, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                ไม่มีข้อมูลของลูกค้าผู้มุ่งหวัง
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Monthly Pipeline and expected Close Dates */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-5 h-5 text-blue-500" />
                ประมาณการยอดขายคาดการณ์รายเดือน (Monthly Close Forecast)
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                มูลค่างบประมาณรวมและมูลค่าถ่วงน้ำหนักโอกาสชนะ ตามเป้าหมายระยะเวลาปิดดีล (Expected Close Date)
              </p>
            </div>
            <div className="flex gap-4 text-xs font-medium">
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-3 h-3 bg-blue-500 rounded"></span> ยอดขายรวมแท้จริง (Estimated)
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-3 h-3 bg-emerald-500 rounded"></span> ยอดตามน้ำหนักความน่าจะเป็น (Weighted)
              </span>
            </div>
          </div>

          <div className="h-72 mt-6">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorWeighted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis 
                    tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : `${v / 1000}K`}
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    formatter={(value: any, name: any) => [
                      formatTHB(Number(value)), 
                      name === 'total' ? 'ยอดประมาณการรวม' : 'ยอดถ่วงน้ำหนักสำเร็จ'
                    ]}
                  />
                  <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" name="total" />
                  <Area type="monotone" dataKey="weighted" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorWeighted)" name="weighted" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                ยังไม่มีการระบุเป้าหมายวันปิดงานในระบบ
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
