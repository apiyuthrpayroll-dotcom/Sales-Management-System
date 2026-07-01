<?php
/**
 * Sales Master CRM - Shared Sidebar Layout
 */
$currentPage = basename($_SERVER['PHP_SELF']);

// Sidebar Translations
$sidebarTranslations = [
    'TH' => [
        'brand' => 'Sales Master CRM',
        'menu_section' => 'ระบบงานขายหลัก (ERP)',
        'menu_dashboard' => 'แผงควบคุมหลัก',
        'menu_customers' => 'ทะเบียนลูกค้าองค์กร',
        'menu_opportunities' => 'ติดตามโอกาสทางการขาย',
        'menu_quotations' => 'ออกใบเสนอราคา (Quotation)',
        'menu_invoices' => 'ใบแจ้งหนี้ / ใบเสร็จรับเงิน',
        'system_management' => 'การจัดการระบบ',
        'menu_users' => 'พนักงาน & สิทธิ์ระบบ',
        'menu_reports' => 'วิเคราะห์รายงานยอดขาย'
    ],
    'EN' => [
        'brand' => 'Sales Master CRM',
        'menu_section' => 'MAIN WORKFLOWS',
        'menu_dashboard' => 'General Dashboard',
        'menu_customers' => 'Customer Accounts',
        'menu_opportunities' => 'Opportunities (Kanban)',
        'menu_quotations' => 'Quotation Generator',
        'menu_invoices' => 'Invoices & Billings',
        'system_management' => 'SYSTEM ADMIN',
        'menu_users' => 'Users & Permissions',
        'menu_reports' => 'BI Reports & Charts'
    ]
];

$st = $sidebarTranslations[$lang];
?>
<!-- Main Sidebar Container -->
<aside class="app-sidebar bg-dark shadow-lg border-end border-secondary" data-bs-theme="dark" style="background-color: #0f172a !important; width: 250px; position: fixed; top: 0; bottom: 0; left: 0; z-index: 1040;">
  <!-- Brand Logo -->
  <div class="sidebar-brand d-flex align-items-center justify-content-between p-3 border-bottom border-secondary">
    <a href="index.php" class="brand-link d-flex align-items-center text-decoration-none gap-2">
      <div class="bg-primary text-white rounded-circle p-1.5 d-flex align-items-center justify-content-center" style="width: 35px; height: 35px;">
        <i class="fa fa-chart-line"></i>
      </div>
      <span class="brand-text fw-extrabold text-white" style="font-size: 1.15rem; letter-spacing: -0.5px;"><?php echo htmlspecialchars($st['brand']); ?></span>
    </a>
  </div>

  <!-- Sidebar User Profile -->
  <div class="p-3 border-bottom border-secondary d-flex align-items-center gap-3">
    <img src="https://ui-avatars.com/api/?name=<?php echo urlencode($userFullname); ?>&background=4f46e5&color=fff" class="rounded-circle" style="width: 40px; height: 40px;" alt="User Avatar">
    <div class="text-white">
      <div class="fw-bold text-truncate" style="max-width: 150px; font-size: 0.9rem;"><?php echo htmlspecialchars($userFullname); ?></div>
      <div class="text-xs text-muted" style="font-size: 0.75rem;"><span class="badge bg-indigo-subtle text-indigo p-1" style="background-color: rgba(102, 16, 242, 0.2); color: #a5b4fc;"><?php echo htmlspecialchars($userRole); ?></span></div>
    </div>
  </div>

  <!-- Sidebar Menu -->
  <div class="sidebar-wrapper overflow-y-auto" style="height: calc(100vh - 145px);">
    <nav class="mt-2 px-2">
      <ul class="nav sidebar-menu flex-column" data-lte-toggle="treeview" role="menu" data-accordion="false">
        
        <li class="nav-item">
          <a href="index.php" class="nav-link py-2.5 d-flex align-items-center gap-3 rounded-2 text-white opacity-85 hover-opacity-100 <?php echo $currentPage === 'index.php' ? 'active bg-primary' : ''; ?>" style="transition: all 0.2s;">
            <i class="nav-icon fas fa-tachometer-alt text-primary" style="width: 20px;"></i>
            <span style="font-size: 0.9rem;"><?php echo $st['menu_dashboard']; ?></span>
          </a>
        </li>

        <li class="nav-header text-muted text-uppercase fw-bold mt-3 mb-2 px-3" style="font-size: 0.75rem; letter-spacing: 0.5px;">
          <?php echo $st['menu_section']; ?>
        </li>

        <li class="nav-item">
          <a href="customers.php" class="nav-link py-2.5 d-flex align-items-center gap-3 rounded-2 text-white opacity-85 hover-opacity-100 <?php echo $currentPage === 'customers.php' ? 'active bg-primary' : ''; ?>" style="transition: all 0.2s;">
            <i class="nav-icon fas fa-building text-info" style="width: 20px;"></i>
            <span style="font-size: 0.9rem;"><?php echo $st['menu_customers']; ?></span>
          </a>
        </li>

        <li class="nav-item">
          <a href="opportunities.php" class="nav-link py-2.5 d-flex align-items-center gap-3 rounded-2 text-white opacity-85 hover-opacity-100 <?php echo $currentPage === 'opportunities.php' ? 'active bg-primary' : ''; ?>" style="transition: all 0.2s;">
            <i class="nav-icon fas fa-bullseye text-warning" style="width: 20px;"></i>
            <span style="font-size: 0.9rem;"><?php echo $st['menu_opportunities']; ?></span>
          </a>
        </li>

        <li class="nav-item">
          <a href="quotations.php" class="nav-link py-2.5 d-flex align-items-center gap-3 rounded-2 text-white opacity-85 hover-opacity-100 <?php echo $currentPage === 'quotations.php' ? 'active bg-primary' : ''; ?>" style="transition: all 0.2s;">
            <i class="nav-icon fas fa-file-invoice text-success" style="width: 20px;"></i>
            <span style="font-size: 0.9rem;"><?php echo $st['menu_quotations']; ?></span>
          </a>
        </li>

        <li class="nav-item">
          <a href="invoices.php" class="nav-link py-2.5 d-flex align-items-center gap-3 rounded-2 text-white opacity-85 hover-opacity-100 <?php echo $currentPage === 'invoices.php' ? 'active bg-primary' : ''; ?>" style="transition: all 0.2s;">
            <i class="nav-icon fas fa-wallet text-danger" style="width: 20px;"></i>
            <span style="font-size: 0.9rem;"><?php echo $st['menu_invoices']; ?></span>
          </a>
        </li>

        <li class="nav-header text-muted text-uppercase fw-bold mt-3 mb-2 px-3" style="font-size: 0.75rem; letter-spacing: 0.5px;">
          <?php echo $st['system_management']; ?>
        </li>

        <li class="nav-item">
          <a href="reports.php" class="nav-link py-2.5 d-flex align-items-center gap-3 rounded-2 text-white opacity-85 hover-opacity-100 <?php echo $currentPage === 'reports.php' ? 'active bg-primary' : ''; ?>" style="transition: all 0.2s;">
            <i class="nav-icon fas fa-chart-bar text-warning" style="width: 20px;"></i>
            <span style="font-size: 0.9rem;"><?php echo $st['menu_reports']; ?></span>
          </a>
        </li>

        <li class="nav-item">
          <a href="users.php" class="nav-link py-2.5 d-flex align-items-center gap-3 rounded-2 text-white opacity-85 hover-opacity-100 <?php echo $currentPage === 'users.php' ? 'active bg-primary' : ''; ?>" style="transition: all 0.2s;">
            <i class="nav-icon fas fa-user-shield text-indigo" style="width: 20px;"></i>
            <span style="font-size: 0.9rem;"><?php echo $st['menu_users']; ?></span>
          </a>
        </li>

      </ul>
    </nav>
  </div>
</aside>
