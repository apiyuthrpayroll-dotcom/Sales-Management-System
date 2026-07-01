// Opportunity Management and tabular view lists
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.endsWith('opportunities.html')) {
    loadOpportunitiesTable();
    initOpportunitiesEvents();
  }
});

let allOpportunitiesCached = [];

async function loadOpportunitiesTable() {
  toggleGlobalLoader(true);
  try {
    allOpportunitiesCached = await SupabaseDB.getOpportunities();
    renderOpportunityRows(allOpportunitiesCached);
  } catch (err) {
    console.error("Fetch opportunities table failed", err);
    showToastAlert('โหลดข้อมูลโอกาสงานขายล้มเหลว', 'danger');
  } finally {
    toggleGlobalLoader(false);
  }
}

function renderOpportunityRows(opportunities) {
  const tbody = document.getElementById('opportunity-table-body');
  if (!tbody) return;

  if (opportunities.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center text-muted p-4">
          <i class="fas fa-handshake d-block fs-2 mb-2 opacity-50"></i>
          ไม่พบรายการโอกาสทางการขายในระบบหลัก
        </td>
      </tr>
    `;
    return;
  }

  const query = document.getElementById('opportunity-search-input')?.value.toLowerCase().trim() || '';
  const numFormatter = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' });

  tbody.innerHTML = opportunities.map(opp => {
    const custName = opp.customer ? opp.customer.customer_name : 'ไม่พบข้อมูลลูกค้า';
    const weightedVal = parseFloat(opp.estimated_value) * (parseInt(opp.success_probability) / 100);

    // Dynamic stats badges
    let statusClass = 'badge-lead';
    if (opp.status === 'Qualified') statusClass = 'badge-qualified';
    if (opp.status === 'Proposal') statusClass = 'badge-proposal text-dark';
    if (opp.status === 'Negotiation') statusClass = 'badge-negotiation';
    if (opp.status === 'Won') statusClass = 'badge-won';
    if (opp.status === 'Lost') statusClass = 'badge-lost';
    if (opp.status === 'Cancelled') statusClass = 'badge-cancelled';

    // Highlight text matching
    let projText = opp.project_name;
    let codeText = opp.opportunity_no;
    let clientText = custName;

    if (query) {
      projText = highlightMatch(projText, query);
      codeText = highlightMatch(codeText, query);
      clientText = highlightMatch(clientText, query);
    }

    // Won/Lost Quick Actions list
    const quickActionsDisabled = (opp.status === 'Won' || opp.status === 'Lost' || opp.status === 'Cancelled');
    const quickActionsHtml = quickActionsDisabled ? 
      `<span class="text-muted small">ปิดดีลแล้ว</span>` : 
      `
      <div class="d-flex gap-1 justify-content-center">
        <button class="btn btn-xs btn-success" p-1 onclick="quickChangeOpportunityStatus('${opp.id}', 'Won')" title="ทำเครื่องหมายชนะการขาย (Won)"><i class="fa fa-check"></i> ชนะ</button>
        <button class="btn btn-xs btn-danger" p-1 onclick="quickChangeOpportunityStatus('${opp.id}', 'Lost')" title="ทำเครื่องหมายแพ้ (Lost)"><i class="fa fa-times"></i> แพ้</button>
      </div>
      `;

    return `
      <tr class="align-middle">
        <td><span class="font-monospace fw-bold text-primary">${codeText}</span></td>
        <td>
          <div class="fw-bold text-dark fs-6">${projText}</div>
          <div class="small text-muted py-0.5"><i class="fa fa-building"></i> ${clientText}</div>
        </td>
        <td><span class="badge bg-light text-dark border">${opp.service_type}</span></td>
        <td>
          <div class="fw-bold text-dark">${numFormatter.format(opp.estimated_value)}</div>
          <div class="text-xs text-muted">โอกาสสำเร็จ: ${opp.success_probability}%</div>
        </td>
        <td>
          <div class="fw-semibold text-color-indigo font-monospace" style="font-size:0.82rem;">${numFormatter.format(weightedVal)}</div>
        </td>
        <td class="font-monospace small font-bold">${opp.expected_close_date || '-'}</td>
        <td>
          <div class="small fw-semibold text-dark" style="font-size: 0.8rem;">${(window.SupabaseDB && window.SupabaseDB.getUsernameOrDisplayName) ? window.SupabaseDB.getUsernameOrDisplayName(opp.sales_person_id) : (opp.sales_person_id || '-')}</div>
          <div class="text-muted font-monospace mt-0.5" style="font-size: 10px; line-height: 1.2;">
            <span class="d-block" title="สร้างโดย"><i class="fa fa-plus-circle text-secondary" style="font-size: 9px;"></i> ${opp.created_by ? window.SupabaseDB.getUsernameOrDisplayName(opp.created_by) : '@apiyut'}</span>
            <span class="d-block" title="แก้ไขโดย"><i class="fa fa-pen text-secondary" style="font-size: 9px;"></i> ${opp.updated_by ? window.SupabaseDB.getUsernameOrDisplayName(opp.updated_by) : '@apiyut'}</span>
          </div>
        </td>
        <td>
          <span class="badge-status ${statusClass} d-inline-block text-center" style="min-width: 90px;">${opp.status}</span>
        </td>
        <td>
          <div class="d-flex flex-column gap-1.5 align-items-center">
            ${quickActionsHtml}
            <div class="d-flex gap-1 justify-content-center mt-1">
              <button onclick="openOpportunityModal('${opp.id}')" class="btn btn-outline-primary btn-xs" title="แก้ไขเอกสารรายละเอียด"><i class="fa fa-edit"></i></button>
              ${SupabaseDB.isAdmin() ? `
                <button class="btn btn-outline-danger btn-xs" onclick="deleteOpportunityConfirm('${opp.id}', '${opp.project_name.replace(/'/g, "\\'")}', '${opp.opportunity_no}')" title="ลบเป้าหมายการขาย"><i class="fa fa-trash"></i></button>
              ` : `
                <button class="btn btn-outline-secondary btn-xs opacity-50" disabled title="จำกัดสิทธิ์เฉพาะ Admin เท่านั้น"><i class="fa fa-lock"></i></button>
              `}
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Substring highlights
function highlightMatch(text, query) {
  if (!text) return '';
  const idx = text.toLowerCase().indexOf(query);
  if (idx === -1) return text;
  return text.substring(0, idx) + `<span class="search-highlight">` + text.substring(idx, idx + query.length) + `</span>` + text.substring(idx + query.length);
}

function initOpportunitiesEvents() {
  const searchInput = document.getElementById('opportunity-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      const filtered = allOpportunitiesCached.filter(o => {
        const custName = o.customer ? o.customer.customer_name : '';
        return o.project_name.toLowerCase().includes(q) ||
               o.opportunity_no.toLowerCase().includes(q) ||
               custName.toLowerCase().includes(q) ||
               o.status.toLowerCase().includes(q) ||
               o.service_type.toLowerCase().includes(q) ||
               o.sales_person_id.toLowerCase().includes(q);
      });
      renderOpportunityRows(filtered);
    });
  }

  // Quick Status Filter buttons
  const statusSelectors = document.querySelectorAll('.opp-status-pill-filter');
  statusSelectors.forEach(btn => {
    btn.addEventListener('click', (e) => {
      statusSelectors.forEach(b => b.classList.remove('active', 'btn-primary'));
      statusSelectors.forEach(b => b.classList.add('btn-outline-secondary'));

      btn.classList.add('active', 'btn-primary');
      btn.classList.remove('btn-outline-secondary');

      const filterStatus = btn.getAttribute('data-status');
      if (filterStatus === 'ALL') {
        renderOpportunityRows(allOpportunitiesCached);
      } else {
        const filtered = allOpportunitiesCached.filter(o => o.status === filterStatus);
        renderOpportunityRows(filtered);
      }
    });
  });
}

// Quick adjust status (Won/Lost)
async function quickChangeOpportunityStatus(id, nextStatus) {
  const opp = allOpportunitiesCached.find(o => o.id === id);
  if (!opp) return;

  const phrase = nextStatus === 'Won' ? 'ชนะปิดดีลงานได้เรียบร้อย (Won)' : 'ปิดแพ้โครงการ (Lost)';
  const icon = nextStatus === 'Won' ? 'success' : 'error';
  const color = nextStatus === 'Won' ? '#198754' : '#dc3545';

  Swal.fire({
    title: `คุณต้องการระบุสถานะเป็น "${nextStatus}"?`,
    text: `โปรแกรมจะอัปเดตสถานะโครงการ ${opp.project_name} ไปยังสถานะที่สรุปทันที!`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: color,
    cancelButtonColor: '#6c757d',
    confirmButtonText: `ปรับเป็น ${nextStatus}`,
    cancelButtonText: 'ยกเลิก'
  }).then(async (result) => {
    if (result.isConfirmed) {
      toggleGlobalLoader(true);
      try {
        // Prepare patch params
        const updates = { 
          status: nextStatus,
          success_probability: nextStatus === 'Won' ? 100 : 0
        };

        await SupabaseDB.updateOpportunity(id, updates);
        await SupabaseDB.addActivity('อัปเดตสถานะดีลงาน', 'Opportunity', id, `เปลี่ยนสถานะดีลของโครงการ "${opp.project_name}" ไปยังสถานะ ${nextStatus}!`);
        
        showToastAlert(`ปรับสถานะเป้าหมายเป็น ${nextStatus} เรียบร้อยแล้ว`, 'success');
        loadOpportunitiesTable(); // Reload to refresh tables and stats
      } catch (err) {
        console.error("Quick status mutation error", err);
        showToastAlert('อัปเดตล้มเหลว', 'danger');
      } finally {
        toggleGlobalLoader(false);
      }
    }
  });
}

// Delete confirm dialog
function deleteOpportunityConfirm(id, name, refNo) {
  if (!SupabaseDB.isAdmin()) {
    showToastAlert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถลบโอกาสขายได้', 'danger');
    return;
  }
  Swal.fire({
    title: 'ต้องการลบเป้าหมายงานขายนี้?',
    text: `หมายเลขโอกาส ${refNo} (โครงการ: ${name}) จะถูกเพิกถอนข้อมูล และการคาดการณ์ยอดเงินจะหายรายจ่ายวิเคราะห์ออกไป ถาวร!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'ใช่, ฉันมั่นใจที่จะลบ!',
    cancelButtonText: 'ยกเลิก'
  }).then(async (result) => {
    if (result.isConfirmed) {
      toggleGlobalLoader(true);
      try {
        await SupabaseDB.deleteOpportunity(id);
        await SupabaseDB.addActivity('ลบข้อมูลโอกาสขาย', 'Opportunity', id, `ทำลายดีลงานที่เกี่ยวกับโครงการ "${name}" (เลขที่ที่ลบ: ${refNo})`);
        showToastAlert('ลบเอกสารโอกาสขายสำเร็จแล้ว', 'success');
        loadOpportunitiesTable();
      } catch (err) {
        console.error("Delete opportunity error", err);
        showToastAlert('ไม่สามารถลบดีลงานได้', 'danger');
      } finally {
        toggleGlobalLoader(false);
      }
    }
  });
}

// Export global symbols
window.quickChangeOpportunityStatus = quickChangeOpportunityStatus;
window.deleteOpportunityConfirm = deleteOpportunityConfirm;

// Modal Support Logic
let opportunityModalInstance = null;

async function loadCustomersToDropdown() {
  try {
    const customers = await SupabaseDB.getCustomers();
    const select = document.getElementById('opp-customer');
    if (!select) return;

    select.innerHTML = '<option value="" disabled selected>-- กรุณาเลือกบัญชีลูกค้าผู้รับผิดชอบ --</option>';
    customers.forEach(cust => {
      if (cust.status === 'Active') {
        const opt = document.createElement('option');
        opt.value = cust.id;
        opt.innerText = `${cust.customer_name} (${cust.customer_code})`;
        select.appendChild(opt);
      }
    });
  } catch (err) {
    console.error("Dropdown customer injection failed", err);
  }
}

async function openOpportunityModal(id = "") {
  await loadCustomersToDropdown();

  // Initialize Bootstrap modal if not already
  if (!opportunityModalInstance) {
    const modalEl = document.getElementById('opportunityModal');
    if (modalEl) {
      opportunityModalInstance = new bootstrap.Modal(modalEl);
      
      // Bind slider dynamically
      const slider = document.getElementById('opp-probability');
      const bubble = document.getElementById('opp-prob-bubble');
      if (slider && bubble) {
        slider.addEventListener('input', (e) => {
          bubble.innerText = `${e.target.value}%`;
        });
      }

      // Bind status to auto-prob
      const statusSelect = document.getElementById('opp-status');
      if (statusSelect && slider && bubble) {
        statusSelect.addEventListener('change', (e) => {
          const val = e.target.value;
          const mappedRates = {
            'Lead': 10,
            'Qualified': 30,
            'Proposal': 60,
            'Negotiation': 80,
            'Won': 100,
            'Lost': 0,
            'Cancelled': 0
          };
          if (mappedRates[val] !== undefined) {
            slider.value = mappedRates[val];
            bubble.innerText = `${mappedRates[val]}%`;
          }
        });
      }
    }
  }

  const titleEl = document.getElementById('opportunityModalLabel');
  const form = document.getElementById('opportunityDetailForm');
  if (form) form.reset();

  const idInput = document.getElementById('opp-form-id');
  const probabilitySlider = document.getElementById('opp-probability');
  const probabilityBubble = document.getElementById('opp-prob-bubble');

  if (id) {
    if (titleEl) titleEl.innerHTML = '<i class="fa fa-edit me-2"></i> แก้ไขข้อมูลโอกาสขาย';
    if (idInput) idInput.value = id;

    // Fetch opportunity details
    const target = allOpportunitiesCached.find(o => o.id === id);
    if (target) {
      document.getElementById('opp-customer').value = target.customer_id || "";
      document.getElementById('opp-project-name').value = target.project_name || "";
      document.getElementById('opp-service-type').value = target.service_type || "Testing Service";
      document.getElementById('opp-lead-source').value = target.lead_source || "Website";
      document.getElementById('opp-location').value = target.project_location || "Other";
      document.getElementById('opp-estimated-value').value = target.estimated_value || 0;
      document.getElementById('opp-expected-date').value = target.expected_close_date || "";
      document.getElementById('opp-salesperson').value = target.sales_person_id || "เอกชัย วงศ์ดี (S01)";
      document.getElementById('opp-status').value = target.status || "Lead";
      
      if (probabilitySlider && probabilityBubble) {
        probabilitySlider.value = target.success_probability || 50;
        probabilityBubble.innerText = `${target.success_probability || 50}%`;
      }
      document.getElementById('opp-remarks').value = target.remarks || "";
    }
  } else {
    if (titleEl) titleEl.innerHTML = '<i class="fa fa-plus me-2"></i> ระบุข้อมูลโอกาสขายใหม่';
    if (idInput) idInput.value = "";
    if (probabilitySlider && probabilityBubble) {
      probabilitySlider.value = 50;
      probabilityBubble.innerText = "50%";
    }
  }

  if (opportunityModalInstance) {
    opportunityModalInstance.show();
  }
}

async function saveOpportunityAction() {
  const idInput = document.getElementById('opp-form-id').value;
  const payload = {
    customer_id: document.getElementById('opp-customer').value,
    project_name: document.getElementById('opp-project-name').value.trim(),
    service_type: document.getElementById('opp-service-type').value,
    lead_source: document.getElementById('opp-lead-source').value,
    project_location: document.getElementById('opp-location').value,
    estimated_value: parseFloat(document.getElementById('opp-estimated-value').value),
    expected_close_date: document.getElementById('opp-expected-date').value,
    success_probability: parseInt(document.getElementById('opp-probability').value, 10),
    sales_person_id: document.getElementById('opp-salesperson').value,
    status: document.getElementById('opp-status').value,
    remarks: document.getElementById('opp-remarks').value.trim(),
    internal_notes: ""
  };

  toggleGlobalLoader(true);
  try {
    if (idInput) {
      await SupabaseDB.updateOpportunity(idInput, payload);
      await SupabaseDB.addActivity('แก้ไขโครงการขาย', 'Opportunity', idInput, `แก้ไขรายละเอียดดีล "${payload.project_name}" (มูลค่า ฿${payload.estimated_value.toLocaleString()})`);
      showToastAlert('ปรับปรุงเรียบร้อยุกตัว', 'success');
    } else {
      const res = await SupabaseDB.addOpportunity(payload);
      await SupabaseDB.addActivity('จดทะเบียนโอกาสขายใหม่', 'Opportunity', res.id || 'new', `ระบุเป้าหมายดีลงานใหม่สำหรับ "${payload.project_name}"`);
      showToastAlert('สร้างเสร็จสิ้น', 'success');
    }

    if (opportunityModalInstance) {
      opportunityModalInstance.hide();
    }

    // Refresh grid dynamically!
    await loadOpportunitiesTable();
  } catch (err) {
    console.error("Save opportunity failed", err);
    showToastAlert('บันทึกข้อมูลล้มเหลว', 'danger');
  } finally {
    toggleGlobalLoader(false);
  }
}

window.openOpportunityModal = openOpportunityModal;
window.saveOpportunityAction = saveOpportunityAction;

