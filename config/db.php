<?php
/**
 * Sales Master CRM - Enterprise Database Connection Config
 * Technology Stack: PHP 7+ / MySQL (PDO)
 */

define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'sales_master_crm');

try {
    // Establish PDO Connection with UTF-8 support and Best Practice attributes
    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    // In production, log error and show friendly message. In dev, display message.
    error_log("Database Connection Failed: " . $e->getMessage());
    die("เชื่อมต่อฐานข้อมูลล้มเหลว: " . $e->getMessage());
}

// Start Session globally
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
