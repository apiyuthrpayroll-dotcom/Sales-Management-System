<?php
/**
 * Sales Master CRM - Invoices & Receipts Management
 * Technology Stack: PHP 7+ / MySQL / SweetAlert2 / Bootstrap 5
 */
require_once __DIR__ . '/header.php';
require_once __DIR__ . '/sidebar.php';

$success_msg = '';
$error_msg = '';

// Handle creating an Invoice (POST submission)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_type']) && $_POST['action_type'] === 'create_invoice') {
    $cust_id = intval($_POST['customer_id']);
    $q_id = !empty($_POST['quotation_id']) ? intval($_POST['quotation_id']) : null;
    $inv_date = trim($_POST['invoice_date']);
    $due_date = trim($_POST['due_date']);
    $grand_total = floatval($_POST['grand_total']);

    if ($cust_id > 0 && !empty($inv_date) && !empty($due_date) && $grand_total > 0) {
        try {
            // Generate Invoice No (e.g. INV-260001)
            $countStmt = $pdo->query("SELECT COUNT(*) as count FROM invoices");
            $nextNum = $countStmt->fetch()['count'] + 1;
            $inv_no = 'INV-' . str_pad($nextNum, 6, '0', STR_PAD_LEFT);

            // Calculate subtotal and tax (assuming 7% standard VAT inclusive)
            $subtotal = $grand_total / 1.07;
            $tax_amount = $grand_total - $subtotal;

            $stmt = $pdo->prepare("
                INSERT INTO invoices (invoice_no, customer_id, quotation_id, invoice_date, due_date, subtotal, tax_amount, grand_total, status, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Unpaid', ?)
            ");
            $stmt->execute([$inv_no, $cust_id, $q_id, $inv_date, $due_date, $subtotal, $tax_amount, $grand_total, $userId]);
            $new_inv_id = $pdo->lastInsertId();

            // Log action to audit trail
            $logStmt = $pdo->prepare("INSERT INTO audit_logs (user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)");
            $logStmt->execute([
                $userId, 
                'ออกใบแจ้งหนี้ใหม่ (PHP Create Invoice)', 
                'invoice', 
                $new_inv_id, 
                "ออกใบแจ้งหนี้เลขที่ {$inv_no} ยอดสุทธิ ฿" . number_format($grand_total, 2) . " สำหรับองค์กรลูกค้าคู่ค้า"
            ]);

            $success_msg = "ออกเอกสารใบแจ้งหนี้เลขที่ \"{$inv_no}\" สำเร็จเรียบร้อย!";
        } catch (PDOException $e) {
            $error_msg = "เกิดข้อผิดพลาดในการสร้างใบแจ้งหนี้: " . $e->getMessage();
        }
    } else {
        $error_msg = "กรุณากรอกข้อมูลและยอดเงินให้ถูกต้อง!";
    }
}

// Fetch all invoices
try {
    $invStmt = $pdo->query("
        SELECT i.*, c.customer_name, q.quotation_no 
        FROM invoices i 
        JOIN customers c ON i.customer_id = c.id 
        LEFT JOIN quotations q ON i.quotation_id = q.id 
        ORDER BY i.invoice_no DESC
    ");
    $invoices = $invStmt->fetchAll();

    // Fetch active customers
    $custStmt = $pdo->query("SELECT id, customer_name FROM customers WHERE status = 'Active' ORDER BY customer_name ASC");
    $formCustomers = $custStmt->fetchAll();

    // Fetch approved quotations
    $qStmt = $pdo->query("SELECT id, quotation_no, grand_total, customer_id FROM quotations WHERE status = 'Approved' ORDER BY quotation_no DESC");
    $formQuotes = $qStmt->fetchAll();
} catch (PDOException $e) {
    echo "<div class='alert alert-danger m-3'>ดึงข้อมูลล้มเหลว: " . $e->getMessage() . "</div>";
    $invoices = $formCustomers = $formQuotes = [];
}
?>

<!-- Main Content Stage Area -->
<main class="app-main p-3">
  <!-- Content Header -->
  <div class="container-fluid mb-3 pt-2">
    <div class="row align-items-center">
      <div class="col-sm-6">
        <h1 class="m-0 fw-bold tracking-tight text-dark fs-2 text-uppercase">
          <i class="fas fa-wallet text-danger me-2"></i>การเงินและใบแจ้งหนี้ (Billing Suite)
        </h1>
        <p class="text-muted small m-0">บันทึกยอดชำระเงิน ตรวจสอบใบแจ้งหนี้ค้างจ่าย (Invoices) ออกใบเสร็จ และติดตามวงเงินเครดิตการค้า</p>
      </div>
      <div class="col-sm-6 text-sm-end mt-2 mt-sm-0">
        <button class="btn btn-outline-secondary btn-sm me-2" onclick="exportTableToExcel('invoice-table', 'Invoices_Export')">
          <i class="fa fa-file-excel text-success me-1"></i>Excel
        </button>
        <button class="btn btn-danger btn-sm shadow-sm" data-bs-toggle="modal" data-bs-target="#addInvoiceModal">
          <i class="fa fa-plus-circle me-1"></i>ออกใบแจ้งหนี้ใหม่
        </button>
      </div>
    </div>
  </div>

  <div class="container-fluid">
    <!-- Invoice DataTable -->
    <div class="card-admin shadow-sm border">
      <div class="card-admin-header bg-white border-bottom py-3">
        <h5 class="card-admin-title m-0 fw-bold text-slate-800">
          <i class="fas fa-table text-danger me-1"></i> ทะเบียนใบเสร็จและใบสำคัญรับเงินทั้งหมด (MySQL Store)
        </h5>
      </div>
      <div class="card-admin-body p-3">
        <div class="table-responsive">
          <table class="table table-bordered table-striped table-hover mb-0 bg-white datatable-init" id="invoice-table" style="font-size: 0.85rem;">
            <thead class="text-uppercase small fw-bold text-dark" style="background-color: #f8fafc;">
              <tr>
                <th style="width: 120px;">เลขที่ใบสำคัญ</th>
                <th>คู่ค้าองค์กรลูกค้า (Corporate Partner)</th>
                <th>อ้างอิงใบเสนอราคา</th>
                <th>วันที่จัดทำ</th>
                <th>กำหนดครบชำระ</th>
                <th>ยอดเงินรวมภาษี (Grand Total)</th>
                <th style="width: 120px;">สถานะจัดเก็บ</th>
                <th class="text-center" style="width: 100px;">การตรวจสอบ</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($invoices as $inv): ?>
                <tr>
                  <td class="font-monospace fw-bold text-danger"><?php echo htmlspecialchars($inv['invoice_no']); ?></td>
                  <td><div class="fw-bold text-dark"><?php echo htmlspecialchars($inv['customer_name']); ?></div></td>
                  <td>
                    <?php if (!empty($inv['quotation_no'])): ?>
                      <span class="badge bg-light text-dark font-monospace border"><i class="fa fa-file-invoice text-muted me-1"></i> <?php echo htmlspecialchars($inv['quotation_no']); ?></span>
                    <?php else: ?>
                      <span class="text-muted small">บันทึกวางบิลทั่วไป</span>
                    <?php endif; ?>
                  </td>
                  <td><?php echo htmlspecialchars($inv['invoice_date']); ?></td>
                  <td>
                    <span class="small <?php echo (strtotime($inv['due_date']) < time() && $inv['status'] === 'Unpaid') ? 'text-danger fw-bold' : ''; ?>">
                      <?php echo htmlspecialchars($inv['due_date']); ?>
                      <?php if (strtotime($inv['due_date']) < time() && $inv['status'] === 'Unpaid'): ?>
                        <br><span class="badge bg-danger-subtle text-danger p-0.5" style="font-size: 9px;"><i class="fa fa-clock"></i> เกินกำหนดชำระ!</span>
                      <?php endif; ?>
                    </span>
                  </td>
                  <td class="fw-bold font-monospace text-dark">฿<?php echo number_format($inv['grand_total'], 2); ?></td>
                  <td>
                    <span class="badge p-1.5 rounded <?php 
                      echo $inv['status'] === 'Paid' ? 'bg-success' : 
                          ($inv['status'] === 'Overdue' ? 'bg-danger' : 
                          ($inv['status'] === 'Unpaid' ? 'bg-warning text-dark' : 'bg-primary')); 
                    ?>">
                      <?php echo htmlspecialchars($inv['status']); ?>
                    </span>
                  </td>
                  <td class="text-center">
                    <button class="btn btn-outline-danger btn-xs px-2" onclick="Swal.fire('ใบแจ้งหนี้: <?php echo htmlspecialchars($inv['invoice_no']); ?>', 'ลูกค้า: <?php echo htmlspecialchars($inv['customer_name']); ?>\nรวมสุทธิ: ฿<?php echo number_format($inv['grand_total'], 2); ?>\nครบชำระ: <?php echo htmlspecialchars($inv['due_date']); ?>', 'info')">
                      <i class="fa fa-receipt"></i> ดูบิล
                    </button>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</main>

<!-- Add Invoice Bootstrap Modal -->
<div class="modal fade" id="addInvoiceModal" tabindex="-1" aria-labelledby="addInvoiceModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content text-dark">
      <form method="POST" action="">
        <input type="hidden" name="action_type" value="create_invoice">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title fw-bold" id="addInvoiceModalLabel"><i class="fa fa-plus-circle me-1.5"></i>จัดทำใบแจ้งหนี้และใบวางบิลใหม่</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body p-4">
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label small fw-bold">เลือกองค์กรลูกค้าคู่ค้า *</label>
              <select class="form-select" name="customer_id" required>
                <option value="">-- เลือกบริษัทลูกค้า --</option>
                <?php foreach ($formCustomers as $c): ?>
                  <option value="<?php echo $c['id']; ?>"><?php echo htmlspecialchars($c['customer_name']); ?></option>
                <?php endforeach; ?>
              </select>
            </div>
            <div class="col-12">
              <label class="form-label small fw-bold">อ้างอิงใบเสนอราคาที่ได้รับอนุมัติ (ถ้ามี)</label>
              <select class="form-select" name="quotation_id" id="quotation_select" onchange="autoFillQuotationAmount(this)">
                <option value="" data-amount="0">-- บันทึกเงินวางบิลตรง (ไม่มีใบเสนอราคา) --</option>
                <?php foreach ($formQuotes as $q): ?>
                  <option value="<?php echo $q['id']; ?>" data-amount="<?php echo $q['grand_total']; ?>" data-customer="<?php echo $q['customer_id']; ?>">
                    <?php echo htmlspecialchars($q['quotation_no']); ?> (ยอด ฿<?php echo number_format($q['grand_total'], 2); ?>)
                  </option>
                <?php endforeach; ?>
              </select>
            </div>
            <div class="col-12 col-sm-6">
              <label class="form-label small fw-bold">วันที่ออกใบแจ้งหนี้ *</label>
              <input type="date" class="form-control" name="invoice_date" required value="<?php echo date('Y-m-d'); ?>">
            </div>
            <div class="col-12 col-sm-6">
              <label class="form-label small fw-bold">วันที่ครบชำระ (Due Date) *</label>
              <input type="date" class="form-control" name="due_date" required value="<?php echo date('Y-m-d', strtotime('+30 days')); ?>">
            </div>
            <div class="col-12">
              <label class="form-label small fw-bold">ยอดเงินวางบิลรวมภาษีสุทธิ (Grand Total) *</label>
              <div class="input-group">
                <span class="input-group-text">฿</span>
                <input type="number" class="form-control font-monospace text-end" name="grand_total" id="grand_total_input" step="0.01" required value="0.00">
              </div>
              <span class="text-xs text-muted" style="font-size: 11px;"><i class="fa fa-info-circle text-info"></i> ระบบจะนำยอดเงินนี้ไปคำนวณถอดแยกภาษีมูลค่าเพิ่ม VAT 7% โดยอัตโนมัติ</span>
            </div>
          </div>
        </div>
        <div class="modal-footer bg-light">
          <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">ยกเลิก</button>
          <button type="submit" class="btn btn-danger btn-sm"><i class="fa fa-save me-1"></i>บันทึกและสร้างเอกสาร</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Autocomplete form trigger from quotation selection -->
<script>
  function autoFillQuotationAmount(select) {
    const selectedOption = select.options[select.selectedIndex];
    const amount = parseFloat(selectedOption.getAttribute('data-amount')) || 0;
    const custId = selectedOption.getAttribute('data-customer');
    
    // Fill the grand total
    const amountInput = document.getElementById('grand_total_input');
    if (amountInput) amountInput.value = amount.toFixed(2);

    // Auto select the matching customer if possible
    if (custId) {
      const custSelect = document.querySelector('select[name="customer_id"]');
      if (custSelect) custSelect.value = custId;
    }
  }
</script>

<!-- SweetAlert Feedback triggers -->
<script>
  window.addEventListener('DOMContentLoaded', () => {
    <?php if (!empty($success_msg)): ?>
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: '<?php echo htmlspecialchars($success_msg); ?>',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#2563eb'
      });
    <?php endif; ?>

    <?php if (!empty($error_msg)): ?>
      Swal.fire({
        icon: 'error',
        title: 'ข้อผิดพลาด!',
        text: '<?php echo htmlspecialchars($error_msg); ?>',
        confirmButtonText: 'ปิด',
        confirmButtonColor: '#ef4444'
      });
    <?php endif; ?>
  });
</script>

<?php
require_once __DIR__ . '/footer.php';
?>
