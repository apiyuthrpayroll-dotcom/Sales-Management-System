<?php
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

// Get JSON post body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if ($data && isset($data['id']) && isset($data['status'])) {
    $oppId = intval($data['id']);
    $newStatus = trim($data['status']);
    $userId = $_SESSION['user_id'];

    // Verify allowed statuses
    $allowedStatuses = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost', 'Cancelled'];
    if (!in_array($newStatus, $allowedStatuses)) {
        echo json_encode(['success' => false, 'message' => 'Invalid status value.']);
        exit();
    }

    try {
        $pdo->beginTransaction();

        // Get opportunity detail for logging
        $oppStmt = $pdo->prepare("SELECT project_name, status, opportunity_no FROM opportunities WHERE id = ?");
        $oppStmt->execute([$oppId]);
        $opp = $oppStmt->fetch();

        if (!$opp) {
            echo json_encode(['success' => false, 'message' => 'Opportunity not found.']);
            exit();
        }

        // Update status
        $updateStmt = $pdo->prepare("UPDATE opportunities SET status = ?, updated_by = ? WHERE id = ?");
        $updateStmt->execute([$newStatus, $userId, $oppId]);

        // Insert audit log
        $logStmt = $pdo->prepare("INSERT INTO audit_logs (user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)");
        $logStmt->execute([
            $userId,
            'เปลี่ยนสถานะโอกาสขาย (Status Updated)',
            'opportunity',
            $oppId,
            "เปลี่ยนสถานะดีล \"{$opp['project_name']}\" ({$opp['opportunity_no']}) จาก [{$opp['status']}] เป็น [{$newStatus}] ผ่าน AJAX Fetch"
        ]);

        $pdo->commit();
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid inputs provided.']);
}
?>
