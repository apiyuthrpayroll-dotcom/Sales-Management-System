// Dashboard functions and charts manager
document.addEventListener('DOMContentLoaded', () => {
  // Load dashboard widgets and graphs
  if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname === '') {
    loadDashboardData();
    initializeRealtimeClock();
  }
});

let allCustomers = [];
let allOpportunities = [];
let allActivities = [];

let statusChartInstance = null;
let pipelineChartInstance = null;

async function loadDashboardData() {
  toggleGlobalLoader(true);
  try {
    allCustomers = await SupabaseDB.getCustomers();
    allOpportunities = await SupabaseDB.getOpportunities();
    allActivities = await SupabaseDB.getActivities();

    // Dynamically synthesize activities for Opportunities and Customers from live Supabase to ensure they display on Netlify / new devices
    const synthesized = [];
    allOpportunities.forEach(opp => {
      const exists = allActivities.some(a => a.target_id === opp.id && (a.action === 'จดทะเบียนโอกาสขายใหม่' || a.action === 'แก้ไขโครงการขาย'));
      if (!exists) {
        synthesized.push({
          id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2),
          action: 'จดทะเบียนโอกาสขายใหม่',
          target_type: 'Opportunity',
          target_id: opp.id,
          details: `ระบุเป้าหมายดีลงานใหม่สำหรับ "${opp.project_name || 'TST'}"`,
          created_at: opp.created_at || new Date().toISOString()
        });
      }
    });

    allCustomers.forEach(cust => {
      const exists = allActivities.some(a => a.target_id === cust.id && (a.action === 'เพิ่มทะเบียนลูกค้าใหม่' || a.action === 'แก้ไขทะเบียนลูกค้า'));
      if (!exists) {
        synthesized.push({
          id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2),
          action: 'เพิ่มทะเบียนลูกค้าใหม่',
          target_type: 'Customer',
          target_id: cust.id,
          details: `ลงทะเบียนลูกค้าใหม่: ${cust.customer_name} ในหมวดหมู่อุตสาหกรรม ${cust.industry_type || ''}`,
          created_at: cust.created_at || new Date().toISOString()
        });
      }
    });

    if (synthesized.length > 0) {
      allActivities = [...allActivities, ...synthesized];
      // Sort descending by created_at
      allActivities.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      localStorage.setItem('crm_activities', JSON.stringify(allActivities));
    }

    // Set welcome profile username if logged in
    const cachedUser = localStorage.getItem('crm_user_role') || 'Admin';
    const cachedFullname = localStorage.getItem('crm_user_fullname') || 'Apiyut';
    const welcomeUserEl = document.getElementById('welcome-username');
    if (welcomeUserEl) {
      welcomeUserEl.innerText = `${cachedFullname} (${cachedUser})`;
    }

    // Trigger initial render
    onFilterChange();

  } catch (error) {
    console.error("Failed to compile dashboard metrics", error);
    showToastAlert('การสรุปผลแดชบอร์ดล้มเหลว กรุณาตรวจสอบการเชื่อมต่อ', 'danger');
  } finally {
    toggleGlobalLoader(false);
  }
}

function initializeRealtimeClock() {
  const clockEl = document.getElementById('realtime-clock');
  const dateEl = document.getElementById('realtime-date');
  
  if (clockEl) {
    setInterval(() => {
      const now = new Date();
      clockEl.innerHTML = `<i class="fa fa-clock me-1 text-warning"></i> ${now.toLocaleTimeString('th-TH')}`;
    }, 1000);
  }
  
  if (dateEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.innerText = new Date().toLocaleDateString('th-TH', options);
  }
}

function onFilterChange() {
  const searchVal = (document.getElementById('filter-search')?.value || '').toLowerCase().trim();
  const serviceTypeVal = document.getElementById('filter-type')?.value || 'ALL';
  const probLevelVal = document.getElementById('filter-prob')?.value || 'ALL';

  let filteredOpps = [...allOpportunities];

  // 1. Filter by Text query
  if (searchVal) {
    filteredOpps = filteredOpps.filter(o => 
      (o.opportunity_name || '').toLowerCase().includes(searchVal) || 
      (o.customer_name || '').toLowerCase().includes(searchVal) ||
      (o.service_type || '').toLowerCase().includes(searchVal)
    );
  }

  // 2. Filter by Service Type
  if (serviceTypeVal !== 'ALL') {
    filteredOpps = filteredOpps.filter(o => o.service_type === serviceTypeVal);
  }

  // 3. Filter by Success Probability Level
  if (probLevelVal !== 'ALL') {
    filteredOpps = filteredOpps.filter(o => {
      const prob = parseFloat(o.success_probability) || 0;
      if (probLevelVal === 'high') return prob >= 70;
      if (probLevelVal === 'mid') return prob >= 40 && prob < 70;
      if (probLevelVal === 'low') return prob < 40;
      return true;
    });
  }

  // Also filter activities that are related to active filtered opportunities
  let filteredActs = [...allActivities];
  if (searchVal || serviceTypeVal !== 'ALL' || probLevelVal !== 'ALL') {
    const activeOppIds = new Set(filteredOpps.map(o => o.id));
    filteredActs = allActivities.filter(a => {
      if (a.target_type === 'Opportunity') {
        return activeOppIds.has(a.target_id);
      }
      return true;
    });
  }

  // Master recalculate and update visuals
  calculateKPIs(allCustomers, filteredOpps);
  renderStatusDistributionChart(filteredOpps);
  renderPipelineTimelineChart(filteredOpps);
  renderRecentTimeline(filteredActs, allCustomers, filteredOpps);
  generateAISmartInsight(filteredOpps);
}

function resetDashboardFilters() {
  const searchInput = document.getElementById('filter-search');
  const typeSelect = document.getElementById('filter-type');
  const probSelect = document.getElementById('filter-prob');

  if (searchInput) searchInput.value = '';
  if (typeSelect) typeSelect.value = 'ALL';
  if (probSelect) probSelect.value = 'ALL';

  onFilterChange();
  showToastAlert('เคลียร์ฟิลเตอร์กรองข้อมูลแดชบอร์ดแล้ว', 'info');
}

function generateAISmartInsight(opps) {
  const element = document.getElementById('ai-insight-line');
  if (!element) return;

  const currentLang = localStorage.getItem('crm_lang') || 'EN';
  const negotiationOpps = opps.filter(o => o.status === 'Negotiation');
  const proposalOpps = opps.filter(o => o.status === 'Proposal');
  const wonOpps = opps.filter(o => o.status === 'Won');
  
  let insightText = '';
  if (currentLang === 'EN') {
    if (negotiationOpps.length > 0) {
      const totalNegValue = negotiationOpps.reduce((sum, item) => sum + (parseFloat(item.estimated_value) || 0), 0);
      const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalNegValue).replace('$', '฿');
      insightText = `Found ${negotiationOpps.length} high-value Negotiation deal(s) totaling ${formatter}. Recommended to close today!`;
    } else if (proposalOpps.length > 0) {
      insightText = `There are ${proposalOpps.length} active Quotation proposals awaiting client feedback. Schedule follow-up calls this week.`;
    } else if (wonOpps.length > 0) {
      insightText = `Congratulations! Large sales deals recently Won. The quarterly revenue projections are positive.`;
    } else {
      insightText = `Sales pipeline is balanced. Create new prospective leads to sustain momentum for next quarter.`;
    }
    
    element.innerHTML = `
      <i class="fa fa-lightbulb text-warning animate__bounce animate__animated animate__infinite"></i>
      <span class="fw-semibold">Today's Strategy Tip:</span> ${insightText}
    `;
  } else {
    if (negotiationOpps.length > 0) {
      const totalNegValue = negotiationOpps.reduce((sum, item) => sum + (parseFloat(item.estimated_value) || 0), 0);
      const formatter = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 });
      insightText = `พบดีลสถานะ เจรจาต่อรอง (Negotiation) รวม ${negotiationOpps.length} ดีลล้ำค่า ยอดสะสมรวม ${formatter.format(totalNegValue)} แนะนำส่งทีมปิดด่วนวันนี้!`;
    } else if (proposalOpps.length > 0) {
      insightText = `มีโครงการเสนอราคา ${proposalOpps.length} ชุดที่รออนุมัติ เสนอจัดเซสชันโทรติดตามผลเพื่อรับรู้ feedback สัปดาห์นี้`;
    } else if (wonOpps.length > 0) {
      insightText = `ยินดีด้วย! คุณปิดการขายดีลใหญ่ (Won) สำเร็จ ยอดผลิตมูลค่ารวมดีลชนะเลิศกระเพื่อมเป็นบวกอย่างยอดเยี่ยม`;
    } else {
      insightText = `ภาพรวมแดชบอร์ดสมดุลดีเยี่ยม แนะนำสร้างลูกค้าเป้าหมายเพื่อป้องกัน Pipeline แห้งในรอบไตรมาสถัดไป`;
    }
    
    element.innerHTML = `
      <i class="fa fa-lightbulb text-warning animate__bounce animate__animated animate__infinite"></i>
      <span class="fw-semibold">คำแนะนำกลยุทธ์วันนี้:</span> ${insightText}
    `;
  }
}

function calculateKPIs(customers, opportunities) {
  const currentLang = localStorage.getItem('crm_lang') || 'EN';
  // Total Active Opportunities Value
  const activeOpps = opportunities.filter(o => o.status !== 'Lost' && o.status !== 'Cancelled');
  const totalValue = activeOpps.reduce((sum, item) => sum + (parseFloat(item.estimated_value) || 0), 0);
  
  // Weighted Pipeline Value (Sum of Estimated Value * Success Probability %)
  const weightedPipeline = activeOpps.reduce((sum, item) => {
    const val = parseFloat(item.estimated_value) || 0;
    const prob = parseFloat(item.success_probability) || 0;
    return sum + (val * (prob / 100));
  }, 0);

  // Won values
  const wonOpps = opportunities.filter(o => o.status === 'Won');
  const wonValue = wonOpps.reduce((sum, item) => sum + (parseFloat(item.estimated_value) || 0), 0);

  // Active Customers Count
  const activeCustomers = customers.filter(c => c.status === 'Active').length;

  // Format currency helpers
  const formatter = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 });

  document.getElementById('kpi-total-val').innerText = formatter.format(totalValue);
  document.getElementById('kpi-weighted-val').innerText = formatter.format(weightedPipeline);
  document.getElementById('kpi-won-val').innerText = formatter.format(wonValue);
  
  if (currentLang === 'EN') {
    document.getElementById('kpi-customers-count').innerText = `${activeCustomers} Accounts`;
  } else {
    document.getElementById('kpi-customers-count').innerText = `${activeCustomers} ราย`;
  }

  // Weighted logic progress bar sync
  const weightedPct = totalValue > 0 ? Math.round((weightedPipeline / totalValue) * 100) : 0;
  const weightedBar = document.getElementById('kpi-weighted-progress');
  const weightedPctText = document.getElementById('kpi-weighted-pct');
  if (weightedBar) {
    weightedBar.style.width = `${weightedPct}%`;
  }
  if (weightedPctText) {
    if (currentLang === 'EN') {
      weightedPctText.innerText = `${weightedPct}% of total pipeline`;
    } else {
      weightedPctText.innerText = `${weightedPct}% ของยอดพอร์ตรวม`;
    }
  }

  // Won progress bar sync against arbitrary target e.g. 5,000,000 THB
  const wonTarget = 5000000;
  const wonPct = Math.min(100, Math.round((wonValue / wonTarget) * 100));
  const wonBar = document.getElementById('kpi-won-progress');
  const wonPctText = document.getElementById('kpi-won-pct');
  if (wonBar) {
    wonBar.style.width = `${wonPct}%`;
  }
  if (wonPctText) {
    if (currentLang === 'EN') {
      wonPctText.innerText = `${wonPct}% of ฿5M target`;
    } else {
      wonPctText.innerText = `${wonPct}% ของเป้า ฿5M`;
    }
  }

  // Mini progress calculation percentage
  const winPercent = opportunities.length > 0 ? Math.round((wonOpps.length / opportunities.length) * 100) : 0;
  if (currentLang === 'EN') {
    document.getElementById('kpi-win-ratio-desc').innerText = `Sales Win Ratio: ${winPercent}% (${wonOpps.length} won from ${opportunities.length} total opportunities)`;
  } else {
    document.getElementById('kpi-win-ratio-desc').innerText = `อัตรางานขายที่สำเร็จ: ${winPercent}% (สำเร็จ ${wonOpps.length} จากดีลรวม ${opportunities.length} รายการ)`;
  }
}

function renderStatusDistributionChart(opportunities) {
  const ctx = document.getElementById('statusChart');
  if (!ctx) return;

  const currentLang = localStorage.getItem('crm_lang') || 'EN';
  const statuses = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost', 'Cancelled'];
  const statusCounts = statuses.map(st => opportunities.filter(o => o.status === st).length);

  if (statusChartInstance) {
    statusChartInstance.destroy();
  }

  const thLabels = ['Lead (เบื้องต้น)', 'Qualified (ลูกค้าจริง)', 'Proposal (เสนอราคา)', 'Negotiation (ต่อรอง)', 'Won (สำเร็จ)', 'Lost (เสียดีล)', 'Cancelled (ยกเลิก)'];
  const enLabels = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost', 'Cancelled'];
  const chartLabel = currentLang === 'EN' ? 'Number of Deals by Status' : 'จำนวนโอกาสดีลตามสถานะ';

  const canvasCtx = ctx.getContext('2d');
  statusChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: currentLang === 'EN' ? enLabels : thLabels,
      datasets: [{
        label: chartLabel,
        data: statusCounts,
        backgroundColor: [
          'rgba(108, 117, 125, 0.85)', // Lead - Gray
          'rgba(13, 202, 240, 0.85)',  // Qualified - Light Blue
          'rgba(255, 193, 7, 0.85)',   // Proposal - Orange Yellow
          'rgba(253, 126, 20, 0.85)',  // Negotiation - Orange
          'rgba(25, 135, 84, 0.85)',   // Won - Green
          'rgba(220, 53, 69, 0.85)',   // Lost - Red
          'rgba(33, 37, 41, 0.85)'     // Cancelled - Dark
        ],
        hoverBackgroundColor: [
          '#6c757d', '#0dcaf0', '#ffc107', '#fd7e14', '#198754', '#dc3545', '#212529'
        ],
        borderWidth: 0,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: '#64748b' },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
            drawTicks: false
          }
        },
        x: {
          ticks: { color: '#64748b' },
          grid: { display: false }
        }
      }
    }
  });
}

function renderPipelineTimelineChart(opportunities) {
  const ctx = document.getElementById('pipelineChart');
  if (!ctx) return;

  const currentLang = localStorage.getItem('crm_lang') || 'EN';

  // Group active opportunities values by Expected Close Month-Year e.g. "2026-07"
  const grouped = {};
  opportunities.forEach(opp => {
    if (opp.status === 'Lost' || opp.status === 'Cancelled') return;
    if (!opp.expected_close_date) return;
    const dateStr = opp.expected_close_date; // YYYY-MM-DD
    const label = dateStr.substring(0, 7); // "YYYY-MM"
    grouped[label] = (grouped[label] || 0) + parseFloat(opp.estimated_value);
  });

  // Sort months chronologically
  const sortedMonths = Object.keys(grouped).sort();
  const sortedValues = sortedMonths.map(m => grouped[m]);

  // Translate labels to user-friendly list "ม.ค. 26", "ก.พ. 26" / "Jan 26", "Feb 26"
  const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const engMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const formattedLabels = sortedMonths.map(m => {
    const parts = m.split('-');
    const monthIdx = parseInt(parts[1], 10) - 1;
    const shortYr = parts[0].substring(2);
    const mName = currentLang === 'EN' ? engMonths[monthIdx] : thaiMonths[monthIdx];
    return `${mName} ${shortYr}`;
  });

  if (pipelineChartInstance) {
    pipelineChartInstance.destroy();
  }

  const canvasCtx = ctx.getContext('2d');
  // Create beautiful line filling linear gradient
  const gradientFill = canvasCtx.createLinearGradient(0, 0, 0, 300);
  gradientFill.addColorStop(0, 'rgba(25, 135, 84, 0.28)');
  gradientFill.addColorStop(1, 'rgba(25, 135, 84, 0.00)');

  const emptyText = currentLang === 'EN' ? "No Deal Data" : "ไม่มีข้อมูลดีล";
  const datasetLabel = currentLang === 'EN' ? 'Forecasted Cumulative Won Revenue (THB)' : 'คาดการณ์ยอดปิดการขายมูลค่าสะสม (บาท)';

  pipelineChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: formattedLabels.length > 0 ? formattedLabels : [emptyText],
      datasets: [{
        label: datasetLabel,
        data: sortedValues.length > 0 ? sortedValues : [0],
        fill: true,
        borderColor: '#198754',
        backgroundColor: gradientFill,
        tension: 0.35,
        borderWidth: 3,
        pointBackgroundColor: '#198754',
        pointHoverBackgroundColor: '#157347',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          display: true, 
          labels: { 
            color: '#64748b',
            boxWidth: 15,
            font: { family: 'Inter, Prompt, sans-serif', size: 12 } 
          } 
        }
      },
      scales: {
        y: {
          ticks: {
            color: '#64748b',
            callback: function(value) {
              if (value >= 1000000) {
                return (value / 1000000).toFixed(1) + 'M ฿';
              } else if (value >= 1000) {
                return (value / 1000).toFixed(0) + 'k ฿';
              }
              return value + ' ฿';
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
            drawTicks: false
          }
        },
        x: { 
          ticks: { color: '#64748b' },
          grid: { display: false }
        }
      }
    }
  });
}

function renderRecentTimeline(activities, customers, opportunities) {
  const container = document.getElementById('recent-timeline');
  if (!container) return;

  const currentLang = localStorage.getItem('crm_lang') || 'EN';

  if (activities.length === 0) {
    const noActText = currentLang === 'EN' ? "No activities found matching current pipeline" : "ไม่พบประวัติกิจกรรมสอดคล้องกับดีลปัจจุบัน";
    container.innerHTML = `
      <div class="text-center p-5 text-muted small">
        <i class="fas fa-history d-block fs-2 mb-3 opacity-25"></i>
        ${noActText}
      </div>
    `;
    return;
  }

  // Build bullet lists with interactive layout
  let html = `<div class="d-flex flex-column gap-3">`;
  
  // Show last 6 logs
  activities.slice(0, 6).forEach((act, idx) => {
    let typeBadge = '<span class="badge bg-secondary rounded-pill px-2" style="font-size:9px;">System</span>';
    let iconHTML = '<div class="timeline-circle bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 28px; height: 28px;"><i class="fa fa-cog small"></i></div>';
    
    if (act.target_type === 'Customer') {
      typeBadge = '<span class="badge bg-primary text-white rounded-pill px-2" style="font-size:9px;">Customer</span>';
      iconHTML = '<div class="timeline-circle bg-primary text-white rounded-circle shadow-sm d-flex align-items-center justify-content-center" style="width: 28px; height: 28px;"><i class="fa fa-user-tie small"></i></div>';
    }
    if (act.target_type === 'Opportunity') {
      typeBadge = '<span class="badge bg-warning text-dark rounded-pill px-2" style="font-size:9px;">Opportunity</span>';
      iconHTML = '<div class="timeline-circle bg-warning text-dark rounded-circle shadow-sm d-flex align-items-center justify-content-center" style="width: 28px; height: 28px;"><i class="fa fa-handshake small"></i></div>';
    }

    const timeLoc = currentLang === 'EN' ? 'en-US' : 'th-TH';
    const dateObj = new Date(act.created_at);
    const formattedDate = dateObj.toLocaleDateString(timeLoc, { day: 'numeric', month: 'short' });
    const timestamp = dateObj.toLocaleTimeString(timeLoc, { hour: '2-digit', minute: '2-digit' });
    const timeSuffix = currentLang === 'EN' ? '' : ' น.';
    const displayTime = `${formattedDate} ${timestamp}${timeSuffix}`;
    const actionLabel = act.action;
    
    let targetLabel = `ID: ${act.target_id.slice(0,6)}`;
    const storedUsers = localStorage.getItem('crm_users_list');
    const systemUsers = storedUsers ? JSON.parse(storedUsers) : [
      { id: "d1ef4942-83b3-4f9e-bbb4-7a0df47ab001", username: "apiyut", fullname: "Apiyut (Admin)", role: "Admin", email: "Apiyut.noeikhiaw@th.ikm.com" },
      { id: "d2ef4942-83b3-4f9e-bbb4-7a0df47ab002", username: "pimjai", fullname: "พิมพ์ใจ กิตติคุณ", role: "Sales Manager", email: "pimjai.k@ikm-testing.co.th" },
      { id: "d3ef4942-83b3-4f9e-bbb4-7a0df47ab003", username: "wiriya", fullname: "วิริยะ สว่างงาม", role: "Sales Rep", email: "wiriya.s@ikm-testing.co.th" },
      { id: "d4ef4942-83b3-4f9e-bbb4-7a0df47ab004", username: "somsri", fullname: "สมศรี จิตรประสงค์", role: "Auditor", email: "somsri.j@ikm-testing.co.th" },
      { id: "657229df-fb36-4978-bf94-4a52e04f7ae0", username: "art", fullname: "ART KIT", role: "Admin", email: "artkummool@gmail.com" }
    ];

    let matchedUser = null;
    if (act.created_by) {
      matchedUser = systemUsers.find(u => u.id === act.created_by) || { fullname: act.created_by_name };
    } else if (act.created_by_name) {
      matchedUser = { fullname: act.created_by_name };
    }

    if (!matchedUser) {
      if (act.target_type === 'Opportunity') {
        const opp = (opportunities || []).find(o => o.id === act.target_id) || (typeof allOpportunities !== 'undefined' ? allOpportunities.find(o => o.id === act.target_id) : null);
        
        if (opp) {
          const rawSalesPerson = opp.sales_person_id || opp.sales_person || "";
          
          matchedUser = systemUsers.find(u => {
            const fn = u.fullname.toLowerCase();
            const rp = rawSalesPerson.toLowerCase();
            return fn.includes(rp) || rp.includes(fn);
          });
  
          if (!matchedUser) {
            if (rawSalesPerson.includes("เอกชัย") || rawSalesPerson.includes("S01") || rawSalesPerson.includes("S1")) {
              matchedUser = systemUsers.find(u => u.fullname.includes("วิริยะ") || u.role === "Sales Rep" || u.role.includes("Sales"));
            } else if (rawSalesPerson.includes("สุชาดา") || rawSalesPerson.includes("S02") || rawSalesPerson.includes("S2")) {
              matchedUser = systemUsers.find(u => u.fullname.includes("พิมพ์ใจ") || u.role === "Sales Manager" || u.role.includes("Manager"));
            } else if (rawSalesPerson.includes("ธนพล") || rawSalesPerson.includes("S03") || rawSalesPerson.includes("S3")) {
              matchedUser = systemUsers.find(u => u.fullname.includes("Apiyut") || u.role === "Admin" || u.role.includes("Admin"));
            }
          }
        }
      } else if (act.target_type === 'Customer') {
        const cust = (customers || []).find(c => c.id === act.target_id) || (typeof allCustomers !== 'undefined' ? allCustomers.find(c => c.id === act.target_id) : null);
        
        if (cust) {
          const rawSalesPerson = cust.sales_person_id || cust.sales_person || cust.created_by || "";
          
          matchedUser = systemUsers.find(u => {
            const fn = u.fullname.toLowerCase();
            const rp = rawSalesPerson.toLowerCase();
            return (rp && fn.includes(rp)) || (rp && rp.includes(fn)) || u.id === rawSalesPerson;
          });
  
          if (!matchedUser) {
            if (rawSalesPerson.includes("เอกชัย") || rawSalesPerson.includes("S01") || rawSalesPerson.includes("S1")) {
              matchedUser = systemUsers.find(u => u.fullname.includes("วิริยะ") || u.role === "Sales Rep" || u.role.includes("Sales"));
            } else if (rawSalesPerson.includes("สุชาดา") || rawSalesPerson.includes("S02") || rawSalesPerson.includes("S2")) {
              matchedUser = systemUsers.find(u => u.fullname.includes("พิมพ์ใจ") || u.role === "Sales Manager" || u.role.includes("Manager"));
            } else if (rawSalesPerson.includes("ธนพล") || rawSalesPerson.includes("S03") || rawSalesPerson.includes("S3")) {
              matchedUser = systemUsers.find(u => u.fullname.includes("Apiyut") || u.role === "Admin" || u.role.includes("Admin"));
            }
          }
        }
      }
    }

    if (!matchedUser) {
       // Fallback to current user if activity doesn't have the explicit actor logged
       const currentUser = (window.SupabaseDB && window.SupabaseDB.getCurrentUser) ? window.SupabaseDB.getCurrentUser() : systemUsers[0];
       matchedUser = currentUser;
    }

    const displayUsername = matchedUser && matchedUser.fullname ? matchedUser.fullname : (systemUsers[0] ? systemUsers[0].fullname : "Apiyut (Admin)");
    const cleanUsername = displayUsername.split('(')[0].trim();
    targetLabel = `<i class="fa fa-user text-white opacity-75 me-1" style="font-size: 8px;"></i>${cleanUsername}`;
    
    html += `
      <div class="d-flex align-items-start gap-2.5 pb-2 border-bottom border-light">
        ${iconHTML}
        <div class="flex-grow-1" style="min-width: 0;">
          <div class="d-flex align-items-center justify-content-between mb-0.5">
            <strong class="text-dark truncate fw-bold" style="font-size: 0.85rem; max-width: 60%;">${actionLabel}</strong>
            <span class="text-muted font-monospace text-nowrap" style="font-size: 10px;">${displayTime}</span>
          </div>
          <p class="text-muted small m-0 mb-1" style="font-size: 0.76rem; line-height: 1.35;">${act.details}</p>
          <div class="d-flex align-items-center gap-2">
            ${typeBadge} 
            <span class="badge bg-dark text-white font-sans fw-bold" style="font-size:9px; padding: 3px 8px;">${targetLabel}</span>
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}
