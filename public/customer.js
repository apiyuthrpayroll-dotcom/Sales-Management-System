// Customer master administration logic
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.endsWith('customers.html')) {
    loadCustomerTable();
    initCustomersEvents();
  }
});

let allCustomersCached = [];

// Fetch and render customer items
async function loadCustomerTable() {
  toggleGlobalLoader(true);
  try {
    allCustomersCached = await SupabaseDB.getCustomers();
    renderCustomerRows(allCustomersCached);
  } catch (err) {
    console.error("Load customers failed", err);
    showToastAlert('โหลดข้อมูลลูกค้าล้มเหลว', 'danger');
  } finally {
    toggleGlobalLoader(false);
  }
}

function renderCustomerRows(customers) {
  const tbody = document.getElementById('customer-table-body');
  if (!tbody) return;

  if (customers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center text-muted p-4">
          <i class="fas fa-building d-block fs-3 mb-2 opacity-50"></i>
          ไม่พบข้อมูลผู้ติดต่อลูกค้าในระบบ
        </td>
      </tr>
    `;
    return;
  }

  const query = document.getElementById('customer-search-input')?.value.toLowerCase().trim() || '';

  tbody.innerHTML = customers.map(cust => {
    // Contacts preview
    const contactsHtml = (cust.contacts || []).map(con => 
      `<div class="small lh-sm text-dark"><i class="fa fa-user opacity-70"></i> <strong>${con.contact_name}</strong> <span class="text-xs text-muted">(${con.position})</span><br><a href="tel:${con.phone}" class="text-xs text-decoration-none text-muted">${con.phone}</a></div>`
    ).join('<hr class="my-1 border-light">') || '<span class="text-muted small">ไม่มีผู้ติดต่อหลัก</span>';

    // Status label
    const statusClass = cust.status === 'Active' ? 'badge-status badge-status-approved' : 'badge-status badge-status-draft';
    
    // Highlight matching keywords
    let nameText = cust.customer_name;
    let codeText = cust.customer_code;
    let indText = cust.industry_type;
    
    if (query) {
      nameText = highlightMatch(nameText, query);
      codeText = highlightMatch(codeText, query);
      indText = highlightMatch(indText, query);
    }

    return `
      <tr class="align-middle">
        <td><span class="font-monospace fw-bold text-primary">${codeText}</span></td>
        <td>
          <div class="fw-bold fs-6 text-primary" style="cursor: pointer; text-decoration: underline dotted;" onclick="viewCustomerDetail('${cust.id}')" title="คลิกเพื่อเรียกดูประวัติงานสั่งจ้างและใบเสนอราคา">
            <i class="fas fa-search-plus text-secondary me-1" style="font-size: 0.85rem;"></i>${nameText}
          </div>
          <div class="small text-muted py-0.5"><i class="fa fa-info-circle"></i> Tax ID: ${cust.tax_id || '-'}</div>
        </td>
        <td><span class="badge bg-light text-dark border">${indText}</span></td>
        <td>
          <div class="small fw-semibold text-dark phone-cut"><i class="fa fa-phone"></i> ${cust.phone || '-'}</div>
          <div class="small text-muted"><i class="fa fa-envelope"></i> ${cust.email || '-'}</div>
        </td>
        <td>${contactsHtml}</td>
        <td>
          <span class="${statusClass}">${cust.status === 'Active' ? 'พร้อมติดต่อ (Active)' : 'ระงับ (Inactive)'}</span>
        </td>
        <td>
          <div class="d-flex gap-2 justify-content-center">
            <button class="btn btn-outline-primary btn-sm rounded shadow-sm d-flex align-items-center gap-1 fw-semibold px-2 py-1" style="font-size: 0.8rem;" onclick="viewCustomerDetail('${cust.id}')" title="ดูประวัติการสั่งจ้าง & ใบเสนอราคา">
              <i class="fas fa-folder-open"></i> ดูข้อมูล
            </button>
            <button class="btn btn-outline-warning text-dark border-warning btn-sm rounded shadow-sm d-flex align-items-center gap-1 fw-semibold px-2 py-1" style="font-size: 0.8rem;" onclick="editCustomerModal('${cust.id}')" title="แก้ไขข้อมูล">
              <i class="fas fa-edit"></i> แก้ไข
            </button>
            ${SupabaseDB.isAdmin() ? `
              <button class="btn btn-outline-danger btn-sm rounded shadow-sm d-flex align-items-center gap-1 px-2 py-1" style="font-size: 0.8rem;" onclick="deleteCustomerConfirm('${cust.id}', '${cust.customer_name.replace(/'/g, "\\'")}')" title="ลบลูกค้า">
                <i class="fas fa-trash-alt"></i>
              </button>
            ` : `
              <button class="btn btn-outline-secondary btn-sm opacity-50 rounded shadow-sm d-flex align-items-center gap-1 px-2 py-1" style="font-size: 0.8rem;" disabled title="จำกัดสิทธิ์เฉพาะ Admin เท่านั้น">
                <i class="fas fa-lock"></i>
              </button>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Regex matching highlight
function highlightMatch(text, query) {
  if (!text) return '';
  const idx = text.toLowerCase().indexOf(query);
  if (idx === -1) return text;
  return text.substring(0, idx) + `<span class="search-highlight">` + text.substring(idx, idx + query.length) + `</span>` + text.substring(idx + query.length);
}

// Search and filter triggers
function initCustomersEvents() {
  const searchInput = document.getElementById('customer-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      const filtered = allCustomersCached.filter(c => {
        const matchesField = c.customer_name.toLowerCase().includes(q) || 
                             c.customer_code.toLowerCase().includes(q) || 
                             c.industry_type.toLowerCase().includes(q) ||
                             (c.tax_id && c.tax_id.includes(q)) ||
                             (c.phone && c.phone.includes(q));
                             
        // also check inner contacts names
        const matchesContact = (c.contacts || []).some(con => con.contact_name.toLowerCase().includes(q));
        
        return matchesField || matchesContact;
      });
      renderCustomerRows(filtered);
    });
  }

  // Nested form row management (add/remove contact rows inside Modal)
  document.getElementById('add-contact-row-btn')?.addEventListener('click', () => {
    appendContactInputRow();
  });
}

function appendContactInputRow(contact = {}) {
  const container = document.getElementById('modal-contacts-container');
  if (!container) return;

  const rowId = crypto.randomUUID();
  const rowHtml = `
    <div class="row g-2 align-items-center mb-0 contact-input-form-row pb-2" id="row-${rowId}">
      <div class="col-md-3">
        <input type="text" class="form-control py-2 shadow-sm con-name" placeholder="ชื่อผู้ติดต่อ (เช่น สมเกียรติ)" value="${contact.contact_name || ''}" required>
      </div>
      <div class="col-md-3">
        <input type="text" class="form-control py-2 shadow-sm con-pos" placeholder="ตำแหน่งงาน (เช่น จัดซื้อ)" value="${contact.position || ''}" required>
      </div>
      <div class="col-md-3">
        <input type="tel" class="form-control py-2 shadow-sm con-phone" placeholder="เบอร์โทรติดต่อ" value="${contact.phone || ''}" required>
      </div>
      <div class="col-md-2">
        <input type="email" class="form-control py-2 shadow-sm con-email" placeholder="อีเมลติดต่อ" value="${contact.email || ''}">
      </div>
      <div class="col-md-1 text-center">
        <button type="button" class="btn btn-outline-danger shadow-sm py-2 px-3" onclick="document.getElementById('row-${rowId}').remove()"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', rowHtml);
}

// Main Modal controls for insertions / updates
function showAddCustomerModal() {
  // Clear modal contents
  document.getElementById('customer-form-id').value = '';
  document.getElementById('customer-modal-title').innerText = 'เพิ่มทะเบียนลูกค้ารายใหม่';
  document.getElementById('cust-name').value = '';
  document.getElementById('cust-tax').value = '';
  document.getElementById('cust-industry').value = 'Manufacturing';
  document.getElementById('cust-phone').value = '';
  document.getElementById('cust-email').value = '';
  document.getElementById('cust-address').value = '';
  document.getElementById('cust-term').value = '30';
  document.getElementById('cust-status').value = 'Active';
  
  const container = document.getElementById('modal-contacts-container');
  if (container) container.innerHTML = ''; // Clear rows
  appendContactInputRow(); // Always start with one blank row

  const bootstrapModal = new bootstrap.Modal(document.getElementById('customerFormModal'));
  bootstrapModal.show();
}

async function editCustomerModal(id) {
  const customer = allCustomersCached.find(c => c.id === id);
  if (!customer) return;

  document.getElementById('customer-form-id').value = customer.id;
  document.getElementById('customer-modal-title').innerText = `แก้ไขข้อมูลลูกค้า: ${customer.customer_code}`;
  document.getElementById('cust-name').value = customer.customer_name;
  document.getElementById('cust-tax').value = customer.tax_id || '';
  document.getElementById('cust-industry').value = customer.industry_type;
  document.getElementById('cust-phone').value = customer.phone || '';
  document.getElementById('cust-email').value = customer.email || '';
  document.getElementById('cust-address').value = customer.address || '';
  document.getElementById('cust-term').value = customer.payment_term || '30';
  document.getElementById('cust-status').value = customer.status;

  const container = document.getElementById('modal-contacts-container');
  if (container) {
    container.innerHTML = '';
    const contacts = customer.contacts || [];
    if (contacts.length === 0) {
      appendContactInputRow();
    } else {
      contacts.forEach(c => appendContactInputRow(c));
    }
  }

  const bootstrapModal = new bootstrap.Modal(document.getElementById('customerFormModal'));
  bootstrapModal.show();
}

// Submitting handler (Save Customer Action)
async function submitCustomerForm() {
  const form = document.getElementById('customerMainForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const id = document.getElementById('customer-form-id').value;
  const contacts = [];
  
  // Parse all contacts inputs
  const rows = document.querySelectorAll('.contact-input-form-row');
  rows.forEach(row => {
    const name = row.querySelector('.con-name').value.trim();
    const pos = row.querySelector('.con-pos').value.trim();
    const phone = row.querySelector('.con-phone').value.trim();
    const email = row.querySelector('.con-email').value.trim();

    if (name && pos && phone) {
      contacts.push({
        contact_name: name,
        position: pos,
        phone: phone,
        email: email
      });
    }
  });

  const payload = {
    customer_name: document.getElementById('cust-name').value.trim(),
    tax_id: document.getElementById('cust-tax').value.trim(),
    industry_type: document.getElementById('cust-industry').value,
    phone: document.getElementById('cust-phone').value.trim(),
    email: document.getElementById('cust-email').value.trim(),
    address: document.getElementById('cust-address').value.trim(),
    payment_term: parseInt(document.getElementById('cust-term').value, 10),
    status: document.getElementById('cust-status').value,
    contacts: contacts
  };

  toggleGlobalLoader(true);
  try {
    if (id) {
      // Edit
      await SupabaseDB.updateCustomer(id, payload);
      await SupabaseDB.addActivity('แก้ไขทะเบียนลูกค้า', 'Customer', id, `อัปเดตข้อมูลและรายชื่อผู้ติดต่อของลูกค้า: ${payload.customer_name}`);
      showToastAlert('อัปเดตข้อมูลลูกค้าเรียบร้อยแล้ว', 'success');
    } else {
      // Insert
      const res = await SupabaseDB.addCustomer(payload);
      await SupabaseDB.addActivity('เพิ่มทะเบียนลูกค้าใหม่', 'Customer', res.id || 'new', `ลงทะเบียนลูกค้าใหม่: ${payload.customer_name} ในภาคอุตสาหกรรมทางการตลาด ${payload.industry_type}`);
      showToastAlert('เพิ่มลูกค้าใหม่เข้าสู่ระบบสำเร็จ', 'success');
    }

    // Hide Modal and refresh
    const mEl = document.getElementById('customerFormModal');
    const modalInstance = bootstrap.Modal.getInstance(mEl);
    modalInstance?.hide();

    loadCustomerTable();

  } catch (error) {
    console.error("Save Customer operation failed", error);
    showToastAlert('ไม่สามารถบันทึกประวัติลูกค้า ข้อผิดพลาด: ' + error.message, 'danger');
  } finally {
    toggleGlobalLoader(false);
  }
}

// Delete account action
function deleteCustomerConfirm(id, name) {
  if (!SupabaseDB.isAdmin()) {
    showToastAlert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถลบข้อมูลลูกค้าได้', 'danger');
    return;
  }
  Swal.fire({
    title: 'ยืนยันการลบลูกค้า?',
    text: `ประวัติโอกาสการขาย โครงงาน ใบสั่งงาน รวมทั้งรายละเอียดผู้ติดต่อทั้งหมดของบริษัท ${name} จะมีผลกระทบลบออกจากระบบทันที!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'ยืนยัน, ลบออกจากระบบ!',
    cancelButtonText: 'ยกเลิก'
  }).then(async (result) => {
    if (result.isConfirmed) {
      toggleGlobalLoader(true);
      try {
        await SupabaseDB.deleteCustomer(id);
        await SupabaseDB.addActivity('ลบข้อมูลลูกค้า', 'Customer', id, `ทำการลบข้อมูลถาวรของลูกค้า: ${name}`);
        showToastAlert('ลบรายชื่อลูกค้าสำเร็จเรียบร้อย', 'success');
        loadCustomerTable();
      } catch (err) {
        console.error("Delete customer error", err);
        showToastAlert('การลบข้อมูลล้มเหลว', 'danger');
      } finally {
        toggleGlobalLoader(false);
      }
    }
  });
}

// View Customer Detailed Insights with ordered items, total cash paid, outstanding balances, and quotations
async function viewCustomerDetail(id) {
  const customer = allCustomersCached.find(c => c.id === id);
  if (!customer) {
    showToastAlert('ไม่พบข้อมูลลูกค้ารายนี้ในระบบข้อมูล', 'warning');
    return;
  }

  toggleGlobalLoader(true);
  try {
    // 1. Fetch Invoices and Quotations from database
    const allQuotes = await SupabaseDB.getQuotations() || [];
    const allInvoices = await SupabaseDB.getInvoices() || [];

    // 2. Filter for this specific customer
    const customerQuotes = allQuotes.filter(q => q.customer_id === id);
    const customerInvoices = allInvoices.filter(i => i.customer_id === id);

    // 3. Fill customer primary details card
    document.getElementById('detail-cust-code').innerText = customer.customer_code || 'CUST-TEMP';
    document.getElementById('detail-cust-name').innerText = customer.customer_name || '-';
    document.getElementById('detail-cust-industry').innerText = customer.industry_type || '-';
    document.getElementById('detail-cust-tax').innerText = customer.tax_id || 'ไม่ระบุ';
    document.getElementById('detail-cust-term').innerText = customer.payment_term || '0';
    document.getElementById('detail-cust-phone').innerText = customer.phone || 'ไม่มีเบอร์โทรศัพทสำนักงานหลัก';
    document.getElementById('detail-cust-email').innerText = customer.email || 'ไม่มีอีเมลองค์กรผู้ติดต่อ';

    // 4. Summarize and aggregate values for KPIs
    const invoiceItems = [];
    let paidTotal = 0;
    let unpaidTotal = 0;

    customerInvoices.forEach(inv => {
      const items = inv.items || [];
      items.forEach(it => {
        invoiceItems.push({
          ...it,
          invoice_no: inv.invoice_no,
          invoice_date: inv.invoice_date,
          status: inv.status
        });
      });

      const grand = parseFloat(inv.grand_total || inv.total_value || 0);
      if (inv.status === 'Paid') {
        paidTotal += grand;
      } else if (inv.status === 'Unpaid' || inv.status === 'Overdue') {
        unpaidTotal += grand;
      }
    });

    // Populate KPI Elements
    document.getElementById('detail-kpi-items-count').innerHTML = `${invoiceItems.length} <span class="fs-6 fw-normal text-muted">รายการสินค้า/บริการ</span>`;
    document.getElementById('detail-kpi-total-paid').innerText = '฿' + paidTotal.toLocaleString(undefined, { minimumFractionDigits: 2 });
    document.getElementById('detail-kpi-total-unpaid').innerText = '฿' + unpaidTotal.toLocaleString(undefined, { minimumFractionDigits: 2 });

    // Set interactive tab counts
    document.getElementById('tab-cnt-services').innerText = invoiceItems.length;
    document.getElementById('tab-cnt-quotes').innerText = customerQuotes.length;
    document.getElementById('tab-cnt-invoices').innerText = customerInvoices.length;

    // 5. Render Services Rendered Pane
    const servicesTbody = document.getElementById('detail-services-body');
    if (invoiceItems.length === 0) {
      servicesTbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4 text-muted">
            <i class="fas fa-cubes d-block fs-3 mb-2 opacity-50"></i>
            ไม่พบบันทึกสรุปรายการการบริการหรือสินค้าที่ใช้บริการสั่งซื้อของลูกค้ารายนี้
          </td>
        </tr>
      `;
    } else {
      servicesTbody.innerHTML = invoiceItems.map(item => {
        const qty = parseFloat(item.qty || 1);
        const rate = parseFloat(item.unit_rate || 0);
        const duration = parseInt(item.duration || 1, 10);
        const total = parseFloat(item.total_price || (qty * rate * duration));

        return `
          <tr>
            <td>
              <div class="fw-bold text-dark">${item.description || 'ไม่มีรายละเอียดงาน'}</div>
              ${item.unit ? `<small class="text-muted"><i class="fas fa-tag"></i> หน่วย: ${item.unit}</small>` : ''}
            </td>
            <td class="text-center font-monospace">${qty.toFixed(2)}</td>
            <td class="text-end font-monospace">${rate.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            <td class="text-center font-monospace">${duration}</td>
            <td class="text-end font-monospace fw-bold text-dark">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            <td class="text-center">
              <span class="badge bg-secondary font-monospace" style="font-size: 0.8rem;">
                <i class="fas fa-file-invoice me-1"></i>${item.invoice_no}
              </span>
            </td>
          </tr>
        `;
      }).join('');
    }

    // 6. Render Quotations List Pane
    const quotesTbody = document.getElementById('detail-quotes-body');
    if (customerQuotes.length === 0) {
      quotesTbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4 text-muted">
            <i class="fas fa-file-contract d-block fs-3 mb-2 opacity-50"></i>
            ไม่พบประวัติการจัดทำและยืนเสนอขออนุมัติใบเสนอราคากับลูกค้ารายนี้
          </td>
        </tr>
      `;
    } else {
      quotesTbody.innerHTML = customerQuotes.map(quote => {
        const qTotal = parseFloat(quote.grand_total || quote.total_value || 0);
        
        // Status Badge Logic
        let statusBadge = '';
        if (quote.status === 'Draft') statusBadge = '<span class="badge-status badge-status-draft">Draft</span>';
        else if (quote.status === 'Sent') statusBadge = '<span class="badge-status badge-status-submitted"><i class="fa fa-paper-plane me-1"></i>Sent</span>';
        else if (quote.status === 'Approved') statusBadge = '<span class="badge-status badge-status-approved"><i class="fa fa-check me-1"></i>Approved</span>';
        else if (quote.status === 'Rejected') statusBadge = '<span class="badge-status badge-status-rejected">Rejected</span>';
        else if (quote.status === 'Invoiced') statusBadge = '<span class="badge-status badge-status-ready"><i class="fa fa-file-invoice me-1"></i>Invoiced</span>';
        else statusBadge = `<span class="badge-status badge-status-draft">${quote.status || 'Draft'}</span>`;

        return `
          <tr>
            <td><span class="font-monospace fw-bold text-primary">${quote.quotation_no}</span></td>
            <td>
              <div class="fw-bold text-dark">${quote.project_name || quote.title || 'โครงการบริการจัดทำสัญญา'}</div>
              <div class="text-muted font-monospace mt-0.5" style="font-size: 11px; line-height: 1.3;">
                <span class="d-block"><i class="fas fa-user-tie text-secondary" style="font-size: 9px;"></i> ผู้ดูแล: ${(window.SupabaseDB && window.SupabaseDB.getUsernameOrDisplayName) ? window.SupabaseDB.getUsernameOrDisplayName(quote.sales_person) : (quote.sales_person || '-')}</span>
                <span class="d-block"><i class="fa fa-plus-circle text-secondary" style="font-size: 9px;"></i> สร้างโดย: ${quote.created_by ? window.SupabaseDB.getUsernameOrDisplayName(quote.created_by) : '@apiyut'}</span>
                ${quote.status === 'Approved' ? `<span class="d-block text-success"><i class="fa fa-check-circle" style="font-size: 9px;"></i> อนุมัติโดย: @pimjai</span>` : ''}
              </div>
            </td>
            <td class="small text-muted font-monospace">${quote.quotation_date || '-'}</td>
            <td class="text-end font-monospace fw-bold text-dark">${qTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            <td class="text-center">${statusBadge}</td>
          </tr>
        `;
      }).join('');
    }

    // 7. Render Invoices List Pane
    const invoicesTbody = document.getElementById('detail-invoices-body');
    if (customerInvoices.length === 0) {
      invoicesTbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4 text-muted">
            <i class="fas fa-file-invoice-dollar d-block fs-3 mb-2 opacity-50"></i>
            ไม่พบประวัติการบันทึกจัดส่งใบแจ้งหนี้เพื่อเรียกเก็บหนี้สำหรับลูกค้ารายนี้
          </td>
        </tr>
      `;
    } else {
      invoicesTbody.innerHTML = customerInvoices.map(inv => {
        const iTotal = parseFloat(inv.grand_total || inv.total_value || 0);
        
        let statusBadge = '';
        if (inv.status === 'Unpaid') statusBadge = '<span class="badge-status badge-status-unpaid"><i class="fa fa-clock"></i> Unpaid</span>';
        else if (inv.status === 'Paid') statusBadge = '<span class="badge-status badge-status-approved"><i class="fa fa-check-double"></i> Paid</span>';
        else if (inv.status === 'Overdue') statusBadge = '<span class="badge-status badge-status-rejected"><i class="fa fa-exclamation-triangle"></i> Overdue</span>';
        else statusBadge = `<span class="badge-status badge-status-draft">${inv.status || 'Unpaid'}</span>`;

        return `
          <tr>
            <td><span class="font-monospace fw-bold text-dark">${inv.invoice_no}</span></td>
            <td>
              <div class="fw-bold text-dark-emphasis">${inv.project_name || 'ใบแจ้งหนี้ทั่วไป'}</div>
              ${inv.remarks ? `<small class="text-muted d-block"><i class="fas fa-comment shadow-xs"></i> ${inv.remarks}</small>` : ''}
            </td>
            <td class="small text-muted font-monospace">${inv.invoice_date || '-'}</td>
            <td class="small text-danger font-monospace">${inv.due_date || '-'}</td>
            <td class="text-end font-monospace fw-bold text-dark">${iTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            <td class="text-center">${statusBadge}</td>
          </tr>
        `;
      }).join('');
    }

    // 8. Open the detail view Dialog Modal using Bootstrap
    const myModal = new bootstrap.Modal(document.getElementById('customerDetailModal'));
    myModal.show();

  } catch (error) {
    console.error("View Customer detail failed", error);
    showToastAlert('เรียกดูข้อมูลเชิงลึกล้มเหลว ข้อผิดพลาด: ' + error.message, 'danger');
  } finally {
    toggleGlobalLoader(false);
  }
}

// Make globally accessible
window.showAddCustomerModal = showAddCustomerModal;
window.editCustomerModal = editCustomerModal;
window.submitCustomerForm = submitCustomerForm;
window.deleteCustomerConfirm = deleteCustomerConfirm;
window.appendContactInputRow = appendContactInputRow;
window.viewCustomerDetail = viewCustomerDetail;
