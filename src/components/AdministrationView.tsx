import React, { useState, useEffect, useMemo } from 'react';
import { UserRole, AuditLog } from '../types';
import { CRMService } from '../supabaseService';
import { 
  Users, 
  Shield, 
  History, 
  UserPlus, 
  Trash2, 
  Check, 
  X, 
  Search, 
  Filter, 
  AlertOctagon, 
  RefreshCcw, 
  Database,
  Lock,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  ArrowRightLeft,
  Edit
} from 'lucide-react';

interface CRMUserSim {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: 'Active' | 'Inactive';
}

interface AdministrationViewProps {
  currentRole: UserRole;
  currentUserId: string;
  onChangeUserSession: (userId: string, role: UserRole) => void;
  onToast: (msg: string, type: 'success' | 'err') => void;
}

const ROLES_LIST: UserRole[] = ['Sales', 'Sales Manager', 'Admin', 'Management', 'System Administrator'];

const INITIAL_MOCK_USERS: CRMUserSim[] = [
  { id: '1', name: 'เอกชัย วงศ์ดี (S01)', email: 'ekachai@crm.com', role: 'Sales', department: 'ฝ่ายขายภาคตะวันออก', status: 'Active' },
  { id: '2', name: 'สุชาดา เลิศวิริยะ (S02)', email: 'suchada@crm.com', role: 'Sales Manager', department: 'ฝ่ายขายและพัฒนาธุรกิจ', status: 'Active' },
  { id: '3', name: 'ธนพล คำดี (S03)', email: 'thanapol@crm.com', role: 'System Administrator', department: 'ฝ่ายเทคโนโลยีสารสนเทศ (IT)', status: 'Active' },
  { id: '4', name: 'นารีรัตน์ มั่นคง (S04)', email: 'nareerat@crm.com', role: 'Management', department: 'คณะกรรมการบริหาร (Executive)', status: 'Active' },
  { id: '5', name: 'ผู้ดูแลระบบ ดลภัทร (Admin)', email: 'admin@crm.com', role: 'Admin', department: 'ฝ่ายสนับสนุนแอดมินกลาง', status: 'Active' }
];

export default function AdministrationView({ 
  currentRole, 
  currentUserId, 
  onChangeUserSession, 
  onToast 
}: AdministrationViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'roles' | 'audit'>('users');
  
  // Simulated Users list
  const [simUsers, setSimUsers] = useState<CRMUserSim[]>(() => {
    const cached = localStorage.getItem('crm_sim_users');
    if (cached) {
      try { return JSON.parse(cached); } catch { return INITIAL_MOCK_USERS; }
    }
    localStorage.setItem('crm_sim_users', JSON.stringify(INITIAL_MOCK_USERS));
    return INITIAL_MOCK_USERS;
  });

  // User form modal
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('Sales');
  const [userDept, setUserDept] = useState('');
  const [userStatus, setUserStatus] = useState<'Active' | 'Inactive'>('Active');

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditTypeFilter, setAuditTypeFilter] = useState('All');
  const [auditRoleFilter, setAuditRoleFilter] = useState('All');

  // Load Sim Users cache on change
  useEffect(() => {
    localStorage.setItem('crm_sim_users', JSON.stringify(simUsers));
  }, [simUsers]);

  // Load audit logs dynamically
  const reloadAuditTrail = async () => {
    setLoadingLogs(true);
    try {
      const logs = await CRMService.fetchAuditLogs();
      setAuditLogs(logs);
    } catch {
      onToast('ไม่สามารถดึงข้อมูลประวัติการทำงานได้', 'err');
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'audit') {
      reloadAuditTrail();
    }
  }, [activeSubTab]);

  // Handle adding or editing users
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim() || !userDept.trim()) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (editingUserId) {
      const updated = simUsers.map(u => u.id === editingUserId ? {
        ...u,
        name: userName,
        email: userEmail,
        role: userRole,
        department: userDept,
        status: userStatus
      } : u);
      setSimUsers(updated);
      onToast(`อัปเดตสมาชิกผู้ใช้ ${userName} เรียบร้อย`, 'success');
      // If we updated the active session user, update session too
      if (editingUserId === currentUserId) {
        onChangeUserSession(editingUserId, userRole);
      }
    } else {
      const newUser: CRMUserSim = {
        id: crypto.randomUUID(),
        name: userName,
        email: userEmail,
        role: userRole,
        department: userDept,
        status: userStatus
      };
      setSimUsers([...simUsers, newUser]);
      onToast(`ลงทะเบียนผู้ใช้ ${userName} สำเร็จแล้ว`, 'success');
    }
    setIsUserFormOpen(false);
  };

  const handleOpenAddUser = () => {
    setEditingUserId(null);
    setUserName('');
    setUserEmail('');
    setUserRole('Sales');
    setUserDept('');
    setUserStatus('Active');
    setIsUserFormOpen(true);
  };

  const handleOpenEditUser = (u: CRMUserSim) => {
    setEditingUserId(u.id);
    setUserName(u.name);
    setUserEmail(u.email);
    setUserRole(u.role);
    setUserDept(u.department);
    setUserStatus(u.status);
    setIsUserFormOpen(true);
  };

  const handleDeleteUser = (id: string, name: string) => {
    const hasPermission = currentRole === 'Admin' || currentRole === 'System Administrator';
    if (!hasPermission) {
      onToast('ขออภัย เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถลบผู้ใช้งานได้', 'err');
      return;
    }
    if (id === currentUserId) {
      onToast('ไม่สามารถลบผู้ที่คุณกำลังล็อกอินสลับใช้ในขณะนี้ได้', 'err');
      return;
    }
    if (confirm(`คุณต้องการถอนรายชื่อผู้ใช้ "${name}" ยืนยันใช่หรือไม่?`)) {
      setSimUsers(simUsers.filter(u => u.id !== id));
      onToast(`เพิกถอนผู้ใช้งาน ${name} เรียบร้อยแล้ว`, 'success');
    }
  };

  // Clear all logs trigger (Admin & System Admin only)
  const handleClearAuditLogs = async () => {
    const hasClearPermission = currentRole === 'Admin' || currentRole === 'System Administrator';
    if (!hasClearPermission) {
      onToast('ขออภัย สิทธิ์ของคุณไม่ได้รับการอนุมัติให้ล้างประวัติการลบทิ้งข้อมูลหลัก', 'err');
      return;
    }

    if (confirm('คำเตือนร้ายแรง! คุณกำลังจะล้างข้อมูล Audit Trail ทั้งหมดในระบบออฟไลน์ Sandbox ยืนยันลบประวัติใช่หรือไม่?')) {
      await CRMService.clearAuditLogs();
      await CRMService.insertAuditLog({
        action_by: currentUserId,
        role: currentRole,
        action: 'ล้างฐานข้อมูลประวัติทำงาน (Purged History)',
        target_type: 'system',
        details: 'แอดมินผู้มีสิทธิ์สูงสุดล้างบันทึก Audit Logs ออกทั้งหมดจาก Sandbox เพื่อรีเซ็ตพื้นที่จัดเก็บ'
      }, currentUserId);
      onToast('ล้างบันทึกการทำงานใน Sandbox รีเซ็ตสะอาดแล้ว', 'success');
      reloadAuditTrail();
    }
  };

  // Switch simulation session
  const handleSwapActiveSession = (u: CRMUserSim) => {
    onChangeUserSession(u.id, u.role);
    onToast(`สลับแผงควบคุมระบบเข้าสู่ตัวตน: ${u.name} (${u.role})`, 'success');
  };

  // Filter audit logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch = 
        log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.action_by.toLowerCase().includes(auditSearch.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(auditSearch.toLowerCase()));

      const matchesType = auditTypeFilter === 'All' || log.target_type === auditTypeFilter;
      const matchesRole = auditRoleFilter === 'All' || log.role === auditRoleFilter;

      return matchesSearch && matchesType && matchesRole;
    });
  }, [auditLogs, auditSearch, auditTypeFilter, auditRoleFilter]);

  // Visual matrix definitions
  const matrixPermissions = [
    { key: 'cus_create', name: 'สร้างบริษัทคู่ค้าใหม่ (Create Customer)', sales: 'Yes', sm: 'Yes', md: 'No', ad: 'Yes', sa: 'Yes' },
    { key: 'cus_edit', name: 'แก้ไขข้อมูลลูกค้า (Edit Customer)', sales: 'Yes', sm: 'Yes', md: 'No', ad: 'Yes', sa: 'Yes' },
    { key: 'cus_delete', name: 'ลบข้อมูลลูกค้า / รายธุรกิจสถิติ', sales: 'No', sm: 'Yes', md: 'No', ad: 'Yes', sa: 'Yes' },
    { key: 'opp_create', name: 'เปิดประมูลดีลการค้าใหม่ (Create Opportunity)', sales: 'Yes', sm: 'Yes', md: 'No', ad: 'Yes', sa: 'Yes' },
    { key: 'opp_edit_own', name: 'แก้ไขดีลการขายที่ตนรับผิดชอบ (Edit Own OPP)', sales: 'Yes', sm: 'Yes', md: 'No', ad: 'Yes', sa: 'Yes' },
    { key: 'opp_edit_all', name: 'เข้าควบคุมปรับทิศทางดีลทั้งหมด (Edit All OPPs)', sales: 'No', sm: 'Yes', md: 'No', ad: 'Yes', sa: 'Yes' }
  ];

  return (
    <div className="space-y-6">
      {/* Internal Menu Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-5 py-3 text-xs font-bold transition-all focus:outline-none flex items-center gap-2 relative border-b-2 cursor-pointer ${activeSubTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Users className="w-4 h-4" />
          การจัดการสิทธิ์และพนักงาน
        </button>
        <button
          onClick={() => setActiveSubTab('roles')}
          className={`px-5 py-3 text-xs font-bold transition-all focus:outline-none flex items-center gap-2 relative border-b-2 cursor-pointer ${activeSubTab === 'roles' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Lock className="w-4 h-4" />
          โครงสร้างตารางสิทธิ์ (Permission Matrix)
        </button>
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-5 py-3 text-xs font-bold transition-all focus:outline-none flex items-center gap-2 relative border-b-2 cursor-pointer ${activeSubTab === 'audit' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <History className="w-4 h-4" />
          ประวัติการใช้งานระบบ (Audit Trail)
        </button>
      </div>

      {activeSubTab === 'users' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-xs">
            <div className="text-xs text-slate-550">
              <span className="font-extrabold text-blue-600">จำลองบัญชีผู้ใช้งานระบบ CRM:</span> สามารถสลับสิทธิ์ใช้งานเป็น Account อื่นเพื่อเข้าตรวจสอบข้อจำกัดความปลอดภัยของแต่ละสิทธิ์พนักงานได้ทันที
            </div>
            <button
              onClick={handleOpenAddUser}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4.5 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer focus:outline-none self-start sm:self-auto shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              ลงทะเบียนพนักงานใหม่
            </button>
          </div>

          {/* Spreadsheet Tab simulation bar */}
          <div className="bg-[#f8f9fa] border border-slate-200 border-b-0 px-4 py-2 flex items-center justify-between text-xs select-none rounded-t-xl mt-4">
            <div className="flex items-center gap-3">
              <span className="font-medium bg-[#E8EAED] px-2.5 py-1 rounded border border-slate-200 text-slate-700 select-none">Sheet1</span>
              <span className="text-slate-400">|</span>
              <span className="font-mono font-semibold text-emerald-600">{simUsers.length} แถว (Rows)</span>
            </div>
          </div>

          {/* User simulated table in Google Sheet style */}
          <div className="bg-white rounded-b-2xl border border-[#DADCE0] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  {/* Excel Column Headers A, B, C... */}
                  <tr className="bg-[#F8F9FA] border-b border-slate-250 text-[10px] font-mono text-slate-400 select-none">
                    <th className="border border-slate-200 bg-[#E8EAED] text-center w-10 py-1"></th>
                    <th className="border border-slate-200 text-center w-52">A</th>
                    <th className="border border-slate-200 text-center w-48">B</th>
                    <th className="border border-slate-200 text-center w-40">C</th>
                    <th className="border border-slate-200 text-center w-36">D</th>
                    <th className="border border-slate-200 text-center w-32">E</th>
                    <th className="border border-slate-200 text-center w-48">F</th>
                    <th className="border border-slate-200 text-center w-36">G</th>
                  </tr>
                  {/* Header Columns inside the spreadsheet */}
                  <tr className="bg-[#F8F9FA] border-b-2 border-slate-300 text-xs font-semibold text-slate-600">
                    <th className="border border-slate-100 bg-[#E8EAED] text-center w-10 font-mono select-none"></th>
                    <th className="border border-slate-200 px-3 py-2 text-slate-705">พนักงานขาย / ตําแหน่งงาน</th>
                    <th className="border border-slate-200 px-3 py-2 text-slate-705">อีเมลลงทะเบียน</th>
                    <th className="border border-slate-200 px-3 py-2 text-slate-705">สังกัดแผนกภายใน</th>
                    <th className="border border-slate-200 px-3 py-2 text-center text-slate-705">บทบาททางสิทธิ์</th>
                    <th className="border border-slate-200 px-3 py-2 text-center text-slate-705">สถานะ</th>
                    <th className="border border-slate-200 px-3 py-2 text-center text-slate-705">จำลองการล็อกอิน</th>
                    <th className="border border-slate-200 px-3 py-2 text-right text-slate-705">ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-700">
                  {simUsers.map((u, idx) => {
                    const isActiveSession = u.id === currentUserId;
                    return (
                      <tr 
                        key={u.id} 
                        className={`hover:bg-blue-50/45 transition-colors border-b border-slate-200 ${isActiveSession ? 'bg-blue-100/30' : idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]/70'}`}
                      >
                        {/* Index row background (spreadsheet numbering) */}
                        <td className="border border-slate-200 bg-[#F1F3F4] text-[#5f6368] text-center font-mono text-[10px] select-none py-1.5">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-200 px-3 py-1.5 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isActiveSession ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {u.name.charAt(0)}
                          </div>
                          <div className="truncate">
                            <span className="font-bold text-slate-800 text-xs block">{u.name}</span>
                            <span className="text-[10px] text-slate-400 block font-medium">สิทธิ์: {u.role}</span>
                          </div>
                        </td>
                        <td className="border border-slate-200 px-3 py-1.5 font-mono text-[11px] text-slate-500">
                          {u.email}
                        </td>
                        <td className="border border-slate-200 px-3 py-1.5 text-slate-500 font-medium truncate">
                          {u.department}
                        </td>
                        <td className="border border-slate-200 px-3 py-1.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                            u.role === 'Sales' ? 'bg-cyan-50 text-cyan-800' :
                            u.role === 'Sales Manager' ? 'bg-indigo-50 text-indigo-800' :
                            u.role === 'Management' ? 'bg-teal-50 text-teal-800' :
                            u.role === 'Admin' ? 'bg-orange-50 text-orange-900' :
                            'bg-rose-50 text-rose-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="border border-slate-200 px-3 py-1.5 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${u.status === 'Active' ? 'bg-green-50 text-green-700 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                            <span className={`w-1 h-1 rounded-full ${u.status === 'Active' ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                            {u.status}
                          </span>
                        </td>
                        <td className="border border-slate-200 px-3 py-1.5 text-center">
                          {isActiveSession ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-150 rounded-lg font-bold">
                              <Check className="w-3.5 h-3.5" />
                              Active Session
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSwapActiveSession(u)}
                              className="bg-white border border-slate-250 hover:border-blue-500 hover:text-blue-600 text-slate-550 px-2.5 py-1 rounded text-[11px] font-bold flex items-center justify-center gap-1 mx-auto transition-colors focus:outline-none cursor-pointer"
                            >
                              <ArrowRightLeft className="w-3 h-3 shrink-0" />
                              สลับไปใช้ตัวตนนี้
                            </button>
                          )}
                        </td>
                        <td className="border border-slate-200 px-3 py-1.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              title="แก้ไขพนักงาน"
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {currentRole === 'Admin' || currentRole === 'System Administrator' ? (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                title="ลบพนักงาน"
                                className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                disabled
                                title="จำกัดสิทธิ์เฉพาะ Admin เท่านั้น"
                                className="p-1.5 text-slate-300 cursor-not-allowed rounded"
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROLE MANAGEMENT (Permission Matrix Checker) */}
      {activeSubTab === 'roles' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 flex items-start gap-4">
            <Lock className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-800">ระบบแมตริกซ์จำกัดสิทธิ์ระดับองค์กร (CRM Security Permission Mapping)</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                ตารางสรุปสิทธิ์พนักงานแต่ละตำแหน่งในระบบจำลอง เพื่อรักษาความปลอดภัยด้านงบประมาณและข้อมูลการประมูลของพาร์ทเนอร์ 
                <span className="font-semibold text-blue-600 ml-1">คุณสามารถล็อกอินเป็น Account สิทธิ์อื่นๆ ใน Tab พนักงาน ย้อนมาเช็คการกรองสิทธิ์นี้ได้ทันที</span>
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <th className="p-4 pl-6 w-1/3">ประเภทการรันข้อมูลหลัก (System Features)</th>
                  <th className="p-4 text-center">Sales (ฝ่ายขาย)</th>
                  <th className="p-4 text-center">Sales Manager</th>
                  <th className="p-4 text-center">Management</th>
                  <th className="p-4 text-center">Admin (หลังบ้าน)</th>
                  <th className="p-4 text-center">System Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                {matrixPermissions.map((perm) => (
                  <tr key={perm.key} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <span className="font-medium text-slate-800 block">{perm.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Permission node: {perm.key}</span>
                    </td>

                    {/* Sales Column */}
                    <td className="p-4 text-center">
                      {perm.sales === 'Yes' ? (
                        <span className="inline-flex p-1 bg-green-50 text-green-600 rounded-lg"><Check className="w-3.5 h-3.5 font-black" /></span>
                      ) : (
                        <span className="inline-flex p-1 bg-rose-50 text-rose-500 rounded-lg"><X className="w-3.5 h-3.5" /></span>
                      )}
                    </td>

                    {/* Sales Manager Column */}
                    <td className="p-4 text-center">
                      {perm.sm === 'Yes' ? (
                        <span className="inline-flex p-1 bg-green-50 text-green-600 rounded-lg"><Check className="w-3.5 h-3.5 font-black" /></span>
                      ) : (
                        <span className="inline-flex p-1 bg-rose-50 text-rose-500 rounded-lg"><X className="w-3.5 h-3.5" /></span>
                      )}
                    </td>

                    {/* Management Column */}
                    <td className="p-4 text-center">
                      {perm.md === 'Yes' ? (
                        <span className="inline-flex p-1 bg-green-50 text-green-600 rounded-lg"><Check className="w-3.5 h-3.5 font-black" /></span>
                      ) : (
                        <span className="inline-flex p-1 bg-rose-50 text-rose-500 rounded-lg"><X className="w-3.5 h-3.5" /></span>
                      )}
                    </td>

                    {/* Admin Column */}
                    <td className="p-4 text-center">
                      {perm.ad === 'Yes' ? (
                        <span className="inline-flex p-1 bg-green-50 text-green-600 rounded-lg"><Check className="w-3.5 h-3.5 font-black" /></span>
                      ) : (
                        <span className="inline-flex p-1 bg-rose-50 text-rose-500 rounded-lg"><X className="w-3.5 h-3.5" /></span>
                      )}
                    </td>

                    {/* System Administrator Column */}
                    <td className="p-4 text-center">
                      {perm.sa === 'Yes' ? (
                        <span className="inline-flex p-1 bg-green-50 text-green-600 rounded-lg"><Check className="w-3.5 h-3.5 font-black" /></span>
                      ) : (
                        <span className="inline-flex p-1 bg-rose-50 text-rose-500 rounded-lg"><X className="w-3.5 h-3.5" /></span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT TRAIL LOGGING */}
      {activeSubTab === 'audit' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col xl:flex-row gap-3 items-center">
            {/* Search */}
            <div className="w-full xl:flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาตามการกระทำ, ชื่อผู้บันทึก, ข้อมูลจำเพาะในระบบ..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 transition-all font-sans font-medium"
              />
            </div>

            <div className="w-full xl:w-auto flex flex-col md:flex-row gap-2 shrink-0">
              {/* Category selector */}
              <div className="flex items-center gap-1.5 border border-slate-200 px-2 pl-3 py-1 bg-slate-50 rounded-lg">
                <Layers className="w-4 h-4 text-slate-400" />
                <select
                  value={auditTypeFilter}
                  onChange={(e) => setAuditTypeFilter(e.target.value)}
                  className="text-xs font-bold bg-transparent text-slate-705 focus:outline-none cursor-pointer"
                >
                  <option value="All">ทุกเป้าหมายระบบ (All target)</option>
                  <option value="customer">ลูกค้า (Customer)</option>
                  <option value="opportunity">โอกาสขาย (OPP)</option>
                  <option value="contact">ผู้ประสานงาน (Contact)</option>
                  <option value="task">งานติดตาม (Task)</option>
                  <option value="attachment">ไฟล์แนบ (Attachment)</option>
                  <option value="system">ความปลอดภัยระบบ (System)</option>
                </select>
              </div>

              {/* Roles Selector */}
              <div className="flex items-center gap-1.5 border border-slate-200 px-2 pl-3 py-1 bg-slate-50 rounded-lg">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={auditRoleFilter}
                  onChange={(e) => setAuditRoleFilter(e.target.value)}
                  className="text-xs font-bold bg-transparent text-slate-705 focus:outline-none cursor-pointer"
                >
                  <option value="All">ทุกกลุ่มสิทธิ์บันทึก (All Roles)</option>
                  {ROLES_LIST.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* Purge Button (Available for Admin or SysAdmin) */}
              {(currentRole === 'Admin' || currentRole === 'System Administrator') && (
                <button
                  onClick={handleClearAuditLogs}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all focus:outline-none cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  ล้างข้อมูล Audit Trail
                </button>
              )}
            </div>
          </div>

          {/* Activity Timeline List container */}
          <div className="bg-white border rounded-2xl overflow-hidden shadow-xs">
            {loadingLogs ? (
              <div className="p-12 text-center text-slate-400">
                <RefreshCcw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                <span>กำลังโหลดรายการ Audit Trail จากโครงข่ายโปรดรอสักครู่...</span>
              </div>
            ) : filteredAuditLogs.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {filteredAuditLogs.map((log) => (
                  <div key={log.id} className="p-4 pl-6 hover:bg-slate-50/50 transition-colors flex items-start gap-4 font-sans">
                    {/* Time indicator column */}
                    <div className="w-32 font-mono text-[10px] text-slate-400 shrink-0 select-none pt-0.5">
                      <div className="flex items-center gap-1 font-bold">
                        <Calendar className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleDateString('th-TH')}
                      </div>
                      <div className="text-[9px] mt-0.5 font-bold">
                        {new Date(log.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} น.
                      </div>
                    </div>

                    {/* Role circle and info block */}
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-slate-800 text-xs">{log.action}</span>
                        
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide ${
                          log.target_type === 'customer' ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' :
                          log.target_type === 'opportunity' ? 'bg-blue-50 text-blue-700 border border-blue-150' :
                          log.target_type === 'contact' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' :
                          log.target_type === 'system' ? 'bg-rose-50 text-rose-700 border border-rose-150' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {log.target_type}
                        </span>

                        <span className="text-slate-300">|</span>

                        <span className="text-[10px] text-indigo-900 bg-indigo-50 font-semibold px-2 py-0.5 rounded-full">
                          ผิวดำเนินการ: {log.action_by} ({log.role})
                        </span>
                      </div>
                      
                      <p className="text-slate-500 font-sans leading-relaxed text-[11px]">
                        {log.details || 'ไม่มีรายละเอียดเพิ่มเติม'}
                      </p>
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 select-none border border-slate-100 px-1.5 py-0.5 rounded hidden sm:inline-block">
                      ID: {log.id.slice(0, 8)}...
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center text-slate-400 font-sans font-medium">
                <Info className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <span>ไม่พบบันทึก Audit Trail สอดคล้องตามเกณฑ์วิเคราะห์ที่กำหนด</span>
              </div>
            )}

            <div className="bg-slate-50 p-4 border-t border-slate-100 text-center font-mono text-[9px] text-slate-400 font-bold">
              ENTERPRISE-GRADE CONTINUOUS LOGGING FILE SYSTEM ACTIVE • TOTAL: {filteredAuditLogs.length} EVENTS RECORDED
            </div>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT SIMULATED USER REGISTRATION MODAL --- */}
      {isUserFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-150 animate-scale-up">
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-5 flex items-center justify-between text-base font-bold">
              <span className="flex items-center gap-1.5 font-sans">
                <UserPlus className="w-5 h-5 text-blue-200" />
                {editingUserId ? 'อัปเดตสิทธิ์บันทึกผู้ใช้' : 'ลงทะเบียนผู้พ่วงขายรายใหม่'}
              </span>
              <button 
                onClick={() => setIsUserFormOpen(false)}
                className="text-white/85 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all focus:outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">ชื่อ-นามสกุลจริงพนักงาน *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สมศักดิ์ มีชัยประสงค์ (S05)"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full text-xs border border-slate-200 p-2.5 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">ที่อยู่อีเมลทางการใช้ล็อกอิน *</label>
                <input
                  type="email"
                  required
                  placeholder="somsak@crm.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full text-xs border border-slate-200 p-2.5 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">สังกัดฝ่ายทำงาน / แผนก *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ฝ่ายซ่อมบำรุงวิเคราะห์งานขาย"
                  value={userDept}
                  onChange={(e) => setUserDept(e.target.value)}
                  className="w-full text-xs border border-slate-200 p-2.5 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">บทบาทตามแมตริกซ์ *</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as UserRole)}
                    className="w-full text-xs border border-slate-200 bg-slate-50 p-2.5 rounded-lg focus:outline-none focus:bg-white font-sans text-slate-705"
                  >
                    {ROLES_LIST.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">สถานะการเชื่อมต่อ</label>
                  <select
                    value={userStatus}
                    onChange={(e) => setUserStatus(e.target.value as any)}
                    className="w-full text-xs border border-slate-200 bg-slate-50 p-2.5 rounded-lg focus:outline-none focus:bg-white font-sans"
                  >
                    <option value="Active">ผู้ใช้ตื่นตัว (Active)</option>
                    <option value="Inactive">ถูกระงับ (Inactive)</option>
                  </select>
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-end gap-2 border-t pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsUserFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg focus:outline-none transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
                >
                  {editingUserId ? 'อัปเดตผู้ใช้งาน' : 'บันทึกเป็นผู้ใช้ใหม่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
