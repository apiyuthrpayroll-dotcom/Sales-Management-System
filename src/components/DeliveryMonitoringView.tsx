import React, { useState, useMemo } from 'react';
import { Customer, SalesOrder, Project, ProjectStatus, UserRole } from '../types';
import { 
  ClipboardList, Search, Filter, Plus, Clock, Activity, Flag, Truck, FileText, CheckCircle2,
  XCircle, Clock8, PlayCircle, Eye, Columns, BarChart4, ChevronRight, X, AlertTriangle,
  Building2, Target
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface DeliveryMonitoringViewProps {
  projects: Project[];
  salesOrders: SalesOrder[];
  customers: Customer[];
  onAdd: (payload: Omit<Project, 'id' | 'job_number' | 'created_at' | 'updated_at'>) => Promise<any>;
  onUpdate: (id: string, updates: Partial<Project>) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
  onToast: (msg: string, type: 'success' | 'err') => void;
  currentRole: UserRole;
  currentUserId: string;
}

export default function DeliveryMonitoringView({
  projects,
  salesOrders,
  customers,
  onAdd,
  onUpdate,
  onDelete,
  onToast,
  currentRole,
  currentUserId
}: DeliveryMonitoringViewProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  
  const canModify = currentRole !== 'Management';
  const canDelete = currentRole === 'Admin' || currentRole === 'System Administrator';

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchSearch =
        p.job_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.customer_name && p.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = selectedStatus === 'All' || p.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [projects, searchTerm, selectedStatus]);

  // Analytics
  const summary = useMemo(() => {
    return {
      total: projects.length,
      pending: projects.filter(p => p.status === 'Pending').length,
      mobilizing: projects.filter(p => p.status === 'Mobilizing').length,
      ongoing: projects.filter(p => p.status === 'On Going').length,
      completed: projects.filter(p => p.status === 'Completed').length,
      readyForInvoice: projects.filter(p => p.status === 'Ready For Invoice').length,
      delayed: projects.filter(p => p.status === 'Delayed').length,
      avgProgress: projects.length > 0 
        ? Math.round(projects.reduce((acc, p) => acc + (p.progress_percent || 0), 0) / projects.length) 
        : 0
    };
  }, [projects]);

  const statusColors: Record<string, string> = {
    'Pending': '#94a3b8',
    'Mobilizing': '#f59e0b',
    'On Going': '#3b82f6',
    'Completed': '#10b981',
    'Ready For Invoice': '#8b5cf6',
    'On Hold': '#64748b',
    'Delayed': '#ef4444',
    'Cancelled': '#64748b',
    'Closed': '#0f172a'
  };

  const getProgressColor = (progress: number) => {
    if (progress <= 25) return 'bg-red-500';
    if (progress <= 50) return 'bg-orange-500';
    if (progress <= 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const statusData = Object.keys(statusColors)
    .filter(k => projects.filter(p => p.status === k).length > 0)
    .map(status => ({
      name: status,
      value: projects.filter(p => p.status === status).length,
      color: statusColors[status]
    }));

  const progressData = [
    { name: '0-25%', count: projects.filter(p => p.progress_percent <= 25).length },
    { name: '26-50%', count: projects.filter(p => p.progress_percent > 25 && p.progress_percent <= 50).length },
    { name: '51-75%', count: projects.filter(p => p.progress_percent > 50 && p.progress_percent <= 75).length },
    { name: '76-100%', count: projects.filter(p => p.progress_percent > 75).length }
  ];

  return (
    <div className="space-y-6 animate-fade-in" id="delivery-monitoring-module">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Delivery & Ongoing Jobs Tracker</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">ศูนย์กลางติดตามสถานะงานโครงการและบริหารสัญญาแบบเรียลไทม์ (End-to-end Project Monitoring)</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {canModify && (
            <button
              onClick={() => onToast('สร้างโปรเจคด้วยการอนุมัติใบสั่งขาย (Sales Order) ตามระบบ ERP', 'success')}
              className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition-all cursor-pointer shadow-sm text-sm"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          )}
        </div>
      </div>

      {/* Internal Tabs */}
      <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 w-fit">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <BarChart4 className="w-4 h-4 inline-block mr-1.5" /> Dashboard Overview
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'list' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Columns className="w-4 h-4 inline-block mr-1.5" /> Delivery Job List
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Total Projects</div>
              <div className="text-2xl font-black text-slate-800">{summary.total}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-slate-400">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Pending</div>
              <div className="text-2xl font-black text-slate-800">{summary.pending}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
              <div className="text-[10px] uppercase font-bold text-amber-500 mb-1">Mobilizing</div>
              <div className="text-2xl font-black text-slate-800">{summary.mobilizing}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500">
              <div className="text-[10px] uppercase font-bold text-blue-500 mb-1">On Going</div>
              <div className="text-2xl font-black text-slate-800">{summary.ongoing}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
              <div className="text-[10px] uppercase font-bold text-emerald-500 mb-1">Completed</div>
              <div className="text-2xl font-black text-slate-800">{summary.completed}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-purple-500">
              <div className="text-[10px] uppercase font-bold text-purple-600 mb-1 leading-tight">Ready Invoice</div>
              <div className="text-2xl font-black text-slate-800">{summary.readyForInvoice}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-rose-500 bg-rose-50/30">
              <div className="text-[10px] uppercase font-bold text-rose-600 mb-1">Delayed</div>
              <div className="text-2xl font-black text-rose-700">{summary.delayed}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Avg Progress</div>
              <div className="text-2xl font-black text-indigo-600">{summary.avgProgress}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-wider">Projects by Status</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 justify-center mt-4">
                {statusData.map(s => (
                  <div key={s.name} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></div>
                    <span className="text-xs font-semibold text-slate-600">{s.name} ({s.value})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-wider">Progress Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                  <BarChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <RechartsTooltip cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {
                        progressData.map((entry, index) => {
                          const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
                          return <Cell key={`cell-${index}`} fill={colors[index]} />;
                        })
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
              <input
                type="text"
                placeholder="Search job number, project name, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-slate-400 w-4 h-4 shrink-0" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-40 bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none font-bold text-slate-700"
              >
                <option value="All">All Statuses</option>
                {Object.keys(statusColors).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <th className="px-4 py-3">Job Number</th>
                    <th className="px-4 py-3">Project / Customer</th>
                    <th className="px-4 py-3">Project Manager</th>
                    <th className="px-4 py-3">Timeline</th>
                    <th className="px-4 py-3">Progress</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Invoice</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-500">No projects found.</td>
                    </tr>
                  ) : (
                    filteredProjects.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-mono font-bold text-slate-800">{p.job_number}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{p.sales_order_no}</div>
                        </td>
                        <td className="px-4 py-3 min-w-[250px]">
                          <div className="font-bold text-slate-800 text-wrap leading-tight">{p.project_name}</div>
                          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><Building2 className="w-3 h-3" /> {p.customer_name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-700">{p.project_manager || '-'}</div>
                          <div className="text-[10px] text-slate-500">Sales: {p.sales_representative || '-'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-slate-700">{p.start_date ? new Date(p.start_date).toLocaleDateString() : '-'}</div>
                          <div className="text-[10px] text-slate-500">to {p.end_date ? new Date(p.end_date).toLocaleDateString() : '-'}</div>
                        </td>
                        <td className="px-4 py-3 w-32">
                          <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                            <span>{p.progress_percent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${getProgressColor(p.progress_percent)}`} style={{ width: `${p.progress_percent}%` }}></div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide" style={{
                            backgroundColor: `${statusColors[p.status]}15`,
                            color: statusColors[p.status],
                            border: `1px solid ${statusColors[p.status]}30`
                          }}>
                            {p.status}
                          </span>
                          {p.status === 'Delayed' && <AlertTriangle className="w-3.5 h-3.5 text-rose-500 inline-block ml-1" />}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div className={`font-semibold ${p.invoice_status === 'Not Billed' ? 'text-slate-400' : p.invoice_status === 'Partially Invoiced' ? 'text-amber-500' : 'text-emerald-600'}`}>
                            {p.invoice_status}
                          </div>
                          <div className="text-[10px] text-slate-400">{p.collection_status}</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setViewingProject(p)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Project Detail Dialog */}
      {viewingProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-end z-[100] animate-fade-in">
          <div className="bg-white w-full max-w-4xl h-full shadow-2xl flex flex-col animate-slide-left">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-start bg-slate-50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-extrabold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">{viewingProject.job_number}</span>
                  <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wide" style={{
                    backgroundColor: `${statusColors[viewingProject.status]}15`,
                    color: statusColors[viewingProject.status],
                    border: `1px solid ${statusColors[viewingProject.status]}30`
                  }}>
                    {viewingProject.status}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-800 leading-tight">{viewingProject.project_name}</h2>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-2">
                  <span className="flex items-center gap-1 font-medium"><Building2 className="w-3.5 h-3.5" /> {viewingProject.customer_name}</span>
                  <span>|</span>
                  <span className="font-mono">SO: {viewingProject.sales_order_no}</span>
                </div>
              </div>
              <button 
                onClick={() => setViewingProject(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
              
              {/* Progress Overview Section */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-end mb-2">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Project Progress</h3>
                  <span className="text-2xl font-black text-slate-800">{viewingProject.progress_percent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden shadow-inner">
                  <div className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(viewingProject.progress_percent)}`} style={{ width: `${viewingProject.progress_percent}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Start: {viewingProject.start_date || 'TBD'}</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{viewingProject.duration_days} Days Duration</span>
                  <span>End: {viewingProject.end_date || 'TBD'}</span>
                </div>
              </div>

              {/* Info Grid Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2 flex items-center gap-2"><Target className="w-4 h-4 text-emerald-600"/> Team & Financials</h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Project Manager</div>
                      <div className="font-semibold text-slate-800">{viewingProject.project_manager || '-'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Sales Representative</div>
                      <div className="font-semibold text-slate-800">{viewingProject.sales_representative || '-'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Contract Value</div>
                      <div className="font-mono font-bold text-blue-600">฿{viewingProject.contract_value?.toLocaleString() || '0'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Invoice Status</div>
                      <div className="font-semibold text-slate-800">{viewingProject.invoice_status}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2"><Clock8 className="w-4 h-4 text-emerald-600"/> Quick Actions</h3>
                  </div>
                  
                  <div className="space-y-2 flex-1 flex flex-col justify-center">
                    {viewingProject.status !== 'Completed' && viewingProject.status !== 'Ready For Invoice' && (
                      <button 
                        onClick={async () => {
                          if(confirm('Advance status to Completed?')) {
                            await onUpdate(viewingProject.id, { status: 'Completed', progress_percent: 100 });
                            setViewingProject({...viewingProject, status: 'Completed', progress_percent: 100});
                          }
                        }}
                        className="w-full py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Mark as Completed
                      </button>
                    )}
                    
                    {viewingProject.status === 'Completed' && (
                      <button 
                        onClick={async () => {
                          if(confirm('Set as Ready for Invoice? This will notify finance.')) {
                            await onUpdate(viewingProject.id, { status: 'Ready For Invoice' });
                            setViewingProject({...viewingProject, status: 'Ready For Invoice'});
                          }
                        }}
                        className="w-full py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-sm font-bold hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" /> Ready For Invoice
                      </button>
                    )}
                    
                    <button className="w-full py-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                       Update Progress Check-in
                    </button>
                  </div>
                </div>
              </div>

              {/* Tasks & Milestones structure mockup */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                 <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                       <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600"/> Key Tasks</h3>
                       <button className="text-[10px] font-bold bg-white border border-slate-200 rounded px-2 py-1 text-slate-600 hover:bg-slate-50">+ Add Task</button>
                    </div>
                    <div className="p-0 flex-1 h-64 overflow-y-auto">
                       {viewingProject.tasks && viewingProject.tasks.length > 0 ? (
                          <div className="divide-y divide-slate-100">
                             {viewingProject.tasks.map(t => (
                                <div key={t.id} className="p-3 hover:bg-slate-50 flex justify-between items-center group">
                                   <div>
                                      <div className="text-sm font-bold text-slate-700">{t.task_name}</div>
                                      <div className="text-[10px] text-slate-400 mt-0.5">{t.responsible_person} • Due {t.due_date}</div>
                                   </div>
                                   <div className="text-right">
                                      <div className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${t.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{t.status}</div>
                                   </div>
                                </div>
                             ))}
                          </div>
                       ) : (
                          <div className="flex h-full items-center justify-center text-slate-400 text-sm">No tasks assigned yet.</div>
                       )}
                    </div>
                 </div>

                 <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                       <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2"><Flag className="w-4 h-4 text-emerald-600"/> Milestones & Timeline</h3>
                       <button className="text-[10px] font-bold bg-white border border-slate-200 rounded px-2 py-1 text-slate-600 hover:bg-slate-50">+ Add</button>
                    </div>
                    <div className="p-4 flex-1 h-64 overflow-y-auto">
                       {viewingProject.timeline && viewingProject.timeline.length > 0 ? (
                          <div className="space-y-4">
                             {viewingProject.timeline.map((event, idx) => (
                                <div key={event.id} className="flex gap-3 relative">
                                   {idx !== viewingProject.timeline!.length - 1 && (
                                     <div className="absolute top-6 left-[11px] bottom-[-16px] w-[2px] bg-slate-200"></div>
                                   )}
                                   <div className="relative z-10 w-6 h-6 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                                      <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                   </div>
                                   <div>
                                      <div className="text-xs font-bold text-slate-700">{event.event_name}</div>
                                      <div className="text-[10px] text-slate-400 mt-0.5 border-l-[2px] border-slate-200 pl-2 ml-[3px] py-0.5">
                                         {event.date} {event.time} • {event.responsible_person}
                                      </div>
                                   </div>
                                </div>
                             ))}
                          </div>
                       ) : (
                          <div className="flex h-full items-center justify-center text-slate-400 text-sm">No timeline events recorded.</div>
                       )}
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
