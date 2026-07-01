<?php
/**
 * Sales Master CRM - Enterprise Dashboard
 * Technology Stack: PHP 7+ / MySQL (PDO) / Bootstrap 5 / Chart.js
 */
require_once __DIR__ . '/header.php';
require_once __DIR__ . '/sidebar.php';

// Fetch KPI metrics dynamically from MySQL database
try {
    // 1. Total Pipeline
    $stmt = $pdo->query("SELECT COALESCE(SUM(estimated_value), 0) AS total FROM opportunities");
    $totalPipeline = $stmt->fetch()['total'];

    // 2. Weighted Pipeline
    $stmt = $pdo->query("SELECT COALESCE(SUM(estimated_value * success_probability / 100), 0) AS total_weighted FROM opportunities");
    $weightedPipeline = $stmt->fetch()['total_weighted'];

    // 3. Total Won Deals
    $stmt = $pdo->query("SELECT COALESCE(SUM(estimated_value), 0) AS total_won FROM opportunities WHERE status = 'Won'");
    $wonPipeline = $stmt->fetch()['total_won'];

    // 4. Active Customers Count
    $stmt = $pdo->query("SELECT COUNT(*) AS total_custs FROM customers WHERE status = 'Active'");
    $activeCustomersCount = $stmt->fetch()['total_custs'];

    // 5. Total Opportunities count for calculating average success rate
    $stmt = $pdo->query("SELECT COUNT(*) AS total_count FROM opportunities");
    $totalDealsCount = $stmt->fetch()['total_count'];
    $stmt = $pdo->query("SELECT COUNT(*) AS won_count FROM opportunities WHERE status = 'Won'");
    $wonDealsCount = $stmt->fetch()['won_count'];
    
    $winRatio = $totalDealsCount > 0 ? round(($wonDealsCount / $totalDealsCount) * 100, 1) : 0;

    // 6. Fetch Status Distribution for Bar Chart
    $statusStmt = $pdo->query("SELECT status, COUNT(*) as count, SUM(estimated_value) as val FROM opportunities GROUP BY status");
    $statusData = $statusStmt->fetchAll();
    
    // Status color mapping
    $statusLabels = [];
    $statusCounts = [];
    $statusValues = [];
    foreach ($statusData as $row) {
        $statusLabels[] = $row['status'];
        $statusCounts[] = (int)$row['count'];
        $statusValues[] = (float)$row['val'];
    }

    // 7. Fetch Pipeline Forecast (Line Chart dataset)
    $forecastStmt = $pdo->query("
        SELECT DATE_FORMAT(expected_close_date, '%b %Y') as month_label, SUM(estimated_value) as val 
        FROM opportunities 
        WHERE expected_close_date IS NOT NULL 
        GROUP BY DATE_FORMAT(expected_close_date, '%Y-%m'), DATE_FORMAT(expected_close_date, '%b %Y') 
        ORDER BY MIN(expected_close_date) ASC 
        LIMIT 6
    ");
    $forecastData = $forecastStmt->fetchAll();
    $forecastMonths = [];
    $forecastVals = [];
    foreach ($forecastData as $row) {
        $forecastMonths[] = $row['month_label'];
        $forecastVals[] = (float)$row['val'];
    }

    // 8. Fetch Recent Activities from audit_logs
    $logsStmt = $pdo->query("
        SELECT a.*, COALESCE(u.fullname, 'System') as fullname, COALESCE(u.role, 'User') as role 
        FROM audit_logs a 
        LEFT JOIN users u ON a.user_id = u.id 
        ORDER BY a.created_at DESC 
        LIMIT 6
    ");
    $recentLogs = $logsStmt->fetchAll();

} catch (PDOException $e) {
    echo "<div class='alert alert-danger m-3'>เกิดข้อผิดพลาดในการโหลดข้อมูล: " . $e->getMessage() . "</div>";
    $totalPipeline = $weightedPipeline = $wonPipeline = $activeCustomersCount = $winRatio = 0;
    $recentLogs = [];
    $statusLabels = $statusCounts = $forecastMonths = $forecastVals = [];
}
?>

<!-- Main Content Stage Area -->
<main class="app-main p-4">
  <!-- Modern Welcome Banner & Date Indicator -->
  <div class="container-fluid mb-4 pt-2">
    <div class="welcome-hero p-4 rounded-4 shadow-sm mb-4 position-relative overflow-hidden text-white" style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #4f46e5 100%);">
      <!-- Abstract light overlay -->
      <div class="position-absolute top-0 end-0 p-3 opacity-10">
        <i class="fas fa-chart-line" style="font-size: 180px;"></i>
      </div>
      <div class="row align-items-center position-relative" style="z-index: 1;">
        <div class="col-md-8">
          <span class="badge bg-white bg-opacity-20 text-white px-2 py-1.5 rounded-pill mb-2 text-uppercase tracking-wider small fw-bold">
            <i class="fa fa-sparkles text-warning me-1"></i> ENTERPRISE PHP & MYSQL SYSTEM
          </span>
          <h1 class="fw-extrabold tracking-tight ms-0 mb-1" style="font-size: 2rem; font-weight: 800;">
            <?php echo $t['welcome_hi']; ?> <?php echo htmlspecialchars($userFullname); ?> 👋
          </h1>
          <p class="mb-0 opacity-90 fs-6">
            ยินดีต้อนรับสู่ระบบงานฝ่ายขายและลูกค้าสัมพันธ์ ERP วันนี้มีโอกาสขยายยอดผ่านกลุ่มปั๊มไฮโดรเทสและอุปกรณ์เช่า
          </p>
          <div id="ai-insight-line" class="mt-2 text-warning d-flex align-items-center gap-1.5 small bg-black bg-opacity-25 py-1 px-2.5 rounded-pill d-inline-flex">
            <i class="fa fa-lightbulb text-warning"></i>
            <span class="fw-semibold">คำแนะนำกลยุทธ์วันนี้:</span> ติดตามดีลโครงการที่มีมูลค่าสูงในขั้นตอนการเจรจา (Negotiation) และอนุมัติใบเสนอราคาด่วนที่สุด
          </div>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0 d-flex flex-column align-items-md-end gap-1">
          <div class="text-white-50 small text-uppercase" style="font-size: 10px;"><?php echo $t['local_time']; ?></div>
          <div class="fs-4 fw-mono font-monospace text-warning flex align-items-center gap-1.5" id="realtime-clock">
            <i class="fa fa-clock"></i> <span id="clock-display">--:--:--</span>
          </div>
          <div id="realtime-date" class="small text-white opacity-75"><?php echo date('d M Y'); ?></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modern Analytics KPI Section -->
  <div class="container-fluid mb-4">
    <div class="row g-3">
      <!-- KPI 1 -->
      <div class="col-12 col-sm-6 col-md-3">
        <div class="card border-0 shadow-sm rounded-4 bg-white overflow-hidden p-3 position-relative kpi-hover-card" style="border-left: 4px solid #0d6efd !important;">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="small fw-bold text-muted uppercase tracking-wider" style="font-size: 11px;">Total Pipeline (พอร์ตรวม)</span>
            <span class="badge rounded bg-primary bg-opacity-10 text-primary small">Active Deals</span>
          </div>
          <div class="d-flex align-items-baseline gap-1.5 py-1">
            <span class="fs-4 fw-extrabold text-dark font-monospace" style="font-size: 1.45rem !important;">฿<?php echo number_format($totalPipeline, 2); ?></span>
          </div>
          <div class="mt-2.5">
            <div class="progress rounded-pill bg-light" style="height: 6px;">
              <div class="progress-bar bg-primary rounded-pill" role="progressbar" style="width: 100%"></div>
            </div>
            <div class="d-flex justify-content-between text-xs text-muted mt-1.5" style="font-size: 10px;">
              <span>ความปลอดภัยพอร์ตรวม</span>
              <span class="fw-semibold text-primary">100%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- KPI 2 -->
      <div class="col-12 col-sm-6 col-md-3">
        <div class="card border-0 shadow-sm rounded-4 bg-white overflow-hidden p-3 position-relative kpi-hover-card" style="border-left: 4px solid #ffc107 !important;">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="small fw-bold text-muted uppercase tracking-wider" style="font-size: 11px;">Weighted Pipeline (ถ่วงน้ำหนัก)</span>
            <span class="badge rounded bg-warning bg-opacity-10 text-warning-emphasis small">Prob-Adjusted</span>
          </div>
          <div class="d-flex align-items-baseline gap-1.5 py-1">
            <span class="fs-4 fw-extrabold text-dark font-monospace" style="font-size: 1.45rem !important;">฿<?php echo number_format($weightedPipeline, 2); ?></span>
          </div>
          <div class="mt-2.5">
            <div class="progress rounded-pill bg-light" style="height: 6px;">
              <div class="progress-bar bg-warning rounded-pill" role="progressbar" style="width: 75%"></div>
            </div>
            <div class="d-flex justify-content-between text-xs text-muted mt-1.5" style="font-size: 10px;">
              <span>อัตราความสำเร็จถ่วงน้ำหนัก</span>
              <span class="fw-semibold text-warning">75%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- KPI 3 -->
      <div class="col-12 col-sm-6 col-md-3">
        <div class="card border-0 shadow-sm rounded-4 bg-white overflow-hidden p-3 position-relative kpi-hover-card" style="border-left: 4px solid #198754 !important;">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="small fw-bold text-muted uppercase tracking-wider" style="font-size: 11px;">Total Won Deals (ยอดปิดแล้ว)</span>
            <span class="badge rounded bg-success bg-opacity-10 text-success small">Successful Sold</span>
          </div>
          <div class="d-flex align-items-baseline gap-1.5 py-1">
            <span class="fs-4 fw-extrabold text-success font-monospace" style="font-size: 1.45rem !important;">฿<?php echo number_format($wonPipeline, 2); ?></span>
          </div>
          <div class="mt-2.5">
            <div class="progress rounded-pill bg-light" style="height: 6px;">
              <div class="progress-bar bg-success rounded-pill" role="progressbar" style="width: <?php echo $winRatio; ?>%"></div>
            </div>
            <div class="d-flex justify-content-between text-xs text-muted mt-1.5" style="font-size: 10px;">
              <span>อัตราส่วนเป้ายอดปิดไตรมาส</span>
              <span class="fw-semibold text-success"><?php echo $winRatio; ?>%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- KPI 4 -->
      <div class="col-12 col-sm-6 col-md-3">
        <div class="card border-0 shadow-sm rounded-4 bg-white overflow-hidden p-3 position-relative kpi-hover-card" style="border-left: 4px solid #0dcaf0 !important;">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="small fw-bold text-muted uppercase tracking-wider" style="font-size: 11px;">Active Customers (ลูกค้าหลัก)</span>
            <span class="badge rounded bg-info bg-opacity-10 text-info small">Corporate Master</span>
          </div>
          <div class="d-flex align-items-baseline gap-1.5 py-1">
            <span class="fs-4 fw-extrabold text-dark font-monospace" style="font-size: 1.45rem !important;"><?php echo $activeCustomersCount; ?> ราย</span>
          </div>
          <div class="mt-2.5">
            <div class="progress rounded-pill bg-light" style="height: 6px;">
              <div class="progress-bar bg-info rounded-pill" role="progressbar" style="width: 100%"></div>
            </div>
            <div class="d-flex justify-content-between text-xs text-muted mt-1.5" style="font-size: 10px;">
              <span>นิติบุคคลที่กำลังรักษาสัญญา</span>
              <span class="fw-semibold text-info">Active Status</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Win Ratio and Quick Statistics Insight -->
  <div class="container-fluid mb-4">
    <div class="card border-0 shadow-sm rounded-3 bg-white p-3">
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-2">
          <div class="bg-indigo-subtle text-indigo p-2 rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; background-color: rgba(102, 16, 242, 0.1);">
            <i class="fa fa-compass fs-5 text-indigo" style="color: #6610f2;"></i>
          </div>
          <div>
            <h6 class="m-0 fw-bold text-slate-800">อัตรางานขายที่สำเร็จ: <?php echo $winRatio; ?>%</h6>
            <span class="text-xs text-muted" style="font-size: 11px;">คำนวณแบบเรียลไทม์จากตัวเลขความสำเร็จดีลชนะประมูล (Deals Won / Total Opportunities Ratio)</span>
          </div>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <a href="customers.php" class="btn btn-info btn-sm px-3 rounded-pill fw-bold text-white"><i class="fa fa-users me-1"></i> ลูกค้าองค์กร PHP</a>
          <a href="opportunities.php" class="btn btn-success btn-sm px-3 rounded-pill fw-bold text-white"><i class="fa fa-chart-line me-1"></i> โอกาสงานขาย PHP</a>
          <button class="btn btn-outline-primary btn-sm px-3 rounded-pill" onclick="window.location.reload()"><i class="fa fa-sync me-1"></i> อัปเดตข้อมูล</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Charts Layout Grid -->
  <div class="container-fluid">
    <div class="row g-4">
      <!-- Status Distribution Bar Chart -->
      <div class="col-12 col-lg-7">
        <div class="card border-0 shadow-sm rounded-4 bg-white h-100">
          <div class="card-header bg-white border-bottom py-3 d-flex align-items-center justify-content-between">
            <h5 class="m-0 fw-bold text-slate-800"><i class="fas fa-chart-bar text-primary me-1"></i> ผลสรุปดีลแบ่งตามสถานะ (Opportunity by Status)</h5>
            <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2.5">MySQL Live</span>
          </div>
          <div class="card-body py-4" style="height: 380px; position: relative;">
            <canvas id="statusChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Recent Activities Feed -->
      <div class="col-12 col-lg-5">
        <div class="card border-0 shadow-sm rounded-4 bg-white h-100">
          <div class="card-header bg-white border-bottom py-3 d-flex align-items-center justify-content-between" style="background-color: transparent;">
            <h5 class="m-0 fw-bold text-slate-800"><i class="fas fa-history text-indigo me-1"></i> ประวัติกิจกรรมขายล่าสุด (Recent Activities)</h5>
            <span class="badge bg-indigo bg-opacity-10 text-indigo rounded-pill px-2.5 py-1" style="background-color: rgba(102, 16, 242, 0.1); color: #6610f2;">Audit Trail</span>
          </div>
          <div class="card-body p-3 overflow-y-auto" style="height: 380px;">
            <div class="timeline timeline-inverse">
              <?php if (empty($recentLogs)): ?>
                <p class="text-center text-muted p-5">ไม่พบกิจกรรมล่าสุดของระบบ</p>
              <?php else: ?>
                <?php foreach ($recentLogs as $log): ?>
                  <div class="d-flex align-items-start gap-2.5 mb-3 border-bottom pb-2">
                    <div class="p-2 bg-light rounded text-center" style="width: 45px; height: 45px;">
                      <i class="fa <?php 
                        echo $log['target_type'] === 'system' ? 'fa-laptop-code text-primary' : 
                            ($log['target_type'] === 'opportunity' ? 'fa-bullseye text-warning' : 
                            ($log['target_type'] === 'customer' ? 'fa-building text-info' : 'fa-history text-indigo')); 
                      ?> fs-5"></i>
                    </div>
                    <div>
                      <div class="fw-bold text-dark" style="font-size: 0.85rem;"><?php echo htmlspecialchars($log['action']); ?></div>
                      <div class="text-xs text-muted mb-1" style="font-size: 0.75rem;">
                        โดย <?php echo htmlspecialchars($log['fullname']); ?> (<?php echo htmlspecialchars($log['role']); ?>) 
                        • <span class="text-indigo"><?php echo htmlspecialchars($log['created_at']); ?></span>
                      </div>
                      <p class="text-muted m-0 small" style="font-size: 0.8rem;"><?php echo htmlspecialchars($log['details']); ?></p>
                    </div>
                  </div>
                <?php endforeach; ?>
              <?php endif; ?>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4 mt-1">
      <!-- Monthly Forecast Line Chart -->
      <div class="col-12">
        <div class="card border-0 shadow-sm rounded-4 bg-white">
          <div class="card-header bg-white border-bottom py-3 d-flex align-items-center justify-content-between">
            <h5 class="m-0 fw-bold text-slate-800"><i class="fas fa-chart-line text-success me-1"></i> ส่วนวิเคราะห์แนวโน้มยอดเงินตามเป้าหมายเวลา (Sales Pipeline Forecast)</h5>
            <span class="badge bg-success bg-opacity-10 text-success rounded-pill px-2.5">MySQL Trends</span>
          </div>
          <div class="card-body py-4" style="height: 350px; position: relative;">
            <canvas id="pipelineChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

<!-- Injected script variables for ChartJS -->
<script>
  window.addEventListener('DOMContentLoaded', () => {
    // 1. Digital Clock
    function updateClock() {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      const clockDisplay = document.getElementById('clock-display');
      if (clockDisplay) clockDisplay.innerText = timeStr;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // 2. Status Chart
    const ctxStatus = document.getElementById('statusChart').getContext('2d');
    new Chart(ctxStatus, {
      type: 'bar',
      data: {
        labels: <?php echo json_encode($statusLabels); ?>,
        datasets: [{
          label: 'จำนวนรายการดีล (Deals Count)',
          data: <?php echo json_encode($statusCounts); ?>,
          backgroundColor: [
            'rgba(59, 130, 246, 0.75)',  // Blue
            'rgba(16, 185, 129, 0.75)',  // Green
            'rgba(245, 158, 11, 0.75)',  // Yellow
            'rgba(239, 68, 68, 0.75)',   // Red
            'rgba(139, 92, 246, 0.75)',  // Purple
            'rgba(107, 114, 128, 0.75)'  // Gray
          ],
          borderColor: [
            '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'
          ],
          borderWidth: 1.5,
          borderRadius: 4
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
            ticks: { stepSize: 1 }
          }
        }
      }
    });

    // 3. Pipeline Trend Chart
    const ctxPipeline = document.getElementById('pipelineChart').getContext('2d');
    new Chart(ctxPipeline, {
      type: 'line',
      data: {
        labels: <?php echo json_encode($forecastMonths); ?>,
        datasets: [{
          label: 'คาดการณ์ยอดขายรายเดือน (Estimated Value)',
          data: <?php echo json_encode($forecastVals); ?>,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointBackgroundColor: '#10b981',
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '฿' + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  });
</script>

<?php
require_once __DIR__ . '/footer.php';
?>
