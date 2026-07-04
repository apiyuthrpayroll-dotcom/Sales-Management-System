<?php
/**
 * Sales Master CRM - Customer Database Page
 * Technology Stack: PHP 7+ / MySQL / DataTables / SweetAlert2 / Bootstrap 5
 */
require_once __DIR__ . '/header.php';
require_once __DIR__ . '/sidebar.php';

$success_msg = '';
$error_msg = '';

// Handle customer creation (POST submission)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_type']) && $_POST['action_type'] === 'create_customer') {
    $cust_name = trim($_POST['customer_name']);
    $industry = trim($_POST['industry_type']);
    $tax_id = trim($_POST['tax_id']);
    $address = trim($_POST['address']);
    $phone = trim($_POST['phone']);
    $email = trim($_POST['email']);
    $payment_term = intval($_POST['payment_term']);

    if (!empty($cust_name)) {
        try {
            $pdo->beginTransaction();

            // Generate customer code (e.g. CUS-XXXXXX)
            $countStmt = $pdo->query("SELECT COUNT(*) as count FROM customers");
            $nextNum = $countStmt->fetch()['count'] + 1;
            $cust_code = 'CUS-' . str_pad($nextNum, 6, '0', STR_PAD_LEFT);

            // Insert customer record
            $stmt = $pdo->prepare("
                INSERT INTO customers (customer_code, customer_name, tax_id, industry_type, address, phone, email, payment_term, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')
            ");
            $stmt->execute([$cust_code, $cust_name, $tax_id, $industry, $address, $phone, $email, $payment_term]);
            $new_customer_id = $pdo->lastInsertId();

            // Insert primary contact if specified
            $contact_name = trim($_POST['contact_name']);
            if (!empty($contact_name)) {
                $contact_position = trim($_POST['contact_position']);
                $contact_phone = trim($_POST['contact_phone']);
                $contact_email = trim($_POST['contact_email']);

                $contactStmt = $pdo->prepare("
                    INSERT INTO customer_contacts (customer_id, contact_name, position, phone, email)
                    VALUES (?, ?, ?, ?, ?)
                ");
                $contactStmt->execute([$new_customer_id, $contact_name, $contact_position, $contact_phone, $contact_email]);
            }

            // Log action to audit trail
            $logStmt = $pdo->prepare("INSERT INTO audit_logs (user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)");
            $logStmt->execute([
                $userId, 
                'สร้างข้อมูลลูกค้าใหม่ (PHP Create Customer)', 
                'customer', 
                $new_customer_id, 
                "เพิ่มลูกค้าองค์กร \"{$cust_name}\" ตลาดอุตสาหกรรม: {$industry} พร้อมระเบียบผู้ติดต่อหลัก"
            ]);

            $pdo->commit();
            $success_msg = "ลงทะเบียนลูกค้าองค์กร \"{$cust_name}\" สำเร็จเรียบร้อยแล้ว!";
        } catch (PDOException $e) {
            $pdo->rollBack();
            $error_msg = "เกิดข้อผิดพลาดในการบันทึกข้อมูล: " . $e->getMessage();
        }
    } else {
        $error_msg = "กรุณากรอกชื่อลูกค้าองค์กร!";
    }
}

// Fetch all customers & contacts
try {
    $stmt = $pdo->query("
        SELECT c.*, 
               (SELECT COUNT(*) FROM customer_contacts cc WHERE cc.customer_id = c.id) as contact_count,
               (SELECT GROUP_CONCAT(CONCAT(cc.contact_name, ' (', COALESCE(cc.position, '-'), ')') SEPARATOR ', ') FROM customer_contacts cc WHERE cc.customer_id = c.id) as contacts_list
        FROM customers c 
        ORDER BY c.customer_code DESC
    ");
    $customers = $stmt->fetchAll();
} catch (PDOException $e) {
    echo "<div class='alert alert-danger m-3'>ดึงข้อมูลลูกค้าล้มเหลว: " . $e->getMessage() . "</div>";
    $customers = [];
}
?>

<!-- Main Content Stage Area -->
<main class="app-main p-3">
  <!-- Content Header -->
  <div class="container-fluid mb-3 pt-2">
    <div class="row align-items-center">
      <div class="col-sm-6">
        <h1 class="m-0 fw-bold tracking-tight text-dark fs-2 text-uppercase">
          <i class="fas fa-building text-primary me-2"></i>จัดการทะเบียนลูกค้า (Customer Master)
        </h1>
        <p class="text-muted small m-0">บันทึกฐานข้อมูลองค์กรลูกค้าภายนอก ประวัติผู้ติดต่อหลัก วงเงินเครดิต และที่ตั้งในระบบ</p>
      </div>
      <div class="col-sm-6 text-sm-end mt-2 mt-sm-0">
        <div class="btn-group shadow-sm">
          <button class="btn btn-outline-secondary btn-sm" onclick="exportTableToExcel('customer-table', 'Customer_Database_Report')">
            <i class="fa fa-file-excel text-success me-1"></i>ส่งออก Excel
          </button>
          <button class="btn btn-outline-secondary btn-sm" onclick="exportTableToPDF('customer-table', 'Customer Database Report')">
            <i class="fa fa-file-pdf text-danger me-1"></i>ส่งออก PDF
          </button>
          <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#addCustomerModal">
            <i class="fa fa-plus-circle me-1"></i>ลงทะเบียนลูกค้าใหม่
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="container-fluid">
    <!-- DataTable -->
    <div class="card-admin card-primary shadow-sm">
      <div class="card-admin-header bg-white border-bottom py-3">
        <h5 class="card-admin-title m-0 fw-bold text-slate-800">
          <i class="fas fa-table text-primary me-1"></i> แฟ้มข้อมูลลูกค้าภาคธุรกิจอุตสาหกรรม (MySQL Data)
        </h5>
      </div>
      <div class="card-admin-body p-3">
        <div class="table-responsive">
          <table class="table table-bordered table-striped table-hover mb-0 bg-white datatable-init" id="customer-table" style="font-size: 0.85rem;">
            <thead class="text-uppercase small fw-bold text-dark" style="background-color: #f8fafc;">
              <tr>
                <th style="width: 120px;">รหัสลูกค้า</th>
                <th>ชื่อลูกค้าองค์กร (Corporation Company)</th>
                <th>ประเภทธุรกิจ</th>
                <th>ช่องทางการติดต่อ</th>
                <th>ผู้ติดต่อประสานงานหลัก (Contacts)</th>
                <th style="width: 100px;">สถานะจัดซื้อ</th>
                <th class="text-center" style="width: 100px;">ควบคุม</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($customers as $cust): ?>
                <tr>
                  <td class="font-monospace fw-bold text-primary"><?php echo htmlspecialchars($cust['customer_code']); ?></td>
                  <td>
                    <div class="fw-bold text-dark"><?php echo htmlspecialchars($cust['customer_name']); ?></div>
                    <div class="text-xs text-muted" style="font-size: 11px;"><i class="fa fa-map-marker-alt me-1"></i> <?php echo htmlspecialchars($cust['address'] ?: '-'); ?></div>
                  </td>
                  <td>
                    <span class="badge bg-secondary bg-opacity-10 text-secondary p-1.5 rounded" style="font-size: 11px;"><?php echo htmlspecialchars($cust['industry_type'] ?: 'Other'); ?></span>
                  </td>
                  <td>
                    <div class="small"><i class="fa fa-phone text-muted me-1"></i> <?php echo htmlspecialchars($cust['phone'] ?: '-'); ?></div>
                    <div class="small text-muted"><i class="fa fa-envelope text-muted me-1"></i> <?php echo htmlspecialchars($cust['email'] ?: '-'); ?></div>
                  </td>
                  <td>
                    <?php if (!empty($cust['contacts_list'])): ?>
                      <div class="small text-slate-700"><i class="fa fa-user-circle text-indigo me-1"></i> <?php echo htmlspecialchars($cust['contacts_list']); ?></div>
                    <?php else: ?>
                      <span class="text-muted small">ไม่มีผู้ติดต่อหลัก</span>
                    <?php endif; ?>
                  </td>
                  <td>
                    <span class="badge <?php echo $cust['status'] === 'Active' ? 'bg-success' : 'bg-danger'; ?> p-1.5 rounded">
                      <?php echo htmlspecialchars($cust['status']); ?>
                    </span>
                  </td>
                  <td class="text-center">
                    <button class="btn btn-outline-primary btn-xs px-2" onclick="Swal.fire('รายละเอียด', '<?php echo htmlspecialchars($cust['customer_name']); ?>\nภาษี: <?php echo htmlspecialchars($cust['tax_id'] ?: '-'); ?>\nการชำระเงิน: <?php echo htmlspecialchars($cust['payment_term']); ?> วัน', 'info')">
                      <i class="fa fa-eye"></i> ดู
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

<!-- Add Customer Bootstrap Modal -->
<div class="modal fade" id="addCustomerModal" tabindex="-1" aria-labelledby="addCustomerModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <form method="POST" action="">
        <input type="hidden" name="action_type" value="create_customer">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title fw-bold" id="addCustomerModalLabel"><i class="fa fa-plus-circle me-1.5"></i>Register New Corporate Customer Account</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-shadow="none" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body p-4 text-dark">
          <div class="row g-3">
            <!-- Company Info Section -->
            <div class="col-12 border-bottom pb-2 mb-1">
              <h6 class="fw-bold text-primary mb-0"><i class="fa fa-building me-1"></i> Corporate Details</h6>
            </div>
            <div class="col-12 col-md-8">
              <label class="form-label small fw-bold">Company / Corporate Name *</label>
              <input type="text" class="form-control" name="customer_name" required placeholder="e.g., PTT Public Company Limited">
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label small fw-bold">Tax Identification Number (Tax ID)</label>
              <input type="text" class="form-control" name="tax_id" placeholder="13-digit identification number">
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label small fw-bold">Business Industry Segment</label>
              <select class="form-select" name="industry_type">
                <option value="Oil & Gas">Oil & Gas</option>
                <option value="Petrochemical">Petrochemical</option>
                <option value="Refinery & Chemical">Refinery & Chemical</option>
                <option value="Power Generation">Power Generation</option>
                <option value="Renewable Energy">Renewable Energy</option>
                <option value="Offshore & Marine">Offshore & Marine</option>
                <option value="EPC Contractor">EPC Contractor</option>
                <option value="Fabrication Yard">Fabrication Yard</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Mining, Cement & Utilities">Mining, Cement & Utilities</option>
                <option value="Government / State Enterprise">Government / State Enterprise</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label small fw-bold">Credit Payment Terms</label>
              <select class="form-select" name="payment_term">
                <option value="30">30 Days (Net 30)</option>
                <option value="45">45 Days (Net 45)</option>
                <option value="60">60 Days (Net 60)</option>
                <option value="15">15 Days (Net 15)</option>
                <option value="0">Cash on Delivery</option>
              </select>
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label small fw-bold">Office Phone Number</label>
              <input type="text" class="form-control" name="phone" placeholder="e.g., +66 2 537 XXXX">
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label small fw-bold">Corporate Email</label>
              <input type="email" class="form-control" name="email" placeholder="e.g., procurement@company.com">
            </div>
            <div class="col-12">
              <label class="form-label small fw-bold">Office Address & Billing Location</label>
              <textarea class="form-control" name="address" rows="2" placeholder="Building, Street, District, Province..."></textarea>
            </div>

            <!-- Primary Contact Section -->
            <div class="col-12 border-bottom pb-2 mt-4 mb-1">
              <h6 class="fw-bold text-indigo mb-0"><i class="fa fa-user-circle me-1"></i> Primary Contact Person Details</h6>
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label small fw-bold">Contact Person Full Name</label>
              <input type="text" class="form-control" name="contact_name" placeholder="e.g., Somsak Mankong">
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label small fw-bold">Job Title / Position</label>
              <input type="text" class="form-control" name="contact_position" placeholder="Procurement Specialist">
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label small fw-bold">Mobile Phone Number</label>
              <input type="text" class="form-control" name="contact_phone" placeholder="e.g., 08X-XXX-XXXX">
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label small fw-bold">Direct Email Address</label>
              <input type="email" class="form-control" name="contact_email" placeholder="e.g., somsak@company.com">
            </div>
          </div>
        </div>
        <div class="modal-footer bg-light">
          <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm"><i class="fa fa-save me-1"></i>Save Customer Account</button>
        </div>
      </form>
    </div>
  </div>
</div>

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
