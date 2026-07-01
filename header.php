<?php
/**
 * Sales Master CRM - Shared Header Layout
 */
require_once __DIR__ . '/config/db.php';

// Authentication Guard
if (!isset($_SESSION['user_email'])) {
    header('Location: login.php');
    exit();
}

// Language handler
if (isset($_GET['lang'])) {
    $_SESSION['lang'] = $_GET['lang'] === 'EN' ? 'EN' : 'TH';
}
$lang = isset($_SESSION['lang']) ? $_SESSION['lang'] : 'TH';

// Active User session data
$userId = $_SESSION['user_id'];
$userFullname = $_SESSION['user_fullname'];
$userRole = $_SESSION['user_role'];
$userEmail = $_SESSION['user_email'];

// UI Translations
$translations = [
    'TH' => [
        'system_title' => 'Sales Master CRM - ระบบจัดการฝ่ายขาย',
        'welcome_hi' => 'สวัสดีครับ,',
        'local_time' => 'เวลาสารสนเทศระบบ (Local Time)',
        'home' => 'หน้าแรก',
        'reset_sample' => 'รีเซ็ตตัวอย่าง',
        'customers' => 'ทะเบียนลูกค้า',
        'opportunities' => 'โอกาสทางการขาย',
        'quotations' => 'ใบเสนอราคา',
        'invoices' => 'ใบแจ้งหนี้',
        'dashboard' => 'แดชบอร์ดสรุปยอด',
        'logout' => 'ออกจากระบบ',
        'active_status' => 'เปิดใช้งาน',
        'user_info' => 'ข้อมูลผู้ใช้งาน',
        'nav_welcome' => 'ยินดีต้อนรับสู่ระบบบริหารฝ่ายขายและจัดการ ERP'
    ],
    'EN' => [
        'system_title' => 'Sales Master CRM - ERP System',
        'welcome_hi' => 'Hello,',
        'local_time' => 'System Local Time',
        'home' => 'Home',
        'reset_sample' => 'Reset Sample',
        'customers' => 'Customers Database',
        'opportunities' => 'Sales Opportunities',
        'quotations' => 'Quotations List',
        'invoices' => 'Invoices & Receipts',
        'dashboard' => 'Dashboard Summary',
        'logout' => 'Log Out',
        'active_status' => 'Active Status',
        'user_info' => 'User Profile',
        'nav_welcome' => 'Welcome to Sales Master CRM & ERP Portal'
    ]
];

$t = $translations[$lang];
?>
<!DOCTYPE html>
<html lang="<?php echo strtolower($lang); ?>">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?php echo $t['system_title']; ?></title>

  <!-- Google Font: Kanit (Thailand UI support) & Source Sans Pro -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600&family=Source+Sans+3:wght@300;400;600;700&display=swap">
  <!-- Font Awesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <!-- Bootstrap 5 CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
  <!-- AdminLTE 4 CSS (Minimal Core beta reference) -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/admin-lte@4.0.0-beta2/dist/css/adminlte.min.css">
  
  <!-- DataTables BS5 CSS -->
  <link rel="stylesheet" href="https://cdn.datatables.net/1.13.5/css/dataTables.bootstrap5.min.css">
  <!-- Custom Application Override CSS -->
  <link rel="stylesheet" href="/style.css">
  
  <style>
    /* Custom spacing and overrides for PHP layouts */
    .app-main {
      padding: 1.5rem;
      min-height: 100vh;
      margin-left: 250px;
      transition: margin-left .3s ease-in-out;
    }
    .sidebar-collapse .app-main {
      margin-left: 0;
    }
    @media (max-width: 991.98px) {
      .app-main {
        margin-left: 0 !important;
      }
    }
  </style>
</head>
<body class="layout-fixed sidebar-expand-lg bg-body-tertiary">
  <div class="app-wrapper wrapper">
    <!-- Navbar -->
    <nav class="app-header navbar navbar-expand bg-white border-bottom shadow-sm">
      <div class="container-fluid">
        <!-- Left links -->
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" data-lte-toggle="sidebar" href="#" role="button"><i class="fas fa-bars"></i></a>
          </li>
          <li class="nav-item d-none d-md-inline-block">
            <a href="index.php" class="nav-link"><i class="fa fa-home text-primary"></i> <?php echo $t['home']; ?></a>
          </li>
          <li class="nav-item d-none d-lg-inline-block align-self-center ps-2 text-muted small">
            <?php echo $t['nav_welcome']; ?>
          </li>
        </ul>

        <!-- Right links -->
        <ul class="navbar-nav ms-auto align-items-center">
          <!-- Language Selector -->
          <li class="nav-item dropdown px-2 text-dark">
            <button class="btn btn-link nav-link p-1 dropdown-toggle d-flex align-items-center gap-1" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="border:none; background:none;">
              <i class="fa fa-globe fs-5 text-secondary"></i> <span class="small fw-bold text-uppercase"><?php echo $lang; ?></span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow border-0" style="min-width: 130px; z-index:9999;">
              <li><a class="dropdown-item d-flex align-items-center gap-2 text-dark" href="?lang=TH">🇹🇭 ไทย (TH)</a></li>
              <li><a class="dropdown-item d-flex align-items-center gap-2 text-dark" href="?lang=EN">🇺🇸 English (EN)</a></li>
            </ul>
          </li>

          <!-- User Profile Dropdown -->
          <li class="nav-item dropdown px-2">
            <a class="nav-link dropdown-toggle active fw-bold d-flex align-items-center gap-2" href="#" id="userProfileDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <img src="https://ui-avatars.com/api/?name=<?php echo urlencode($userFullname); ?>&background=0d6efd&color=fff" class="rounded-circle" style="width: 28px; height: 28px;" alt="User">
              <span class="d-none d-sm-inline text-dark"><?php echo htmlspecialchars($userFullname); ?> (<?php echo htmlspecialchars($userRole); ?>)</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end shadow border-0" aria-labelledby="userProfileDropdown" style="z-index: 10000;">
              <li><a class="dropdown-item py-2 text-dark" href="users.php"><i class="fas fa-user-shield me-2 text-indigo"></i><?php echo $t['user_info']; ?></a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item py-2 text-danger" href="logout.php"><i class="fas fa-sign-out-alt me-2"></i><?php echo $t['logout']; ?></a></li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
    <!-- /Navbar -->
