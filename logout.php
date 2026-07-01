<?php
/**
 * Sales Master CRM - Logout Action Handler
 */
require_once __DIR__ . '/config/db.php';

if (isset($_SESSION['user_id'])) {
    try {
        // Log logout action before destroying session
        $logStmt = $pdo->prepare("INSERT INTO audit_logs (user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)");
        $logStmt->execute([
            $_SESSION['user_id'], 
            'ออกจากระบบ (PHP Logout)', 
            'system', 
            '0', 
            "ผู้ใช้งาน " . $_SESSION['user_fullname'] . " ได้ออกจากระบบเป็นที่เรียบร้อย"
        ]);
    } catch (PDOException $e) {
        // Fail silently
    }
}

// Clear all session data
$_SESSION = [];
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["html_only"]
    );
}
session_destroy();

// Redirect to login page
header("Location: login.php");
exit();
?>
