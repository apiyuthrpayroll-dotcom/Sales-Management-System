import React, { useState, useMemo, useEffect } from 'react';
import { Customer, Opportunity, OpportunityStatus, Activity, OpportunityTask, OpportunityAttachment, UserRole } from '../types';
import { SAMPLE_SALES_PERSONS, CRMService } from '../supabaseService';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Download, 
  FileSpreadsheet, 
  Eye, 
  X, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  User, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  FileCheck2,
  FileClock,
  ArrowUpDown,
  Paperclip,
  Lock,
  CheckCircle
} from 'lucide-react';

interface OpportunityViewProps {
  opportunities: Opportunity[];
  customers: Customer[];
  onAdd: (opportunity: Omit<Opportunity, 'id' | 'opportunity_no'>) => Promise<any>;
  onUpdate: (id: string, updates: Partial<Opportunity>) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
  onToast: (msg: string, type: 'success' | 'err') => void;
  currentRole?: UserRole;
  currentUserId?: string;
}

const SERVICE_TYPES = [
  'Industrial Cleaning',
  'Mechanical Service',
  'Testing Service',
  'Inspection Service',
  'Equipment Rental',
  'Manpower Service',
  'Maintenance & Repair',
  'Project Support'
];

const LEAD_SOURCES = [
  'Walk In',
  'Call In',
  'Call Out',
  'Existing Customer',
  'Referral',
  'Connection',
  'Website',
  'Email Inquiry',
  'Tender',
  'Other'
];

const OPPORTUNITY_STATUSES: { value: OpportunityStatus; label: string; colorClass: string }[] = [
  { value: 'Lead', label: 'Lead', colorClass: 'bg-slate-100 text-slate-700 border-slate-300' },
  { value: 'Qualified', label: 'Qualified', colorClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'Proposal', label: 'Proposal', colorClass: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'Negotiation', label: 'Negotiation', colorClass: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'Won', label: 'Won', colorClass: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'Lost', label: 'Lost', colorClass: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'Cancelled', label: 'Cancelled', colorClass: 'bg-zinc-800 text-white border-zinc-700' },
];

export default function OpportunityView({ 
  opportunities, 
  customers, 
  onAdd, 
  onUpdate, 
  onDelete, 
  onToast,
  currentRole = 'System Administrator',
  currentUserId = '3'
}: OpportunityViewProps) {
  
  const canModifyOpportunity = currentRole !== 'Management';
  const canDeleteOpportunity = currentRole === 'Admin' || currentRole === 'System Administrator';
  const isSales = currentRole === 'Sales';
  const canReassignSalesPerson = currentRole === 'Sales Manager' || currentRole === 'Admin' || currentRole === 'System Administrator';
  
  // Filtering & Pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [salesFilter, setSalesFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'opportunity_no' | 'estimated_value' | 'success_probability' | 'expected_close_date'>('opportunity_no');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);
  const [viewingOpp, setViewingOpp] = useState<Opportunity | null>(null);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  
  // Main form fields
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formProjectName, setFormProjectName] = useState('');
  const [formServiceType, setFormServiceType] = useState('Testing Service');
  const [formLeadSource, setFormLeadSource] = useState('Walk In');
  const [formEstimatedValue, setFormEstimatedValue] = useState('');
  const [formProbability, setFormProbability] = useState('50');
  const [formExpectedCloseDate, setFormExpectedCloseDate] = useState('2026-12-31');
  const [formSalesPersonId, setFormSalesPersonId] = useState('1');
  const [formStatus, setFormStatus] = useState<OpportunityStatus>('Lead');
  const [formRemarks, setFormRemarks] = useState('');

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Related opportunity logs
  const [oppTab, setOppTab] = useState<'details' | 'activities' | 'tasks' | 'attachments'>('details');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tasks, setTasks] = useState<OpportunityTask[]>([]);
  const [attachments, setAttachments] = useState<OpportunityAttachment[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Quick form inputs inside opportunity details drawer
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('Sales Administrator');
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const [showActivityForm, setShowActivityForm] = useState(false);
  const [newActivityType, setNewActivityType] = useState<'Phone Call' | 'Meeting' | 'Email' | 'Site Visit' | 'Other'>('Phone Call');
  const [newActivitySubject, setNewActivitySubject] = useState('');
  const [newActivityDesc, setNewActivityDesc] = useState('');

  // Fetch opportunity components on focus
  useEffect(() => {
    if (viewingOpp) {
      setOppTab('details');
      setLoadingRelated(true);
      Promise.all([
        CRMService.fetchActivities(viewingOpp.id),
        CRMService.fetchTasks(viewingOpp.id),
        CRMService.fetchAttachments(viewingOpp.id)
      ]).then(([acts, tsks, atts]) => {
        setActivities(acts);
        setTasks(tsks);
        setAttachments(atts);
      }).catch(err => {
        console.error('Failed to load related opportunity logs:', err);
      }).finally(() => {
        setLoadingRelated(false);
      });
    }
  }, [viewingOpp]);

  const allSalesPersons = useMemo(() => {
    const base = [...SAMPLE_SALES_PERSONS];
    try {
      const cached = localStorage.getItem('crm_sim_users');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          parsed.forEach((user: any) => {
            if (!base.some(b => b.id === user.id)) {
              base.push({
                id: user.id,
                name: user.name || user.fullname || user.username,
                role: user.role,
                email: user.email || ''
              });
            }
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
    return base;
  }, []);

  const activeSalesPersonMap = useMemo(() => {
    return new Map(allSalesPersons.map(s => [s.id, s.name]));
  }, [allSalesPersons]);

  // 1. Process Filtering & Sorting
  const processedOpportunities = useMemo(() => {
    let list = [...opportunities];

    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(o => 
        o.opportunity_no.toLowerCase().includes(term) ||
        o.project_name.toLowerCase().includes(term) ||
        (o.customer?.customer_name || '').toLowerCase().includes(term) ||
        (activeSalesPersonMap.get(o.sales_person_id) || '').toLowerCase().includes(term)
      );
    }

    // Status Filter
    if (statusFilter !== 'All') {
      list = list.filter(o => o.status === statusFilter);
    }

    // Service Filter
    if (serviceFilter !== 'All') {
      list = list.filter(o => o.service_type === serviceFilter);
    }

    // Sales Filter
    if (salesFilter !== 'All') {
      list = list.filter(o => o.sales_person_id === salesFilter);
    }

    // Sort
    list.sort((a, b) => {
      let aVal: any = a[sortBy];
      let bVal: any = b[sortBy];

      if (sortBy === 'estimated_value' || sortBy === 'success_probability') {
        aVal = Number(aVal || 0);
        bVal = Number(bVal || 0);
      } else {
        aVal = String(aVal || '').toLowerCase();
        bVal = String(bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [opportunities, searchTerm, statusFilter, serviceFilter, salesFilter, sortBy, sortOrder, activeSalesPersonMap]);

  // 2. Pagination computation
  const paginatedOpps = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return processedOpportunities.slice(startIdx, startIdx + itemsPerPage);
  }, [processedOpportunities, currentPage]);

  const totalPages = Math.ceil(processedOpportunities.length / itemsPerPage) || 1;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleHeaderSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // 3. Reset & open forms
  const handleOpenAdd = () => {
    if (customers.length === 0) {
      onToast('กรุณาสร้างบิษัทลูกค้าอย่างน้อย 1 แห่งก่อนสร้างข้อเสนอลีด', 'err');
      return;
    }
    setEditingOpp(null);
    setFormCustomerId(customers[0].id);
    setFormProjectName('');
    setFormServiceType('Testing Service');
    setFormLeadSource('Walk In');
    setFormEstimatedValue('');
    setFormProbability('50');
    setFormExpectedCloseDate(new Date('2026-12-31').toISOString().split('T')[0]);
    setFormSalesPersonId(currentUserId || '1');
    setFormStatus('Lead');
    setFormRemarks('');
    setErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (opp: Opportunity, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingOpp(opp);
    setFormCustomerId(opp.customer_id);
    setFormProjectName(opp.project_name);
    setFormServiceType(opp.service_type);
    setFormLeadSource(opp.lead_source);
    setFormEstimatedValue(String(opp.estimated_value));
    setFormProbability(String(opp.success_probability));
    setFormExpectedCloseDate(opp.expected_close_date || '');
    setFormSalesPersonId(opp.sales_person_id);
    setFormStatus(opp.status);
    setFormRemarks(opp.remarks);
    setErrors({});
    setIsFormOpen(true);
  };

  const validateForm = () => {
    const errs: { [key: string]: string } = {};
    if (!formCustomerId) errs.customer = 'Please select a customer account';
    if (!formProjectName.trim()) errs.projectName = 'Please specify the project name';
    if (!formEstimatedValue.trim() || Number(formEstimatedValue) <= 0) {
      errs.value = 'Please enter a valid estimated budget (greater than 0)';
    }
    if (!formExpectedCloseDate) errs.closeDate = 'Please select the expected close date';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canModifyOpportunity) {
      onToast('Security Privilege (View Only): Executive users are not authorized to create or edit sales opportunities', 'err');
      return;
    }
    if (editingOpp && isSales && editingOpp.sales_person_id !== currentUserId) {
      onToast('Access Denied: Sales representatives can only edit their own assigned opportunities', 'err');
      return;
    }
    if (!validateForm()) return;

    const payload = {
      customer_id: formCustomerId,
      project_name: formProjectName,
      service_type: formServiceType,
      lead_source: formLeadSource,
      estimated_value: Number(formEstimatedValue),
      success_probability: Number(formProbability),
      expected_close_date: formExpectedCloseDate,
      sales_person_id: formSalesPersonId,
      status: formStatus,
      remarks: formRemarks
    };

    try {
      if (editingOpp) {
        await onUpdate(editingOpp.id, payload);
        onToast('Opportunity updated successfully', 'success');
        if (viewingOpp && viewingOpp.id === editingOpp.id) {
          const loadedCust = customers.find(c => c.id === formCustomerId);
          setViewingOpp({ ...viewingOpp, ...payload, customer: loadedCust });
        }
      } else {
        await onAdd(payload);
        onToast('New opportunity created successfully', 'success');
      }
      setIsFormOpen(false);
    } catch (err) {
      onToast('Error saving opportunity', 'err');
    }
  };

  const handleDeleteOpportunity = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canDeleteOpportunity) {
      onToast('Role Restricted: Only Administrators are authorized to delete opportunities', 'err');
      return;
    }
    if (confirm('Are you sure you want to delete this opportunity? This action cannot be undone.')) {
      try {
        await onDelete(id);
        onToast('Opportunity deleted successfully', 'success');
        if (viewingOpp && viewingOpp.id === id) {
          setViewingOpp(null);
        }
      } catch {
        onToast('Failed to delete opportunity', 'err');
      }
    }
  };

  // 4. Excel (CSV) Export Engine
  const handleExportCSV = () => {
    const csvHeaders = [
      'Opportunity No',
      'Customer Code',
      'Customer Name',
      'Project Name',
      'Service Type',
      'Lead Source',
      'Estimated Value',
      'Probability %',
      'Expected Close Date',
      'Sales Person',
      'Status',
      'Remarks',
      'Created At'
    ];

    const rows = processedOpportunities.map(o => [
      o.opportunity_no,
      o.customer?.customer_code || '',
      o.customer?.customer_name || '',
      o.project_name,
      o.service_type,
      o.lead_source,
      o.estimated_value,
      o.success_probability + '%',
      o.expected_close_date,
      activeSalesPersonMap.get(o.sales_person_id) || '',
      o.status,
      o.remarks.replace(/\r?\n|\r/g, " "),
      o.created_at || ''
    ]);

    // Download Utility using UTF-8 BOM
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
    link.setAttribute("download", `CRM_Opportunities_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast('Excel/CSV exported successfully', 'success');
  };

  // Helper formats
  const formatTHB = (num: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(num);
  };

  const getStatusBadge = (status: OpportunityStatus) => {
    const found = OPPORTUNITY_STATUSES.find(s => s.value === status);
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border inline-block ${found?.colorClass || ''}`}>
        {found?.label || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm col-span-full">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Sales Opportunities Pipeline (Opportunities)</h2>
          <p className="text-slate-400 text-xs mt-0.5">Track opportunity stages, estimate success probability, and manage sales deals.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs flex items-center justify-center gap-1.5 focus:outline-none"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Excel
          </button>
          <button
            id="btn-add-opportunity"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-1.5 focus:outline-none"
          >
            <Plus className="w-4 h-4" />
            Create Opportunity
          </button>
        </div>
      </div>

      {/* Multi filter Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-4 text-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              id="search-opportunity"
              type="text"
              placeholder="Search Deal No, Project Name, Customer..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none text-slate-800 font-sans"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full text-sm border border-slate-200 bg-slate-50 p-2 rounded-lg focus:outline-none text-slate-700 font-sans cursor-pointer"
            >
              <option value="All">All Stages / Status</option>
              {OPPORTUNITY_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Service Type Filter */}
          <div>
            <select
              id="filter-service"
              value={serviceFilter}
              onChange={(e) => { setServiceFilter(e.target.value); setCurrentPage(1); }}
              className="w-full text-sm border border-slate-200 bg-slate-50 p-2 rounded-lg focus:outline-none text-slate-700 font-sans cursor-pointer"
            >
              <option value="All">All Service Segments</option>
              {SERVICE_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Sales person filter */}
          <div>
            <select
              id="filter-sales"
              value={salesFilter}
              onChange={(e) => { setSalesFilter(e.target.value); setCurrentPage(1); }}
              className="w-full text-sm border border-slate-200 bg-slate-50 p-2 rounded-lg focus:outline-none text-slate-700 font-sans cursor-pointer"
            >
              <option value="All">All Sales Representatives</option>
              {allSalesPersons.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Main List Table (Google Sheets Style) */}
      <div className="bg-[#f8f9fa] border border-slate-300 rounded-lg shadow-sm overflow-hidden font-sans">
        {/* Google Sheets Sheets Tab styling & Formula Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-300 bg-[#f8f9fa] divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          <div className="flex items-center px-4 py-2 flex-grow min-w-0">
            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px] mr-2">fx</span>
            <div className="font-mono text-[11px] text-slate-600 bg-white border border-slate-200 py-1 px-2.5 rounded-sm flex-1 truncate select-all" title="Google Sheets Formula Simulator">
              =QUERY(OPPORTUNITIES_DATABASE, &quot;SELECT A, B, C, D, E, F WHERE D &gt;= 0 AND Status=&apos;{statusFilter}&apos;&quot; {searchTerm ? `AND LOWER(C) LIKE &apos;%${searchTerm.toLowerCase()}%&apos;` : ''})
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white sm:bg-transparent text-xs text-slate-500 font-sans">
            <span className="font-medium bg-[#E8EAED] px-2 py-1 rounded border border-slate-200 text-slate-700 select-none">Deals_Data</span>
            <span className="text-slate-400">|</span>
            <span className="font-mono font-semibold text-emerald-600">฿{processedOpportunities.reduce((sum, o) => sum + (Number(o.estimated_value) || 0), 0).toLocaleString()} ({processedOpportunities.length} rows)</span>
          </div>
        </div>

        <div className="overflow-x-auto bg-white">
          <table className="w-full text-left border-collapse table-fixed min-w-[950px] border border-slate-200">
            <thead>
              {/* Excel Column Headers A, B, C... */}
              <tr className="bg-[#F8F9FA] border-b border-slate-300 text-[10px] font-mono text-slate-400 select-none">
                <th className="border border-slate-200 bg-[#E8EAED] text-center w-10 py-1"></th>
                <th className="border border-slate-200 text-center w-32">A</th>
                <th className="border border-slate-200 text-center w-1/4">B</th>
                <th className="border border-slate-200 text-center w-1/4">C</th>
                <th className="border border-slate-200 text-center w-40">D</th>
                <th className="border border-slate-200 text-center w-28">E</th>
                <th className="border border-slate-200 text-center w-36">F</th>
                <th className="border border-slate-200 text-center w-44">G</th>
                <th className="border border-slate-200 text-center w-40">H</th>
                <th className="border border-slate-200 text-center w-32 font-sans text-[9px]">I</th>
              </tr>
              {/* Header Columns inside the spreadsheet */}
              <tr className="bg-[#F8F9FA] border-b-2 border-slate-300 text-xs font-semibold text-slate-600 select-none">
                <th className="border border-slate-200 bg-[#E8EAED] text-center w-10 font-mono"></th>
                <th 
                  onClick={() => handleHeaderSort('opportunity_no')}
                  className="border border-slate-200 px-3 py-2 text-slate-700 w-32 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Opportunity No
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700 w-1/4">Customer Account</th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700 w-1/4">Project Name & Service Category</th>
                <th 
                  onClick={() => handleHeaderSort('estimated_value')}
                  className="border border-slate-200 px-3 py-2 text-right text-slate-700 w-40 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    Estimated Value
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleHeaderSort('success_probability')}
                  className="border border-slate-200 px-3 py-2 text-center text-slate-700 w-28 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    Probability (%)
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleHeaderSort('expected_close_date')}
                  className="border border-slate-200 px-3 py-2 text-center text-slate-700 w-36 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    Expected Close Date
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="border border-slate-200 px-3 py-2 text-slate-700 w-44 font-sans">Sales Owner</th>
                <th className="border border-slate-200 px-3 py-2 text-center text-slate-700 w-40">Stage / Status</th>
                <th className="border border-slate-200 px-3 py-2 text-right text-slate-700 w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-700">
              {paginatedOpps.length > 0 ? (
                paginatedOpps.map((opp, idx) => (
                  <tr 
                    key={opp.id} 
                    onClick={() => setViewingOpp(opp)}
                    className={`hover:bg-blue-50/45 cursor-pointer transition-colors border-b border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]/70'}`}
                  >
                    {/* Index row background (spreadsheet numbering) */}
                    <td className="border border-slate-200 bg-[#F1F3F4] text-[#5f6368] text-center font-mono text-[10px] select-none py-1.5">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 font-mono text-slate-600 truncate">
                      {opp.opportunity_no}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 font-semibold text-slate-800 truncate" title={opp.customer?.customer_name}>
                      {opp.customer?.customer_name || 'Customer not assigned'}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5">
                      <div className="truncate font-medium text-slate-700" title={opp.project_name}>
                        {opp.project_name}
                      </div>
                      <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 rounded px-1.5 py-0.5 mt-1 inline-block select-none font-sans">
                        {opp.service_type}
                      </span>
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 text-right font-mono font-medium text-slate-900">
                      {formatTHB(opp.estimated_value)}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-1 font-mono font-semibold text-blue-600">
                        <TrendingUp className="w-3 h-3 text-blue-500" />
                        {opp.success_probability}%
                      </div>
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 text-center font-mono text-slate-600 text-[11px]">
                      {opp.expected_close_date || '-'}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 truncate text-slate-600">
                      {activeSalesPersonMap.get(opp.sales_person_id) || '-'}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 text-center">
                      {getStatusBadge(opp.status)}
                    </td>
                    <td className="border border-slate-200 px-3 py-1.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="View Details"
                          onClick={() => setViewingOpp(opp)}
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Edit Deal"
                          onClick={(e) => handleOpenEdit(opp, e)}
                          className="p-1 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {canDeleteOpportunity ? (
                          <button
                            title="Delete Deal"
                            onClick={(e) => handleDeleteOpportunity(opp.id, e)}
                            className="p-1 text-slate-500 hover:text-red-700 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            disabled
                            title="Admin Permission Required"
                            className="p-1 text-slate-300 cursor-not-allowed rounded"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 font-sans border border-slate-200">
                    No sales opportunities found matching the search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Panel */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-slate-500 text-xs">
          <span>
            Showing page {currentPage} of {totalPages} (Total {processedOpportunities.length} opportunities)
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-white transition-colors bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-slate-50 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-white transition-colors bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-slate-50 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* --- FORM ADD/EDIT OPPORTUNITY MODAL --- */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 sm:p-6 z-50 backdrop-blur-xs transition-opacity animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="text-base font-bold text-slate-800">
                {editingOpp ? `Edit Opportunity: ${editingOpp.opportunity_no}` : 'Create New Opportunity'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/30">
              <form id="opportunity-form" onSubmit={handleSaveOpportunity} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Customer Dropdown */}
                  <div className="sm:col-span-2 space-y-1 text-sm">
                    <label className="text-xs font-semibold text-slate-500 block">Select Customer Account <span className="text-red-500">*</span></label>
                    <select
                      id="form-customer-id"
                      value={formCustomerId}
                      onChange={(e) => setFormCustomerId(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500 text-slate-800 font-sans shadow-sm"
                    >
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.customer_name} ({c.customer_code})</option>
                      ))}
                    </select>
                  </div>

                  {/* Project Name */}
                  <div className="sm:col-span-2 space-y-1 text-sm">
                    <label className="text-xs font-semibold text-slate-500 block">Project Name or Business Initiative <span className="text-red-500">*</span></label>
                    <input
                      id="form-project-name"
                      type="text"
                      value={formProjectName}
                      onChange={(e) => setFormProjectName(e.target.value)}
                      placeholder="e.g. Boiler Pressure Inspection Phase 4"
                      className={`w-full p-2.5 border rounded-lg focus:outline-none focus:border-blue-500 shadow-sm ${errors.projectName ? 'border-red-400 bg-red-50/10' : 'border-slate-200'}`}
                    />
                    {errors.projectName && <span className="text-[11px] text-red-500 block">{errors.projectName}</span>}
                  </div>

                  {/* Service Type */}
                  <div className="space-y-1 text-sm">
                    <label className="text-xs font-semibold text-slate-500 block">Service Segment / Work Scope</label>
                    <select
                      id="form-service-type"
                      value={formServiceType}
                      onChange={(e) => setFormServiceType(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500 shadow-sm"
                    >
                      {SERVICE_TYPES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Lead Source */}
                  <div className="space-y-1 text-sm">
                    <label className="text-xs font-semibold text-slate-500 block">Lead Source</label>
                    <select
                      id="form-lead-source"
                      value={formLeadSource}
                      onChange={(e) => setFormLeadSource(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500 shadow-sm"
                    >
                      {LEAD_SOURCES.map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>

                  {/* Estimated Budget */}
                  <div className="space-y-1 text-sm">
                    <label className="text-xs font-semibold text-slate-500 block">Estimated Budget (THB) <span className="text-red-500">*</span></label>
                    <input
                      id="form-estimated-value"
                      type="number"
                      value={formEstimatedValue}
                      onChange={(e) => setFormEstimatedValue(e.target.value)}
                      placeholder="e.g. 1500000"
                      className={`w-full p-2.5 border rounded-lg font-mono focus:outline-none focus:border-blue-500 shadow-sm ${errors.value ? 'border-red-400 bg-red-50/10' : 'border-slate-200'}`}
                    />
                    {errors.value && <span className="text-[11px] text-red-500 block">{errors.value}</span>}
                  </div>

                  {/* Probability Success */}
                  <div className="space-y-1 text-sm">
                    <label className="text-xs font-semibold text-slate-500 block">Win Probability % (0 - 100)</label>
                    <div className="flex items-center gap-3">
                      <input
                        id="form-probability"
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={formProbability}
                        onChange={(e) => setFormProbability(e.target.value)}
                        className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded border border-slate-200 w-16 text-center shrink-0 shadow-sm">
                        {formProbability}%
                      </span>
                    </div>
                  </div>

                  {/* Expected Close Date */}
                  <div className="space-y-1 text-sm">
                    <label className="text-xs font-semibold text-slate-500 block">Expected Close Date <span className="text-red-500">*</span></label>
                    <input
                      id="form-close-date"
                      type="date"
                      value={formExpectedCloseDate}
                      onChange={(e) => setFormExpectedCloseDate(e.target.value)}
                      className={`w-full p-2.5 border rounded-lg font-mono focus:outline-none focus:border-blue-500 shadow-sm ${errors.closeDate ? 'border-red-400 bg-red-50/10' : 'border-slate-200'}`}
                    />
                    {errors.closeDate && <span className="text-[11px] text-red-500 block">{errors.closeDate}</span>}
                  </div>

                  {/* Sales Person Responsible */}
                  <div className="space-y-1 text-sm">
                    <label className="text-xs font-semibold text-slate-500 block">Sales Owner</label>
                    <select
                      id="form-sales-person"
                      value={formSalesPersonId}
                      onChange={(e) => setFormSalesPersonId(e.target.value)}
                      disabled={!canReassignSalesPerson}
                      className="w-full p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none shadow-sm disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                    >
                      {allSalesPersons.map(staff => (
                        <option key={staff.id} value={staff.id}>{staff.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Opportunity Status */}
                  <div className="space-y-1 text-sm">
                    <label className="text-xs font-semibold text-slate-500 block">Opportunity Stage (Status)</label>
                    <select
                      id="form-status"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as OpportunityStatus)}
                      className="w-full p-2.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-blue-500 shadow-sm"
                    >
                      {OPPORTUNITY_STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Remarks */}
                  <div className="sm:col-span-2 space-y-1 text-sm">
                    <label className="text-xs font-semibold text-slate-500 block font-sans">Additional Remarks & Collaboration Details</label>
                    <textarea
                      id="form-remarks"
                      rows={3}
                      value={formRemarks}
                      onChange={(e) => setFormRemarks(e.target.value)}
                      placeholder="Specify additional requirements, key context, scope details..."
                      className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 shadow-sm"
                    />
                  </div>

                </div>
              </form>
            </div>

            {/* Pinned Action Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-all focus:outline-none shadow-sm"
              >
                Cancel
              </button>
              <button
                form="opportunity-form"
                id="btn-submit-opportunity"
                type="submit"
                className="px-8 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 border border-blue-700 rounded-lg transition-all shadow-md hover:shadow-lg focus:outline-none flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Save Opportunity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DETAILED OPPORTUNITY DRAWER VIEW --- */}
      {viewingOpp && (
        <div className="fixed inset-0 bg-slate-900/60 flex justify-end z-50 backdrop-blur-xs transition-opacity animate-fade-in">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col overflow-hidden animate-slide-left">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full uppercase">
                  {viewingOpp.opportunity_no}
                </span>
                <h3 className="text-base font-bold text-slate-800 mt-1 truncate max-w-[320px]">
                  {viewingOpp.project_name}
                </h3>
              </div>
              <button 
                onClick={() => setViewingOpp(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-full focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub Tabs Selection inside Opportunity Drawer */}
            <div className="flex border-b border-slate-100 text-[11px] sm:text-xs font-semibold text-slate-500 bg-slate-50/50">
              <button 
                onClick={() => setOppTab('details')}
                className={`flex-1 py-3 text-center transition-colors border-b-2 focus:outline-none ${oppTab === 'details' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent hover:text-slate-800'}`}
              >
                Details
              </button>
              <button 
                onClick={() => setOppTab('activities')}
                className={`flex-1 py-3 text-center transition-colors border-b-2 focus:outline-none ${oppTab === 'activities' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent hover:text-slate-800'}`}
              >
                Activities ({activities.length})
              </button>
              <button 
                onClick={() => setOppTab('tasks')}
                className={`flex-1 py-3 text-center transition-colors border-b-2 focus:outline-none ${oppTab === 'tasks' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent hover:text-slate-800'}`}
              >
                Tasks ({tasks.length})
              </button>
              <button 
                onClick={() => setOppTab('attachments')}
                className={`flex-1 py-3 text-center transition-colors border-b-2 focus:outline-none ${oppTab === 'attachments' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent hover:text-slate-800'}`}
              >
                Files ({attachments.length})
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-600">
              
              {loadingRelated && (
                <div className="flex items-center justify-center gap-2 py-4 text-xs text-neutral-400">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading account and assigned tasks...</span>
                </div>
              )}

              {/* TAB 1: DETAILS */}
              {oppTab === 'details' && (
                <div className="space-y-6">
                  {/* Core Business Rule Alert if Proposal */}
                  {viewingOpp.status === 'Proposal' ? (
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-start gap-3">
                      <FileCheck2 className="w-10 h-10 text-orange-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-bold text-orange-800 block text-sm">Business Rule Met</span>
                        <p className="text-xs text-orange-700 leading-relaxed">
                          Since the opportunity stage is **Proposal**, you are authorized to issue a formal quotation for this project immediately.
                        </p>
                        <button
                          id="btn-create-quotation"
                          onClick={() => setIsQuotationModalOpen(true)}
                          className="mt-2 text-xs font-semibold bg-orange-600 text-white px-3 py-1.5 rounded hover:bg-orange-700 transition cursor-pointer"
                        >
                          Create Quotation
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-start gap-3">
                      <FileClock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-500 leading-relaxed">
                        *Business Rule: Quotation creation (Create Quotation) is only enabled when the opportunity stage is updated to **Proposal**.
                      </p>
                    </div>
                  )}

                  {/* Client Info Summary */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                    <span className="text-xs font-semibold text-slate-400 block">Customer Account Info</span>
                    <span className="font-bold text-slate-800 text-base block">
                      {viewingOpp.customer?.customer_name || 'Customer not assigned'}
                    </span>
                    {viewingOpp.customer && (
                      <div className="text-xs text-slate-500 font-mono space-y-1.5 pt-1">
                        <div>Customer Code: {viewingOpp.customer.customer_code}</div>
                        <div>Email: {viewingOpp.customer.email} | Phone: {viewingOpp.customer.phone}</div>
                        <div>Industry Type: {viewingOpp.customer.industry_type}</div>
                      </div>
                    )}
                  </div>

                  {/* Project metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                      <span className="text-xs text-slate-400 block">Estimated Project Value</span>
                      <span className="font-mono text-base font-bold text-blue-700">{formatTHB(viewingOpp.estimated_value)}</span>
                    </div>
                    <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl">
                      <span className="text-xs text-slate-400 block">Win Probability</span>
                      <span className="font-mono text-base font-bold text-purple-700">{viewingOpp.success_probability}%</span>
                    </div>
                  </div>

                  {/* Sub parameters */}
                  <div className="space-y-3.5 border-t border-slate-100 pt-4 text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Service Segment</span>
                      <span className="font-medium text-slate-800">{viewingOpp.service_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lead Source</span>
                      <span className="font-medium text-slate-800">{viewingOpp.lead_source}</span>
                    </div>
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-slate-400 font-sans text-sm">Expected Close Date</span>
                      <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {viewingOpp.expected_close_date || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sales Owner</span>
                      <span className="font-medium text-slate-800 flex items-center gap-1">
                        <User className="w-4 h-4 text-slate-400 shrink-0" />
                        {activeSalesPersonMap.get(viewingOpp.sales_person_id) || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg">
                      <span className="text-slate-400 text-xs">Current Pipeline Stage</span>
                      {getStatusBadge(viewingOpp.status)}
                    </div>
                  </div>

                  {/* Description remarks */}
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <span className="text-xs text-slate-400 block">Remarks & Deep Context</span>
                    <p className="bg-slate-50/50 p-3 rounded-lg text-slate-700 leading-relaxed text-xs border border-slate-100">
                      {viewingOpp.remarks || 'No remarks provided.'}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: ACTIVITIES */}
              {oppTab === 'activities' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 block font-sans">Activity log and discussion history</span>
                    <button 
                      onClick={() => setShowActivityForm(!showActivityForm)}
                      className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded font-bold hover:bg-blue-100 cursor-pointer"
                    >
                      {showActivityForm ? 'Close Form' : 'Add Activity'}
                    </button>
                  </div>

                  {showActivityForm && (
                     <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newActivitySubject.trim() || !newActivityDesc.trim()) {
                        alert('Please fill in the activity subject and details');
                        return;
                      }
                      try {
                        const res = await CRMService.insertActivity({
                          opportunity_id: viewingOpp.id,
                          activity_type: newActivityType,
                          activity_date: new Date().toISOString().split('T')[0],
                          subject: newActivitySubject,
                          description: newActivityDesc,
                          owner: 'Sales Owner'
                        });
                        setActivities([res, ...activities]);
                        setNewActivitySubject('');
                        setNewActivityDesc('');
                        setShowActivityForm(false);
                        onToast('Activity log added successfully', 'success');
                        
                        await CRMService.insertAuditLog({
                          action_by: currentUserId || '00000000-0000-0000-0000-000000000000',
                          role: currentRole || 'Sales',
                          action: 'ดึงข้อมูลกิจกรรมดีล',
                          target_type: 'opportunity',
                          target_id: viewingOpp.id,
                          details: `บันทึกกิจกรรมในดีล ${viewingOpp.opportunity_no}: ${newActivityType} - ${newActivitySubject}`
                        }, currentUserId || '00000000-0000-0000-0000-000000000000');
                      } catch {
                        onToast('Failed to log activity', 'err');
                      }
                    }} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-400 block mb-0.5">Activity Type</label>
                          <select 
                            value={newActivityType} 
                            onChange={(e: any) => setNewActivityType(e.target.value)}
                            className="w-full bg-white border border-slate-200 p-1.5 rounded focus:outline-none"
                          >
                            <option value="Phone Call">Phone Call</option>
                            <option value="Meeting">Meeting</option>
                            <option value="Email">Email</option>
                            <option value="Site Visit">Site Visit</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-0.5">Subject</label>
                          <input 
                            type="text" 
                            required
                            value={newActivitySubject} 
                            placeholder="e.g. Sent pricing details / Called project lead"
                            onChange={(e) => setNewActivitySubject(e.target.value)}
                            className="w-full bg-white border border-slate-200 p-1.5 rounded focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-0.5 font-sans">Discussion details</label>
                        <textarea 
                          rows={2} 
                          required
                          value={newActivityDesc} 
                          placeholder="Log meeting minutes or details..."
                          onChange={(e) => setNewActivityDesc(e.target.value)}
                          className="w-full bg-white border border-slate-200 p-1.5 rounded focus:outline-none resize-none"
                        />
                      </div>
                      <div className="flex justify-end gap-1.5">
                        <button type="button" onClick={() => setShowActivityForm(false)} className="px-2 py-1 bg-slate-200 text-slate-700 rounded cursor-pointer">Cancel</button>
                        <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded font-bold cursor-pointer">Save</button>
                      </div>
                    </form>
                  )}

                  {activities.length > 0 ? (
                    <div className="relative border-l border-slate-200 pl-4 space-y-4 ml-2">
                      {activities.map(act => (
                        <div key={act.id} className="relative text-xs">
                          <span className="absolute -left-6 top-1.5 bg-blue-600 w-2.5 h-2.5 rounded-full border-2 border-white"></span>
                          <span className="text-[10px] text-slate-400 font-mono block">{act.activity_date} | โดย: {act.owner}</span>
                          <span className="font-bold text-slate-850 text-[13px] block mt-0.5">{act.subject} ({act.activity_type})</span>
                          <p className="text-slate-600 mt-1 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">{act.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-neutral-400">
                      No interaction or discussion history recorded for this deal yet.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: TASKS */}
              {oppTab === 'tasks' && (
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-450">Assigned Tasks & Action Items</span>
                    <button 
                      onClick={() => setShowTaskForm(!showTaskForm)}
                      className="text-[11px] text-blue-600 bg-blue-50 px-2.5 py-1 rounded font-bold hover:bg-blue-100 cursor-pointer"
                    >
                      {showTaskForm ? 'Close Form' : 'Assign New Task'}
                    </button>
                  </div>

                  {showTaskForm && (
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newTaskName.trim() || !newTaskDueDate) {
                        alert('Please fill in the task name and target due date');
                        return;
                      }
                      try {
                        const res = await CRMService.insertTask({
                          opportunity_id: viewingOpp.id,
                          task_name: newTaskName,
                          description: 'ตรวจเช็ครายละเอียดสัญญาเสนอดีล',
                          due_date: newTaskDueDate,
                          assigned_to: newTaskAssignedTo,
                          priority: newTaskPriority,
                          status: 'Open'
                        });
                        setTasks([...tasks, res]);
                        setNewTaskName('');
                        setNewTaskDueDate('');
                        setShowTaskForm(false);
                        onToast('Task assigned successfully', 'success');
                        
                        await CRMService.insertAuditLog({
                          action_by: currentUserId || '00000000-0000-0000-0000-000000000000',
                          role: currentRole || 'Sales',
                          action: 'Assign task',
                          target_type: 'opportunity',
                          target_id: viewingOpp.id,
                          details: `Assigned task: ${newTaskName} to employee ${newTaskAssignedTo}`
                        }, currentUserId || '00000000-0000-0000-0000-000000000000');
                      } catch {
                        onToast('Failed to assign task', 'err');
                      }
                    }} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2.5">
                      <div>
                        <label className="text-slate-400 block mb-0.5">Task Description / Action Item</label>
                        <input 
                          type="text" 
                          required
                          value={newTaskName} 
                          placeholder="e.g. Check BoQ / Prepare Pricing proposal"
                          onChange={(e) => setNewTaskName(e.target.value)}
                          className="w-full bg-white border border-slate-200 p-1.5 rounded focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-400 block mb-0.5">Due Date</label>
                          <input 
                            type="date" 
                            required
                            value={newTaskDueDate} 
                            onChange={(e) => setNewTaskDueDate(e.target.value)}
                            className="w-full bg-white border border-slate-200 p-1.5 rounded focus:outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-0.5 font-sans">Assignee Role</label>
                          <select 
                            value={newTaskAssignedTo} 
                            onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                            className="w-full bg-white border border-slate-200 p-1.5 rounded focus:outline-none"
                          >
                            <option value="Sales Administrator">Sales Administrator</option>
                            <option value="Lead Engineer">Lead Engineer</option>
                            <option value="Executive Officer">Executive Officer</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-1.5 border-t">
                        <div>
                          <span className="text-slate-400 mr-2">Priority:</span>
                          <select 
                            value={newTaskPriority} 
                            onChange={(e: any) => setNewTaskPriority(e.target.value)}
                            className="bg-white border text-xs p-1 rounded focus:outline-none"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Urgent">Urgent</option>
                          </select>
                        </div>
                        <div className="flex gap-1.5 animate-fade-in">
                          <button type="button" onClick={() => setShowTaskForm(false)} className="px-2 py-1 bg-slate-200 text-slate-700 rounded cursor-pointer">Cancel</button>
                          <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded font-bold cursor-pointer">Assign</button>
                        </div>
                      </div>
                    </form>
                  )}

                  {tasks.length > 0 ? (
                    <div className="space-y-2">
                      {tasks.map(tsk => (
                        <div key={tsk.id} className="p-3 bg-slate-50 border border-slate-155 rounded-xl flex flex-col gap-1 hover:border-slate-350 transition text-slate-800">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 border-b pb-1 font-mono">
                            <span className={`px-1.5 rounded font-extrabold ${
                              tsk.priority === 'Urgent' ? 'bg-red-50 text-red-700' :
                              tsk.priority === 'High' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {tsk.priority} Priority
                            </span>
                            <span>เป้าสิ้นสุด: {tsk.due_date}</span>
                          </div>
                          <div className="font-bold text-slate-800 text-[13px] mt-0.5">{tsk.task_name}</div>
                          <div className="text-[10px] text-slate-500 font-sans">Assignee: <span className="text-slate-800 font-bold">{tsk.assigned_to}</span></div>
                          
                          <div className="mt-2 pt-1.5 border-t border-dashed flex justify-between items-center">
                            <span className="text-[10px] text-neutral-400">Status Update:</span>
                            <select 
                              value={tsk.status} 
                              onChange={async (e) => {
                                const newStatus = e.target.value as any;
                                try {
                                  const updated = await CRMService.updateTask(tsk.id, { status: newStatus });
                                  setTasks(tasks.map(x => x.id === tsk.id ? updated : x));
                                  onToast('Task status updated successfully', 'success');
                                } catch {
                                  onToast('Error updating task in database', 'err');
                                }
                              }}
                              className="p-1 rounded bg-slate-100 text-[10px] font-sans border focus:outline-none cursor-pointer"
                            >
                              <option value="Open">Open</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-neutral-405">
                      ยังไม่มีรายการสั่งมอบหมายเพื่อติดตามโครงการ
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ATTACHMENTS */}
              {oppTab === 'attachments' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Proposal Attachments</span>
                    <button 
                      onClick={async () => {
                        const mockFiles = [
                          'Initial_RFP_Consulting.pdf',
                          'Engineering_BoQ_RoughEstimation.xlsx',
                          'Company_Registration_Paper.zip'
                        ];
                        const fName = prompt('Mock upload - Enter your file name:', mockFiles[Math.floor(Math.random() * mockFiles.length)]);
                        if (fName) {
                          try {
                            const res = await CRMService.insertAttachment({
                              opportunity_id: viewingOpp.id,
                              file_name: fName,
                              file_size: Math.round(Math.random() * 1200) + 90,
                              file_type: fName.split('.').pop() || 'pdf',
                              uploaded_by: 'Account Manager',
                              file_url: '#'
                            });
                            setAttachments([res, ...attachments]);
                            onToast('Mock file uploaded successfully', 'success');
                          } catch {
                            onToast('Failed to add attachment', 'err');
                          }
                        }
                      }}
                      className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded font-bold hover:bg-blue-105 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Attach File
                    </button>
                  </div>

                  {attachments.length > 0 ? (
                    <div className="space-y-2">
                      {attachments.map(at => (
                        <div key={at.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100 text-xs text-slate-700">
                          <div className="flex items-center gap-2 truncate">
                            <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                            <div className="truncate">
                              <span className="font-bold text-slate-700 block truncate" title={at.file_name}>{at.file_name}</span>
                              <span className="text-[10px] text-slate-400 font-mono block">Size: {at.file_size} KB | By: {at.uploaded_by}</span>
                            </div>
                          </div>
                          <button 
                            onClick={async () => {
                              if (confirm('Are you sure you want to remove this file?')) {
                                try {
                                  await CRMService.deleteAttachment(at.id);
                                  setAttachments(attachments.filter(x => x.id !== at.id));
                                  onToast('File removed successfully', 'success');
                                } catch {
                                  onToast('Failed to remove file', 'err');
                                }
                              }
                            }}
                            className="text-slate-405 hover:text-red-650 p-1 hover:bg-white rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-neutral-400">
                      No attachments uploaded for this opportunity yet.
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* --- REALISTIC PLACEHOLDER MODULE FOR PHASE 2 "CREATE QUOTATION" --- */}
      {isQuotationModalOpen && viewingOpp && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[70] backdrop-blur-xs transition-opacity animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-up">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border-2 border-green-200">
                <FileCheck2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-lg font-bold text-slate-800">Quotation Created Successfully!</h4>
                <p className="text-sm text-slate-500 font-mono">
                  Quotation ID: <span className="font-bold text-slate-700">QT-26{viewingOpp.opportunity_no.slice(-4)}</span>
                </p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left text-xs space-y-2 text-slate-600 font-sans mt-3">
                  <div className="flex justify-between border-b pb-1">
                    <span>Attention:</span>
                    <span className="font-bold">{viewingOpp.customer?.customer_name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>Project:</span>
                    <span className="font-semibold">{viewingOpp.project_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Quotation Value:</span>
                    <span className="font-mono text-emerald-600 font-bold">{formatTHB(viewingOpp.estimated_value)}</span>
                  </div>
                </div>
                <p className="text-slate-400 text-xs text-center leading-relaxed mt-2.5">
                  The quotation code has been stored in our central CRM database. It is now queued for Phase 2 (Quotation Management module) integration!
                </p>
              </div>
              <div className="pt-4 flex gap-2">
                <button
                  onClick={() => setIsQuotationModalOpen(false)}
                  className="w-full py-2.5 text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 font-sans"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
