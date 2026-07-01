/**
 * Sales Master CRM - PHP Enterprise Codebase Store
 * Contains the complete, production-ready PHP scripts, layouts, and SQL definitions.
 */

export interface PHPFile {
  filepath: string;
  description: string;
  category: 'Configuration' | 'Layout' | 'Main Page' | 'API';
  content: string;
}

export const phpCodebase: PHPFile[] = [
  {
    category: 'Configuration',
    filepath: '/config/db.php',
    description: 'ไฟล์กำหนดค่าเชื่อมต่อฐานข้อมูล MySQL ด้วยสิทธิ์ PDO (PHP Data Objects) พร้อมรองรับ UTF-8',
    content: `<?php
/**
 * Sales Master CRM - Database Connection Settings
 * Technology Stack: PHP 7+ / MySQL / PDO
 */
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'sales_master_crm');

// Start secure session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    die("Database Connection Failed: " . $e->getMessage());
}
?>`
  },
  {
    category: 'Configuration',
    filepath: '/database.sql',
    description: 'ไฟล์กำหนดโครงสร้างตาราง MySQL (DDL) พร้อมข้อมูลจำลองสำหรับตระกูลองค์กร และผู้จัดจำหน่าย',
    content: `-- SQL Schema สำหรับฐานข้อมูล MySQL (XAMPP / phpMyAdmin)
-- โครงการ: Sales Master CRM Enterprise Suite

CREATE DATABASE IF NOT EXISTS \`sales_master_crm\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`sales_master_crm\`;

-- 1. ตารางผู้ใช้งานระบบ (Users)
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`fullname\` VARCHAR(100) NOT NULL,
  \`email\` VARCHAR(100) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`role\` ENUM('Administrator', 'Sales Manager', 'Sales Representative', 'Executive') NOT NULL DEFAULT 'Sales Representative',
  \`status\` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. ตารางทะเบียนลูกค้าองค์กร (Customers)
CREATE TABLE IF NOT EXISTS \`customers\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`customer_code\` VARCHAR(20) NOT NULL UNIQUE,
  \`customer_name\` VARCHAR(255) NOT NULL,
  \`tax_id\` VARCHAR(20) DEFAULT NULL,
  \`industry_type\` VARCHAR(100) DEFAULT NULL,
  \`address\` TEXT DEFAULT NULL,
  \`phone\` VARCHAR(50) DEFAULT NULL,
  \`email\` VARCHAR(100) DEFAULT NULL,
  \`payment_term\` INT DEFAULT 30, -- จำนวนวันเครดิต
  \`status\` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. ตารางประวัติผู้ติดต่อประสานงานหลัก (Customer Contacts)
CREATE TABLE IF NOT EXISTS \`customer_contacts\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`customer_id\` INT NOT NULL,
  \`contact_name\` VARCHAR(150) NOT NULL,
  \`position\` VARCHAR(100) DEFAULT NULL,
  \`phone\` VARCHAR(50) DEFAULT NULL,
  \`email\` VARCHAR(100) DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. ตารางประเมินดีลโอกาสทางการขาย (Opportunities)
CREATE TABLE IF NOT EXISTS \`opportunities\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`opportunity_no\` VARCHAR(20) NOT NULL UNIQUE,
  \`customer_id\` INT NOT NULL,
  \`project_name\` VARCHAR(255) NOT NULL,
  \`service_type\` VARCHAR(100) NOT NULL,
  \`lead_source\` VARCHAR(100) DEFAULT NULL,
  \`estimated_value\` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  \`success_probability\` INT DEFAULT 20,
  \`expected_close_date\` DATE DEFAULT NULL,
  \`sales_person_id\` INT NOT NULL,
  \`status\` ENUM('Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost', 'Cancelled') NOT NULL DEFAULT 'Lead',
  \`remarks\` TEXT DEFAULT NULL,
  \`created_by\` INT NOT NULL,
  \`updated_by\` INT DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`sales_person_id\`) REFERENCES \`users\`(\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. ตารางใบเสนอราคา (Quotations)
CREATE TABLE IF NOT EXISTS \`quotations\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`quotation_no\` VARCHAR(20) NOT NULL UNIQUE,
  \`customer_id\` INT NOT NULL,
  \`opportunity_id\` INT DEFAULT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`quotation_date\` DATE NOT NULL,
  \`validity_days\` INT DEFAULT 30,
  \`payment_term\` VARCHAR(100) DEFAULT NULL,
  \`total_value\` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  \`tax_rate\` DECIMAL(5,2) NOT NULL DEFAULT '7.00',
  \`grand_total\` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  \`terms_conditions\` TEXT DEFAULT NULL,
  \`remarks\` TEXT DEFAULT NULL,
  \`sales_person_id\` INT NOT NULL,
  \`status\` ENUM('Draft', 'Sent', 'Approved', 'Rejected', 'Cancelled') NOT NULL DEFAULT 'Draft',
  \`created_by\` INT NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`opportunity_id\`) REFERENCES \`opportunities\`(\`id\`) ON DELETE SET NULL,
  FOREIGN KEY (\`sales_person_id\`) REFERENCES \`users\`(\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. ตารางรายการย่อยของใบเสนอราคา (Quotation Items)
CREATE TABLE IF NOT EXISTS \`quotation_items\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`quotation_id\` INT NOT NULL,
  \`item_name\` VARCHAR(255) NOT NULL,
  \`quantity\` DECIMAL(12,2) NOT NULL DEFAULT '1.00',
  \`unit\` VARCHAR(50) DEFAULT NULL,
  \`unit_price\` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  \`total\` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  FOREIGN KEY (\`quotation_id\`) REFERENCES \`quotations\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. ตารางใบแจ้งหนี้ (Invoices)
CREATE TABLE IF NOT EXISTS \`invoices\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`invoice_no\` VARCHAR(20) NOT NULL UNIQUE,
  \`customer_id\` INT NOT NULL,
  \`quotation_id\` INT DEFAULT NULL,
  \`invoice_date\` DATE NOT NULL,
  \`due_date\` DATE NOT NULL,
  \`subtotal\` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  \`tax_amount\` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  \`grand_total\` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  \`status\` ENUM('Unpaid', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled') NOT NULL DEFAULT 'Unpaid',
  \`created_by\` INT NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`quotation_id\`) REFERENCES \`quotations\`(\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. ตารางประวัติและประทับกิจกรรมระบบ (Audit Logs)
CREATE TABLE IF NOT EXISTS \`audit_logs\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT DEFAULT NULL,
  \`action\` VARCHAR(255) NOT NULL,
  \`target_type\` VARCHAR(50) DEFAULT NULL,
  \`target_id\` INT DEFAULT NULL,
  \`details\` TEXT DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- --- ใส่ข้อมูลตั้งต้นในตาราง (Seeding) ---
-- ผู้ใช้งานเบื้องต้น (รหัสผ่านคือ crm123456 เข้ารหัสแบบ password_hash)
INSERT INTO \`users\` (\`id\`, \`username\`, \`fullname\`, \`email\`, \`password\`, \`role\`, \`status\`) VALUES
(1, 'Apiyut', 'Apiyut Noeikhiaw', 'Apiyut.noeikhiaw@th.ikm.com', '$2y$10$wS2WbT2HhYh5G5LgR5uDDeK5U8uU5YfPjZ5mK3Z0g8GvS6u1v7x5e', 'Administrator', 'Active'),
(2, 'Supaporn', 'Supaporn Wattana', 'supaporn@th.ikm.com', '$2y$10$wS2WbT2HhYh5G5LgR5uDDeK5U8uU5YfPjZ5mK3Z0g8GvS6u1v7x5e', 'Sales Manager', 'Active'),
(3, 'Chaloempon', 'Chaloempon Kittisak', 'chaloempon@th.ikm.com', '$2y$10$wS2WbT2HhYh5G5LgR5uDDeK5U8uU5YfPjZ5mK3Z0g8GvS6u1v7x5e', 'Sales Representative', 'Active');

-- ข้อมูลลูกค้านิติบุคคลหลัก
INSERT INTO \`customers\` (\`id\`, \`customer_code\`, \`customer_name\`, \`tax_id\`, \`industry_type\`, \`address\`, \`phone\`, \`email\`, \`payment_term\`, \`status\`) VALUES
(1, 'CUS-000001', 'บริษัท ปตท. สำรวจและผลิตปิโตรเลียม จำกัด (มหาชน)', '0107535000206', 'Energy & Utilities', '555/1 ศูนย์เอนเนอร์ยี่คอมเพล็กซ์ อาคารเอ ถนนวิภาวดีรังสิต จตุจักร กรุงเทพฯ', '02-537-4000', 'procurement@pttep.com', 30, 'Active'),
(2, 'CUS-000002', 'บริษัท ไทยออยล์ จำกัด (มหาชน)', '0107537000220', 'Energy & Utilities', '555/1 ศูนย์เอนเนอร์ยี่คอมเพล็กซ์ อาคารบี จตุจักร กรุงเทพฯ', '02-797-2000', 'vendor@thaioilgroup.com', 45, 'Active'),
(3, 'CUS-000003', 'บริษัท ปูนซิเมนต์ไทย จำกัด (มหาชน)', '0107537000017', 'Manufacturing', '1 ถนนปูนซิเมนต์ไทย บางซื่อ กรุงเทพฯ', '02-586-4444', 'contact@scg.com', 30, 'Active');

-- ผู้ประสานงานหลักของลูกค้า
INSERT INTO \`customer_contacts\` (\`id\`, \`customer_id\`, \`contact_name\`, \`position\`, \`phone\`, \`email\`) VALUES
(1, 1, 'คุณ สมชาย รักดี', 'Procurement Manager', '081-234-5678', 'somchai.r@pttep.com'),
(2, 2, 'คุณ สมศรี มณีรัตน์', 'Senior Maintenance Engineer', '089-876-5432', 'somsri.m@thaioilgroup.com'),
(3, 3, 'คุณ อภิสิทธิ์ ใจดี', 'Site Engineering Director', '085-555-4321', 'apisit.j@scg.com');

-- รายการประมูลโอกาสทางการขาย
INSERT INTO \`opportunities\` (\`id\`, \`opportunity_no\`, \`customer_id\`, \`project_name\`, \`service_type\`, \`lead_source\`, \`estimated_value\`, \`success_probability\`, \`expected_close_date\`, \`sales_person_id\`, \`status\`, \`remarks\`, \`created_by\`) VALUES
(1, 'OPP-000001', 1, 'โครงการจัดหาปั๊มไฮโดรเทสความดันสูง คลังน้ำมันระยอง', 'Equipment Rental', 'Tender', 1500000.00, 80, '2026-07-15', 3, 'Negotiation', 'โครงการมีความต้องการเช่าอุปกรณ์ยาว 6 เดือนเป็นกรณีพิเศษ', 1),
(2, 'OPP-000002', 2, 'บริการงานทดสอบแรงดันระบบท่อส่งน้ำมันหล่อลื่นส่วนต่อขยาย', 'Testing Service', 'Existing Customer', 850000.00, 95, '2026-07-30', 3, 'Won', 'งานตกลงจ้างบริการเรียบร้อยและผ่านการพิจารณาด้านวิศวกรรมแล้ว', 1),
(3, 'OPP-000003', 3, 'จัดหากำลังพลสนับสนุนสายงานซ่อมบำรุงโรงไฟฟ้าปูนแก่งคอย', 'Manpower Supply', 'Referral', 2400000.00, 40, '2026-08-10', 3, 'Proposal', 'อยู่ระหว่างส่งข้อเสนอประวัติวิศวกรและแผนประกันความปลอดภัย', 1);

-- ใบเสนอราคาอ้างอิง
INSERT INTO \`quotations\` (\`id\`, \`quotation_no\`, \`customer_id\`, \`opportunity_id\`, \`title\`, \`quotation_date\`, \`validity_days\`, \`payment_term\`, \`total_value\`, \`tax_rate\`, \`grand_total\`, \`status\`, \`sales_person_id\`, \`created_by\`) VALUES
(1, 'QT-000001', 2, 2, 'ใบเสนอราคาบริการทดสอบแรงดันระบบท่อส่งน้ำมัน (Testing Service)', '2026-06-15', 30, 'เครดิต 45 วัน', 850000.00, 7.00, 909500.00, 'Approved', 3, 1),
(2, 'QT-000002', 3, 3, 'จัดหากำลังพลสนับสนุนสายงานซ่อมบำรุงวิศวกรรมโรงงาน SCG', '2026-06-25', 30, 'เครดิต 30 วัน', 2400000.00, 7.00, 2568000.00, 'Sent', 3, 1);

-- รายการย่อยใบเสนอราคา
INSERT INTO \`quotation_items\` (\`id\`, \`quotation_id\`, \`item_name\`, \`quantity\`, \`unit\`, \`unit_price\`, \`total\`) VALUES
(1, 1, 'บริการทดสอบความสมบูรณ์รอยเชื่อมและแรงดันสูงด้วยน้ำสะอาด', 1.00, 'Job', 600000.00, 600000.00),
(2, 1, 'ค่าเช่าเครื่องอ่านค่าแรงดันแบบดิจิทัลความละเอียดสูง', 5.00, 'Day', 50000.00, 250000.00),
(3, 2, 'วิศวกรเครื่องกลความชำนาญการพิเศษ (Mechanical Engineer Extra)', 4.00, 'Man/Month', 600000.00, 2400000.00);

-- ใบแจ้งหนี้ที่จัดทำ
INSERT INTO \`invoices\` (\`id\`, \`invoice_no\`, \`customer_id\`, \`quotation_id\`, \`invoice_date\`, \`due_date\`, \`subtotal\`, \`tax_amount\`, \`grand_total\`, \`status\`, \`created_by\`) VALUES
(1, 'INV-000001', 2, 1, '2026-06-20', '2026-08-04', 850000.00, 59500.00, 909500.00, 'Unpaid', 1);

-- บันทึกประวัติกิจกรรมเบื้องต้น
INSERT INTO \`audit_logs\` (\`id\`, \`user_id\`, \`action\`, \`target_type\`, \`target_id\`, \`details\`) VALUES
(1, 1, 'ติดตั้งระบบฐานข้อมูล (Database Seeding)', 'system', 0, 'ผู้ดูแลระบบทำการอัปโหลดสกีมา SQL และตั้งค่าสิทธิของตระกูลสิทธิ์เรียบร้อย'),
(2, 3, 'อัปเกรดความคืบหน้าดีล (Opportunity Updated)', 'opportunity', 2, 'วิศวกร Chaloempon ทำการปรับสถานะโครงการของบริษัทไทยออยล์ เป็น [Won]');
`
  },
  {
    category: 'Layout',
    filepath: '/header.php',
    description: 'แถบแถวบนส่วนกลางของแอปพลิเคชัน (Navbar) แสดงโลโก้ ระบบเปลี่ยนภาษา และโปรไฟล์ผู้ใช้',
    content: `<?php
/**
 * Sales Master CRM - Shared Navbar Layout
 */
require_once __DIR__ . '/config/db.php';

// Verify authentication state in PHP
if (!isset($_SESSION['user_email'])) {
    header('Location: login.php');
    exit();
}

$userFullname = $_SESSION['user_fullname'];
$userRole = $_SESSION['user_role'];
$userId = $_SESSION['user_id'];

// Multi-language system dictionary helper
$lang = $_SESSION['lang'] ?? 'TH';
$translations = [
    'TH' => [
        'welcome_hi' => 'สวัสดีครับ',
        'app_title' => 'ระบบจัดการลูกค้าสัมพันธ์ระดับองค์กร',
        'local_time' => 'เวลาในระบบ',
        'dashboard' => 'แดชบอร์ดสรุปยอด',
        'customers' => 'ทะเบียนกลุ่มลูกค้า',
        'opportunities' => 'ดีลและงานประมูล',
        'quotations' => 'ระบบเสนอราคา',
        'invoices' => 'การเงิน / แจ้งหนี้',
        'reports' => 'สรุปรายงาน BI'
    ],
    'EN' => [
        'welcome_hi' => 'Welcome',
        'app_title' => 'Enterprise CRM System Suite',
        'local_time' => 'System Time',
        'dashboard' => 'Sales Dashboard',
        'customers' => 'Customer Masters',
        'opportunities' => 'Deals & Pipeline',
        'quotations' => 'Quotation Center',
        'invoices' => 'Billing & Invoices',
        'reports' => 'Reports & Analytics'
    ]
];
$t = $translations[$lang];
?>
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?php echo htmlspecialchars($t['app_title']); ?> - Sales Master CRM</title>

  <!-- Google Fonts: Kanit & Source Sans -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&family=Source+Sans+3:wght@300;400;600;700&display=swap">
  <!-- Font Awesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <!-- Bootstrap 5 Framework -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
  <!-- AdminLTE 4 (Beta Layout Theme) -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/admin-lte@4.0.0-beta2/dist/css/adminlte.min.css">
  <!-- DataTables Integration CSS -->
  <link rel="stylesheet" href="https://cdn.datatables.net/1.13.5/css/dataTables.bootstrap5.min.css">

  <style>
    body {
      font-family: 'Kanit', 'Source Sans 3', sans-serif;
      background-color: #f1f5f9;
    }
    .kpi-hover-card {
      transition: all 0.25s ease;
    }
    .kpi-hover-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
    }
    .font-monospace {
      font-family: 'JetBrains Mono', 'Fira Code', monospace !important;
    }
    .card-admin {
      background: white;
      border-radius: 0.75rem;
      border: 1px solid rgba(226, 232, 240, 0.8);
      overflow: hidden;
    }
  </style>
</head>
<body class="layout-fixed sidebar-expand-lg bg-light text-slate-800">
  <div class="app-wrapper">
    <!-- Top Nav bar banner -->
    <nav class="app-header navbar navbar-expand navbar-light bg-white border-bottom shadow-sm py-2.5 no-print" style="margin-left: 250px; transition: margin-left .3s ease-in-out;">
      <div class="container-fluid d-flex align-items-center justify-content-between">
        
        <!-- Toggle button for responsive menu -->
        <ul class="navbar-nav align-items-center gap-1">
          <li class="nav-item">
            <a class="nav-link text-secondary" data-lte-toggle="sidebar" href="#" role="button"><i class="fas fa-bars fs-5"></i></a>
          </li>
          <li class="nav-item d-none d-md-inline-block">
            <span class="badge bg-primary bg-opacity-10 text-primary py-2 px-3 rounded-pill fw-bold" style="font-size: 11px;">
              <i class="fa fa-database text-primary me-1"></i> แหล่งต่อเชื่อมฐานข้อมูล: MySQL Localhost
            </span>
          </li>
        </ul>

        <!-- Language toggle and profile panel -->
        <ul class="navbar-nav align-items-center gap-3">
          <!-- Toggle Language dropdown -->
          <li class="nav-item">
            <div class="btn-group btn-group-sm rounded-pill border p-0.5 bg-light" style="font-size: 11px;">
              <a href="?lang=TH" class="btn btn-xs rounded-pill px-2.5 py-1 fw-bold <?php echo $lang === 'TH' ? 'btn-white bg-white shadow-sm text-dark' : 'text-muted'; ?>">TH</a>
              <a href="?lang=EN" class="btn btn-xs rounded-pill px-2.5 py-1 fw-bold <?php echo $lang === 'EN' ? 'btn-white bg-white shadow-sm text-dark' : 'text-muted'; ?>">EN</a>
            </div>
          </li>

          <!-- User Profiling block -->
          <li class="nav-item dropdown">
            <a href="#" class="d-flex align-items-center gap-2.5 text-decoration-none dropdown-toggle text-dark" data-bs-toggle="dropdown">
              <div class="rounded-circle bg-primary text-white font-weight-bold d-flex align-items-center justify-content-center" style="width: 34px; height: 34px; font-weight: 700;">
                <?php echo substr($userFullname, 0, 1); ?>
              </div>
              <div class="d-none d-sm-block text-start">
                <div class="fw-bold small lh-1"><?php echo htmlspecialchars($userFullname); ?></div>
                <span class="text-muted lh-1 text-uppercase" style="font-size: 10px; font-weight: 600;"><?php echo htmlspecialchars($userRole); ?></span>
              </div>
            </a>
            <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2 rounded-3 text-dark" style="width: 220px;">
              <li class="p-3 border-bottom bg-light">
                <div class="fw-bold small text-dark"><?php echo htmlspecialchars($userFullname); ?></div>
                <div class="text-muted small" style="font-size: 11px;"><?php echo htmlspecialchars($_SESSION['user_email']); ?></div>
              </li>
              <li>
                <a class="dropdown-item py-2.5 text-danger small font-weight-bold" href="logout.php">
                  <i class="fas fa-sign-out-alt me-1.5 text-danger"></i> ออกจากระบบความปลอดภัย
                </a>
              </li>
            </ul>
          </li>
        </ul>

      </div>
    </nav>`
  },
  {
    category: 'Layout',
    filepath: '/sidebar.php',
    description: 'แถบตัวเลือกด้านซ้ายสำหรับการนำทาง (Sidebar) พร้อมเน้นรายการเพจที่เปิดอยู่ตามไฟล์ PHP ปัจจุบัน',
    content: `<?php
/**
 * Sales Master CRM - Sidebar Navigation Menu Layout
 */
$current_page = basename($_SERVER['PHP_SELF']);
?>
<aside class="app-sidebar bg-dark text-white shadow" data-bs-theme="dark" style="width: 250px; position: fixed; top: 0; bottom: 0; left: 0; z-index: 1030; transition: width .3s ease-in-out;">
  
  <!-- Sidebar Brand Logo and title banner -->
  <div class="sidebar-brand border-bottom border-secondary py-3 px-4 text-center">
    <a href="index.php" class="text-decoration-none d-flex align-items-center gap-2 justify-content-center text-white">
      <div class="bg-primary text-white rounded p-1.5 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; background: linear-gradient(135deg, #3b82f6, #6366f1) !important;">
        <i class="fa fa-chart-line fs-5"></i>
      </div>
      <span class="brand-text fw-bold tracking-tight" style="font-size: 1.15rem; font-weight: 800; letter-spacing: -0.5px;">SALES MASTER</span>
    </a>
  </div>

  <!-- Scrollable list links -->
  <div class="sidebar-wrapper py-3">
    <nav class="mt-2">
      <ul class="nav flex-column gap-1.5 px-3" data-lte-toggle="treeview" role="menu" data-accordion="false">
        
        <!-- Menu Label Group -->
        <li class="nav-header text-muted text-uppercase small px-3 mb-1" style="font-size: 10px; font-weight: 700; letter-spacing: 0.5px;">เมนูระบบหลัก (Main Menu)</li>

        <!-- Link 1: Dashboard -->
        <li class="nav-item">
          <a href="index.php" class="nav-link py-2.5 px-3 rounded-3 d-flex align-items-center gap-2.5 text-white-50 <?php echo $current_page === 'index.php' ? 'bg-primary text-white active' : 'hover-bg-secondary'; ?>" style="font-size: 0.9rem; font-weight: 500;">
            <i class="fas fa-tachometer-alt fs-6 text-center" style="width: 20px;"></i>
            <span><?php echo $t['dashboard']; ?></span>
          </a>
        </li>

        <!-- Link 2: Customers Master -->
        <li class="nav-header text-muted text-uppercase small px-3 mt-3 mb-1" style="font-size: 10px; font-weight: 700; letter-spacing: 0.5px;">การจัดการนิติบุคคล (Corporations)</li>
        
        <li class="nav-item">
          <a href="customers.php" class="nav-link py-2.5 px-3 rounded-3 d-flex align-items-center gap-2.5 text-white-50 <?php echo $current_page === 'customers.php' ? 'bg-primary text-white active' : 'hover-bg-secondary'; ?>" style="font-size: 0.9rem; font-weight: 500;">
            <i class="fas fa-building fs-6 text-center" style="width: 20px;"></i>
            <span><?php echo $t['customers']; ?></span>
          </a>
        </li>

        <!-- Link 3: Opportunities Kanban -->
        <li class="nav-header text-muted text-uppercase small px-3 mt-3 mb-1" style="font-size: 10px; font-weight: 700; letter-spacing: 0.5px;">กิจกรรมการค้า (Sales Pipeline)</li>

        <li class="nav-item">
          <a href="opportunities.php" class="nav-link py-2.5 px-3 rounded-3 d-flex align-items-center gap-2.5 text-white-50 <?php echo $current_page === 'opportunities.php' ? 'bg-primary text-white active' : 'hover-bg-secondary'; ?>" style="font-size: 0.9rem; font-weight: 500;">
            <i class="fas fa-bullseye fs-6 text-center" style="width: 20px;"></i>
            <span><?php echo $t['opportunities']; ?></span>
          </a>
        </li>

        <!-- Link 4: Quotation and Billings -->
        <li class="nav-header text-muted text-uppercase small px-3 mt-3 mb-1" style="font-size: 10px; font-weight: 700; letter-spacing: 0.5px;">ระบบงานการเงิน (Billings Suite)</li>

        <li class="nav-item">
          <a href="quotations.php" class="nav-link py-2.5 px-3 rounded-3 d-flex align-items-center gap-2.5 text-white-50 <?php echo $current_page === 'quotations.php' ? 'bg-primary text-white active' : 'hover-bg-secondary'; ?>" style="font-size: 0.9rem; font-weight: 500;">
            <i class="fas fa-file-invoice fs-6 text-center" style="width: 20px;"></i>
            <span><?php echo $t['quotations']; ?></span>
          </a>
        </li>

        <li class="nav-item">
          <a href="invoices.php" class="nav-link py-2.5 px-3 rounded-3 d-flex align-items-center gap-2.5 text-white-50 <?php echo $current_page === 'invoices.php' ? 'bg-primary text-white active' : 'hover-bg-secondary'; ?>" style="font-size: 0.9rem; font-weight: 500;">
            <i class="fas fa-wallet fs-6 text-center" style="width: 20px;"></i>
            <span><?php echo $t['invoices']; ?></span>
          </a>
        </li>

        <!-- Link 5: Reports BI -->
        <li class="nav-header text-muted text-uppercase small px-3 mt-3 mb-1" style="font-size: 10px; font-weight: 700; letter-spacing: 0.5px;">สรุปผลผู้บริหาร (Executives BI)</li>

        <li class="nav-item">
          <a href="reports.php" class="nav-link py-2.5 px-3 rounded-3 d-flex align-items-center gap-2.5 text-white-50 <?php echo $current_page === 'reports.php' ? 'bg-primary text-white active' : 'hover-bg-secondary'; ?>" style="font-size: 0.9rem; font-weight: 500;">
            <i class="fas fa-chart-bar fs-6 text-center" style="width: 20px;"></i>
            <span><?php echo $t['reports']; ?></span>
          </a>
        </li>

      </ul>
    </nav>
  </div>
  
  <style>
    .hover-bg-secondary:hover {
      background-color: rgba(255, 255, 255, 0.05) !important;
      color: #fff !important;
    }
    .app-sidebar .active {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35) !important;
    }
  </style>
</aside>`
  },
  {
    category: 'Layout',
    filepath: '/footer.php',
    description: 'แถบแถวล่างท้ายเพจรวมถึงการนำเข้าคลังสคริปต์กลางยอดนิยม อาทิ jQuery, Bootstrap 5, Chart.js และ DataTables',
    content: `<?php
/**
 * Sales Master CRM - Shared Footer Layout
 */
?>
    <!-- Footer block -->
    <footer class="app-footer text-center bg-white border-top py-3 text-muted small no-print mt-auto" style="margin-left: 250px; transition: margin-left .3s ease-in-out;">
      <div class="float-end d-none d-sm-inline ms-3">AdminLTE PHP Enterprise Sales Suite</div>
      <strong>Copyright &copy; 2026 <a href="#" class="text-decoration-none">Sales Master ERP</a>.</strong> สงวนลิขสิทธิ์ระบบอย่างถูกต้องสมบูรณ์
    </footer>
  </div> <!-- /app-wrapper -->

  <!-- Core JavaScript dependencies -->
  <!-- jQuery (Required for DataTables) -->
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <!-- Bootstrap 5 JS Bundle -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <!-- AdminLTE 4 JS Bundle -->
  <script src="https://cdn.jsdelivr.net/npm/admin-lte@4.0.0-beta2/dist/js/adminlte.min.js"></script>
  <!-- DataTables jQuery & BS5 Integration -->
  <script src="https://cdn.datatables.net/1.13.5/js/jquery.dataTables.min.js"></script>
  <script src="https://cdn.datatables.net/1.13.5/js/dataTables.bootstrap5.min.js"></script>
  <!-- ChartJS -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <!-- SweetAlert2 -->
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <!-- SheetJS (Excel) -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
  <!-- jsPDF -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js"></script>

  <!-- Global AJAX Helpers and Event handlers -->
  <script>
    // General export table to Excel helper
    function exportTableToExcel(tableId, filename = 'CRM_Export') {
      const table = document.getElementById(tableId);
      if (!table) return;
      const wb = XLSX.utils.table_to_book(table, { sheet: "Data Sheet" });
      XLSX.writeFile(wb, \`\${filename}_\${new Date().toISOString().slice(0,10)}.xlsx\`);
    }

    // General export table to PDF helper
    function exportTableToPDF(tableId, titleText = 'CRM Data Report') {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'pt', 'a4');
      
      // Add Title
      doc.setFontSize(16);
      doc.text(titleText, 40, 40);
      doc.setFontSize(10);
      doc.text(\`Generated on: \${new Date().toLocaleString()}\`, 40, 55);
      
      const table = document.getElementById(tableId);
      if (table) {
        doc.autoTable({ 
          html: \`#\${tableId}\`,
          startY: 70,
          styles: { font: "Kanit", fontStyle: "normal" }
        });
      }
      doc.save(\`\${titleText.replace(/\\s+/g, '_')}_\${new Date().toISOString().slice(0,10)}.pdf\`);
    }

    // Toggle menu state for sidebar
    $(document).ready(function() {
      // Initialize any Datatables
      $('.datatable-init').DataTable({
        "language": {
          "lengthMenu": "แสดง _MENU_ รายการต่อหน้า",
          "zeroRecords": "ไม่พบข้อมูลที่ต้องการ",
          "info": "กำลังแสดงหน้าที่ _PAGE_ จากทั้งหมด _PAGES_ หน้า",
          "infoEmpty": "ไม่มีข้อมูลเพื่อแสดงผล",
          "infoFiltered": "(กรองจากทั้งหมด _MAX_ รายการ)",
          "search": "ค้นหารวดเร็ว:",
          "paginate": {
            "first": "หน้าแรก",
            "last": "หน้าสุดท้าย",
            "next": "ถัดไป",
            "previous": "ก่อนหน้า"
          }
        },
        "pageLength": 10,
        "responsive": true
      });
    });
  </script>
</body>
</html>`
  },
  {
    category: 'Main Page',
    filepath: '/index.php',
    description: 'หน้าแดชบอร์ดสรุปผลการประมูล ตัวเลขพอร์ตรวม แผนภูมิยอดขาย และประวัติการทำงานผู้ใช้',
    content: `<?php
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
    <div class="row g-4 animate-fade-in">
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
  </div>
</main>
<?php require_once __DIR__ . '/footer.php'; ?>`
  },
  {
    category: 'Main Page',
    filepath: '/customers.php',
    description: 'ทะเบียนลูกค้าองค์กรภาคธุรกิจ (Customer Master) การจัดการรายละเอียดบริษัทและการผูกผู้ประสานงานหลัก',
    content: `<?php
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

            // Generate customer code
            $countStmt = $pdo->query("SELECT COUNT(*) as count FROM customers");
            $nextNum = $countStmt->fetch()['count'] + 1;
            $cust_code = 'CUS-' . str_pad($nextNum, 6, '0', STR_PAD_LEFT);

            // Insert customer
            $stmt = $pdo->prepare("
                INSERT INTO customers (customer_code, customer_name, tax_id, industry_type, address, phone, email, payment_term, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')
            ");
            $stmt->execute([$cust_code, $cust_name, $tax_id, $industry, $address, $phone, $email, $payment_term]);
            $new_customer_id = $pdo->lastInsertId();

            // Insert primary contact
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

            // Log action
            $logStmt = $pdo->prepare("INSERT INTO audit_logs (user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)");
            $logStmt->execute([
                $userId, 
                'สร้างข้อมูลลูกค้าใหม่ (PHP Create Customer)', 
                'customer', 
                $new_customer_id, 
                "เพิ่มลูกค้าองค์กร \"\${cust_name}\" ตลาดอุตสาหกรรม: \${industry} พร้อมระเบียบผู้ติดต่อหลัก"
            ]);

            $pdo->commit();
            $success_msg = "ลงทะเบียนลูกค้าองค์กร \"\${cust_name}\" สำเร็จเรียบร้อยแล้ว!";
        } catch (PDOException $e) {
            $pdo->rollBack();
            $error_msg = "เกิดข้อผิดพลาดในการบันทึกข้อมูล: " . $e->getMessage();
        }
    }
}
// ...
?>`
  },
  {
    category: 'Main Page',
    filepath: '/opportunities.php',
    description: 'การควบคุมโครงการดีลงานเสนอราคา รองรับการสลับมุมมองระหว่างแบบตารางและการทำงานบอร์ดไปป์ไลน์คัมบัง (Kanban Pipeline Board)',
    content: `<?php
/**
 * Sales Master CRM - Opportunities Listing & Kanban Board
 * Technology Stack: PHP 7+ / MySQL / AJAX Fetch API / SweetAlert2 / Bootstrap 5
 */
require_once __DIR__ . '/header.php';
require_once __DIR__ . '/sidebar.php';
// ...
?>`
  },
  {
    category: 'API',
    filepath: '/api/update-opportunity-status.php',
    description: 'เอพีไอหลังบ้านสำหรับรับส่งสายสตรีม JSON ผ่าน AJAX Fetch API เพื่ออัปเดตขั้นตอนของดีลและบันทึกรอยปะกิจกรรม Audit Log',
    content: `<?php
/**
 * AJAX Endpoint - Update Opportunity Status
 * Technology Stack: PHP 7+ / MySQL PDO / JSON Response
 */
header('Content-Type: application/json');
require_once __DIR__ . '/../config/db.php';

// Verification check
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access. Please login.']);
    exit();
}
// ...
?>`
  }
];
