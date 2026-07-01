<?php
/**
 * Sales Master CRM - Sales BI & Analytics Reports
 * Technology Stack: PHP 7+ / MySQL / Chart.js / DataTables
 */
require_once __DIR__ . '/header.php';
require_once __DIR__ . '/sidebar.php';

try {
    // 1. Service Segment Share (Pie Chart)
    $stmt = $pdo->query("SELECT service_type, SUM(estimated_value) as val FROM opportunities GROUP BY service_type");
    $shareData = $stmt->fetchAll();
    $shareLabels = [];
    $shareValues = [];
    foreach ($shareData as $row) {
        $shareLabels[] = $row['service_type'];
        $shareValues[] = (float)$row['val'];
    }

    // 2. Top Performing Corporate Accounts
    $stmt = $pdo->query("
        SELECT c.customer_code, c.customer_name, c.industry_type, COUNT(o.id) as deal_count, SUM(o.estimated_value) as total_val 
        FROM opportunities o 
        JOIN customers c ON o.customer_id = c.id 
        GROUP BY c.id, c.customer_code, c.customer_name, c.industry_type 
        ORDER BY total_val DESC 
        LIMIT 5
    ");
    $topCustomers = $stmt->fetchAll();

    // 3. Status Value Breakdown
    $stmt = $pdo->query("SELECT status, SUM(estimated_value) as total_val, COUNT(*) as deal_count FROM opportunities GROUP BY status");
    $statusSummary = $stmt->fetchAll();

} catch (PDOException $e) {
    echo "<div class='alert alert-danger m-3'>ดึงข้อมูลรายงานล้มเหลว: " . $e->getMessage() . "</div>";
    $shareLabels = $shareValues = [];
    $topCustomers = $statusSummary = [];
}
?>

<!-- Main Content Stage Area -->
<main class="app-main p-3">
  <!-- Content Header -->
  <div class="container-fluid mb-3 pt-2">
    <div class="row align-items-center">
      <div class="col-sm-6">
        <h1 class="m-0 fw-bold tracking-tight text-dark fs-2 text-uppercase">
          <i class="fas fa-chart-bar text-warning me-2"></i>รายงานและวิเคราะห์ยอดขาย (BI Reports)
        </h1>
        <p class="text-muted small m-0">ติดตามสถิติมูลค่างานเสนอประมูล ยอดสัญญากลุ่มบริษัทคู่ค้า และวิเคราะห์สัดส่วนรายได้</p>
      </div>
      <div class="col-sm-6 text-sm-end mt-2 mt-sm-0">
        <button class="btn btn-outline-secondary btn-sm" onclick="window.print()">
          <i class="fa fa-print me-1"></i>พิมพ์รายงาน BI
        </button>
      </div>
    </div>
  </div>

  <div class="container-fluid">
    <!-- Grid for Analytics Charts -->
    <div class="row g-4 mb-4">
      <!-- Pie Chart segment share -->
      <div class="col-12 col-md-5">
        <div class="card border-0 shadow-sm rounded-4 bg-white h-100">
          <div class="card-header bg-white border-bottom py-3">
            <h5 class="m-0 fw-bold text-slate-800"><i class="fas fa-chart-pie text-success me-1"></i> สัดส่วนบริการ (Service Segment Share)</h5>
          </div>
          <div class="card-body d-flex align-items-center justify-content-center" style="height: 300px; position: relative;">
            <canvas id="shareChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Opportunity Values Summary Cards -->
      <div class="col-12 col-md-7">
        <div class="card border-0 shadow-sm rounded-4 bg-white h-100">
          <div class="card-header bg-white border-bottom py-3">
            <h5 class="m-0 fw-bold text-slate-800"><i class="fas fa-table text-primary me-1"></i> สรุปดีลขายแบ่งตามสถานะ (Status Portfolio Value)</h5>
          </div>
          <div class="card-body p-3">
            <div class="table-responsive">
              <table class="table table-bordered table-striped mb-0 text-dark" style="font-size: 0.85rem;">
                <thead class="bg-light">
                  <tr>
                    <th>สถานะ (Status Stage)</th>
                    <th class="text-center">จำนวนดีลประมูล</th>
                    <th class="text-end">มูลค่าเสนอราคารวม (฿)</th>
                  </tr>
                </thead>
                <tbody>
                  <?php foreach ($statusSummary as $sum): ?>
                    <tr>
                      <td class="fw-bold">
                        <span class="badge p-1.5 rounded <?php 
                          echo $sum['status'] === 'Won' ? 'bg-success' : 
                              ($sum['status'] === 'Lost' ? 'bg-danger' : 
                              ($sum['status'] === 'Negotiation' ? 'bg-warning text-dark' : 'bg-primary')); 
                        ?>">
                          <?php echo htmlspecialchars($sum['status']); ?>
                        </span>
                      </td>
                      <td class="text-center font-monospace fw-bold"><?php echo $sum['deal_count']; ?> รายการ</td>
                      <td class="text-end font-monospace fw-bold text-dark">฿<?php echo number_format($sum['total_val'], 2); ?></td>
                    </tr>
                  <?php endforeach; ?>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Corporate Customers Portfolio -->
    <div class="card-admin shadow-sm border mb-4">
      <div class="card-admin-header bg-white border-bottom py-3">
        <h5 class="card-admin-title m-0 fw-bold text-slate-800">
          <i class="fas fa-crown text-warning me-1"></i> 5 อันดับแรกคู่ค้าธุรกิจพอร์ตรวมสูงสุด (Top 5 Corporate Accounts)
        </h5>
      </div>
      <div class="card-admin-body p-3">
        <div class="table-responsive">
          <table class="table table-bordered table-hover mb-0 bg-white" style="font-size: 0.85rem; color: #333;">
            <thead class="text-uppercase small fw-bold text-dark" style="background-color: #f8fafc;">
              <tr>
                <th style="width: 120px;">รหัสลูกค้า</th>
                <th>ชื่อนิติบุคคล (Corporate Name)</th>
                <th>เซกเมนต์อุตสาหกรรม</th>
                <th class="text-center" style="width: 140px;">จำนวนโครงการประมูล</th>
                <th class="text-end" style="width: 250px;">พอร์ตรวมมูลค่าสะสม (฿)</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($topCustomers as $index => $tc): ?>
                <tr>
                  <td class="font-monospace fw-bold text-indigo"><?php echo htmlspecialchars($tc['customer_code']); ?></td>
                  <td>
                    <div class="fw-bold text-dark">
                      <span class="badge bg-warning text-dark me-1" style="font-size: 10px; padding: 2px 4px;">Top <?php echo $index + 1; ?></span>
                      <?php echo htmlspecialchars($tc['customer_name']); ?>
                    </div>
                  </td>
                  <td><span class="badge bg-secondary bg-opacity-10 text-secondary p-1.5"><?php echo htmlspecialchars($tc['industry_type']); ?></span></td>
                  <td class="text-center font-monospace fw-bold"><?php echo $tc['deal_count']; ?> โครงการ</td>
                  <td class="text-end fw-extrabold font-monospace text-success" style="font-size: 0.95rem;">฿<?php echo number_format($tc['total_val'], 2); ?></td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</main>

<script>
  window.addEventListener('DOMContentLoaded', () => {
    // Service Segment Share Pie Chart
    const ctxShare = document.getElementById('shareChart').getContext('2d');
    new Chart(ctxShare, {
      type: 'doughnut',
      data: {
        labels: <?php echo json_encode($shareLabels); ?>,
        datasets: [{
          data: <?php echo json_encode($shareValues); ?>,
          backgroundColor: [
            '#2563eb', // Blue
            '#10b981', // Green
            '#f59e0b', // Yellow
            '#8b5cf6', // Purple
            '#ef4444', // Red
            '#6b7280'  // Gray
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { boxWidth: 12, font: { family: 'Kanit', size: 11 } }
          }
        }
      }
    });
  });
</script>

<?php
require_once __DIR__ . '/footer.php';
?>
