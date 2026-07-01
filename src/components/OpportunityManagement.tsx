import React, { useState, useEffect, useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  Briefcase, Target, TrendingUp, DollarSign, CheckCircle2, XCircle, Clock, Percent,
  Plus, Search, Filter, Download, KanbanSquare, List, LayoutDashboard, LineChart as LineChartIcon,
  ChevronRight, Calendar, AlertCircle, Edit, Trash2, Shield, Settings,
  ArrowRight, Phone, Mail, MoreVertical, X, Tag, FileText, UploadCloud, UserCircle2, Activity
} from 'lucide-react';

type ViewMode = 'dashboard' | 'list' | 'kanban' | 'forecast' | 'detail' | 'form';

export default function OpportunityManagement() {
  const [view, setView] = useState<ViewMode>('dashboard');
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // @ts-ignore
    if (window.SupabaseDB) {
      try {
        // @ts-ignore
        const data = await window.SupabaseDB.getOpportunities();
        const mapped = data.map((o: any) => ({
          id: o.id,
          no: o.opportunity_no,
          name: o.project_name || 'Unnamed Opportunity',
          customerId: o.customer_id,
          customerName: o.customer?.customer_name || 'Customer #' + String(o.customer_id).substring(0,4),
          source: o.lead_source || 'Website',
          projectType: o.service_type || 'Service',
          value: o.estimated_value || 0,
          probability: o.success_probability || 10,
          expectedRevenue: (o.estimated_value || 0) * ((o.success_probability || 0)/100),
          closeDate: o.expected_close_date || new Date().toISOString(),
          salesRep: o.sales_person_id || 'System User',
          stage: o.status || 'Lead',
          createdAt: o.created_at || new Date().toISOString()
        }));
        setOpportunities(mapped.length > 0 ? mapped : defaultMock);
      } catch(e) {
        setOpportunities(defaultMock);
      }
    } else {
      setOpportunities(defaultMock);
    }
  };

  const STAGES = ['Lead', 'Qualified', 'Need Analysis', 'Proposal', 'Negotiation', 'Quotation Submitted', 'Pending Approval', 'Won', 'Lost'];

  const getStageColor = (stage: string) => {
    if(stage === 'Won') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if(stage === 'Lost') return 'bg-rose-100 text-rose-700 border-rose-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">Opportunity Management</h1>
            <p className="text-sm font-medium text-slate-500">Enterprise CRM Pipeline & Forecast</p>
          </div>
        </div>

        {/* View Switcher */}
        {['dashboard', 'list', 'kanban', 'forecast'].includes(view) && (
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
             <ViewToggle icon={<LayoutDashboard className="w-4 h-4"/>} label="Dashboard" active={view==='dashboard'} onClick={()=>setView('dashboard')}/>
             <ViewToggle icon={<List className="w-4 h-4"/>} label="List" active={view==='list'} onClick={()=>setView('list')}/>
             <ViewToggle icon={<KanbanSquare className="w-4 h-4"/>} label="Kanban" active={view==='kanban'} onClick={()=>setView('kanban')}/>
             <ViewToggle icon={<LineChartIcon className="w-4 h-4"/>} label="Forecast" active={view==='forecast'} onClick={()=>setView('forecast')}/>
          </div>
        )}

        {['form', 'detail'].includes(view) && (
          <button onClick={() => setView('list')} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm">
             Back to Opportunities
          </button>
        )}
      </div>

      <div className="p-6 max-w-[1600px] mx-auto">
         {view === 'dashboard' && <OppDashboard opps={opportunities} onNavigate={(v, c) => {setView(v); if(c) setSelectedOpp(c)}} />}
         {view === 'list' && <OppList opps={opportunities} getStageColor={getStageColor} onNavigate={(v, c) => {setView(v); setSelectedOpp(c || null)}} />}
         {view === 'kanban' && <OppKanban opps={opportunities} stages={STAGES} onNavigate={(v, c) => {setView(v); setSelectedOpp(c || null)}} />}
         {view === 'forecast' && <OppForecast opps={opportunities} />}
         {view === 'form' && <OppForm opp={selectedOpp} onSave={() => {fetchData(); setView('list');}} onCancel={() => setView('list')} />}
         {view === 'detail' && <OppDetail opp={selectedOpp} getStageColor={getStageColor} onEdit={() => setView('form')} />}
      </div>
    </div>
  );
}

function ViewToggle({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${active ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
      {icon} <span className="hidden md:inline">{label}</span>
    </button>
  );
}

// ----------------------------------------------------------------------------------
// DASHBOARD
// ----------------------------------------------------------------------------------
function OppDashboard({ opps, onNavigate }: any) {
  const openCount = opps.filter((o:any) => o.stage !== 'Won' && o.stage !== 'Lost').length;
  const wonCount = opps.filter((o:any) => o.stage === 'Won').length;
  const lostCount = opps.filter((o:any) => o.stage === 'Lost').length;
  
  const totalVal = opps.reduce((acc:any, o:any) => acc + o.value, 0);
  const expectedRev = opps.reduce((acc:any, o:any) => acc + o.expectedRevenue, 0);

  const stageCounts = opps.reduce((acc: any, curr: any) => {
     acc[curr.stage] = (acc[curr.stage] || 0) + 1;
     return acc;
  }, {});
  const pipelineStageData = Object.keys(stageCounts).map(k => ({ name: k, value: stageCounts[k] }));

  const sourceCounts = opps.reduce((acc: any, curr: any) => {
     acc[curr.source] = (acc[curr.source] || 0) + 1;
     return acc;
  }, {});
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6'];
  const sourceData = Object.keys(sourceCounts).map((k, i) => ({ name: k, value: sourceCounts[k], color: colors[i % colors.length] }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Opportunities" val={opps.length} valStr={null} icon={<Briefcase/>} trend="up" pct="+8%" color="blue" />
        <KPICard title="Open Opportunities" val={openCount} valStr={null} icon={<Target/>} trend="up" pct="+12%" color="indigo" />
        <KPICard title="Total Pipeline Value" val={null} valStr={`฿ ${(totalVal/1000000).toFixed(1)}M`} icon={<DollarSign/>} trend="up" pct="+5%" color="emerald" />
        <KPICard title="Expected Revenue" val={null} valStr={`฿ ${(expectedRev/1000000).toFixed(1)}M`} icon={<TrendingUp/>} trend="neutral" pct="0%" color="blue" />
        <KPICard title="Won Opportunities" val={wonCount} valStr={null} icon={<CheckCircle2/>} trend="up" pct="+25%" color="emerald" />
        <KPICard title="Lost Opportunities" val={lostCount} valStr={null} icon={<XCircle/>} trend="down" pct="-5%" color="rose" />
        <KPICard title="Closing This Month" val={5} valStr={null} icon={<Clock/>} trend="up" pct="+2%" color="amber" />
        <KPICard title="Avg. Win Rate" val={null} valStr={`${(wonCount / (wonCount + lostCount || 1) * 100).toFixed(0)}%`} icon={<Percent/>} trend="up" pct="+8%" color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="text-base font-bold text-slate-800 mb-4">Pipeline by Stage (Funnel)</h3>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                <BarChart data={pipelineStageData.length ? pipelineStageData : mockPipelineStage} layout="vertical" margin={{top: 5, right: 30, left: 40, bottom: 5}}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0"/>
                  <XAxis type="number" axisLine={false} tickLine={false} className="text-xs text-slate-500" />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} className="text-xs font-semibold text-slate-700" width={120} />
                  <RechartsTooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '8px', border: '1px solid #E2E8F0'}} />
                  <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={24}>
                    {(pipelineStageData.length ? pipelineStageData : mockPipelineStage).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={'#2563EB'} />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="text-base font-bold text-slate-800 mb-4">Opportunity Source Analysis</h3>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
               <PieChart>
                 <Pie data={sourceData.length ? sourceData : mockSources} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value">
                   {(sourceData.length ? sourceData : mockSources).map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color} /> ))}
                 </Pie>
                 <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                 <Legend verticalAlign="bottom" height={36} />
               </PieChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  )
}

function KPICard({ title, val, valStr, icon, trend, pct, color }: any) {
  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100',
  };
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
       <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-bold text-slate-500 tracking-wide">{title}</h3>
          <div className={`p-2 rounded-lg ${colorMap[color]}`}>{icon}</div>
       </div>
       <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">{valStr || val}</div>
       <div className="flex items-center gap-2 mt-3">
          <span className={`text-xs font-bold ${trend==='up'?'text-emerald-600':trend==='down'?'text-rose-600':'text-slate-500'}`}>{pct}</span>
          <span className="text-xs font-medium text-slate-400">vs last month</span>
       </div>
    </div>
  )
}

// ----------------------------------------------------------------------------------
// LIST VIEW
// ----------------------------------------------------------------------------------
function OppList({ opps, getStageColor, onNavigate }: any) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search opportunities..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50"><Filter className="w-4 h-4"/> Filter</button>
          <button onClick={() => onNavigate('form')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm"><Plus className="w-4 h-4"/> New Opportunity</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-4 font-semibold">Opportunity</th>
                <th className="px-4 py-4 font-semibold">Customer</th>
                <th className="px-4 py-4 font-semibold text-right">Value (THB)</th>
                <th className="px-4 py-4 font-semibold text-center">Prob %</th>
                <th className="px-4 py-4 font-semibold text-right">Expected Rev</th>
                <th className="px-4 py-4 font-semibold text-center">Close Date</th>
                <th className="px-4 py-4 font-semibold">Sales Rep</th>
                <th className="px-4 py-4 font-semibold text-center">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {opps.map((o: any) => (
                <tr key={o.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => onNavigate('detail', o)}>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800 hover:text-blue-600 transition-colors">{o.name}</div>
                    <div className="text-xs font-mono text-slate-500 mt-1">{o.no}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-medium">{o.customerName}</td>
                  <td className="px-4 py-3 text-right font-mono font-medium">{(o.value).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-12 bg-slate-200 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{width:`${o.probability}%`}}></div></div>
                      <span className="text-xs font-bold w-6">{o.probability}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-blue-600">{(o.expectedRevenue).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center text-slate-600 text-xs font-medium">{o.closeDate.split('T')[0]}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs font-semibold flex items-center gap-1 mt-2.5">
                     <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600 font-bold">{o.salesRep.charAt(0)}</span>
                     {o.salesRep}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${getStageColor(o.stage)}`}>{o.stage}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------------
// KANBAN VIEW
// ----------------------------------------------------------------------------------
function OppKanban({ opps, stages, onNavigate }: any) {
  return (
    <div className="overflow-x-auto pb-6">
       <div className="flex gap-4 min-w-max">
         {stages.filter((s:any)=> s !== 'Won' && s !== 'Lost').map((stage: string) => {
           const stageOpps = opps.filter((o:any) => o.stage === stage);
           const total = stageOpps.reduce((acc:any, o:any) => acc + o.value, 0);
           return (
             <div key={stage} className="w-80 flex flex-col h-[calc(100vh-220px)]">
               {/* Column Header */}
               <div className="mb-3 px-1">
                 <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-slate-800">{stage}</h3>
                    <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">{stageOpps.length}</span>
                 </div>
                 <div className="text-xs font-medium text-slate-500">฿ {(total/1000000).toFixed(2)}M</div>
               </div>
               
               {/* Cards Container */}
               <div className="flex-1 bg-slate-100 rounded-xl p-2 overflow-y-auto space-y-2 border border-slate-200">
                  {stageOpps.map((o:any) => (
                    <div key={o.id} onClick={() => onNavigate('detail', o)} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group">
                       <div className="flex justify-between items-start mb-2">
                         <div className="text-xs font-mono font-bold text-blue-600">{o.no}</div>
                         <button className="text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical className="w-4 h-4"/></button>
                       </div>
                       <h4 className="font-bold text-slate-800 text-sm mb-1 leading-tight">{o.name}</h4>
                       <p className="text-xs text-slate-500 font-medium mb-3">{o.customerName}</p>
                       <div className="flex items-center justify-between mt-auto">
                         <div className="text-sm font-bold text-slate-700 font-mono">฿ {(o.value/1000).toFixed(0)}k</div>
                         <div className="bg-slate-100 text-slate-600 text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                           <Target className="w-3 h-3 text-amber-500"/> {o.probability}%
                         </div>
                       </div>
                    </div>
                  ))}
                  {stageOpps.length === 0 && (
                     <div className="h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-xs font-medium text-slate-400">
                       Drop here
                     </div>
                  )}
               </div>
             </div>
           )
         })}
       </div>
    </div>
  )
}

// ----------------------------------------------------------------------------------
// FORECAST ANALYTICS
// ----------------------------------------------------------------------------------
function OppForecast({ opps }: any) {
  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
            <h4 className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Q3 Expected Revenue</h4>
            <div className="text-4xl font-black text-blue-600 font-mono">฿ 45.2M</div>
         </div>
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
            <h4 className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Weighted Pipeline</h4>
            <div className="text-4xl font-black text-indigo-600 font-mono">฿ 28.5M</div>
         </div>
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
            <h4 className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Forecast Accuracy</h4>
            <div className="text-4xl font-black text-emerald-600 font-mono">85%</div>
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="text-base font-bold text-slate-800 mb-4">Monthly Closing Forecast</h3>
             <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                 <LineChart data={mockForecast}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0"/>
                   <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs text-slate-500" />
                   <YAxis axisLine={false} tickLine={false} className="text-xs text-slate-500" tickFormatter={v=>`฿${v/1000}k`} />
                   <RechartsTooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '8px', border: '1px solid #E2E8F0'}} />
                   <Legend />
                   <Line type="monotone" dataKey="expected" name="Expected Revenue" stroke="#3B82F6" strokeWidth={3} dot={{r:4}} />
                   <Line type="monotone" dataKey="bestCase" name="Best Case" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="text-base font-bold text-slate-800 mb-4">Pipeline Trend vs Target</h3>
             <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                 <AreaChart data={mockForecast}>
                   <defs>
                      <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0"/>
                   <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs text-slate-500" />
                   <YAxis axisLine={false} tickLine={false} className="text-xs text-slate-500" tickFormatter={v=>`฿${v/1000}k`} />
                   <RechartsTooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '8px', border: '1px solid #E2E8F0'}} />
                   <Legend />
                   <Area type="step" dataKey="target" name="Quota Target" stroke="#8B5CF6" fill="url(#colorTarget)" strokeWidth={2} />
                   <Line type="monotone" dataKey="closed" name="Closed Won" stroke="#F59E0B" strokeWidth={3} dot={{r:4}} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
       </div>
    </div>
  )
}

// ----------------------------------------------------------------------------------
// FORM VIEW
// ----------------------------------------------------------------------------------
function OppForm({ opp, onSave, onCancel }: any) {
  const isEdit = !!opp;
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    // @ts-ignore
    if(window.SupabaseDB) {
       // @ts-ignore
       window.SupabaseDB.getCustomers().then(c => setCustomers(c)).catch(() => {});
    }
  }, []);

  const handleSave = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    
    const payload = {
      project_name: fd.get('projectName'),
      customer_id: fd.get('customerId'),
      lead_source: fd.get('source'),
      service_type: fd.get('projectType'),
      estimated_value: parseFloat(fd.get('value') as string) || 0,
      success_probability: parseInt(fd.get('probability') as string) || 0,
      expected_close_date: fd.get('closeDate'),
      status: fd.get('stage'),
      sales_person_id: fd.get('salesRep')
    };

    // @ts-ignore
    if(window.SupabaseDB) {
      if(isEdit) {
        // @ts-ignore
        await window.SupabaseDB.updateOpportunity(opp.id, payload);
      } else {
        // @ts-ignore
        await window.SupabaseDB.addOpportunity(payload);
      }
    }
    onSave();
  };

  const handleDelete = async () => {
    if(confirm('Are you sure you want to delete this opportunity?')) {
       // @ts-ignore
       if(window.SupabaseDB) {
         // @ts-ignore
         await window.SupabaseDB.deleteOpportunity(opp.id);
       }
       onSave();
    }
  };

  return (
    <form onSubmit={handleSave} className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
       <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {isEdit ? <Edit className="w-5 h-5 text-blue-600"/> : <Plus className="w-5 h-5 text-emerald-600"/>}
            {isEdit ? 'Edit Opportunity' : 'Create Opportunity'}
          </h2>
        </div>
        <button type="button" onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5 text-slate-500"/></button>
      </div>

      <div className="p-8 space-y-8">
         <section>
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 uppercase flex items-center gap-2"><span className="bg-blue-100 text-blue-700 w-6 h-6 rounded flex items-center justify-center text-xs">1</span> General Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <FormInput label="Opportunity Name" name="projectName" defaultValue={isEdit ? opp.name : ''} required />
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Customer <span className="text-rose-500">*</span></label>
                  <select name="customerId" required defaultValue={isEdit ? opp.customerId : ''} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="" disabled>Select Customer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}
                  </select>
               </div>
               <FormSelect label="Source" name="source" options={['Walk In', 'Call In', 'Website Inquiry', 'Tender', 'Referral', 'Event']} defaultValue={isEdit ? opp.source : 'Website Inquiry'} />
               <FormSelect label="Project Type" name="projectType" options={['Product Sales', 'Service', 'Maintenance', 'Consulting']} defaultValue={isEdit ? opp.projectType : 'Service'} />
            </div>
         </section>

         <section>
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 uppercase flex items-center gap-2"><span className="bg-blue-100 text-blue-700 w-6 h-6 rounded flex items-center justify-center text-xs">2</span> Sales Pipeline Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
               <FormInput label="Opportunity Value (THB)" name="value" type="number" defaultValue={isEdit ? opp.value : 0} required />
               <FormInput label="Success Probability (%)" name="probability" type="number" defaultValue={isEdit ? opp.probability : 10} required />
               <FormInput label="Expected Close Date" name="closeDate" type="date" defaultValue={isEdit ? opp.closeDate.split('T')[0] : ''} required />
               <FormSelect label="Stage" name="stage" options={['Lead', 'Qualified', 'Need Analysis', 'Proposal', 'Negotiation', 'Quotation Submitted', 'Pending Approval', 'Won', 'Lost']} defaultValue={isEdit ? opp.stage : 'Lead'} required />
               <FormSelect label="Sales Rep" name="salesRep" options={['Wiriya S.', 'ธนพล คำดี (S03)', 'Pimjai K.']} defaultValue={isEdit ? opp.salesRep : 'Wiriya S.'} required />
            </div>
         </section>

         <section>
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 uppercase flex items-center gap-2"><span className="bg-blue-100 text-blue-700 w-6 h-6 rounded flex items-center justify-center text-xs">3</span> Description</h3>
            <textarea name="description" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24" placeholder="Add opportunity details, requirements, or scope..."></textarea>
         </section>
      </div>

      <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between gap-3">
         {isEdit ? (
           <button type="button" onClick={handleDelete} className="px-5 py-2.5 bg-rose-50 text-rose-600 rounded-lg text-sm font-bold shadow-sm hover:bg-rose-100 flex items-center gap-2"><Trash2 className="w-4 h-4"/> Delete</button>
         ) : <div></div>}
         <div className="flex gap-3">
           <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50">Cancel</button>
           <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4"/> Save Opportunity
           </button>
         </div>
      </div>
    </form>
  )
}

function FormInput({ label, name, type = "text", required, disabled, defaultValue }: any) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-1.5">{label} {required && <span className="text-rose-500">*</span>}</label>
      <input type={type} name={name} disabled={disabled} defaultValue={defaultValue} required={required} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100" />
    </div>
  )
}

function FormSelect({ label, name, options, required, defaultValue }: any) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-1.5">{label} {required && <span className="text-rose-500">*</span>}</label>
      <select name={name} required={required} defaultValue={defaultValue} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="" disabled>Select...</option>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

// ----------------------------------------------------------------------------------
// DETAIL VIEW
// ----------------------------------------------------------------------------------
function OppDetail({ opp, getStageColor, onEdit }: any) {
  const [activeTab, setActiveTab] = useState('Overview');
  const tabs = ['Overview', 'Activities', 'Attachments', 'Timeline', 'Notes'];

  if (!opp) return null;

  return (
    <div className="space-y-6">
      {/* Detail Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div>
              <div className="flex items-center gap-3 mb-1">
                 <h2 className="text-2xl font-bold text-slate-900">{opp.name}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                 <div className="flex items-center gap-1 font-mono font-bold text-indigo-600"><Briefcase className="w-4 h-4" /> {opp.no}</div>
                 <div className="flex items-center gap-1"><UserCircle2 className="w-4 h-4" /> Customer: <b>{opp.customerName}</b></div>
                 <div className="flex items-center gap-1"><Activity className="w-4 h-4" /> Prob: <b>{opp.probability}%</b></div>
              </div>
           </div>
           <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="text-right mr-4 hidden md:block">
                 <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Expected Rev</div>
                 <div className="text-2xl font-black font-mono text-emerald-600">฿ {(opp.expectedRevenue).toLocaleString()}</div>
              </div>
              <button onClick={onEdit} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-50 flex items-center gap-2">
                 <Edit className="w-4 h-4" /> Edit
              </button>
           </div>
        </div>

        {/* Pipeline Progress Bar */}
        <div className="mt-8">
           <div className="flex justify-between items-end mb-2">
             <span className="text-xs font-bold text-slate-500 uppercase">Pipeline Stage</span>
             <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getStageColor(opp.stage)}`}>{opp.stage}</span>
           </div>
           <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
              {['Lead', 'Qualified', 'Need Analysis', 'Proposal', 'Negotiation', 'Quotation Submitted', 'Won'].map((s, i) => {
                 const isActive = s === opp.stage || opp.stage === 'Won';
                 // Extremely simplified progress logic for mockup visual
                 let fill = opp.stage === 'Won' ? 'bg-emerald-500' : (opp.stage === 'Lost' ? 'bg-rose-500' : 'bg-blue-500');
                 return (
                    <div key={s} className={`h-full flex-1 border-r border-white/20 last:border-0 ${isActive ? fill : 'bg-transparent'}`}></div>
                 )
              })}
           </div>
           <div className="flex justify-between mt-1 px-1">
             <span className="text-[10px] font-bold text-slate-400">Lead</span>
             <span className="text-[10px] font-bold text-slate-400">Proposal</span>
             <span className="text-[10px] font-bold text-slate-400">Closed</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Left Column Container */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="flex overflow-x-auto border-b border-slate-200 scrollbar-hide">
                 {tabs.map(tab => (
                   <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-3.5 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                     {tab}
                   </button>
                 ))}
               </div>
               <div className="p-6 bg-slate-50/50 min-h-[400px]">
                  {activeTab === 'Overview' && (
                     <div className="space-y-6">
                       <h3 className="font-bold text-slate-800">Opportunity Details</h3>
                       <div className="grid grid-cols-2 gap-4">
                         <DetailItem label="Opportunity Value" value={`฿ ${opp.value.toLocaleString()}`} bold />
                         <DetailItem label="Expected Close Date" value={opp.closeDate.split('T')[0]} />
                         <DetailItem label="Source" value={opp.source} />
                         <DetailItem label="Project Type" value={opp.projectType} />
                         <DetailItem label="Sales Representative" value={opp.salesRep} />
                         <DetailItem label="Created Date" value={opp.createdAt.split('T')[0]} />
                       </div>
                       <div className="pt-4 border-t border-slate-200">
                          <h4 className="font-bold text-slate-700 text-sm mb-2">Description / Scope</h4>
                          <p className="text-sm text-slate-600 leading-relaxed bg-white p-4 border border-slate-200 rounded-lg">Requirement analysis for expanding database capacities and implementing enterprise data pipeline over the next 12 months. Requires close collaboration with the technical engineering team.</p>
                       </div>
                     </div>
                  )}
                  {activeTab === 'Activities' && (
                     <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-slate-800">Follow-up Activities</h3>
                          <button className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 flex items-center gap-1"><Plus className="w-4 h-4"/> Log Activity</button>
                        </div>
                        {mockActivities.map(act => (
                          <div key={act.id} className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
                             <div className="flex justify-between items-start mb-2">
                               <div className="flex items-center gap-2">
                                 <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center"><Phone className="w-4 h-4"/></span>
                                 <span className="font-bold text-slate-800 text-sm">{act.type}</span>
                               </div>
                               <span className="text-xs font-semibold text-slate-500">{act.date}</span>
                             </div>
                             <p className="text-sm text-slate-600 ml-10">{act.note}</p>
                          </div>
                        ))}
                     </div>
                  )}
                  {activeTab === 'Attachments' && (
                     <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                        <UploadCloud className="w-12 h-12 text-blue-300 mx-auto mb-3"/>
                        <h4 className="font-bold text-slate-700">Document Attachments</h4>
                        <p className="text-sm text-slate-500 mb-4">Upload proposals, BOQ, Contracts or Requirement Docs</p>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">Browse Files</button>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Right Column Container */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
               <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Customer Info</h3>
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-500">{opp.customerName.charAt(0)}</div>
                 <div>
                   <div className="font-bold text-slate-800 leading-tight">{opp.customerName}</div>
                   <a href="#" className="text-xs text-blue-600 font-semibold hover:underline">View CRM Profile</a>
                 </div>
               </div>
               <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                 <div className="flex items-center gap-2 text-sm"><UserCircle2 className="w-4 h-4 text-slate-400"/><span className="font-semibold text-slate-700">Somchai Jaidee</span></div>
                 <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-slate-400"/><span className="text-slate-600">081-222-3333</span></div>
                 <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-slate-400"/><span className="text-slate-600">somchai@example.com</span></div>
               </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
               <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Next Follow-up</h3>
               <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-amber-600"/>
                    <span className="font-bold text-amber-800 text-sm">Tomorrow, 10:00 AM</span>
                  </div>
                  <p className="text-sm text-amber-700 font-medium">Follow up on submitted proposal regarding pricing discount request.</p>
                  <button className="mt-3 text-xs bg-white text-amber-700 px-3 py-1.5 font-bold rounded shadow-sm border border-amber-200 w-full text-center">Mark Complete</button>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}

function DetailItem({ label, value, bold }: any) {
  return (
    <div className="bg-white p-3 border border-slate-100 rounded-lg">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-sm text-slate-800 ${bold ? 'font-black font-mono text-base text-blue-700' : 'font-medium'}`}>{value}</div>
    </div>
  )
}

// ----------------------------------------------------------------------------------
// MOCK DATA 
// ----------------------------------------------------------------------------------

const defaultMock = [
  { id: '1', no: 'OPP-2601', name: 'Cloud Migration Phase 1', customerName: 'SCG Chemicals', source: 'Website', projectType: 'Service', value: 2500000, probability: 60, expectedRevenue: 1500000, closeDate: '2026-09-15', salesRep: 'Wiriya S.', stage: 'Proposal', createdAt: '2026-06-01' },
  { id: '2', no: 'OPP-2602', name: 'Factory Automation Sensors', customerName: 'PTT PCL', source: 'Tender', projectType: 'Product Sales', value: 12000000, probability: 30, expectedRevenue: 3600000, closeDate: '2026-11-20', salesRep: 'Pimjai K.', stage: 'Need Analysis', createdAt: '2026-06-10' },
  { id: '3', no: 'OPP-2603', name: 'Annual Maintenance Contract', customerName: 'AIS PLC', source: 'Existing Customer', projectType: 'Maintenance', value: 850000, probability: 90, expectedRevenue: 765000, closeDate: '2026-07-01', salesRep: 'ธนพล คำดี', stage: 'Negotiation', createdAt: '2026-05-15' },
  { id: '4', no: 'OPP-2604', name: 'Security Camera Installation', customerName: 'Central Group', source: 'Referral', projectType: 'Product & Service', value: 3400000, probability: 20, expectedRevenue: 680000, closeDate: '2026-08-15', salesRep: 'Wiriya S.', stage: 'Qualified', createdAt: '2026-06-12' },
  { id: '5', no: 'OPP-2605', name: 'Server Hardware Upgrade', customerName: 'Bumrungrad Hospital', source: 'Call In', projectType: 'Product Sales', value: 5200000, probability: 100, expectedRevenue: 5200000, closeDate: '2026-05-30', salesRep: 'Pimjai K.', stage: 'Won', createdAt: '2026-04-20' },
];

const mockPipelineStage = [
  { name: 'Lead', value: 45 },
  { name: 'Qualified', value: 32 },
  { name: 'Need Analysis', value: 20 },
  { name: 'Proposal', value: 15 },
  { name: 'Negotiation', value: 8 },
  { name: 'Quotation', value: 5 },
  { name: 'Won', value: 12 },
];

const mockSources = [
  { name: 'Tender', value: 35, color: '#3B82F6' },
  { name: 'Referral', value: 25, color: '#10B981' },
  { name: 'Website', value: 20, color: '#F59E0B' },
  { name: 'Cold Call', value: 10, color: '#EF4444' },
  { name: 'Partner', value: 10, color: '#8B5CF6' },
];

const mockForecast = [
  { month: 'Jul', target: 8000000, expected: 5000000, bestCase: 6500000, closed: 2000000 },
  { month: 'Aug', target: 9000000, expected: 6500000, bestCase: 8000000, closed: 1500000 },
  { month: 'Sep', target: 10000000, expected: 11000000, bestCase: 12500000, closed: 0 },
  { month: 'Oct', target: 12000000, expected: 8000000, bestCase: 10000000, closed: 0 },
];

const mockActivities = [
  { id: 1, type: 'Phone Call', date: '18 Jun 2026, 14:00', note: 'Discussed initial requirements over the phone. Customer requested a formal introductory deck.' },
  { id: 2, type: 'Online Meeting', date: '15 Jun 2026, 10:00', note: 'Presented company credentials. Customer seemed interested in the cloud module.' },
];
