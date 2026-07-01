import React, { useState, useMemo } from 'react';
import { Opportunity, OpportunityStatus, UserRole } from '../types';
import { TrendingUp, DollarSign, Building2, Layers2 } from 'lucide-react';

interface KanbanViewProps {
  opportunities: Opportunity[];
  onStatusChange: (id: string, newStatus: OpportunityStatus) => Promise<any>;
  onToast: (msg: string, type: 'success' | 'err') => void;
  onSelectOpp: (opp: Opportunity) => void;
  currentRole?: UserRole;
  currentUserId?: string;
}

const KANBAN_STAGES: { id: OpportunityStatus; title: string; color: string; bgHeader: string }[] = [
  { id: 'Lead', title: 'มีลีด (Lead)', color: 'border-t-slate-400 text-slate-700', bgHeader: 'bg-slate-100/80' },
  { id: 'Qualified', title: 'คัดกรอง (Qualified)', color: 'border-t-blue-500 text-blue-700', bgHeader: 'bg-blue-50/80' },
  { id: 'Proposal', title: 'เสนอราคา (Proposal)', color: 'border-t-orange-500 text-orange-700', bgHeader: 'bg-orange-50/80' },
  { id: 'Negotiation', title: 'เจรจา (Negotiation)', color: 'border-t-purple-500 text-purple-700', bgHeader: 'bg-purple-50/80' },
  { id: 'Won', title: 'ปิดการขายได้ (Won)', color: 'border-t-green-500 text-green-700', bgHeader: 'bg-green-50/80' },
];

export default function KanbanView({ 
  opportunities, 
  onStatusChange, 
  onToast, 
  onSelectOpp,
  currentRole = 'System Administrator',
  currentUserId = '3'
}: KanbanViewProps) {
  // Drag state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [hoveredStage, setHoveredStage] = useState<OpportunityStatus | null>(null);

  // Group opportunities by status (only including the core pipeline stages for maximum clarity)
  const groupedOpportunities = useMemo(() => {
    const groups: { [key in OpportunityStatus]?: Opportunity[] } = {};
    
    // Seed groups
    KANBAN_STAGES.forEach(stage => {
      groups[stage.id] = [];
    });

    opportunities.forEach(opp => {
      if (groups[opp.status]) {
        groups[opp.status]?.push(opp);
      }
    });

    return groups;
  }, [opportunities]);

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setHoveredStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stage: OpportunityStatus) => {
    e.preventDefault();
    if (hoveredStage !== stage) {
      setHoveredStage(stage);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStage: OpportunityStatus) => {
    e.preventDefault();
    const id = draggedId;
    handleDragEnd();

    if (!id) return;

    // Find original
    const original = opportunities.find(o => o.id === id);
    if (!original) return;

    if (original.status === targetStage) return; // No change

    // Role restrictions checks
    if (currentRole === 'Management') {
      onToast('ปฏิเสธการดำเนินการ: แฟ้มงานผู้บริหารเปิดดูได้อย่างเดียว (View Only) ไม่ได้รับสิทธิ์เขียนสถานะบนแผ่นคัมบัง', 'err');
      return;
    }

    if (currentRole === 'Sales' && original.sales_person_id !== currentUserId) {
      onToast('ปฏิเสธการสลับการ์ด: พนักงานฝ่ายขายไม่มีสิทธิ์เคลื่อนห่วงดีลพนักงานท่านอื่น (พนักงานสามารถโยกเฉพาะงานของตนเอง)', 'err');
      return;
    }

    try {
      await onStatusChange(id, targetStage);
      onToast(`เปลี่ยนประเภทลีด ${original.opportunity_no} ไปยังขั้นตอน ${targetStage} สำเร็จ`, 'success');
    } catch {
      onToast('เกิดข้อผิดพลาดในการย้ายกระดานข้อมูลคัมบัง', 'err');
    }
  };

  // Helper formats
  const formatTHB = (num: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="space-y-6">
      
      {/* Kanban Info Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-1.5">
            <Layers2 className="w-5 h-5 text-blue-500" />
            ไปป์ไลน์การขาย (CRM Sales Pipeline Kanban)
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">ลากและวางการ์ดเพื่ออัปเดตสเตตัสโอกาสการขายแบบเรียลไทม์ และประสานเข้ากับฐานข้อมูลคลาวด์</p>
        </div>
        <div className="flex gap-4 text-xs bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-slate-500 font-medium">
          <span>* Drag การ์ดเพื่อขยับขั้นตอนการเจรจาการค้าในทันที</span>
        </div>
      </div>

      {/* Board Scroll wrapper */}
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 min-w-[1200px]">
          {KANBAN_STAGES.map(stage => {
            const list = groupedOpportunities[stage.id] || [];
            
            // Calculate column total value
            const colTotal = list.reduce((sum, item) => sum + item.estimated_value, 0);

            return (
              <div 
                key={stage.id}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={() => setHoveredStage(null)}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`flex flex-col bg-[#f8fafc]/40 rounded-2xl border-t-[4px] border border-slate-100/80 min-h-[500px] transition-all ${
                  hoveredStage === stage.id 
                    ? 'border-blue-400 shadow-sm bg-blue-50/20 scale-[1.01]' 
                    : draggedId 
                      ? 'border-slate-200' 
                      : 'border-slate-100'
                } ${stage.color}`}
              >
                {/* Column Header */}
                <div className={`p-4 rounded-t-xl ${stage.bgHeader} border-b border-slate-200/40 flex justify-between items-center shrink-0 select-none`}>
                  <div className="space-y-0.5 min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm truncate">{stage.title}</h3>
                    <div className="text-[10px] text-slate-400 font-semibold font-mono" title="มูลค่างบประมาณรวม">
                      {formatTHB(colTotal)}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-white/70 border border-slate-200/50 px-2 py-0.5 rounded-full shadow-2xs font-mono shrink-0">
                    {list.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[520px]">
                  {list.length > 0 ? (
                    list.map(opp => (
                      <div
                        key={opp.id}
                        draggable
                        onDragStart={() => handleDragStart(opp.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onSelectOpp(opp)}
                        className={`bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing transition-all select-none relative group ${
                          draggedId === opp.id ? 'opacity-30 border-dashed border-blue-300' : ''
                        }`}
                      >
                        {/* OPP ID */}
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            {opp.opportunity_no}
                          </span>
                          
                          {/* Success probability badge */}
                          <span className="text-[10px] font-mono font-bold text-slate-500 flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3 text-slate-400 shrink-0" />
                            {opp.success_probability}%
                          </span>
                        </div>

                        {/* Project name */}
                        <div className="mt-2 text-xs font-semibold text-slate-800 line-clamp-2 leading-relaxed" title={opp.project_name}>
                          {opp.project_name}
                        </div>

                        {/* Customer title */}
                        <div className="mt-2.5 flex items-center gap-1 text-slate-400 font-sans text-[11px] border-t border-slate-200/30 pt-2 shrink-0">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate" title={opp.customer?.customer_name}>
                            {opp.customer?.customer_name || 'ไม่ได้ระบุลูกค้า'}
                          </span>
                        </div>

                        {/* Card Budget price */}
                        <div className="mt-2 flex items-center justify-between font-mono text-xs font-bold text-slate-700">
                          <div className="flex items-center text-slate-500 font-sans font-normal text-[10px]">
                            <span>งบประมาณ:</span>
                          </div>
                          <span className="text-blue-900">{formatTHB(opp.estimated_value)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full py-16 flex items-center justify-center text-slate-400/60 text-xs border border-dashed border-slate-100 rounded-xl select-none">
                      ไม่มีรายการลีดขั้นตอนนี้
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
