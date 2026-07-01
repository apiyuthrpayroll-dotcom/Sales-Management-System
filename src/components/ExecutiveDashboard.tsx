import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Target, 
  LayoutDashboard, 
  BarChart4, 
  Settings, 
  ShieldCheck, 
  AlertTriangle,
  Menu,
  ChevronRight,
  Database,
  CloudLightning,
  Sparkles,
  Layers,
  ChevronDown,
  Moon,
  Sun,
  X,
  Users,
  Shield,
  History,
  Lock,
  ArrowRightLeft,
  Plus,
  FileText,
  Briefcase,
  Truck,
  FileSpreadsheet,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar as CalendarIcon,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart
} from 'recharts';

// Data types (Mock based on the prompt if no real data is passed, but we will accept props)
export default function ExecutiveDashboard({ customers = [], opportunities = [], invoices = [], salesOrders = [] }: any) {
  // We will map data later, for now we will use robust mock data to fulfill the UI requirement precisely as requested
  
  const COLORS = {
    primary: '#2563EB',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#06B6D4',
  };

  const [dateRange, setDateRange] = useState('This Year');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* 1. Header Section */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
            IKM
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">Executive Dashboard</h1>
            <p className="text-sm font-medium text-slate-500">Sales Management & ERP Overview</p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-lg px-3 py-1.5 border border-slate-200">
            <CalendarIcon className="w-4 h-4 text-slate-500 mr-2" />
            <select className="bg-transparent border-none text-sm font-medium focus:ring-0 text-slate-700 outline-none" value={dateRange} onChange={e => setDateRange(e.target.value)}>
              <option>This Month</option>
              <option>Last Quarter</option>
              <option>This Year</option>
              <option>All Time</option>
            </select>
          </div>
          <button className="flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        
        {/* 2. EXECUTIVE KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total Opportunity Value" value="฿ 45.2M" count="124 Opportunities" trend="up" pct="12.5%" color="primary" />
          <KPICard title="Pending Quotation Value" value="฿ 12.8M" count="45 Quotations" trend="up" pct="4.2%" color="warning" />
          <KPICard title="Confirmed Sales Order" value="฿ 28.5M" count="83 SOs" trend="up" pct="18.5%" color="success" />
          <KPICard title="Active Projects" value="45 Projects" count="Avg Progress: 68%" trend="neutral" pct="0%" color="info" />
          <KPICard title="Outstanding Invoice" value="฿ 8.4M" count="32 Invoices" trend="down" pct="-2.4%" color="danger" />
          <KPICard title="Received Payment" value="฿ 18.2M" count="Accumulated" trend="up" pct="8.4%" color="success" />
          <KPICard title="Current Month Sales" value="฿ 4.2M" count="Total Monthly" trend="up" pct="15.2%" color="primary" />
          <KPICard title="Annual Sales target" value="฿ 85.0M" count="Achievement: 33%" trend="up" pct="Target" color="primary" />
        </div>

        {/* 3. SALES ANALYTICS & 4. ANNUAL SALES TREND */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Monthly Sales Analytics (Actual vs Target)">
             <ResponsiveContainer width="100%" height={300} minHeight={1} minWidth={1}>
              <ComposedChart data={mockMonthlySales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" tickFormatter={formatCurrencyShort} />
                <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                <Legend />
                <Bar dataKey="actual" name="Actual Sales" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Line type="monotone" dataKey="target" name="Sales Target" stroke="#F59E0B" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Annual Sales Trend (YoY)">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockAnnualTrend}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#94A3B8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" tickFormatter={formatCurrencyShort} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="currentYear" name="Current Year" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorCurrent)" />
                <Area type="monotone" dataKey="prevYear" name="Previous Year" stroke="#94A3B8" strokeWidth={2} fillOpacity={1} strokeDasharray="5 5" fill="url(#colorPrev)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* 5. SALES PIPELINE & 8. PROJECT STATUS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartCard title="Sales Pipeline Conversion">
              <div className="h-[300px] flex flex-col justify-center gap-2">
                {mockPipeline.map((stage, idx) => (
                  <div key={stage.stage} className="flex items-center gap-4 group">
                    <div className="w-32 text-right text-sm font-semibold text-slate-600">{stage.stage}</div>
                    <div className="flex-1 right bg-slate-100 rounded-r-lg overflow-hidden h-10 relative flex items-center shadow-sm">
                      <div 
                        className="absolute left-0 top-0 bottom-0 bg-blue-600 transition-all duration-500 ease-out group-hover:bg-blue-500"
                        style={{ width: `${(stage.value / mockPipeline[0].value) * 100}%` }}
                      ></div>
                      <div className="relative z-10 px-4 text-white text-xs font-bold drop-shadow-md flex justify-between w-full">
                        <span>{stage.count} deals</span>
                        <span>฿ {(stage.value / 1000000).toFixed(1)}M</span>
                      </div>
                    </div>
                    <div className="w-16 text-right text-xs font-bold text-slate-400">
                      {idx > 0 ? `${((stage.value / mockPipeline[idx - 1].value) * 100).toFixed(0)}%` : '100%'}
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
          <div className="lg:col-span-1">
             <ChartCard title="Project execution Status">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockProjectStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockProjectStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>

        {/* 6. TOP CUSTOMERS & 7. TOP SALESPERSON */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Top 5 Customers by Revenue">
             <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3 text-right">Revenue</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTopCustomers.map((c, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-400">#{i+1}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{c.name}</td>
                      <td className="px-4 py-3 text-right font-mono font-medium">฿ {c.revenue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${c.status === 'Good' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{c.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
             </div>
          </ChartCard>

          <ChartCard title="Top Salesperson Leaderboard">
             <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Salesperson</th>
                    <th className="px-4 py-3 text-center">Deals Won</th>
                    <th className="px-4 py-3 text-right">Achieved %</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTopSales.map((s, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        {i === 0 ? <span className="bg-yellow-400 text-yellow-900 w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-xs shadow-sm">1</span> : 
                         i === 1 ? <span className="bg-slate-300 text-slate-800 w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-xs shadow-sm">2</span> : 
                         i === 2 ? <span className="bg-orange-300 text-orange-900 w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-xs shadow-sm">3</span> : 
                         <span className="text-slate-400 font-bold ml-2">{i+1}</span>}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">{s.initials}</div>
                        {s.name}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-medium">{s.deals}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-1.5">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{width: `${s.pct}%`}}></div>
                          </div>
                          <span className="font-bold text-slate-700 w-10">{s.pct}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
             </div>
          </ChartCard>
        </div>

        {/* 9. FINANCIAL SUMMARY & 10. AR AGING */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <ChartCard title="AR Aging Report (Outstanding)">
             <div className="h-[250px] flex items-end justify-around pb-4 pt-10">
               {mockAging.map(b => (
                 <div key={b.period} className="flex flex-col items-center gap-2 w-1/4">
                   <div className="text-sm font-bold text-slate-700">฿ {b.amount}M</div>
                   <div className={`w-16 rounded-t-lg transition-all duration-500 shadow-sm ${b.color}`} style={{height: `${(b.amount / 12) * 150}px`}}></div>
                   <div className="text-xs font-semibold text-slate-500 text-center">{b.period}</div>
                 </div>
               ))}
             </div>
             <div className="mt-2 text-center text-xs text-slate-400">Aging buckets show total outstanding debt by days past due</div>
           </ChartCard>

           <ChartCard title="Recent Live Activities">
             <div className="space-y-4 p-2 relative h-[250px] overflow-y-auto">
               <div className="absolute left-[23px] top-6 bottom-0 w-0.5 bg-slate-200"></div>
               {mockActivities.map((act, i) => (
                 <div key={i} className="flex items-start gap-4 relative z-10">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm ${act.br}`}>
                     {act.icon}
                   </div>
                   <div className="pt-1">
                     <p className="text-sm font-semibold text-slate-800">{act.event}</p>
                     <p className="text-xs text-slate-500">{act.detail}</p>
                     <p className="text-[10px] text-slate-400 font-medium mt-1">{act.time}</p>
                   </div>
                 </div>
               ))}
             </div>
           </ChartCard>
        </div>

      </div>
    </div>
  );
}

// ---------------------------
// Helpers & Sub-components
// ---------------------------

function KPICard({ title, value, count, trend, pct, color }: any) {
  const colorMap: any = {
    primary: 'bg-blue-50 text-blue-600 border-blue-200',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    warning: 'bg-amber-50 text-amber-600 border-amber-200',
    danger: 'bg-rose-50 text-rose-600 border-rose-200',
    info: 'bg-cyan-50 text-cyan-600 border-cyan-200',
  };

  const trendIcon = trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : trend === 'down' ? <ArrowDownRight className="w-3.5 h-3.5" /> : null;
  const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-500';

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-${color}-50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity`}></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider w-3/4 leading-snug">{title}</h3>
          <div className={`p-1.5 rounded-lg ${colorMap[color]}`}>
            <LayoutDashboard className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono mb-1">{value}</div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs font-semibold text-slate-500">{count}</span>
          <div className={`flex items-center gap-1 text-xs font-bold ${trendColor}`}>
            {trendIcon}
            <span>{pct}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
      <h3 className="text-base font-bold text-slate-800 mb-4">{title}</h3>
      <div className="flex-1 w-full relative">
        {children}
      </div>
    </div>
  );
}

function formatCurrencyShort(val: number) {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
  return val.toString();
}

// ---------------------------
// Mock Data (For Visual Demo)
// ---------------------------

const mockMonthlySales = [
  { name: 'Jan', actual: 4000000, target: 4500000 },
  { name: 'Feb', actual: 5200000, target: 4800000 },
  { name: 'Mar', actual: 6100000, target: 5500000 },
  { name: 'Apr', actual: 4800000, target: 5800000 },
  { name: 'May', actual: 7500000, target: 6500000 },
  { name: 'Jun', actual: 8200000, target: 7200000 },
];

const mockAnnualTrend = [
  { month: 'Jan', currentYear: 4000000, prevYear: 3200000 },
  { month: 'Feb', currentYear: 5200000, prevYear: 3800000 },
  { month: 'Mar', currentYear: 6100000, prevYear: 4100000 },
  { month: 'Apr', currentYear: 4800000, prevYear: 4000000 },
  { month: 'May', currentYear: 7500000, prevYear: 5200000 },
  { month: 'Jun', currentYear: 8200000, prevYear: 5600000 },
];

const mockPipeline = [
  { stage: '1. Leads', count: 245, value: 120000000 },
  { stage: '2. Qualified', count: 180, value: 85000000 },
  { stage: '3. Proposal', count: 120, value: 65000000 },
  { stage: '4. Negotiation', count: 45, value: 28000000 },
  { stage: '5. Won / Sales Order', count: 28, value: 18500000 },
];

const mockProjectStatus = [
  { name: 'On Track', value: 45, color: '#10B981' },
  { name: 'Near Complete', value: 25, color: '#2563EB' },
  { name: 'Delayed', value: 10, color: '#F59E0B' },
  { name: 'Critical', value: 5, color: '#EF4444' },
];

const mockTopCustomers = [
  { name: 'PTT Public Company Limited', revenue: 12500000, status: 'Good' },
  { name: 'SCG Chemicals Co., Ltd', revenue: 8400000, status: 'Good' },
  { name: 'Thai Oil Public Co., Ltd', revenue: 6200000, status: 'Good' },
  { name: 'IRPC Public Co., Ltd', revenue: 4100000, status: 'Overdue' },
  { name: 'Global Power Synergy PCL', revenue: 3800000, status: 'Good' },
];

const mockTopSales = [
  { name: 'Wiriya S.', initials: 'WS', deals: 14, pct: 120 },
  { name: 'Pimjai K.', initials: 'PK', deals: 11, pct: 95 },
  { name: 'Somsri J.', initials: 'SJ', deals: 8, pct: 82 },
  { name: 'Tanapol C.', initials: 'TC', deals: 5, pct: 60 },
];

const mockAging = [
  { period: '0-30 Days', amount: 4.2, color: 'bg-emerald-400' },
  { period: '31-60 Days', amount: 2.8, color: 'bg-yellow-400' },
  { period: '61-90 Days', amount: 1.5, color: 'bg-orange-400' },
  { period: '> 90 Days', amount: 0.8, color: 'bg-rose-500' },
];

const mockActivities = [
  { event: 'Sales Order Approved', detail: 'SO-260012 for PTT Public Company', time: '10 mins ago', icon: <Briefcase className="w-4 h-4 text-emerald-600"/>, br: 'bg-emerald-100 text-emerald-600' },
  { event: 'New Quotation Sent', detail: 'QT-0005-26 to Thai Oil Public', time: '1 hour ago', icon: <FileText className="w-4 h-4 text-blue-600"/>, br: 'bg-blue-100 text-blue-600' },
  { event: 'Payment Received', detail: '฿1,200,000 from SCG Chemicals', time: '3 hours ago', icon: <Wallet className="w-4 h-4 text-green-600"/>, br: 'bg-green-100 text-green-600' },
  { event: 'Invoice Overdue Alert', detail: 'INV-0010-26 is 30 days overdue', time: '5 hours ago', icon: <AlertTriangle className="w-4 h-4 text-red-600"/>, br: 'bg-red-100 text-red-600' },
  { event: 'Deal Status Changed', detail: 'Welding Support -> Negotiation', time: 'Yesterday', icon: <Layers className="w-4 h-4 text-amber-600"/>, br: 'bg-amber-100 text-amber-600' },
];

