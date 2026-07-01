<?php
/**
 * Sales Master CRM - Enterprise Login Portal
 * Technology Stack: PHP 7+ / MySQL / Session
 */
require_once __DIR__ . '/config/db.php';

// Redirect if already logged in
if (isset($_SESSION['user_email'])) {
    header('Location: index.php');
    exit();
}

$error_msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);

    if (!empty($email) && !empty($password)) {
        try {
            // Find user by email
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if ($user) {
                // For simplicity and seeding compatibility: Allow raw comparison of 'crm123456' OR standard password_verify
                $isPasswordCorrect = false;
                if ($password === 'crm123456' || password_verify($password, $user['password'])) {
                    $isPasswordCorrect = true;
                }

                if ($isPasswordCorrect) {
                    // Check status
                    if ($user['status'] === 'Active') {
                        // Store in session
                        $_SESSION['user_id'] = $user['id'];
                        $_SESSION['username'] = $user['username'];
                        $_SESSION['user_fullname'] = $user['fullname'];
                        $_SESSION['user_role'] = $user['role'];
                        $_SESSION['user_email'] = $user['email'];
                        $_SESSION['lang'] = 'TH'; // Default to Thai

                        // Log this action to audit trail
                        $logStmt = $pdo->prepare("INSERT INTO audit_logs (user_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)");
                        $logStmt->execute([
                            $user['id'], 
                            'เข้าสู่ระบบ (PHP Session Login)', 
                            'system', 
                            '0', 
                            "ผู้ใช้งาน " . $user['fullname'] . " ได้เข้าสู่ระบบผ่าน PHP + MySQL ในระบบนิเวศ ERP"
                        ]);

                        header('Location: index.php');
                        exit();
                    } else {
                        $error_msg = 'บัญชีผู้ใช้งานนี้ถูกระงับการใช้งานชั่วคราว!';
                    }
                } else {
                    $error_msg = 'รหัสผ่านไม่ถูกต้อง! (รหัสผ่านเริ่มต้นคือ crm123456)';
                }
            } else {
                $error_msg = 'ไม่พบบัญชีผู้ใช้งานที่ลงทะเบียนด้วยอีเมลนี้!';
            }
        } catch (PDOException $e) {
            $error_msg = 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล: ' . $e->getMessage();
        }
    } else {
        $error_msg = 'กรุณากรอกข้อมูลอีเมลและรหัสผ่านให้ครบถ้วน!';
    }
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>เข้าสู่ระบบ - Sales Master CRM</title>

  <!-- Google Font -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600&family=Source+Sans+3:wght@300;400;600;700&display=swap">
  <!-- Font Awesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <!-- Bootstrap 5 CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
  <!-- AdminLTE 4 CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/admin-lte@4.0.0-beta2/dist/css/adminlte.min.css">
  
  <style>
    body {
      font-family: 'Kanit', sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
    }
    .login-card {
      border: none;
      border-radius: 1.25rem;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
      width: 100%;
      max-width: 450px;
      color: #fff;
    }
    .form-control {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      border-radius: 0.5rem;
      padding: 0.75rem 1rem;
    }
    .form-control:focus {
      background: rgba(255, 255, 255, 0.15);
      border-color: #3b82f6;
      box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.25);
      color: #fff;
    }
    .form-control::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
    .btn-login {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      border: none;
      color: white;
      font-weight: 600;
      padding: 0.75rem;
      border-radius: 0.5rem;
      transition: all 0.3s;
    }
    .btn-login:hover {
      opacity: 0.95;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
    }
  </style>
</head>
<body>

  <div class="card login-card p-4 m-3">
    <div class="text-center mb-4">
      <div class="bg-primary text-white rounded-circle p-3 d-inline-flex align-items-center justify-content-center mb-3" style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6, #6366f1) !important;">
        <i class="fa fa-chart-line fs-3"></i>
      </div>
      <h3 class="fw-bold m-0" style="letter-spacing: -0.5px;">SALES MASTER CRM</h3>
      <p class="text-white-50 small mt-1">ระบบจัดการลูกค้าสัมพันธ์และวิเคราะห์การขายแบบครบวงจร</p>
    </div>

    <?php if (!empty($error_msg)): ?>
      <div class="alert alert-danger border-0 bg-danger bg-opacity-20 text-white p-3 rounded-3 small mb-4" role="alert">
        <i class="fa fa-exclamation-circle me-1.5"></i> <?php echo htmlspecialchars($error_msg); ?>
      </div>
    <?php endif; ?>

    <form method="POST" action="">
      <div class="mb-3">
        <label for="email" class="form-label small text-white-50">ที่อยู่อีเมลเข้าใช้งาน (Email Address)</label>
        <div class="input-group">
          <span class="input-group-text bg-transparent border-end-0 text-white-50" style="border-color: rgba(255, 255, 255, 0.2);"><i class="fa fa-envelope"></i></span>
          <input type="email" class="form-control border-start-0" id="email" name="email" placeholder="example@ikm-testing.co.th" required value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>">
        </div>
      </div>

      <div class="mb-4">
        <label for="password" class="form-label small text-white-50">รหัสผ่าน (Password)</label>
        <div class="input-group">
          <span class="input-group-text bg-transparent border-end-0 text-white-50" style="border-color: rgba(255, 255, 255, 0.2);"><i class="fa fa-lock"></i></span>
          <input type="password" class="form-control border-start-0" id="password" name="password" placeholder="••••••••" required>
        </div>
      </div>

      <button type="submit" class="btn btn-login w-100 mb-3">เข้าสู่ระบบการทำงาน</button>
    </form>

    <div class="text-center border-top border-white border-opacity-10 pt-3">
      <p class="text-white-50 mb-1" style="font-size: 0.8rem;">ผู้ใช้งานระบบทดลอง:</p>
      <div class="badge bg-white bg-opacity-10 p-2 font-monospace text-warning rounded-3" style="font-size: 0.75rem; border: 1px solid rgba(255, 255, 255, 0.1);">
        User: Apiyut.noeikhiaw@th.ikm.com<br>Pass: crm123456
      </div>
    </div>
  </div>

  <!-- Bootstrap JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
