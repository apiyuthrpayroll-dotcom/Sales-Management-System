<?php
/**
 * Sales Master CRM - Opportunities Listing & Kanban Board
 * Technology Stack: PHP 7+ / MySQL / AJAX Fetch API / SweetAlert2 / Bootstrap 5
 */
require_once __DIR__ . '/header.php';
require_once __DIR__ . '/sidebar.php';

$success_msg = '';
$error_msg = '';

// Handle creating a new opportunity
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action_type']) && $_POST['action_type'] === 'create_opportunity') {
    $cust_id = intval($_POST['customer_id']);
    $proj_name = trim($_POST['project_name']);
    $service_type = trim($_POST['service_type']);
    $lead_source = trim($_POST['lead_source']);
    $est_value = floatval($_POST['estimated_value']);
    $success_prob = intval($_POST['success_probability']);
    $close_date = trim($_POST['expected_close_date']);
    $sales_rep = intval($_POST['sales_person_id']);
    $remarks = trim($_POST['remarks']);

    if (!empty($proj_name) && $cust_id > 0) {
        try {
            // Generate Opportunity Number
            $countStmt = $pdo->query("SELECT COUNT(*) as count FROM opportunities");
            $nextNum = $countStmt->fetch()['count'] + 1;
            $opp_no = 'OPP-' . str_pad($nextNum, 6, '0', STR_PAD_LEFT);

            $stmt = $pdo->prepare("
                INSERT INTO opportunities (opportunity_no, customer_id, project_name, service_type, lead_source, estimated_value, success_probability, expected_close_date, sales_person_id, status, remarks, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Lead', ?, ?)
            ");
            $stmt->execute([$opp_no, $cust_id, $proj_name, $service_type, $lead_source, $est_value, $success_prob, $close_date, $sales_rep, $remarks, $userId]);
            $new_opp_id = $pdo->lastInsertId();

            // Log action to audit trail
            $logStmt = $pdo->prepare("INSERT INTO audit_logs (user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)");
            $logStmt->execute([
                $userId, 
                'สร้างโอกาสขายใหม่ (PHP Create Opportunity)', 
                'opportunity', 
                $new_opp_id, 
                "เพิ่มดีล \"{$proj_name}\" มูลค่าคาดการณ์ ฿" . number_format($est_value, 2) . " โดยใช้สิทธิ์ในเซสชัน"
            ]);

            $success_msg = "ลงทะเบียนโอกาสทางการขายโครงการ \"{$proj_name}\" สำเร็จเรียบร้อย!";
        } catch (PDOException $e) {
            $error_msg = "เกิดข้อผิดพลาดในการบันทึกโอกาสการขาย: " . $e->getMessage();
        }
    } else {
        $error_msg = "กรุณากรอกข้อมูลสำคัญให้ครบถ้วน!";
    }
}

// Fetch all opportunities joined with customers & users
try {
    $oppsStmt = $pdo->query("
        SELECT o.*, c.customer_name, u.fullname as salesperson_name 
        FROM opportunities o 
        JOIN customers c ON o.customer_id = c.id 
        JOIN users u ON o.sales_person_id = u.id 
        ORDER BY o.opportunity_no DESC
    ");
    $opportunities = $oppsStmt->fetchAll();

    // Fetch active customers for form select
    $custSelectStmt = $pdo->query("SELECT id, customer_name FROM customers WHERE status = 'Active' ORDER BY customer_name ASC");
    $formCustomers = $custSelectStmt->fetchAll();

    // Fetch salespeople for form select
    $userSelectStmt = $pdo->query("SELECT id, fullname FROM users WHERE status = 'Active' ORDER BY fullname ASC");
    $formUsers = $userSelectStmt->fetchAll();
} catch (PDOException $e) {
    echo "<div class='alert alert-danger m-3'>ดึงข้อมูลการประมูลล้มเหลว: " . $e->getMessage() . "</div>";
    $opportunities = $formCustomers = $formUsers = [];
}

// Group opportunities by status for Kanban Board
$kanbanStages = [
    'Lead' => [],
    'Qualified' => [],
    'Proposal' => [],
    'Negotiation' => [],
    'Won' => [],
    'Lost' => []
];
foreach ($opportunities as $opp) {
    if (array_key_exists($opp['status'], $kanbanStages)) {
        $kanbanStages[$opp['status']][] = $opp;
    }
}
?>

<!-- Main Content Stage Area -->
<main class="app-main p-3">
  <!-- Content Header -->
  <div class="container-fluid mb-3 pt-2">
    <div class="row align-items-center">
      <div class="col-sm-6">
        <h1 class="m-0 fw-bold tracking-tight text-dark fs-2 text-uppercase">
          <i class="fas fa-bullseye text-warning me-2"></i>โอกาสและดีลทางการขาย (Sales Opportunities)
        </h1>
        <p class="text-muted small m-0">บริหารจัดการข้อมูลการยื่นเสนอราคางานประมูล คาดการณ์ความเป็นไปได้ และจัดทำยอดพอร์ตรวม</p>
      </div>
      <div class="col-sm-6 text-sm-end mt-2 mt-sm-0">
        <!-- Tab Toggle buttons -->
        <div class="btn-group shadow-sm me-2">
          <button class="btn btn-outline-secondary btn-sm active" id="btn-list-view" onclick="switchView('list')">
            <i class="fa fa-list me-1"></i>ดูแบบตาราง
          </button>
          <button class="btn btn-outline-secondary btn-sm" id="btn-kanban-view" onclick="switchView('kanban')">
            <i class="fa fa-columns me-1"></i>ดูแบบไปป์ไลน์ (Kanban)
          </button>
        </div>
        <button class="btn btn-primary btn-sm shadow-sm" data-bs-toggle="modal" data-bs-target="#addOpportunityModal">
          <i class="fa fa-plus-circle me-1"></i>บันทึกโอกาสขายใหม่
        </button>
      </div>
    </div>
  </div>

  <div class="container-fluid">
    <!-- 1. LIST VIEW CONTAINER -->
    <div id="opp-list-view" class="card-admin shadow-sm border">
      <div class="card-admin-header bg-white border-bottom py-3">
        <h5 class="card-admin-title m-0 fw-bold text-slate-800">
          <i class="fas fa-table text-primary me-1"></i> ทะเบียนรายการประมูลและขยายยอดสะสม (MySQL Source)
        </h5>
      </div>
      <div class="card-admin-body p-3">
        <div class="table-responsive">
          <table class="table table-bordered table-striped table-hover mb-0 bg-white datatable-init" id="opportunity-table" style="font-size: 0.85rem;">
            <thead class="text-uppercase small fw-bold text-dark" style="background-color: #f8fafc;">
              <tr>
                <th style="width: 120px;">รหัสโครงการ</th>
                <th>ข้อมูลลูกค้า & โครงการ</th>
                <th>ประเภทบริการ</th>
                <th>มูลค่าประเมิน</th>
                <th>โอกาสความสำเร็จ</th>
                <th>กำหนดปิดดีล</th>
                <th style="width: 130px;">สถานะดีล</th>
                <th class="text-center" style="width: 140px;">ปรับสถานะ</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($opportunities as $opp): ?>
                <tr id="opp-row-<?php echo $opp['id']; ?>">
                  <td class="font-monospace fw-bold text-primary"><?php echo htmlspecialchars($opp['opportunity_no']); ?></td>
                  <td>
                    <div class="fw-bold text-dark"><?php echo htmlspecialchars($opp['project_name']); ?></div>
                    <div class="text-xs text-muted" style="font-size: 11px;"><i class="fa fa-building me-1"></i> <?php echo htmlspecialchars($opp['customer_name']); ?></div>
                  </td>
                  <td>
                    <span class="badge bg-secondary bg-opacity-10 text-secondary p-1.5 rounded" style="font-size: 11px;"><?php echo htmlspecialchars($opp['service_type']); ?></span>
                  </td>
                  <td class="fw-bold font-monospace text-dark">฿<?php echo number_format($opp['estimated_value'], 2); ?></td>
                  <td>
                    <div class="d-flex align-items-center gap-1.5">
                      <div class="progress rounded-pill w-100 bg-light" style="height: 6px;">
                        <div class="progress-bar bg-info" role="progressbar" style="width: <?php echo $opp['success_probability']; ?>%"></div>
                      </div>
                      <span class="small font-monospace fw-bold text-dark"><?php echo $opp['success_probability']; ?>%</span>
                    </div>
                  </td>
                  <td class="small"><?php echo htmlspecialchars($opp['expected_close_date'] ?: '-'); ?></td>
                  <td>
                    <span class="badge p-1.5 rounded text-white <?php 
                      echo $opp['status'] === 'Won' ? 'bg-success' : 
                          ($opp['status'] === 'Lost' ? 'bg-danger' : 
                          ($opp['status'] === 'Negotiation' ? 'bg-warning text-dark' : 
                          ($opp['status'] === 'Proposal' ? 'bg-info text-dark' : 'bg-primary'))); 
                    ?>">
                      <?php echo htmlspecialchars($opp['status']); ?>
                    </span>
                  </td>
                  <td class="text-center">
                    <!-- Quick Transition Dropdown -->
                    <select class="form-select form-select-xs d-inline-block w-auto" style="font-size: 11px; padding: 0.15rem 0.5rem;" onchange="updateOpportunityStatus(<?php echo $opp['id']; ?>, this.value)">
                      <option value="">-- เปลี่ยน --</option>
                      <option value="Lead" <?php echo $opp['status'] === 'Lead' ? 'disabled' : ''; ?>>Lead</option>
                      <option value="Qualified" <?php echo $opp['status'] === 'Qualified' ? 'disabled' : ''; ?>>Qualified</option>
                      <option value="Proposal" <?php echo $opp['status'] === 'Proposal' ? 'disabled' : ''; ?>>Proposal</option>
                      <option value="Negotiation" <?php echo $opp['status'] === 'Negotiation' ? 'disabled' : ''; ?>>Negotiation</option>
                      <option value="Won" <?php echo $opp['status'] === 'Won' ? 'disabled' : ''; ?>>Won</option>
                      <option value="Lost" <?php echo $opp['status'] === 'Lost' ? 'disabled' : ''; ?>>Lost</option>
                    </select>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 2. KANBAN PIPELINE VIEW (Hidden by default) -->
    <div id="opp-kanban-view" class="d-none">
      <div class="row g-2.5 flex-nowrap overflow-x-auto pb-4" style="min-height: 500px;">
        <?php foreach ($kanbanStages as $stageName => $stageOpps): ?>
          <div class="col-12 col-sm-6 col-md-4 col-xl" style="min-width: 250px;">
            <div class="card-admin bg-light border-0 shadow-sm rounded-3 p-2.5 h-100">
              <!-- Stage Header -->
              <div class="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
                <span class="fw-bold text-dark text-uppercase small d-flex align-items-center gap-1.5">
                  <span class="rounded-circle d-inline-block" style="width: 10px; height: 10px; background-color: <?php 
                    echo $stageName === 'Won' ? '#10b981' : 
                        ($stageName === 'Lost' ? '#ef4444' : 
                        ($stageName === 'Negotiation' ? '#f59e0b' : 
                        ($stageName === 'Proposal' ? '#3b82f6' : '#6b7280'))); 
                  ?>;"></span>
                  <?php echo $stageName; ?>
                </span>
                <span class="badge bg-secondary rounded-pill text-white small"><?php echo count($stageOpps); ?></span>
              </div>
              
              <!-- Cards Container -->
              <div class="d-flex flex-column gap-2.5 overflow-y-auto" style="max-height: 600px;">
                <?php if (empty($stageOpps)): ?>
                  <div class="text-center p-4 border border-dashed rounded text-muted small" style="border-style: dashed !important;">ไม่มีข้อมูลดีล</div>
                <?php else: ?>
                  <?php foreach ($stageOpps as $opp): ?>
                    <div class="card border border-light-subtle rounded-3 shadow-sm bg-white p-2.5 hover-shadow-md position-relative cursor-pointer" onclick="Swal.fire('โครงการ: <?php echo htmlspecialchars($opp['project_name']); ?>', 'ลูกค้า: <?php echo htmlspecialchars($opp['customer_name']); ?>\nมูลค่า: ฿<?php echo number_format($opp['estimated_value'], 2); ?>\nความน่าจะเป็น: <?php echo $opp['success_probability']; ?>%\nผู้ประสานงาน: <?php echo htmlspecialchars($opp['salesperson_name']); ?>\nบันทึก: <?php echo htmlspecialchars($opp['remarks'] ?: '-'); ?>', 'info')">
                      <div class="text-xs font-monospace fw-bold text-primary mb-1"><?php echo htmlspecialchars($opp['opportunity_no']); ?></div>
                      <div class="fw-bold text-dark small text-truncate mb-1" style="font-size: 0.825rem;"><?php echo htmlspecialchars($opp['project_name']); ?></div>
                      <div class="text-xs text-muted text-truncate mb-2" style="font-size: 0.75rem;"><i class="fa fa-building me-1"></i> <?php echo htmlspecialchars($opp['customer_name']); ?></div>
                      
                      <div class="d-flex align-items-center justify-content-between border-top pt-2 mt-2">
                        <span class="fw-bold font-monospace text-success small" style="font-size: 0.8rem;">฿<?php echo number_format($opp['estimated_value'] / 1000, 1); ?>K</span>
                        <span class="badge bg-indigo-subtle text-indigo p-1" style="font-size: 10px; background-color: rgba(102, 16, 242, 0.1); color: #6610f2;"><?php echo $opp['success_probability']; ?>%</span>
                      </div>
                    </div>
                  <?php endforeach; ?>
                <?php endif; ?>
              </div>
            </div>
          </div>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
</main>

<!-- Add Opportunity Bootstrap Modal -->
<div class="modal fade" id="addOpportunityModal" tabindex="-1" aria-labelledby="addOpportunityModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content text-dark">
      <form method="POST" action="">
        <input type="hidden" name="action_type" value="create_opportunity">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title fw-bold" id="addOpportunityModalLabel"><i class="fa fa-plus-circle me-1.5"></i>บันทึกดีลโครงการ / งานประมูลใหม่</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body p-4">
          <div class="row g-3">
            <div class="col-12 col-md-6">
              <label class="form-label small fw-bold">เลือกบริษัทลูกค้าผู้สั่งซื้อ *</label>
              <select class="form-select" name="customer_id" required>
                <option value="">-- เลือกองค์กรผู้ติดต่อ --</option>
                <?php foreach ($formCustomers as $c): ?>
                  <option value="<?php echo $c['id']; ?>"><?php echo htmlspecialchars($c['customer_name']); ?></option>
                <?php endforeach; ?>
              </select>
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label small fw-bold">ชื่อโครงการ / ดีลประมูลงานขาย *</label>
              <input type="text" class="form-control" name="project_name" required placeholder="เช่น โครงการ Hydrotest ปั๊มระยอง">
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label small fw-bold">ประเภทบริการ (Service Segment)</label>
              <select class="form-select" name="service_type">
                <option value="Testing Service">Testing Service (งานบริการทดสอบ)</option>
                <option value="Equipment Rental">Equipment Rental (งานเช่าอุปกรณ์)</option>
                <option value="Manpower Supply">Manpower Supply (กำลังพลสนับสนุน)</option>
                <option value="Engineering Service">Engineering Service (บริการงานวิศวกรรม)</option>
                <option value="Other">Other (งานจัดซื้อจัดจ้างทั่วไป)</option>
              </select>
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label small fw-bold">ที่มาของดีล (Lead Source)</label>
              <select class="form-select" name="lead_source">
                <option value="Existing Customer">Existing Customer (ลูกค้าเก่ากัลยาณมิตร)</option>
                <option value="Tender">Tender (ยื่นประกวดราคาบอร์ดรัฐ/เอกชน)</option>
                <option value="Referral">Referral (การแนะนำปากต่อปาก)</option>
                <option value="Website">Website / Digital Lead (เว็บไซต์ระบบ)</option>
                <option value="Connection">Connection (คอนเน็กชันส่วนตัว)</option>
              </select>
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label small fw-bold">มูลค่าประมาณการของดีล (Estimated Value)</label>
              <div class="input-group">
                <span class="input-group-text">฿</span>
                <input type="number" class="form-control" name="estimated_value" step="0.01" required value="0.00">
              </div>
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label small fw-bold">ความเป็นไปได้สำเร็จ (Probability)</label>
              <div class="input-group">
                <input type="number" class="form-control" name="success_probability" min="0" max="100" required value="20">
                <span class="input-group-text">%</span>
              </div>
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label small fw-bold">วันที่คาดหมายว่าจะปิดงาน</label>
              <input type="date" class="form-control" name="expected_close_date" required value="<?php echo date('Y-m-d', strtotime('+30 days')); ?>">
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label small fw-bold">เจ้าหน้าที่ขายผู้ดูแลหลัก (Sales Representative) *</label>
              <select class="form-select" name="sales_person_id" required>
                <?php foreach ($formUsers as $u): ?>
                  <option value="<?php echo $u['id']; ?>" <?php echo $u['id'] == $userId ? 'selected' : ''; ?>>
                    <?php echo htmlspecialchars($u['fullname']); ?>
                  </option>
                <?php endforeach; ?>
              </select>
            </div>
            <div class="col-12">
              <label class="form-label small fw-bold">หมายเหตุและรายละเอียดขอบเขตดีล</label>
              <textarea class="form-control" name="remarks" rows="3" placeholder="ระบุขอบเขตงาน รายละเอียดการต่อรองราคา ความคืบหน้าเบื้องต้น..."></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer bg-light">
          <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">ยกเลิก</button>
          <button type="submit" class="btn btn-primary btn-sm"><i class="fa fa-save me-1"></i>บันทึกดีล</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- AJAX Status Update scripts and View controls -->
<script>
  // Dynamic tab switcher between List and Kanban
  function switchView(viewName) {
    const listView = document.getElementById('opp-list-view');
    const kanbanView = document.getElementById('opp-kanban-view');
    const btnList = document.getElementById('btn-list-view');
    const btnKanban = document.getElementById('btn-kanban-view');

    if (viewName === 'kanban') {
      listView.classList.add('d-none');
      kanbanView.classList.remove('d-none');
      btnList.classList.remove('active');
      btnKanban.classList.add('active');
    } else {
      listView.classList.remove('d-none');
      kanbanView.classList.add('d-none');
      btnList.classList.add('active');
      btnKanban.classList.remove('active');
    }
  }

  // Real-time status update via AJAX Fetch API
  async function updateOpportunityStatus(oppId, newStatus) {
    if (!newStatus) return;

    Swal.fire({
      title: 'กำลังอัปเดตสถานะ...',
      text: 'กรุณารอสักครู่ ระบบกำลังสื่อสารกับ MySQL',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      const response = await fetch('/api/update-opportunity-status.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: oppId, status: newStatus })
      });
      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'อัปเดตสถานะดีลสำเร็จ!',
          text: 'สถานะของโอกาสทางการขายถูกเปลี่ยนเป็น ' + newStatus,
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#10b981'
        }).then(() => {
          window.location.reload();
        });
      } else {
        throw new Error(data.message || 'Error occurred');
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถเปลี่ยนสถานะดีลได้: ' + err.message,
        confirmButtonText: 'ปิด',
        confirmButtonColor: '#ef4444'
      });
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
