import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Building2, UserPlus, UserMinus, Wallet, CircleDollarSign, Star, Briefcase,
  Search, Filter, Download, Plus, ChevronDown, ChevronRight, MapPin, Phone, Mail,
  Globe, Clock, CreditCard, FileText, Activity, MoreVertical, X, CheckCircle2,
  Calendar, AlertCircle, Edit, Trash2, Shield, UploadCloud, Tag, Layers, Settings,
  ArrowRight
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';

// --- Types ---
type ViewMode = 'list' | 'detail' | 'form';

// --- Main Container ---
export default function EnterpriseCustomerDB() {
  const [view, setView] = useState<ViewMode>('list');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
       {/* Header */}
       <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">Customer Database</h1>
            <p className="text-sm font-medium text-slate-500">Enterprise Single Source of Truth</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {view === 'list' ? (
            <>
              <button className="flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                <Download className="w-4 h-4" /> Export
              </button>
              <button 
                onClick={() => { setSelectedCustomer(null); setView('form'); }}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> New Customer
              </button>
            </>
          ) : (
            <button 
              onClick={() => setView('list')}
              className="flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
            >
               Back to List
            </button>
          )}
        </div>
      </div>

      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
         {view === 'list' && <CustomerListView onNavigate={(v, c) => { setView(v); setSelectedCustomer(c); }} />}
         {view === 'form' && <CustomerFormView customer={selectedCustomer} onSave={() => setView('list')} onCancel={() => setView('list')} />}
         {view === 'detail' && <CustomerDetailView customer={selectedCustomer} onEdit={() => setView('form')} />}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// LIST VIEW
// -------------------------------------------------------------
function CustomerListView({ onNavigate }: { onNavigate: (view: ViewMode, customer?: any) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      // @ts-ignore
      if (window.SupabaseDB) {
         try {
             // @ts-ignore
             const data = await window.SupabaseDB.getCustomers();
             // Transform from raw schema to our UI schema
             const mapped = data.map((c: any) => ({
                id: c.id,
                code: c.customer_code,
                name: c.customer_name,
                taxId: c.tax_id || '',
                type: 'Corporate', // mapped defaults
                industry: c.industry_type || '',
                primaryContact: c.contacts && c.contacts.length > 0 ? c.contacts[0].contact_name : 'No Contact',
                phone: c.phone || '',
                email: c.email || '',
                paymentTerm: c.payment_term || 30,
                status: c.status || 'Active',
                tags: []
             }));
             setCustomers(mapped.length > 0 ? mapped : mockCustomers);
         } catch (e) {
             console.warn('Failed to fetch from Supabase:', e);
             setCustomers(mockCustomers);
         }
      } else {
        setCustomers(mockCustomers);
      }
    }
    fetchData();
  }, []);
  
  return (
    <div className="space-y-6">
      <CustomerDashboardCards />

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search customers by name, tax ID, or code..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
            <Filter className="w-4 h-4" /> Advanced Filter
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
            <Settings className="w-4 h-4" /> Columns
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold cursor-pointer hover:text-slate-700">Code</th>
                <th className="px-4 py-3 font-semibold cursor-pointer hover:text-slate-700">Customer Name</th>
                <th className="px-4 py-3 font-semibold">Tax ID</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Industry</th>
                <th className="px-4 py-3 font-semibold">Contact Person</th>
                <th className="px-4 py-3 font-semibold text-right">Payment Term</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => onNavigate('detail', c)}>
                  <td className="px-4 py-3 font-mono text-slate-500 font-medium">{c.code}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {c.name}
                    </div>
                    {c.tags && (
                       <div className="flex gap-1 mt-1">
                         {c.tags.map((t: string) => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold border border-blue-100">{t}</span>)}
                       </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-500">{c.taxId}</td>
                  <td className="px-4 py-3 text-slate-600">{c.type}</td>
                  <td className="px-4 py-3 text-slate-600">{c.industry}</td>
                  <td className="px-4 py-3">
                    <div className="text-slate-800 font-medium">{c.primaryContact}</div>
                    <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3"/> {c.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs font-semibold text-slate-700">
                       <Clock className="w-3 h-3 text-slate-400" /> {c.paymentTerm} Days
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold ${c.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onNavigate('detail', c); }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50">
           <span className="text-sm text-slate-500 font-medium">Showing 1 to 5 of 124 entries</span>
           <div className="flex gap-1">
             <button className="px-3 py-1 bg-white border border-slate-300 rounded text-sm font-medium text-slate-500 disabled:opacity-50">Prev</button>
             <button className="px-3 py-1 bg-blue-600 border border-blue-600 rounded text-sm font-bold text-white">1</button>
             <button className="px-3 py-1 bg-white border border-slate-300 rounded text-sm font-medium text-slate-700">2</button>
             <button className="px-3 py-1 bg-white border border-slate-300 rounded text-sm font-medium text-slate-700">3</button>
             <button className="px-3 py-1 bg-white border border-slate-300 rounded text-sm font-medium text-slate-700">Next</button>
           </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SUMMARY CARDS
// -------------------------------------------------------------
function CustomerDashboardCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard title="Total Customers" value="842" icon={<Users />} trend="up" pct="+12%" color="bg-blue-50 text-blue-600 border-blue-100" />
      <KPICard title="Active Customers" value="615" icon={<CheckCircle2 />} trend="up" pct="+5%" color="bg-emerald-50 text-emerald-600 border-emerald-100" />
      <KPICard title="New This Month" value="24" icon={<UserPlus />} trend="up" pct="+18%" color="bg-purple-50 text-purple-600 border-purple-100" />
      <KPICard title="Inactive / Stopped" value="48" icon={<UserMinus />} trend="down" pct="-2%" color="bg-rose-50 text-rose-600 border-rose-100" />
      
      <KPICard title="Total Revenue" value="฿ 452.8M" icon={<Wallet />} trend="up" pct="+15%" color="bg-indigo-50 text-indigo-600 border-indigo-100" />
      <KPICard title="Total Outstanding" value="฿ 12.4M" icon={<AlertCircle />} trend="down" pct="-8%" color="bg-amber-50 text-amber-600 border-amber-100" />
      <KPICard title="VIP Clients" value="35" icon={<Star />} trend="up" pct="+2%" color="bg-yellow-50 text-yellow-600 border-yellow-100" />
      <KPICard title="Active Projects" value="128" icon={<Briefcase />} trend="up" pct="+14%" color="bg-cyan-50 text-cyan-600 border-cyan-100" />
    </div>
  );
}

function KPICard({ title, value, icon, trend, pct, color }: any) {
  const isUp = trend === 'up';
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
       <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-black/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}></div>
       <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
          <div className={`p-2 rounded-lg ${color}`}>
            {React.cloneElement(icon, { className: "w-5 h-5" })}
          </div>
       </div>
       <div>
         <div className="text-2xl font-black text-slate-900 tracking-tight font-sans">{value}</div>
         <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs font-bold flex items-center ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
              {pct}
            </span>
            <span className="text-xs font-medium text-slate-400">vs last month</span>
         </div>
       </div>
    </div>
  )
}

// -------------------------------------------------------------
// DETAIL VIEW (360 Degree View)
// -------------------------------------------------------------
function CustomerDetailView({ customer, onEdit }: { customer: any, onEdit: () => void }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const tabs = ['Overview', 'Contacts', 'Addresses', 'Quotations', 'Sales Orders', 'Projects', 'Invoices', 'Payments', 'Documents', 'Activities'];

  if (!customer) return <div>No customer selected.</div>;

  return (
    <div className="space-y-6">
      {/* Header Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div className="flex items-center gap-5">
             <div className="w-20 h-20 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 text-3xl font-black shadow-inner">
               {customer.name.charAt(0)}
             </div>
             <div>
               <div className="flex items-center gap-3">
                 <h2 className="text-2xl font-bold text-slate-900">{customer.name}</h2>
                 <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${customer.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700'}`}>
                    {customer.status}
                 </span>
                 {customer.tags?.includes('VIP') && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                      VIP
                    </span>
                 )}
               </div>
               <div className="mt-1 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                 <div className="flex items-center gap-1 font-mono"><Tag className="w-3.5 h-3.5" /> {customer.code}</div>
                 <div className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Tax ID: {customer.taxId}</div>
                 <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {customer.province || 'Bangkok'}</div>
               </div>
               <div className="mt-3 flex gap-2">
                 {customer.tags?.map((t: string) => <span key={t} className="bg-slate-100 text-slate-600 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded">{t}</span>)}
               </div>
             </div>
           </div>
           
           <div className="flex gap-2 w-full md:w-auto">
              <button onClick={onEdit} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2 flex-1 md:flex-none">
                <Edit className="w-4 h-4" /> Edit Profile
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 flex-1 md:flex-none">
                <FileText className="w-4 h-4" /> New Transaction
              </button>
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-200 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3.5 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab 
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="p-6 bg-slate-50/30">
          {activeTab === 'Overview' && <DetailOverviewTab customer={customer} />}
          {activeTab === 'Contacts' && <DetailContactsTab />}
          {activeTab === 'Invoices' && <DetailInvoicesTab />}
          {activeTab === 'Activities' && <DetailActivitiesTab />}
          {/* Other tabs would go here */}
          {['Addresses', 'Quotations', 'Sales Orders', 'Projects', 'Payments', 'Documents'].includes(activeTab) && (
            <div className="py-12 text-center text-slate-400">
               <Layers className="w-12 h-12 mx-auto mb-3 opacity-20" />
               <p className="font-medium">{activeTab} management panel</p>
               <p className="text-sm mt-1">Select other active tabs (Overview, Contacts, Invoices, Activities) for preview.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-tabs for Detail View
function DetailOverviewTab({ customer }: { customer: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Details */}
      <div className="lg:col-span-1 space-y-6">
         {/* General Info */}
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
             <Building2 className="w-4 h-4 text-blue-600"/> Company Information
           </h3>
           <div className="space-y-3">
             <InfoRow label="Industry" value={customer.industry} />
             <InfoRow label="Customer Type" value={customer.type} />
             <InfoRow label="Branch No." value="00000 (Head Office)" />
             <InfoRow label="Website" value="www.company-website.com" link />
             <InfoRow label="Sales Owner" value="Wiriya S." />
           </div>
         </div>

         {/* Financial & Terms */}
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
             <CreditCard className="w-4 h-4 text-emerald-600"/> Financial & Terms
           </h3>
           <div className="space-y-3">
             <InfoRow label="Payment Term" value={`${customer.paymentTerm} Days`} />
             <InfoRow label="Credit Limit" value="฿ 5,000,000" bold />
             <InfoRow label="Tax Type" value="VAT 7%" />
             <InfoRow label="WHT" value="3%" />
           </div>
         </div>
      </div>

      {/* Right Column - Analytics & Quick Stats */}
      <div className="lg:col-span-2 space-y-6">
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
           <StatBox title="YTD Revenue" value="฿ 12.5M" />
           <StatBox title="Outstanding Balance" value="฿ 1.2M" highlight="danger" />
           <StatBox title="Active Projects" value="3" />
         </div>

         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Revenue History (12 Months)</h3>
           </div>
           <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                <BarChart data={mockRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} tickFormatter={(v) => `฿${v/1000}k`} />
                  <RechartsTooltip cursor={{fill: '#F1F5F9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
           </div>
         </div>
      </div>
    </div>
  );
}

function DetailContactsTab() {
  return (
    <div className="space-y-4">
       <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800">Contact Persons (3)</h3>
          <button className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-100 flex items-center gap-1">
            <Plus className="w-4 h-4"/> Add Contact
          </button>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ContactCard name="Somchai Jaidee" role="Purchasing Manager" phone="081-234-5678" email="somchai.j@example.com" isPrimary />
          <ContactCard name="Somsri Rakdee" role="Finance Manager" phone="089-876-5432" email="somsri.r@example.com" />
          <ContactCard name="Nadech Kugimiya" role="Project Director" phone="085-555-1234" email="nadech.k@example.com" />
       </div>
    </div>
  )
}

function DetailInvoicesTab() {
  return (
     <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Invoice No</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockDetailInvoices.map((inv, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono font-medium text-blue-600">{inv.no}</td>
                <td className="px-4 py-3 text-slate-600">{inv.date}</td>
                <td className="px-4 py-3 text-slate-600">{inv.dueDate}</td>
                <td className="px-4 py-3 text-right font-medium">฿ {inv.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : inv.status === 'Overdue' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
     </div>
  )
}

function DetailActivitiesTab() {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-3xl">
       <h3 className="font-bold text-slate-800 mb-6">Activity Timeline</h3>
       <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
          {mockTimeline.map((item, i) => (
            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 overflow-hidden">
                <Activity className="w-4 h-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                   <span className="font-bold text-slate-800 text-sm">{item.action}</span>
                   <span className="text-xs font-medium text-slate-400">{item.date}</span>
                </div>
                <p className="text-sm text-slate-600">{item.detail}</p>
                <p className="text-xs text-slate-400 mt-2">by {item.user}</p>
              </div>
            </div>
          ))}
       </div>
    </div>
  )
}


function InfoRow({ label, value, link, bold }: any) {
  return (
    <div className="flex justify-between py-1 border-b border-slate-50 last:border-0 hover:bg-slate-50 outline-none transition-colors rounded px-1">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      {link ? (
        <a href="#" className="text-sm font-semibold text-blue-600 hover:underline">{value}</a>
      ) : (
        <span className={`text-sm text-slate-800 ${bold ? 'font-bold' : 'font-semibold'}`}>{value}</span>
      )}
    </div>
  )
}

function StatBox({ title, value, highlight }: any) {
  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
      <div className="text-xs font-bold text-slate-500 uppercase mb-1">{title}</div>
      <div className={`text-xl font-black font-mono ${highlight === 'danger' ? 'text-rose-600' : 'text-slate-800'}`}>{value}</div>
    </div>
  )
}

function ContactCard({ name, role, phone, email, isPrimary }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 relative shadow-sm hover:shadow transition-shadow">
      {isPrimary && <span className="absolute top-3 right-3 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">PRIMARY</span>}
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-lg mb-3">
        {name.charAt(0)}
      </div>
      <h4 className="font-bold text-slate-800 text-sm">{name}</h4>
      <p className="text-xs text-slate-500 font-medium mb-3">{role}</p>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-slate-600"><Phone className="w-3.5 h-3.5 text-slate-400"/> {phone}</div>
        <div className="flex items-center gap-2 text-xs text-slate-600"><Mail className="w-3.5 h-3.5 text-slate-400"/> {email}</div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// FORM VIEW
// -------------------------------------------------------------
function CustomerFormView({ customer, onSave, onCancel }: { customer?: any, onSave: () => void, onCancel: () => void }) {
  const isEdit = !!customer;
  
  const handleSave = async () => {
     // @ts-ignore
     if (window.SupabaseDB) {
       // Mock save payload creation
       const payload = {
          customer_code: isEdit ? customer.code : `CUS-2600${Math.floor(Math.random()*100)}`,
          customer_name: 'New Registered Customer Ltd.',
          tax_id: '0105555555555',
          industry_type: 'Manufacturing',
          phone: '02-111-2222',
          payment_term: 30,
          status: 'Active'
       };
       try {
          if (isEdit) {
            // @ts-ignore
            await window.SupabaseDB.updateCustomer(customer.id, payload);
          } else {
             const uid = crypto.randomUUID ? crypto.randomUUID() : 'c'+Math.random();  
             // @ts-ignore
             await window.SupabaseDB.createCustomer({ id: uid, ...payload });
          }
       } catch (err) {
         console.warn("Save via DB failed, closing form anyway", err);
       }
     }
     onSave();
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {isEdit ? <Edit className="w-5 h-5 text-blue-600"/> : <Plus className="w-5 h-5 text-emerald-600"/>}
            {isEdit ? 'Edit Customer Protocol' : 'New Customer Registration'}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Complete the verified enterprise record</p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500"/></button>
      </div>

      <div className="p-8 space-y-8">
         {/* Section 1 */}
         <section>
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded flex items-center justify-center text-xs">1</span> 
              General Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <FormInput label="Customer Code (Auto-Generated)" defaultValue={isEdit ? customer.code : 'CUS-260024'} disabled />
               <FormInput label="Tax ID (13 Digits)" defaultValue={isEdit ? customer.taxId : ''} required />
               <FormInput label="Customer Name (TH)" defaultValue={isEdit ? customer.name : ''} required />
               <FormInput label="Customer Name (EN)" defaultValue={isEdit ? '' : ''} />
               <FormSelect label="Customer Type" options={['Corporate', 'Government', 'SME', 'Individual']} defaultValue={isEdit ? customer.type : ''} />
               <FormSelect label="Industry" options={['Manufacturing', 'Energy', 'Software', 'Retail', 'Telecom', 'Healthcare', 'Other']} defaultValue={isEdit ? customer.industry : ''} />
            </div>
         </section>

         {/* Section 2 */}
         <section>
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded flex items-center justify-center text-xs">2</span> 
              Primary Details & Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <FormInput label="Primary Phone" defaultValue={isEdit ? customer.phone : ''} required />
               <FormInput label="Primary Email" type="email" defaultValue={isEdit ? customer.email : ''} />
               <div className="md:col-span-2">
                 <label className="block text-sm font-bold text-slate-700 mb-1.5">Head Office Address <span className="text-rose-500">*</span></label>
                 <textarea className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none" rows={3}></textarea>
               </div>
            </div>
         </section>

         {/* Section 3 */}
         <section>
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded flex items-center justify-center text-xs">3</span> 
              Credit & Payment Terms
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
               <FormSelect label="Payment Term" options={['Cash', 'COD', '15 Days', '30 Days', '45 Days', '60 Days', '90 Days']} defaultValue={isEdit ? `${customer.paymentTerm} Days` : '30 Days'} />
               <FormInput label="Credit Limit (THB)" type="number" defaultValue={isEdit ? '5000000' : '0'} />
               <FormSelect label="Default VAT" options={['VAT 7%', 'VAT 0%', 'No VAT']} defaultValue="VAT 7%" />
            </div>
         </section>
      </div>

      <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
         <button onClick={onCancel} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50">Cancel</button>
         <button onClick={handleSave} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4"/> Save Customer Record
         </button>
      </div>
    </div>
  )
}

function FormInput({ label, type = "text", required, disabled, defaultValue }: any) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input 
        type={type} 
        disabled={disabled}
        defaultValue={defaultValue}
        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:bg-slate-100 disabled:text-slate-500 transition-colors" 
      />
    </div>
  )
}

function FormSelect({ label, options, required, defaultValue }: any) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <select 
        defaultValue={defaultValue}
        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
      >
        <option value="" disabled>Select...</option>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

// -------------------------------------------------------------
// MOCK DATA
// -------------------------------------------------------------
const mockCustomers = [
  { id: 1, code: 'CUS-260001', name: 'PTT Public Company Limited', taxId: '0107544000108', type: 'Corporate', industry: 'Energy', primaryContact: 'Somchai J.', phone: '02-537-2000', paymentTerm: 30, status: 'Active', tags: ['VIP', 'Key Account'] },
  { id: 2, code: 'CUS-260002', name: 'SCG Chemicals Co., Ltd', taxId: '0107537000958', type: 'Corporate', industry: 'Manufacturing', primaryContact: 'Wandee S.', phone: '02-586-3333', paymentTerm: 45, status: 'Active', tags: ['Enterprise'] },
  { id: 3, code: 'CUS-260003', name: 'Tech Solutions Hub', taxId: '0107555000111', type: 'SME', industry: 'Software', primaryContact: 'John Doe', phone: '02-123-4567', paymentTerm: 15, status: 'Inactive', tags: [] },
  { id: 4, code: 'CUS-260004', name: 'Advanced Info Service PLC', taxId: '0107535000265', type: 'Corporate', industry: 'Telecom', primaryContact: 'Sudarat V.', phone: '02-029-5000', paymentTerm: 60, status: 'Active', tags: ['VIP'] },
  { id: 5, code: 'CUS-260005', name: 'Bumrungrad Hospital', taxId: '0107536000536', type: 'Corporate', industry: 'Healthcare', primaryContact: 'Dr. Araya', phone: '02-066-8888', paymentTerm: 30, status: 'Active', tags: [] },
];

const mockRevenueData = [
  { month: 'Jan', amount: 850000 },
  { month: 'Feb', amount: 1200000 },
  { month: 'Mar', amount: 900000 },
  { month: 'Apr', amount: 1500000 },
  { month: 'May', amount: 2100000 },
  { month: 'Jun', amount: 1800000 },
];

const mockDetailInvoices = [
  { no: 'INV-2026-0089', date: '10-Jun-2026', dueDate: '10-Jul-2026', amount: 450000, status: 'Pending' },
  { no: 'INV-2026-0042', date: '15-May-2026', dueDate: '14-Jun-2026', amount: 125000, status: 'Overdue' },
  { no: 'INV-2026-0012', date: '05-Apr-2026', dueDate: '05-May-2026', amount: 890000, status: 'Paid' },
];

const mockTimeline = [
  { action: 'Invoice INV-2026-0089 Generated', date: '10-Jun-2026 14:30', detail: 'Generated from Sales Order SO-2026-0055 for maintenance service.', user: 'Somsri (Finance)' },
  { action: 'Sales Order SO-2026-0055 Approved', date: '08-Jun-2026 09:15', detail: 'Approved by Sales Director. Ready for fulfillment.', user: 'Director' },
  { action: 'Quotation QT-2026-0120 Accepted', date: '05-Jun-2026 16:45', detail: 'Customer signed and returned the quotation.', user: 'Wiriya S.' },
  { action: 'Customer Record Created', date: '01-Jan-2026 10:00', detail: 'Initial registration in ERP system.', user: 'Admin' },
];
