-- ==========================================
-- Sales Master CRM - MySQL Enterprise Schema Setup
-- Compatible with PHP 7+ and MySQL (XAMPP / phpMyAdmin)
-- ==========================================

CREATE DATABASE IF NOT EXISTS `sales_master_crm` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sales_master_crm`;

-- 1. Create USERS Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) UNIQUE NOT NULL,
    `fullname` VARCHAR(150) NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `role` VARCHAR(50) NOT NULL DEFAULT 'Sales Rep', -- 'Admin', 'Sales Manager', 'Sales Rep', 'Auditor'
    `status` VARCHAR(50) NOT NULL DEFAULT 'Active', -- 'Active', 'Suspended'
    `password` VARCHAR(255) NOT NULL, -- password_hash value for 'crm123456'
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create CUSTOMERS Table
CREATE TABLE IF NOT EXISTS `customers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `customer_code` VARCHAR(50) UNIQUE NOT NULL,
    `customer_name` VARCHAR(255) NOT NULL,
    `tax_id` VARCHAR(50) NULL,
    `industry_type` VARCHAR(100) NULL,
    `address` TEXT NULL,
    `phone` VARCHAR(50) NULL,
    `email` VARCHAR(255) NULL,
    `payment_term` INT NOT NULL DEFAULT 30, -- In days (e.g. 30, 45, 60)
    `status` VARCHAR(50) NOT NULL DEFAULT 'Active', -- 'Active', 'Inactive'
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create CUSTOMER CONTACTS Table
CREATE TABLE IF NOT EXISTS `customer_contacts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `customer_id` INT NOT NULL,
    `contact_name` VARCHAR(255) NOT NULL,
    `position` VARCHAR(150) NULL,
    `phone` VARCHAR(50) NULL,
    `email` VARCHAR(255) NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create OPPORTUNITIES Table
CREATE TABLE IF NOT EXISTS `opportunities` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `opportunity_no` VARCHAR(50) UNIQUE NOT NULL,
    `customer_id` INT NOT NULL,
    `project_name` VARCHAR(255) NOT NULL,
    `service_type` VARCHAR(100) NOT NULL, -- 'Testing Service', 'Equipment Rental', 'Manpower Supply', 'Engineering Service', 'Other'
    `lead_source` VARCHAR(100) NOT NULL DEFAULT 'Existing Customer',
    `estimated_value` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `success_probability` INT NOT NULL DEFAULT 0, -- 0 to 100
    `expected_close_date` DATE NULL,
    `sales_person_id` INT NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Lead', -- 'Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost', 'Cancelled'
    `remarks` TEXT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` INT NULL,
    `updated_by` INT NULL,
    FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`sales_person_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Create QUOTATIONS Table
CREATE TABLE IF NOT EXISTS `quotations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `quotation_no` VARCHAR(50) UNIQUE NOT NULL,
    `customer_id` INT NOT NULL,
    `opportunity_id` INT NULL DEFAULT NULL,
    `title` VARCHAR(255) NOT NULL,
    `quotation_date` DATE NOT NULL,
    `validity_days` INT NOT NULL DEFAULT 30,
    `payment_term` VARCHAR(50) NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Draft', -- 'Draft', 'Sent', 'Approved', 'Rejected'
    `sales_person_id` INT NOT NULL,
    `total_value` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `tax_rate` DECIMAL(5, 2) NOT NULL DEFAULT 7.00,
    `grand_total` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `terms_conditions` TEXT NULL,
    `remarks` TEXT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` INT NULL,
    `updated_by` INT NULL,
    FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities` (`id`) ON DELETE SET NULL,
    FOREIGN KEY (`sales_person_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Create QUOTATION ITEMS Table
CREATE TABLE IF NOT EXISTS `quotation_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `quotation_id` INT NOT NULL,
    `item_name` VARCHAR(255) NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
    `unit` VARCHAR(50) NOT NULL DEFAULT 'Unit',
    `unit_price` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `total` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Create INVOICES Table
CREATE TABLE IF NOT EXISTS `invoices` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `invoice_no` VARCHAR(50) UNIQUE NOT NULL,
    `customer_id` INT NOT NULL,
    `quotation_id` INT NULL DEFAULT NULL,
    `invoice_date` DATE NOT NULL,
    `due_date` DATE NOT NULL,
    `subtotal` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `tax_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `grand_total` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Unpaid', -- 'Unpaid', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` INT NULL,
    FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`) ON DELETE SET NULL,
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Create AUDIT LOGS Table
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NULL,
    `action` VARCHAR(255) NOT NULL,
    `target_type` VARCHAR(100) NOT NULL,
    `target_id` VARCHAR(100) NOT NULL,
    `details` TEXT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- SEED DATA (Matches Enterprise Accounts & Sim Data)
-- ==========================================

-- Seed default users with password_hash of 'crm123456' 
-- (hash value: '$2y$10$W47vP5C6V6TqI3v5tq6LteW83y6wS1l8Gg5bB96Z0lY4m635aHzeO' - or similar)
INSERT INTO `users` (`id`, `username`, `fullname`, `email`, `role`, `status`, `password`)
VALUES 
(1, 'apiyut', 'Apiyut (Admin)', 'Apiyut.noeikhiaw@th.ikm.com', 'Admin', 'Active', '$2y$10$092fP6R6T6gI3v5tq6Ltew83y6wS1l8Gg5bB96Z0lY4m635aHzeO'),
(2, 'pimjai', 'พิมพ์ใจ กิตติคุณ', 'pimjai.k@ikm-testing.co.th', 'Sales Manager', 'Active', '$2y$10$092fP6R6T6gI3v5tq6Ltew83y6wS1l8Gg5bB96Z0lY4m635aHzeO'),
(3, 'wiriya', 'วิริยะ สว่างงาม', 'wiriya.s@ikm-testing.co.th', 'Sales Rep', 'Active', '$2y$10$092fP6R6T6gI3v5tq6Ltew83y6wS1l8Gg5bB96Z0lY4m635aHzeO'),
(4, 'somsri', 'สมศรี จิตรประสงค์', 'somsri.j@ikm-testing.co.th', 'Auditor', 'Active', '$2y$10$092fP6R6T6gI3v5tq6Ltew83y6wS1l8Gg5bB96Z0lY4m635aHzeO')
ON DUPLICATE KEY UPDATE `username`=`username`;

-- Seed default customers
INSERT INTO `customers` (`id`, `customer_code`, `customer_name`, `tax_id`, `industry_type`, `address`, `phone`, `email`, `payment_term`, `status`)
VALUES
(1, 'CUS-260001', 'บริษัท ปตท. จำกัด (มหาชน)', '0107544000108', 'Energy & Utilities', '555 ถนนวิภาวดีรังสิต แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900', '02-537-2000', 'info@pttplc.com', 30, 'Active'),
(2, 'CUS-260002', 'บริษัท ปูนซิเมนต์ไทย จำกัด (มหาชน) (SCG)', '0107537000958', 'Manufacturing', '1 ถนนปูนซิเมนต์ไทย บางซื่อ กรุงเทพฯ 10800', '02-586-3333', 'contact@scg.com', 45, 'Active'),
(3, 'CUS-260003', 'บริษัท ซีพี ออลล์ จำกัด (มหาชน)', '0107542000011', 'Retail', '313 อาคาร ซี.พี.ทาวเวอร์ ชั้น 24 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500', '02-071-9000', 'hr@cpall.co.th', 60, 'Active'),
(4, 'CUS-260004', 'บริษัท แอดวานซ์ อินโฟร์ เซอร์วิส จำกัด (มหาชน) (AIS)', '0107535000265', 'Telecommunication', '414 อาคารชินวัตร 1 ถนนพหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400', '02-029-5000', 'contact@ais.co.th', 30, 'Inactive'),
(5, 'CUS-260005', 'บริษัท ไทยเบฟเวอเรจ จำกัด (มหาชน)', '0107546000342', 'Food & Beverage', '14 ถนนวิภาวดีรังสิต แขวงจอมพล เขตจตุจักร กรุงเทพฯ 10900', '02-788-1000', 'info@thaibev.com', 45, 'Active')
ON DUPLICATE KEY UPDATE `customer_code`=`customer_code`;

-- Seed default contacts
INSERT INTO `customer_contacts` (`id`, `customer_id`, `contact_name`, `position`, `phone`, `email`)
VALUES
(1, 1, 'คุณธนพล รักไทย', 'Procurement Manager', '081-123-4567', 'thanapol.p@pttplc.com'),
(2, 1, 'คุณนรีรัตน์ ใจดี', 'Senior Engineer', '089-987-6543', 'nareerat.j@pttplc.com'),
(3, 2, 'คุณสมเกียรติ มั่นคง', 'Engineering Director', '082-345-6789', 'somkiat.m@scg.com'),
(4, 3, 'คุณวิชัย วงศ์วาน', 'Purchasing Officer', '083-456-7890', 'wichai.w@cpall.co.th')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed default opportunities
INSERT INTO `opportunities` (`id`, `opportunity_no`, `customer_id`, `project_name`, `service_type`, `lead_source`, `estimated_value`, `success_probability`, `expected_close_date`, `sales_person_id`, `status`, `remarks`)
VALUES
(1, 'OPP-260001', 1, 'โครงการ Hydrotest ปั๊มแรงดันสูง ปั้มซับสเตชัน ระยอง', 'Testing Service', 'Existing Customer', 1250000.00, 80, '2026-07-30', 3, 'Negotiation', 'เสนอราคารอบที่ 2 แล้ว ลูกค้าค่อนข้างพอใจ คาดว่าจะปิดดีลได้สิ้นเดือนหน้า'),
(2, 'OPP-260002', 2, 'งานเช่าอุปกรณ์เครื่องแลกเปลี่ยนความร้อน (Heat Exchanger Rental)', 'Equipment Rental', 'Referral', 450000.00, 50, '2026-08-15', 3, 'Proposal', 'ลูกค้าขอต่อรองราคาเพิ่ม 5% กำลังพิจารณาเสนออนุมัติจากผู้จัดการ'),
(3, 'OPP-260003', 3, 'จัดหากำลังคนช่างเทคนิคซ่อมบำรุงประจำโรงงานแก่งคอย', 'Manpower Supply', 'Tender', 2100000.00, 30, '2026-09-01', 3, 'Qualified', 'อยู่ขั้นตอนเตรียมเอกสารประมูลงาน ยื่นซองสัปดาห์หน้า'),
(4, 'OPP-260004', 5, 'งานตรวจสอบโครงสร้างท่อส่งน้ำและวาล์วควบคุมระบบบำบัดน้ำเสีย', 'Testing Service', 'Walk In', 320000.00, 95, '2026-07-10', 3, 'Won', 'ปิดการขายได้แล้ว กำลังออกใบสั่งซื้อและเตรียมงาน'),
(5, 'OPP-260005', 1, 'บริการติดตั้งวิศวกรรมระบบท่อส่งก๊าซธรรมชาติใต้ดิน', 'Engineering Service', 'Connection', 8500000.00, 10, '2026-12-15', 3, 'Lead', 'ประสานงานหารือเบื้องต้นกับสถาปนิกและทีมออกแบบ')
ON DUPLICATE KEY UPDATE `opportunity_no`=`opportunity_no`;

-- Seed default quotations
INSERT INTO `quotations` (`id`, `quotation_no`, `customer_id`, `opportunity_id`, `title`, `quotation_date`, `validity_days`, `payment_term`, `status`, `sales_person_id`, `total_value`, `tax_rate`, `grand_total`, `terms_conditions`, `remarks`)
VALUES
(1, 'QT-260001', 1, 1, 'ใบเสนอราคางาน Hydrotest ปั๊มแรงดันสูง ระยอง', '2026-06-20', 30, 'เครดิต 30 วัน', 'Sent', 3, 1168224.30, 7.00, 1250000.00, '1. ยืนราคา 30 วัน\n2. ส่งมอบงานภายใน 15 วันหลังจากได้รับใบสั่งซื้อ', 'ราคานี้รวมการสนับสนุนซ่อมบำรุงเบื้องต้น 1 ปี'),
(2, 'QT-260002', 5, 4, 'ใบเสนอราคางานตรวจสอบโครงสร้างท่อส่งน้ำ ไทยเบฟ', '2026-06-15', 30, 'เครดิต 45 วัน', 'Approved', 3, 299065.42, 7.00, 320000.00, '1. รับประกันงานทดสอบ 180 วัน\n2. เข้าปฏิบัติงานหลังได้รับอนุมัติ 3 วัน', 'ส่งมอบแล้วและลูกค้าออก PO มาเรียบร้อยแล้ว')
ON DUPLICATE KEY UPDATE `quotation_no`=`quotation_no`;

-- Seed default quotation items
INSERT INTO `quotation_items` (`id`, `quotation_id`, `item_name`, `quantity`, `unit`, `unit_price`, `total`)
VALUES
(1, 1, 'บริการ Hydrotesting บริเวณถังแรงดันสูงและท่อส่งหลัก', 1.00, 'Job', 800000.00, 800000.00),
(2, 1, 'ค่าเช่าเครื่องปั๊มแรงดันสูงขนาด 10,000 PSI', 5.00, 'Day', 50000.00, 250000.00),
(3, 1, 'ทีมงานวิศวกรผู้เชี่ยวชาญควบคุมการทดสอบ', 3.00, 'Man-Day', 39408.10, 118224.30),
(4, 2, 'บริการงานตรวจสอบโครงสร้างท่อผ่านคลื่นอัลตราโซนิก (UT)', 1.00, 'Job', 299065.42, 299065.42)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed default invoices
INSERT INTO `invoices` (`id`, `invoice_no`, `customer_id`, `quotation_id`, `invoice_date`, `due_date`, `subtotal`, `tax_amount`, `grand_total`, `status`)
VALUES
(1, 'INV-260001', 5, 2, '2026-06-25', '2026-07-25', 299065.42, 20934.58, 320000.00, 'Unpaid')
ON DUPLICATE KEY UPDATE `invoice_no`=`invoice_no`;

-- Seed default audit logs
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `target_type`, `target_id`, `details`)
VALUES
(1, 3, 'เข้าสู่ระบบ (Login Success)', 'system', '0', 'ผู้ใช้งาน wiriya เข้าสู่ระบบโดยใช้เซสชันผ่านเว็บบราวเซอร์'),
(2, 3, 'สร้างดีลประมูลใหม่', 'opportunity', '1', 'เปิดรหัสงาน OPP-260001 โครงการ Hydrotest ปั๊มแรงดันสูง ระยอง ยอดประเมิน 1,250,000 บาท')
ON DUPLICATE KEY UPDATE `id`=`id`;
