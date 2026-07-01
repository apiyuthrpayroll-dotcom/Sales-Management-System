<?php
/**
 * Sales Master CRM - Quotations List & Generator
 * Technology Stack: PHP 7+ / MySQL / JavaScript Dynamic Forms / SweetAlert2 / Bootstrap 5
 */
require_once __DIR__ . '/header.php';
require_once __DIR__ . '/sidebar.php';

$success_msg = '';
$error_msg = '';

// Handle creating a new quotation
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_type']) && $_POST['action_type'] === 'create_quotation') {
    $cust_id = intval($_POST['customer_id']);
    $opp_id = !empty($_POST['opportunity_id']) ? intval($_POST['opportunity_id']) : null;
    $title = trim($_POST['title']);
    $q_date = trim($_POST['quotation_date']);
    $validity = intval($_POST['validity_days']);
    $pay_term = trim($_POST['payment_term']);
    $terms = trim($_POST['terms_conditions']);
    $remarks = trim($_POST['remarks']);

    // Line items data from form
    $item_names = $_POST['item_name'] ?? [];
    $quantities = $_POST['item_qty'] ?? [];
    $units = $_POST['item_unit'] ?? [];
    $prices = $_POST['item_price'] ?? [];

    if (!empty($title) && $cust_id > 0 && !empty($item_names)) {
        try {
            $pdo->beginTransaction();

            // 1. Generate Quotation No (e.g. QT-260001)
            $countStmt = $pdo->query("SELECT COUNT(*) as count FROM quotations");
            $nextNum = $countStmt->fetch()['count'] + 1;
            $q_no = 'QT-' . str_pad($nextNum, 6, '0', STR_PAD_LEFT);

            // 2. Calculate totals from line items
            $total_value = 0;
            $line_items_data = [];
            for ($i = 0; $i < count($item_names); $i++) {
                if (empty(trim($item_names[$i]))) continue;
                $qty = floatval($quantities[$i]);
                $price = floatval($prices[$i]);
                $line_total = $qty * $price;
                $total_value += $line_total;

                $line_items_data[] = [
                    'item_name' => trim($item_names[$i]),
                    'qty' => $qty,
                    'unit' => trim($units[$i] ?: 'Unit'),
                    'price' => $price,
                    'total' => $line_total
                ];
            }

            $tax_rate = 7.00; // 7% Standard VAT
            $tax_amount = $total_value * ($tax_rate / 100);
            $grand_total = $total_value + $tax_amount;

            // 3. Insert Quotation Header
            $stmt = $pdo->prepare("
                INSERT INTO quotations (quotation_no, customer_id, opportunity_id, title, quotation_date, validity_days, payment_term, total_value, tax_rate, grand_total, terms_conditions, remarks, sales_person_id, status, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft', ?)
            ");
            $stmt->execute([$q_no, $cust_id, $opp_id, $title, $q_date, $validity, $pay_term, $total_value, $tax_rate, $grand_total, $terms, $remarks, $userId, $userId]);
            $new_q_id = $pdo->lastInsertId();

            // 4. Insert Quotation Line Items
            $itemStmt = $pdo->prepare("
                INSERT INTO quotation_items (quotation_id, item_name, quantity, unit, unit_price, total)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            foreach ($line_items_data as $item) {
                $itemStmt->execute([$new_q_id, $item['item_name'], $item['qty'], $item['unit'], $item['price'], $item['total']]);
            }

            // 5. Log action to audit trail
            $logStmt = $pdo->prepare("INSERT INTO audit_logs (user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)");
            $logStmt->execute([
                $userId, 
                'ออกใบเสนอราคาใหม่ (PHP Create Quotation)', 
                'quotation', 
                $new_q_id, 
                "ออกใบเสนอราคาเลขที่ {$q_no} เรื่อง: \"{$title}\" ยอดสุทธิ ฿" . number_format($grand_total, 2)
            ]);

            $pdo->commit();
            $success_msg = "สร้างใบเสนอราคาเลขที่ \"{$q_no}\" เรียบร้อยแล้ว!";
        } catch (PDOException $e) {
            $pdo->rollBack();
            $error_msg = "เกิดข้อผิดพลาดในการบันทึกข้อมูลใบเสนอราคา: " . $e->getMessage();
        }
    } else {
        $error_msg = "กรุณากรอกข้อมูลและรายการใบเสนอราคาอย่างน้อย 1 รายการ!";
    }
}

// Fetch all quotations with joined details
try {
    $qStmt = $pdo->query("
        SELECT q.*, c.customer_name, o.project_name 
        FROM quotations q 
        JOIN customers c ON q.customer_id = c.id 
        LEFT JOIN opportunities o ON q.opportunity_id = o.id 
        ORDER BY q.quotation_no DESC
    ");
    $quotations = $qStmt->fetchAll();

    // Fetch active customers
    $custStmt = $pdo->query("SELECT id, customer_name FROM customers WHERE status = 'Active' ORDER BY customer_name ASC");
    $formCustomers = $custStmt->fetchAll();

    // Fetch active opportunities
    $oppStmt = $pdo->query("SELECT id, project_name, customer_id FROM opportunities WHERE status NOT IN ('Won', 'Lost') ORDER BY project_name ASC");
    $formOpps = $oppStmt->fetchAll();
} catch (PDOException $e) {
    echo "<div class='alert alert-danger m-3'>ดึงข้อมูลล้มเหลว: " . $e->getMessage() . "</div>";
    $quotations = $formCustomers = $formOpps = [];
}
?>

<!-- Main Content Stage Area -->
<main class="app-main p-3">
  <!-- Content Header -->
  <div class="container-fluid mb-3 pt-2">
    <div class="row align-items-center">
      <div class="col-sm-6">
        <h1 class="m-0 fw-bold tracking-tight text-dark fs-2 text-uppercase">
          <i class="fas fa-file-invoice text-success me-2"></i>ระบบออกใบเสนอราคา (Quotations Suite)
        </h1>
        <p class="text-muted small m-0">บันทึกใบเสนอราคา แจกแจงรายการสินค้า ค่าอุปกรณ์เช่า ชิ้นส่วนงานทดสอบไฮโดรเทส และติดตามอนุมัติ</p>
      </div>
      <div class="col-sm-6 text-sm-end mt-2 mt-sm-0">
        <div class="btn-group shadow-sm me-2">
          <button class="btn btn-outline-secondary btn-sm" onclick="exportTableToExcel('quotation-table', 'Quotations_Report')">
            <i class="fa fa-file-excel text-success me-1"></i>Excel
          </button>
        </div>
        <button class="btn btn-success btn-sm shadow-sm" data-bs-toggle="modal" data-bs-target="#addQuotationModal">
          <i class="fa fa-plus-circle me-1"></i>สร้างใบเสนอราคาใหม่
        </button>
      </div>
    </div>
  </div>

  <div class="container-fluid">
    <!-- DataTable Card -->
    <div class="card-admin shadow-sm border">
      <div class="card-admin-header bg-white border-bottom py-3">
        <h5 class="card-admin-title m-0 fw-bold text-slate-800">
          <i class="fas fa-table text-success me-1"></i> แฟ้มรายการเอกสารเสนอราคาทั้งหมด (MySQL Stream)
        </h5>
      </div>
      <div class="card-admin-body p-3">
        <div class="table-responsive">
          <table class="table table-bordered table-striped table-hover mb-0 bg-white datatable-init" id="quotation-table" style="font-size: 0.85rem;">
            <thead class="text-uppercase small fw-bold text-dark" style="background-color: #f8fafc;">
              <tr>
                <th style="width: 120px;">เลขที่เอกสาร</th>
                <th>ข้อมูลลูกค้า & เรื่อง</th>
                <th>เชื่อมโยงดีล</th>
                <th>วันที่ออกเอกสาร</th>
                <th>ยอดรวมสุทธิ</th>
                <th style="width: 100px;">สถานะ</th>
                <th class="text-center" style="width: 130px;">การควบคุม</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($quotations as $q): ?>
                <tr>
                  <td class="font-monospace fw-bold text-success"><?php echo htmlspecialchars($q['quotation_no']); ?></td>
                  <td>
                    <div class="fw-bold text-dark"><?php echo htmlspecialchars($q['title']); ?></div>
                    <div class="text-xs text-muted" style="font-size: 11px;"><i class="fa fa-building me-1"></i> <?php echo htmlspecialchars($q['customer_name']); ?></div>
                  </td>
                  <td>
                    <span class="small text-muted"><i class="fa fa-bullseye me-1 text-warning"></i> <?php echo htmlspecialchars($q['project_name'] ?: 'ดีลขายทั่วไป'); ?></span>
                  </td>
                  <td><?php echo htmlspecialchars($q['quotation_date']); ?></td>
                  <td class="fw-bold font-monospace text-dark">฿<?php echo number_format($q['grand_total'], 2); ?></td>
                  <td>
                    <span class="badge p-1.5 rounded <?php 
                      echo $q['status'] === 'Approved' ? 'bg-success' : 
                          ($q['status'] === 'Rejected' ? 'bg-danger' : 
                          ($q['status'] === 'Sent' ? 'bg-info text-dark' : 'bg-primary')); 
                    ?>">
                      <?php echo htmlspecialchars($q['status']); ?>
                    </span>
                  </td>
                  <td class="text-center">
                    <button class="btn btn-outline-success btn-xs px-2" onclick="Swal.fire('ใบเสนอราคา: <?php echo htmlspecialchars($q['quotation_no']); ?>', 'ชื่อ: <?php echo htmlspecialchars($q['title']); ?>\nรวมสุทธิ: ฿<?php echo number_format($q['grand_total'], 2); ?>\nเงื่อนไขชำระ: <?php echo htmlspecialchars($q['payment_term']); ?>', 'success')">
                      <i class="fa fa-eye"></i> รายละเอียด
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

<!-- Add Quotation Modal -->
<div class="modal fade" id="addQuotationModal" tabindex="-1" aria-labelledby="addQuotationModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-xl">
    <div class="modal-content text-dark">
      <form method="POST" action="">
        <input type="hidden" name="action_type" value="create_quotation">
        <div class="modal-header bg-success text-white">
          <h5 class="modal-title fw-bold" id="addQuotationModalLabel"><i class="fa fa-plus-circle me-1.5"></i>จัดทำเอกสารเสนอราคาใหม่</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body p-4">
          <div class="row g-3">
            <!-- Header section -->
            <div class="col-12 col-md-4">
              <label class="form-label small fw-bold">เลือกองค์กรลูกค้า *</label>
              <select class="form-select" name="customer_id" required>
                <option value="">-- เลือกบริษัทลูกค้า --</option>
                <?php foreach ($formCustomers as $c): ?>
                  <option value="<?php echo $c['id']; ?>"><?php echo htmlspecialchars($c['customer_name']); ?></option>
                <?php endforeach; ?>
              </select>
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label small fw-bold">เชื่อมโยงโครงการดีลขาย</label>
              <select class="form-select" name="opportunity_id">
                <option value="">-- ไม่เชื่อมโยง (ใบเสนอราคาทั่วไป) --</option>
                <?php foreach ($formOpps as $o): ?>
                  <option value="<?php echo $o['id']; ?>"><?php echo htmlspecialchars($o['project_name']); ?></option>
                <?php endforeach; ?>
              </select>
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label small fw-bold">วันที่ออกใบเสนอราคา *</label>
              <input type="date" class="form-control" name="quotation_date" required value="<?php echo date('Y-m-d'); ?>">
            </div>
            <div class="col-12 col-md-8">
              <label class="form-label small fw-bold">หัวข้อเสนอราคา / ชื่อเรื่องโครงการ *</label>
              <input type="text" class="form-control" name="title" required placeholder="เช่น ใบเสนอราคางานซ่อมบำรุงปั๊มไฮโดรเทส ประจำปี 2026">
            </div>
            <div class="col-12 col-md-2">
              <label class="form-label small fw-bold">ยืนราคา (วัน)</label>
              <input type="number" class="form-control" name="validity_days" required value="30">
            </div>
            <div class="col-12 col-md-2">
              <label class="form-label small fw-bold">เงื่อนไขการรับเงิน</label>
              <input type="text" class="form-control" name="payment_term" value="เครดิต 30 วัน" placeholder="เช่น เครดิต 30 วัน">
            </div>

            <!-- Dynamic Line Items Section -->
            <div class="col-12 mt-4">
              <div class="border-bottom pb-2 d-flex justify-content-between align-items-center">
                <h6 class="fw-bold text-success m-0"><i class="fa fa-list-ol"></i> รายการสินค้าและบริการ (Quotation Items)</h6>
                <button type="button" class="btn btn-outline-success btn-xs" onclick="addQuotationRow()"><i class="fa fa-plus-circle"></i> เพิ่มแถว</button>
              </div>
              
              <table class="table table-bordered table-sm mt-2.5" id="items-table">
                <thead class="bg-light small">
                  <tr>
                    <th>รายละเอียดชื่อสินค้า / รายการวิศวกรรมบริการ *</th>
                    <th style="width: 100px;">จำนวน</th>
                    <th style="width: 100px;">หน่วย</th>
                    <th style="width: 150px;">ราคาต่อหน่วย (฿)</th>
                    <th style="width: 150px;">ราคารวม (฿)</th>
                    <th style="width: 60px;" class="text-center">ลบ</th>
                  </tr>
                </thead>
                <tbody id="items-tbody">
                  <!-- First Row initialized -->
                  <tr>
                    <td><input type="text" class="form-control form-control-sm" name="item_name[]" required placeholder="เช่น บริการ Hydrotesting บริเวณข้อต่อท่อหลัก"></td>
                    <td><input type="number" class="form-control form-control-sm" name="item_qty[]" step="0.01" required value="1" oninput="calculateRowTotal(this)"></td>
                    <td><input type="text" class="form-control form-control-sm" name="item_unit[]" value="Job" placeholder="เช่น Job, Day"></td>
                    <td><input type="number" class="form-control form-control-sm" name="item_price[]" step="0.01" required value="0" oninput="calculateRowTotal(this)"></td>
                    <td><input type="text" class="form-control form-control-sm bg-light font-monospace text-end line-total-display" readonly value="0.00"></td>
                    <td class="text-center"><button type="button" class="btn btn-link text-danger p-0" onclick="removeQuotationRow(this)"><i class="fa fa-trash"></i></button></td>
                  </tr>
                </tbody>
              </table>

              <!-- Total values display box -->
              <div class="row justify-content-end text-dark">
                <div class="col-12 col-md-5">
                  <div class="card p-3 bg-light border-0">
                    <div class="d-flex justify-content-between mb-1.5">
                      <span class="small text-muted">มูลค่ารวมก่อนภาษี (Subtotal):</span>
                      <span class="fw-bold font-monospace text-slate-800">฿<span id="subtotal-display">0.00</span></span>
                    </div>
                    <div class="d-flex justify-content-between mb-1.5">
                      <span class="small text-muted">ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                      <span class="fw-bold font-monospace text-slate-800">฿<span id="vat-display">0.00</span></span>
                    </div>
                    <div class="d-flex justify-content-between border-top pt-2 mt-1.5">
                      <span class="small fw-bold text-dark">มูลค่ารวมสุทธิ (Grand Total):</span>
                      <span class="fs-5 fw-extrabold font-monospace text-success">฿<span id="grandtotal-display">0.00</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-12">
              <label class="form-label small fw-bold">ข้อกำหนดและเงื่อนไขสัญญา (Terms & Conditions)</label>
              <textarea class="form-control" name="terms_conditions" rows="2">1. ยืนราคากำหนด 30 วันหลังจากออกเอกสาร
2. ส่งมอบงานภายใน 15 วันหลังจากได้รับใบสั่งซื้อ (Purchase Order) เพื่อจัดเตรียมวิศวกรและอุปกรณ์แรงดันสูง</textarea>
            </div>
            <div class="col-12">
              <label class="form-label small fw-bold">บันทึกเพิ่มเติม</label>
              <textarea class="form-control" name="remarks" rows="1"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer bg-light">
          <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">ยกเลิก</button>
          <button type="submit" class="btn btn-success btn-sm"><i class="fa fa-save me-1"></i>บันทึกและสร้างเอกสาร</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Dynamic Quotation Javascript Logic -->
<script>
  function addQuotationRow() {
    const tbody = document.getElementById('items-tbody');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" class="form-control form-control-sm" name="item_name[]" required placeholder="ระบุรายการสินค้า / บริการ"></td>
      <td><input type="number" class="form-control form-control-sm" name="item_qty[]" step="0.01" required value="1" oninput="calculateRowTotal(this)"></td>
      <td><input type="text" class="form-control form-control-sm" name="item_unit[]" value="Job" placeholder="เช่น Job, Day"></td>
      <td><input type="number" class="form-control form-control-sm" name="item_price[]" step="0.01" required value="0" oninput="calculateRowTotal(this)"></td>
      <td><input type="text" class="form-control form-control-sm bg-light font-monospace text-end line-total-display" readonly value="0.00"></td>
      <td class="text-center"><button type="button" class="btn btn-link text-danger p-0" onclick="removeQuotationRow(this)"><i class="fa fa-trash"></i></button></td>
    `;
    tbody.appendChild(tr);
  }

  function removeQuotationRow(button) {
    const row = button.closest('tr');
    const tbody = document.getElementById('items-tbody');
    if (tbody.rows.length > 1) {
      row.remove();
      updateGrandTotals();
    } else {
      Swal.fire('แจ้งเตือน', 'ใบเสนอราคาต้องมีรายการสินค้าอย่างน้อย 1 แถว!', 'warning');
    }
  }

  function calculateRowTotal(input) {
    const row = input.closest('tr');
    const qty = parseFloat(row.querySelector('input[name="item_qty[]"]').value) || 0;
    const price = parseFloat(row.querySelector('input[name="item_price[]"]').value) || 0;
    const total = qty * price;
    
    row.querySelector('.line-total-display').value = total.toFixed(2);
    updateGrandTotals();
  }

  function updateGrandTotals() {
    let subtotal = 0;
    const lineTotals = document.querySelectorAll('.line-total-display');
    lineTotals.forEach(display => {
      subtotal += parseFloat(display.value) || 0;
    });

    const vat = subtotal * 0.07;
    const grand = subtotal + vat;

    document.getElementById('subtotal-display').innerText = subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('vat-display').innerText = vat.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('grandtotal-display').innerText = grand.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
