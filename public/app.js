// Common Shell Layout Injection and System Controls
document.addEventListener('DOMContentLoaded', () => {
  // 0. Check Authentication and Session Management
  const isLoginPage = window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('reset-password.html');
  const loggedInEmail = localStorage.getItem('crm_user_email');
  
  if (!loggedInEmail && !isLoginPage) {
    window.location.href = 'login.html';
    return;
  }
  if (loggedInEmail && isLoginPage) {
    window.location.href = 'index.html';
    return;
  }

  // 1. Setup shared UI shell elements dynamically to prevent code duplication
  injectSharedShell();

  // 2. Sync and bind dark mode
  initDarkMode();

  // 3. Highlight active menu items based on URL
  highlightActiveMenu();

  // 4. Update Database Connectivity UI
  syncDatabaseConnectivityIndicator();

  // 5. Initialize Language Translations (TH/EN)
  initSystemLanguage();

  // 6. Check and display notifications (Quotation nearing expiration & Overdue invoices)
  checkAndShowSystemNotifications();
});

// Sidebar & Navbar Dynamic Builder
function injectSharedShell() {
  const wrapper = document.querySelector('.wrapper');
  if (!wrapper) return;

  // Header/Navbar inject
  const existingHeader = document.querySelector('.app-header');
  if (!existingHeader) {
    const headerHtml = `
      <nav class="app-header navbar navbar-expand bg-white border-bottom shadow-sm">
        <div class="container-fluid">
          <!-- Left links -->
          <ul class="navbar-nav">
            <li class="nav-item">
              <a class="nav-link" data-lte-toggle="sidebar" href="#" role="button"><i class="fas fa-bars"></i></a>
            </li>
            <li class="nav-item d-none d-md-inline-block">
              <a href="index.html" class="nav-link" data-i18n="home"><i class="fa fa-home"></i> หน้าแรก</a>
            </li>
            <li class="nav-item d-none d-md-inline-block">
              <a href="#" class="nav-link" onclick="seedDatabaseFallback()" data-i18n="re_seed"><i class="fa fa-seedling"></i> รีเซ็ตตัวอย่าง</a>
            </li>
          </ul>

          <!-- Right links -->
          <ul class="navbar-nav ms-auto align-items-center">
            <!-- Connection Mode Toggle -->
            <li class="nav-item px-2">
              <div class="form-check form-switch m-0 d-flex align-items-center gap-1.5" title="Switch Supabase vs Local Storage Mode">
                <input class="form-check-input" type="checkbox" role="switch" id="supabaseSwitcher" style="cursor: pointer;">
                <label class="form-check-label small font-monospace fw-bold" for="supabaseSwitcher" id="db-state-lbl">DATABASE</label>
              </div>
            </li>

            <!-- Language Switcher Dropdown -->
            <li class="nav-item dropdown px-2 text-dark">
              <button class="btn btn-link nav-link p-1 dropdown-toggle d-flex align-items-center gap-1" type="button" data-bs-toggle="dropdown" aria-expanded="false" id="langDropdown" style="border:none; background:none;">
                <i class="fa fa-globe fs-5"></i> <span id="current-lang-lbl" class="small fw-bold">TH</span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow border-0" style="min-width: 130px; z-index:9999;">
                <li><a class="dropdown-item d-flex align-items-center gap-2 text-dark" href="#" onclick="switchSystemLanguage('TH')">🇹🇭 ไทย (TH)</a></li>
                <li><a class="dropdown-item d-flex align-items-center gap-2 text-dark" href="#" onclick="switchSystemLanguage('EN')">🇺🇸 English (EN)</a></li>
              </ul>
            </li>

            <!-- Dark Mode Switcher -->
            <li class="nav-item px-2">
              <button class="btn btn-link nav-link p-1" id="darkModeToggler" aria-label="Toggle Dark Mode">
                <i class="fas fa-moon fs-5"></i>
              </button>
            </li>

            <!-- User Session profile -->
            <li class="nav-item dropdown px-2">
              <a class="nav-link dropdown-toggle active fw-bold d-flex align-items-center gap-2" href="#" id="userProfileDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(localStorage.getItem('crm_user_fullname') || 'User')}&background=0d6efd&color=fff" class="rounded-circle" style="width: 28px; height: 28px;" alt="User">
                <span class="d-none d-sm-inline" id="user-role-span">${localStorage.getItem('crm_user_fullname') || 'User'} (${localStorage.getItem('crm_user_role') || 'Admin'})</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end shadow border-0" aria-labelledby="userProfileDropdown" style="z-index: 10000;">
                <li><a class="dropdown-item py-2 text-dark" href="users.html"><i class="fas fa-user-shield me-2 text-indigo"></i>ข้อมูลผู้ใช้งาน</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item py-2 text-danger" href="#" onclick="handleGlobalSignOut(event)"><i class="fas fa-sign-out-alt me-2"></i>ออกจากระบบ</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
    `;
    wrapper.insertAdjacentHTML('afterbegin', headerHtml);
  }

  // Sidebar inject
  const existingSidebar = document.querySelector('.app-sidebar');
  if (!existingSidebar) {
    const sidebarHtml = `
      <aside class="app-sidebar bg-dark text-white shadow" data-bs-theme="dark" style="height: 100vh; position: fixed; top: 0; left: 0; width: 250px; display: flex; flex-direction: column;">
        <!-- Brand logo -->
        <div class="sidebar-brand p-3 border-bottom d-flex align-items-center gap-2" style="flex-shrink: 0;">
          <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white" style="width: 32px; height: 32px; font-weight: 900; background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);">
            IKM
          </div>
          <span class="brand-text fw-bold tracking-tight text-white" style="font-size: 1.05rem;">IKM ERP CRM</span>
        </div>

        <!-- Sidebar Content -->
        <div class="sidebar-wrapper text-white" style="flex: 1; overflow-y: auto; overflow-x: hidden; margin-bottom: 70px;">
          <nav class="mt-2">
            <ul class="nav flex-column gap-1" role="menu">

              <!-- 🏠 แดชบอร์ด -->
              <li class="nav-item">
                <a href="index.html" class="nav-link px-3 py-1.8 d-flex align-items-center gap-2 rounded text-decoration-none text-white-50 hover-bg-light transition-all">
                  <i class="fas fa-chart-pie text-primary" style="font-size:0.92rem; width: 18px;"></i>
                  <span style="font-weight: 500; color: #f3f4f6; font-size: 0.82rem;">แดชบอร์ด</span>
                </a>
              </li>

              <!-- 👥 ข้อมูลลูกค้า -->
              <li class="nav-item">
                <a href="customers.html" class="nav-link px-3 py-1.8 d-flex align-items-center gap-2 rounded text-decoration-none text-white-50 hover-bg-light transition-all">
                  <i class="fas fa-users text-info" style="font-size:0.92rem; width: 18px;"></i>
                  <span style="font-weight: 500; color: #f3f4f6; font-size: 0.82rem;">ข้อมูลลูกค้า</span>
                </a>
              </li>

              <!-- 🎯 โอกาสงานขาย -->
              <li class="nav-item">
                <a href="opportunities.html" class="nav-link px-3 py-1.8 d-flex align-items-center gap-2 rounded text-decoration-none text-white-50 hover-bg-light transition-all">
                  <i class="fas fa-handshake text-warning" style="font-size:0.92rem; width: 18px;"></i>
                  <span style="font-weight: 500; color: #f3f4f6; font-size: 0.82rem;">โอกาสงานขาย</span>
                </a>
              </li>

              <!-- 📄 ใบเสนอราคา -->
              <li class="nav-item">
                <a href="quotations.html" class="nav-link px-3 py-1.8 d-flex align-items-center gap-2 rounded text-decoration-none text-white-50 hover-bg-light transition-all">
                  <i class="fas fa-file-contract text-warning" style="font-size:0.92rem; width: 18px;"></i>
                  <span style="font-weight: 500; color: #f3f4f6; font-size: 0.82rem;">ใบเสนอราคา</span>
                </a>
              </li>

              <!-- 🛒 ใบสั่งขาย -->
              <li class="nav-item">
                <a href="sales-orders.html" class="nav-link px-3 py-1.8 d-flex align-items-center gap-2 rounded text-decoration-none text-white-50 hover-bg-light transition-all">
                  <i class="fas fa-list-check text-primary" style="font-size:0.92rem; width: 18px;"></i>
                  <span style="font-weight: 500; color: #f3f4f6; font-size: 0.82rem;">ใบสั่งขาย</span>
                </a>
              </li>

              <!-- 💰 ใบแจ้งหนี้ -->
              <li class="nav-item">
                <a href="invoices.html" class="nav-link px-3 py-1.8 d-flex align-items-center gap-2 rounded text-decoration-none text-white-50 hover-bg-light transition-all">
                  <i class="fas fa-file-invoice text-indigo" style="font-size:0.92rem; width: 18px;"></i>
                  <span style="font-weight: 500; color: #f3f4f6; font-size: 0.82rem;">ใบแจ้งหนี้</span>
                </a>
              </li>

              <!-- 🔧 ตั๋วบริการ -->
              <li class="nav-item">
                <a href="support-desk.html" class="nav-link px-3 py-1.8 d-flex align-items-center gap-2 rounded text-decoration-none text-white-50 hover-bg-light transition-all">
                  <i class="fas fa-tools text-success" style="font-size:0.92rem; width: 18px;"></i>
                  <span style="font-weight: 500; color: #f3f4f6; font-size: 0.82rem;">ตั๋วบริการ</span>
                </a>
              </li>

              <!-- 📊 รายงาน -->
              <li class="nav-item">
                <a href="reports-bi.html" class="nav-link px-3 py-1.8 d-flex align-items-center gap-2 rounded text-decoration-none text-white-50 hover-bg-light transition-all">
                  <i class="fas fa-chart-line text-info" style="font-size:0.92rem; width: 18px;"></i>
                  <span style="font-weight: 500; color: #f3f4f6; font-size: 0.82rem;">รายงาน</span>
                </a>
              </li>

              <!-- 👤 สิทธิ์พนักงาน -->
              <li class="nav-item">
                <a href="users.html" class="nav-link px-3 py-1.8 d-flex align-items-center gap-2 rounded text-decoration-none text-white-50 hover-bg-light transition-all">
                  <i class="fas fa-user-shield text-muted" style="font-size:0.92rem; width: 18px;"></i>
                  <span style="font-weight: 500; color: #f3f4f6; font-size: 0.82rem;">สิทธิ์พนักงาน</span>
                </a>
              </li>

            </ul>
          </nav>
        </div>

        <!-- Sidebar Footer Session summary -->
        <div class="sidebar-footer p-2 border-t position-absolute bottom-0 start-0 end-0 bg-dark text-center no-print" style="flex-shrink: 0; z-index: 1000; height: 70px;">
          <div class="bg-secondary bg-opacity-25 p-1 rounded border border-secondary text-center">
            <span class="text-xs text-muted block font-bold d-block" style="font-size: 9px;">CURRENT REGION - THAILAND</span>
            <span class="badge bg-success" style="font-size:9px;">IKM Testing Partner v1.2</span>
          </div>
        </div>
      </aside>
    `;
    // Insert sidebar after app-header
    const header = document.querySelector('.app-header');
    if (header) {
      header.insertAdjacentHTML('afterend', sidebarHtml);
    } else {
      wrapper.insertAdjacentHTML('beforeend', sidebarHtml);
    }
  }

  // Mobile bottom Bar injection (Hidden on desktops, active on mobile)
  const existingMobileBar = document.querySelector('.mobile-bottom-nav');
  if (!existingMobileBar) {
    const mobileBarHtml = `
      <div class="mobile-bottom-nav d-flex d-md-none bg-dark border-top position-fixed bottom-0 start-0 w-100 no-print" style="height: 60px; z-index: 5000; align-items: center; justify-content: space-around; box-shadow: 0 -3px 10px rgba(0,0,0,0.15);">
        <a href="index.html" class="mobile-nav-item" id="m-nav-dashboard" style="display: flex; flex-direction: column; align-items: center; text-decoration: none; font-size: 10px; color: rgba(255,255,255,0.6);" onclick="localStorage.setItem('active_m_tab', 'dashboard')">
          <i class="fas fa-chart-pie mb-1" style="font-size: 16px;"></i>
          <span>แดชบอร์ด</span>
        </a>
        <a href="customers.html" class="mobile-nav-item" id="m-nav-customers" style="display: flex; flex-direction: column; align-items: center; text-decoration: none; font-size: 10px; color: rgba(255,255,255,0.6);" onclick="localStorage.setItem('active_m_tab', 'customers')">
          <i class="fas fa-building mb-1" style="font-size: 16px;"></i>
          <span>ลูกค้า</span>
        </a>
        <a href="search.html" class="mobile-nav-item" id="m-nav-search" style="display: flex; flex-direction: column; align-items: center; text-decoration: none; font-size: 10px; color: rgba(255,255,255,0.6);" onclick="localStorage.setItem('active_m_tab', 'search')">
          <i class="fas fa-search mb-1" style="font-size: 16px;"></i>
          <span>ค้นหา</span>
        </a>
        <a href="invoices.html" class="mobile-nav-item" id="m-nav-invoices" style="display: flex; flex-direction: column; align-items: center; text-decoration: none; font-size: 10px; color: rgba(255,255,255,0.6);" onclick="localStorage.setItem('active_m_tab', 'invoices')">
          <i class="fas fa-file-invoice-dollar mb-1" style="font-size: 16px;"></i>
          <span>บิลเงิน</span>
        </a>
        <a href="#" class="mobile-nav-item" style="display: flex; flex-direction: column; align-items: center; text-decoration: none; font-size: 10px; color: rgba(255,255,255,0.6);" data-bs-toggle="modal" data-bs-target="#mobileMoreMenuModal">
          <i class="fas fa-grid mb-1" style="font-size: 16px; background-color:#3b82f6; color:#fff; padding:6px; border-radius:50%; margin-top:-15px; width:28px; height:28px; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 6px rgba(59,130,246,0.3);"></i>
          <span>เมนูอื่น</span>
        </a>
      </div>

      <!-- Mobile More Menu Grid Modal -->
      <div class="modal fade" id="mobileMoreMenuModal" tabindex="-1" aria-hidden="true" style="z-index:99999;">
        <div class="modal-dialog modal-dialog-centered pb-5">
          <div class="modal-content border-0 shadow-lg text-dark" style="border-radius: 20px;">
            <div class="modal-header border-0 pb-1">
              <h5 class="modal-title fw-bold"><i class="fas fa-grid-2 text-primary"></i> บริหารจัดการ 12 แผนกงาน</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-3">
              <div class="row g-3 text-center">
                <!-- item 1 -->
                <div class="col-4">
                  <a href="index.html" class="text-decoration-none d-block p-2 rounded hover-bg-light">
                    <div class="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1" style="width: 44px; height: 44px;">
                      <i class="fas fa-chart-pie fs-5"></i>
                    </div>
                    <span class="text-dark small d-block" style="font-size: 10px; font-weight: 500;">แดชบอร์ด</span>
                  </a>
                </div>
                <!-- item 2 -->
                <div class="col-4">
                  <a href="customers.html" class="text-decoration-none d-block p-2 rounded hover-bg-light">
                    <div class="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1" style="width: 44px; height: 44px;">
                      <i class="fas fa-building fs-5"></i>
                    </div>
                    <span class="text-dark small d-block" style="font-size: 10px; font-weight: 500;">ลูกค้า Master</span>
                  </a>
                </div>
                <!-- item 3 -->
                <div class="col-4">
                  <a href="opportunities.html" class="text-decoration-none d-block p-2 rounded hover-bg-light">
                    <div class="bg-warning bg-opacity-10 text-warning-emphasis rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1" style="width: 44px; height: 44px;">
                      <i class="fas fa-chart-line fs-5"></i>
                    </div>
                    <span class="text-dark small d-block" style="font-size: 10px; font-weight: 500;">โอกาสขาย</span>
                  </a>
                </div>
                <!-- item 4 -->
                <div class="col-4">
                  <a href="quotations.html" class="text-decoration-none d-block p-2 rounded hover-bg-light">
                    <div class="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1" style="width: 44px; height: 44px;">
                      <i class="fas fa-file-contract fs-5"></i>
                    </div>
                    <span class="text-dark small d-block" style="font-size: 10px; font-weight: 500;">ใบเสนอราคา</span>
                  </a>
                </div>
                <!-- item 5 -->
                <div class="col-4">
                  <a href="sales-orders.html" class="text-decoration-none d-block p-2 rounded hover-bg-light">
                    <div class="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1" style="width: 44px; height: 44px;">
                      <i class="fas fa-list-check fs-5"></i>
                    </div>
                    <span class="text-dark small d-block" style="font-size: 10px; font-weight: 500;">ใบตั้งคำสั่งซื้อ (SO)</span>
                  </a>
                </div>
                <!-- item 6 -->
                <div class="col-4">
                  <a href="support-desk.html" class="text-decoration-none d-block p-2 rounded hover-bg-light">
                    <div class="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1" style="width: 44px; height: 44px;">
                      <i class="fas fa-headset fs-5"></i>
                    </div>
                    <span class="text-dark small d-block" style="font-size: 10px; font-weight: 500;">จัดการใบงาน</span>
                  </a>
                </div>
                <!-- item 7 -->
                <div class="col-4">
                  <a href="invoices.html?view=invoice" class="text-decoration-none d-block p-2 rounded hover-bg-light">
                    <div class="bg-indigo bg-opacity-10 text-indigo rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1" style="width: 44px; height: 44px;">
                      <i class="fas fa-file-invoice fs-5"></i>
                    </div>
                    <span class="text-dark small d-block" style="font-size: 10px; font-weight: 500;">ใบแจ้งหนี้</span>
                  </a>
                </div>
                <!-- item 8 -->
                <div class="col-4">
                  <a href="invoices.html?view=receipt" class="text-decoration-none d-block p-2 rounded hover-bg-light">
                    <div class="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1" style="width: 44px; height: 44px;">
                      <i class="fas fa-receipt fs-5"></i>
                    </div>
                    <span class="text-dark small d-block" style="font-size: 10px; font-weight: 500;">ใบเสร็จรับเงิน</span>
                  </a>
                </div>
                <!-- item 9 -->
                <div class="col-4">
                  <a href="reports-bi.html" class="text-decoration-none d-block p-2 rounded hover-bg-light">
                    <div class="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1" style="width: 44px; height: 44px;">
                      <i class="fas fa-brain fs-5"></i>
                    </div>
                    <span class="text-dark small d-block" style="font-size: 10px; font-weight: 500;">สถิติ BI</span>
                  </a>
                </div>
                <!-- item 10 -->
                <div class="col-4">
                  <a href="search.html" class="text-decoration-none d-block p-2 rounded hover-bg-light">
                    <div class="bg-warning bg-opacity-10 text-warning-emphasis rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1" style="width: 44px; height: 44px;">
                      <i class="fas fa-search fs-5"></i>
                    </div>
                    <span class="text-dark small d-block" style="font-size: 10px; font-weight: 500;">ค้นหาศูนย์กลาง</span>
                  </a>
                </div>
                <!-- item 11 -->
                <div class="col-4">
                  <a href="strategic-corp.html" class="text-decoration-none d-block p-2 rounded hover-bg-light">
                    <div class="bg-dark bg-opacity-10 text-dark rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1" style="width: 44px; height: 44px;">
                      <i class="fas fa-map-marked-alt fs-5"></i>
                    </div>
                    <span class="text-dark small d-block" style="font-size: 10px; font-weight: 500;">SWOT & ดีล</span>
                  </a>
                </div>
                <!-- item 12 -->
                <div class="col-4">
                  <a href="users.html" class="text-decoration-none d-block p-2 rounded hover-bg-light">
                    <div class="bg-indigo bg-opacity-10 text-indigo rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1" style="width: 44px; height: 44px;">
                      <i class="fas fa-user-shield fs-5"></i>
                    </div>
                    <span class="text-dark small d-block" style="font-size: 10px; font-weight: 500;">ผู้ใช้และสิทธิ์</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    wrapper.insertAdjacentHTML('beforeend', mobileBarHtml);
  }

  // Spinner injection
  const existingSpinner = document.getElementById('global-spinner');
  if (!existingSpinner) {
    const spinnerHtml = `
      <div id="global-spinner" class="hidden">
        <div class="text-center bg-white p-4 rounded shadow-lg border">
          <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Loading...</span>
          </div>
          <h5 class="mt-3 text-dark fw-bold m-0">กำลังประสานฐานข้อมูล...</h5>
          <p class="text-muted small mt-1 mb-0 font-sans">กรุณารอสักครู่ ระบบกำลังสื่อสารกับฐานข้อมูล Supabase</p>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', spinnerHtml);
  }

  // Toast container injection
  const existingToast = document.querySelector('.toast-container');
  if (!existingToast) {
    const toastHtml = `<div class="toast-container"></div>`;
    document.body.insertAdjacentHTML('beforeend', toastHtml);
  }
}

// Sidebar active selection highlight
function highlightActiveMenu() {
  const currentPath = window.location.pathname;
  const page = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
  const queryStr = window.location.search || '';

  // Clear existing active flags on sublinks
  document.querySelectorAll('.sidebar-submenu .nav-link').forEach(el => {
    el.classList.remove('active');
  });
  document.querySelectorAll('.sidebar-parent-btn').forEach(el => {
    el.classList.remove('active', 'text-white');
    el.classList.add('text-white-50');
  });

  // Track the matched sublink ID
  let activeSubId = '';

  if (page === 'index.html') {
    if (queryStr.includes('view=sales') || queryStr.includes('dash=sales')) {
      activeSubId = 'sub-sales-dash';
    } else if (queryStr.includes('view=financial') || queryStr.includes('dash=finance')) {
      activeSubId = 'sub-fin-dash';
    } else if (queryStr.includes('view=project') || queryStr.includes('dash=project')) {
      activeSubId = 'sub-proj-dash';
    } else {
      activeSubId = 'sub-exec-dash';
    }
  } else if (page === 'customers.html') {
    if (queryStr.includes('view=contact')) {
      activeSubId = 'sub-cust-contact';
    } else if (queryStr.includes('view=industry')) {
      activeSubId = 'sub-cust-industry';
    } else if (queryStr.includes('view=location')) {
      activeSubId = 'sub-cust-location';
    } else {
      activeSubId = 'sub-cust-list';
    }
  } else if (page === 'opportunities.html') {
    if (queryStr.includes('view=followup')) {
      activeSubId = 'sub-opp-followup';
    } else if (queryStr.includes('view=lost')) {
      activeSubId = 'sub-opp-lost';
    } else {
      activeSubId = 'sub-opp-list';
    }
  } else if (page === 'opportunity-kanban.html') {
    activeSubId = 'sub-opp-kanban';
  } else if (page === 'quotations.html') {
    if (queryStr.includes('action=create')) {
      activeSubId = 'sub-q-create';
    } else if (queryStr.includes('status=Draft')) {
      activeSubId = 'sub-q-draft';
    } else if (queryStr.includes('status=Submitted')) {
      activeSubId = 'sub-q-submitted';
    } else if (queryStr.includes('status=Approved')) {
      activeSubId = 'sub-q-approved';
    } else if (queryStr.includes('status=Rejected')) {
      activeSubId = 'sub-q-rejected';
    } else if (queryStr.includes('status=Expired')) {
      activeSubId = 'sub-q-expired';
    } else if (queryStr.includes('view=revision')) {
      activeSubId = 'sub-q-revision';
    } else {
      activeSubId = 'sub-q-all';
    }
  } else if (page === 'sales-orders.html') {
    if (queryStr.includes('action=create')) {
      activeSubId = 'sub-so-create';
    } else if (queryStr.includes('status=Open')) {
      activeSubId = 'sub-so-open';
    } else if (queryStr.includes('status=Closed')) {
      activeSubId = 'sub-so-closed';
    } else if (queryStr.includes('view=jobs')) {
      activeSubId = 'sub-job-list';
    } else if (queryStr.includes('view=job_schedule')) {
      activeSubId = 'sub-job-sched';
    } else if (queryStr.includes('view=job_assignment')) {
      activeSubId = 'sub-job-assign';
    } else {
      activeSubId = 'sub-so-all';
    }
  } else if (page === 'support-desk.html') {
    if (queryStr.includes('status=Pending')) {
      activeSubId = 'sub-job-pending';
    } else if (queryStr.includes('status=Mobilizing')) {
      activeSubId = 'sub-job-mobil';
    } else if (queryStr.includes('status=OnGoing') || queryStr.includes('status=Ongoing')) {
      activeSubId = 'sub-job-ongoing';
    } else if (queryStr.includes('status=Completed')) {
      activeSubId = 'sub-job-done';
    } else if (queryStr.includes('status=ReadyForInvoice') || queryStr.includes('status=Ready')) {
      activeSubId = 'sub-job-ready';
    } else if (queryStr.includes('view=timeline')) {
      activeSubId = 'sub-proj-timeline';
    } else if (queryStr.includes('view=resources')) {
      activeSubId = 'sub-proj-resource';
    } else {
      activeSubId = 'sub-job-ongoing';
    }
  } else if (page === 'invoices.html') {
    if (queryStr.includes('view=receipt')) {
      if (queryStr.includes('action=create')) {
        activeSubId = 'sub-rcpt-entry';
      } else if (queryStr.includes('status=Partial')) {
        activeSubId = 'sub-rcpt-partial';
      } else if (queryStr.includes('status=Paid')) {
        activeSubId = 'sub-rcpt-full';
      } else if (queryStr.includes('status=Unpaid')) {
        activeSubId = 'sub-rcpt-outstanding';
      } else {
        activeSubId = 'sub-rcpt-full';
      }
    } else {
      if (queryStr.includes('action=create')) {
        activeSubId = 'sub-inv-create';
      } else if (queryStr.includes('status=Outstanding')) {
        activeSubId = 'sub-inv-outstanding';
      } else if (queryStr.includes('status=Overdue')) {
        activeSubId = 'sub-inv-overdue';
      } else {
        activeSubId = 'sub-inv-all';
      }
    }
  } else if (page === 'reports-bi.html') {
    if (queryStr.includes('view=conversion')) {
      activeSubId = 'sub-q-conversion';
    } else if (queryStr.includes('view=quote_perf')) {
      activeSubId = 'sub-q-perf';
    } else if (queryStr.includes('view=progress')) {
      activeSubId = 'sub-proj-progress';
    } else if (queryStr.includes('view=aging')) {
      activeSubId = 'sub-ar-aging';
    } else if (queryStr.includes('view=collection')) {
      activeSubId = 'sub-ar-collection';
    } else if (queryStr.includes('sec=sales')) {
      activeSubId = 'sub-rep-sales';
    } else if (queryStr.includes('sec=opp')) {
      activeSubId = 'sub-rep-opp';
    } else if (queryStr.includes('sec=quote')) {
      activeSubId = 'sub-rep-quota';
    } else if (queryStr.includes('sec=project')) {
      activeSubId = 'sub-rep-proj';
    } else if (queryStr.includes('sec=finance')) {
      activeSubId = 'sub-rep-finance';
    } else if (queryStr.includes('sec=management')) {
      activeSubId = 'sub-rep-management';
    } else {
      activeSubId = 'sub-rep-sales';
    }
  } else if (page === 'search.html') {
    if (queryStr.includes('tab=customer')) {
      activeSubId = 'sub-search-cust';
    } else if (queryStr.includes('tab=quotation')) {
      activeSubId = 'sub-search-quota';
    } else if (queryStr.includes('tab=sales_order')) {
      activeSubId = 'sub-search-so';
    } else if (queryStr.includes('tab=job')) {
      activeSubId = 'sub-search-job';
    } else if (queryStr.includes('tab=invoice')) {
      activeSubId = 'sub-search-invoice';
    } else {
      activeSubId = 'sub-search-global';
    }
  } else if (page === 'strategic-corp.html') {
    if (queryStr.includes('tab=location')) {
      activeSubId = 'sub-master-location';
    } else if (queryStr.includes('tab=industry')) {
      activeSubId = 'sub-master-industry';
    } else if (queryStr.includes('tab=tax')) {
      activeSubId = 'sub-master-tax';
    } else {
      activeSubId = 'sub-master-service';
    }
  } else if (page === 'users.html') {
    if (queryStr.includes('tab=roles')) {
      activeSubId = 'sub-user-roles';
    } else if (queryStr.includes('tab=permissions')) {
      activeSubId = 'sub-user-permissions';
    } else if (queryStr.includes('tab=audit')) {
      activeSubId = 'sub-user-audit';
    } else {
      activeSubId = 'sub-user-list';
    }
  }

  // Apply active selection & auto-expand bootstrap collapse container
  if (activeSubId) {
    const subBtn = document.getElementById(activeSubId);
    if (subBtn) {
      subBtn.classList.add('active');
      const parentCollapse = subBtn.closest('.collapse');
      if (parentCollapse) {
        parentCollapse.classList.add('show');
        const triggerBtn = document.querySelector(`[href="#${parentCollapse.id}"], [data-bs-target="#${parentCollapse.id}"]`);
        if (triggerBtn) {
          triggerBtn.setAttribute('aria-expanded', 'true');
          triggerBtn.classList.add('active', 'text-white');
          triggerBtn.classList.remove('text-white-50');
        }
      }
    }
  }

  // Mobile navigation active highlight
  const mobileMap = {
    'index.html': 'm-nav-dashboard',
    'customers.html': 'm-nav-customers',
    'search.html': 'm-nav-search',
    'invoices.html': 'm-nav-invoices'
  };

  const mobileActiveId = mobileMap[page];
  if (mobileActiveId) {
    const mobileBtn = document.getElementById(mobileActiveId);
    if (mobileBtn) {
      mobileBtn.style.color = '#3b82f6';
      const mIcon = mobileBtn.querySelector('i');
      if (mIcon) {
        mIcon.style.color = '#3b82f6';
      }
    }
  }
}

// Dark Mode Actions
function initDarkMode() {
  const toggler = document.getElementById('darkModeToggler');
  const isDark = localStorage.getItem('crm_dark_theme') === 'true';

  applyDarkModeState(isDark);

  if (toggler) {
    toggler.addEventListener('click', () => {
      const currentlyDark = document.body.classList.contains('dark-mode');
      applyDarkModeState(!currentlyDark);
    });
  }
}

function applyDarkModeState(enable) {
  const toggler = document.getElementById('darkModeToggler');
  if (enable) {
    document.body.classList.add('dark-mode');
    document.querySelector('.app-header')?.classList.remove('bg-white');
    document.querySelector('.app-header')?.classList.add('bg-dark', 'navbar-dark');
    localStorage.setItem('crm_dark_theme', 'true');
    if (toggler) toggler.innerHTML = '<i class="fas fa-sun text-warning fs-5"></i>';
  } else {
    document.body.classList.remove('dark-mode');
    document.querySelector('.app-header')?.classList.remove('bg-dark', 'navbar-dark');
    document.querySelector('.app-header')?.classList.add('bg-white');
    localStorage.setItem('crm_dark_theme', 'false');
    if (toggler) toggler.innerHTML = '<i class="fas fa-moon fs-5"></i>';
  }
}

// Connectivity switcher syncing
function syncDatabaseConnectivityIndicator() {
  const switcher = document.getElementById('supabaseSwitcher');
  const label = document.getElementById('db-state-lbl');
  
  const cloudActive = localStorage.getItem('crm_use_cloud') !== 'false';
  
  if (switcher) {
    switcher.checked = cloudActive;
    updateDBLabel(cloudActive);

    switcher.addEventListener('change', (e) => {
      const mode = e.target.checked;
      localStorage.setItem('crm_use_cloud', JSON.stringify(mode));
      updateDBLabel(mode);
      
      // Toast notification for user feedback
      showToastAlert(
        mode ? 'เชื่อมต่อระบบคลายและซิงค์ข้อมูลกับ Supabase Storage' : 'เปลี่ยนเป็นระบบโลคอลแรนโบว์ (Offline Mode)',
        mode ? 'success' : 'warning'
      );

      // Reload page content if fetch functions are loaded
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    });
  }
}

function updateDBLabel(isCloud) {
  const label = document.getElementById('db-state-lbl');
  if (label) {
    if (isCloud) {
       label.innerHTML = 'SUPABASE CONNECTED <span class="badge bg-success ms-1 animate__animated animate__pulse animate__infinite">CLOUD</span>';
       label.className = 'form-check-label small font-monospace fw-bold text-success';
    } else {
       label.innerHTML = 'LOCAL SANDBOX ACTIVE <span class="badge bg-secondary ms-1">LOCAL</span>';
       label.className = 'form-check-label small font-monospace fw-bold text-muted';
    }
  }
}

// Loading Toggle Indicators
function toggleGlobalLoader(show) {
  // Disabled as per user request to not show blocking loader
  return;
}

// Toast Notification manager
function showToastAlert(message, type = 'success') {
  const container = document.querySelector('.toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-item ${type}`;
  
  let icon = '<i class="fas fa-check-circle text-success fs-5"></i>';
  if (type === 'danger') icon = '<i class="fas fa-times-circle text-danger fs-5"></i>';
  if (type === 'warning') icon = '<i class="fas fa-exclamation-triangle text-amber fs-5"></i>';

  toast.innerHTML = `
    <div style="flex-shrink:0;">${icon}</div>
    <div style="flex:1;">
      <span class="fw-bold d-block" style="font-size:0.85rem;">การแจ้งเตือนระบบ</span>
      <p class="m-0" style="font-size:0.77rem; color:inherit; opacity:0.85;">${message}</p>
    </div>
    <button class="btn-close ms-auto btn-sm" onclick="this.parentElement.remove()" style="font-size: 0.65rem;" aria-label="Close"></button>
  `;

  container.appendChild(toast);
  
  // Fade out of view after 4.5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4500);
}

// Dynamic spreadsheet Excel exporter using native client-side sheets structure
function exportTableToExcel(tableId, filename = 'CRM_Export_Report') {
  const table = document.getElementById(tableId);
  if (!table) {
    showToastAlert('ไม่พบตารางข้อมูลสำหรับการส่งออก', 'danger');
    return;
  }
  
  try {
    const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0,10)}.xlsx`);
    showToastAlert('ส่งออกรายงาน Excel สำเร็จแล้ว', 'success');
  } catch (err) {
    console.error("XLSX export failed", err);
    showToastAlert('การล้อออก Excel ล้มเหลว โปรดเช็คการพึ่งพาตัวไลบรารี', 'danger');
  }
}

// Export PDF functionality using jsPDF and autoTable plug-ins
function exportTableToPDF(tableId, titleText = 'CRM Report Summary') {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    showToastAlert('ระบบโปรแกรมสากดึงไม่พบไฟล์ PDF library รองรับ', 'danger');
    return;
  }

  showToastAlert('กำลังสังเคราะห์และจัดรูปแบบ PDF...', 'success');

  try {
    const doc = new jsPDF('p', 'pt', 'a4');
    
    // Simple header
    doc.setFontSize(16);
    doc.text(titleText, 40, 40);
    doc.setFontSize(10);
    doc.text(`Generated At: ${new Date().toLocaleString()}`, 40, 60);

    doc.autoTable({
      html: `#${tableId}`,
      startY: 80,
      margin: { left: 40, right: 40 },
      styles: { font: "Helvetica", fontSize: 8 },
      headStyles: { fillColor: [13, 110, 253] }
    });

    doc.save(`${titleText.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`);
    showToastAlert('ดาวน์โหลดไฟล์เอกสาร PDF สำเร็จแล้ว', 'success');
  } catch (error) {
    console.error("PDF generation failed", error);
    showToastAlert('การส่งออกเอกสาร PDF ล้มเหลว', 'danger');
  }
}

// Database Seeder Fallback helper
function seedDatabaseFallback() {
  Swal.fire({
    title: 'คุณมั่นใจหรือไม่?',
    text: "สิทธิ์การเขียนและอัดข้อมูลทับใน Local Storage และคลาวด์จะทับประวัติตามค่าดั้งเดิม เริ่มต้นใหม่ทันที!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'ใช่, รีเซ็ตข้อมูลเดี๋ยวนี้!',
    cancelButtonText: 'ยกเลิก'
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem('crm_customers');
      localStorage.removeItem('crm_contacts');
      localStorage.removeItem('crm_opportunities');
      localStorage.removeItem('crm_quotations');
      localStorage.removeItem('crm_invoices');
      localStorage.removeItem('crm_activities');
      
      showToastAlert('รีเซ็ตข้อมูลเริ่มต้นเสร็จสิ้น กำลังรีโหลดหน้าจอ...', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  });
}

// Export globally
window.showToastAlert = showToastAlert;
window.toggleGlobalLoader = toggleGlobalLoader;
window.exportTableToExcel = exportTableToExcel;
window.exportTableToPDF = exportTableToPDF;
window.seedDatabaseFallback = seedDatabaseFallback;

// Localized Translation Dictionary (TH/EN)
const I18N_DICTIONARY = {
  TH: {
    "home": " หน้าแรก",
    "re_seed": " รีเซ็ตตัวอย่าง",
    "dashboard_main": "แดชบอร์ดหลัก",
    "dashboard_bi": "วิเคราะห์ BI (Analytics)",
    "sidebar_menu_analytical": "เมนูระบบหลัก & วิเคราะห์",
    "sidebar_menu_customers": "ลูกค้ารายใหม่ & เกรดรีด",
    "sidebar_menu_opps": "สถานะโอกาส & บอร์ดประมูล",
    "sidebar_menu_documents": "เอกสารการค้า & ข้อตกลง",
    "sidebar_menu_support": "หลังการขาย & กลยุทธ์องค์กร",
    "customer_master": "ทะเบียนลูกค้า Master",
    "leads_list": "รายชื่อผู้สนใจ (Leads)",
    "all_opps": "รายการโอกาสขายทั้งหมด",
    "pipeline_board": "กระดาน Pipeline Board",
    "quotations": "ใบเสนอราคา (Quotations)",
    "invoices": "ใบแจ้งหนี้ / ใบเสร็จ / คำสั่งซื้อ",
    "support_desk": "ฝ่ายริเริ่ม & Support Desk",
    "strategic_swot": "กลยุทธ์ SWOT & แคมเปญ",
    "dashboard_title": "Sales Master CRM - แดชบอร์ดสรุปยอดขาย",
    "welcome_hi": "สวัสดีครับ, ",
    "welcome_subtitle": "ยินดีต้อนรับสู่แดชบอร์ดติดตามยอดขาย IKM Testing. วันนี้มีโอกาสขยายยอดผ่านปั๊มไฮโดรเทสและอุปกรณ์เช่า",
    "ai_tip": "คำแนะนำกลยุทธ์วันนี้:",
    "local_time": "เวลาสารสนเทศระบบ (Local Time)",
    "filter_placeholder": "ค้นหาตามชื่อโครงการ / ลูกค้านิติบุคคล...",
    "all_services": "ประเภทบริการทั้งหมด (ALL)",
    "service_testing": "Testing Service (งานตรวจสอบ)",
    "service_rental": "Equipment Rental (อุปกรณ์เช่า)",
    "service_eng": "Engineering Service (วิศวกรรม)",
    "service_manpower": "Manpower Supply (กำลังคน)",
    "all_probs": "ความน่าจะเป็นทั้งหมด (ALL)",
    "prob_high": "โอกาสสำเร็จสูง (>= 70%)",
    "prob_mid": "โอกาสสำเร็จปานกลาง (40% - 69%)",
    "prob_low": "กำลังเสนอตัวแรกเริ่ม (< 40%)",
    "clear_filters": "ล้างตัวกรอง",
    "total_pipeline": "Total Pipeline (พอร์ตรวม)",
    "active_deals": "Active Deals",
    "quarterly_goal": "เป้าขับเคลื่อนไตรมาส",
    "weighted_pipeline": "Weighted Pipeline (ถ่วงน้ำหนัก)",
    "average_success": "อัตราส่วนความสำเร็จเฉลี่ย",
    "total_won_deals": "Total Won Deals (ยอดปิดแล้ว)",
    "vs_quarterly_target": "เทียบกับเป้าหมายไตรมาส",
    "active_customers": "Active Customers (ลูกค้าหลัก)",
    "retained_customers": "ลูกค้ารักษาสัญญารวม",
    "update_data": " อัปเดตข้อมูล",
    "new_deal": " บันทึกดีลประมูลใหม่",
    "deals_won_ratio": "อัตรางานขายที่สำเร็จ: ",
    "deals_ratio_sub": "คำนวณจากตัวเลขความสำเร็จดีลทิ้งขาดชนะประมูล (Deals Won / Total Opportunities Ratio)",
    "opp_by_status": "ผลสรุปดีลแบ่งตามสถานะ (Opportunity by Status)",
    "realtime_update": "อัปเดตแบบเรียลไทม์",
    "recent_activities": "ประวัติกิจกรรมขายล่าสุด (Recent Activities)",
    "pipeline_timeline_title": "ส่วนวิเคราะห์แนวโน้มยอดเงินแต่ละช่วงเดือน (Sales Pipeline Timeline)",
    "forecast_intl": "คาดการณ์สากล"
  },
  EN: {
    "home": " Home",
    "re_seed": " Re-seed Sandbox",
    "dashboard_main": "Main Dashboard",
    "dashboard_bi": "BI Analytics Panel",
    "sidebar_menu_analytical": "CORE & ANALYTICAL MENU",
    "sidebar_menu_customers": "CUSTOMER & PROSPECTS METRICS",
    "sidebar_menu_opps": "OPPORTUNITIES & PIPELINE",
    "sidebar_menu_documents": "TRADE DOCUMENTS & BILLING",
    "sidebar_menu_support": "AFTER-SALES & STRATEGIC",
    "customer_master": "Customers Master DB",
    "leads_list": "Prospect Leads (Leads)",
    "all_opps": "All Sales Opportunities",
    "pipeline_board": "Kanban Pipeline Board",
    "quotations": "Quotations (Quotes)",
    "invoices": "Invoices / Bills / Orders",
    "support_desk": "Initiation & Support Desk",
    "strategic_swot": "Strategic SWOT & Campaign",
    "dashboard_title": "Sales Master CRM - Sales Summary Dashboard",
    "welcome_hi": "Welcome, ",
    "welcome_subtitle": "Welcome to IKM Testing Sales Tracking Dashboard. Today is a great day to pursue new hydrotest and equipment rental deals.",
    "ai_tip": "Today's Strategic Tip:",
    "local_time": "Local System Time",
    "filter_placeholder": "Search by project name / corporate customer...",
    "all_services": "All Service Types (ALL)",
    "service_testing": "Testing Service",
    "service_rental": "Equipment Rental",
    "service_eng": "Engineering Service",
    "service_manpower": "Manpower Supply",
    "all_probs": "All Probabilities (ALL)",
    "prob_high": "High Probability (>= 70%)",
    "prob_mid": "Medium Probability (40% - 69%)",
    "prob_low": "Initial Proposal (< 40%)",
    "clear_filters": "Clear Filters",
    "total_pipeline": "Total Pipeline",
    "active_deals": "Active Deals",
    "quarterly_goal": "Quarterly Target",
    "weighted_pipeline": "Weighted Pipeline Value",
    "average_success": "Average Success Rate",
    "total_won_deals": "Total Won Deals",
    "vs_quarterly_target": "Compared to Quarterly Target",
    "active_customers": "Active Customers",
    "retained_customers": "Total Active Accounts",
    "update_data": " Refresh Data",
    "new_deal": " New Auction Deal",
    "deals_won_ratio": "Win Ratio Analysis: ",
    "deals_ratio_sub": "Calculated as won bids over total sales opportunities.",
    "opp_by_status": "Deals Breakdown by Status (Opportunity by Status)",
    "realtime_update": "Live Sync Feed",
    "recent_activities": "Recent Sales Activities Feed (Recent Activities)",
    "pipeline_timeline_title": "Sales Pipeline Forecast Timeline (Monthly Trend)",
    "forecast_intl": "Forecast"
  }
};

function initSystemLanguage() {
  const currentLang = localStorage.getItem('crm_lang') || 'TH';
  const labelEl = document.getElementById('current-lang-lbl');
  if (labelEl) {
    labelEl.innerText = currentLang;
  }
  applyLanguageTranslations(currentLang);
}

function switchSystemLanguage(lang) {
  localStorage.setItem('crm_lang', lang);
  const labelEl = document.getElementById('current-lang-lbl');
  if (labelEl) {
    labelEl.innerText = lang;
  }
  applyLanguageTranslations(lang);
  showToastAlert(lang === 'TH' ? 'เปลี่ยนภาษาของระบบเป็น ภาษาไทย แล้ว' : 'System language changed to English successfully', 'success');
  
  // Custom hook to trigger dashboard refresh if present
  if (typeof onFilterChange === 'function') {
    onFilterChange();
  }
}

function applyLanguageTranslations(lang) {
  const dict = I18N_DICTIONARY[lang] || I18N_DICTIONARY.TH;
  
  // Set window/page title if applicable
  if (dict["dashboard_title"] && window.location.pathname.endsWith('index.html')) {
    document.title = dict["dashboard_title"];
  }

  // Translate all marked elements
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      // Retain icons if any exist inside the element
      const icon = el.querySelector('i');
      if (icon) {
        // Clear non-icon content and re-insert icon + translation text
        const iconClone = icon.cloneNode(true);
        el.innerHTML = '';
        el.appendChild(iconClone);
        el.appendChild(document.createTextNode(' ' + dict[key].replace(/^\s*<i.*?>.*?<\/i>\s*/, '')));
      } else {
        // Plain text translation handles input placeholder vs inner HTML
        if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
          el.setAttribute('placeholder', dict[key]);
        } else {
          el.innerText = dict[key];
        }
      }
    }
  });
}

window.switchSystemLanguage = switchSystemLanguage;
window.applyLanguageTranslations = applyLanguageTranslations;
window.initSystemLanguage = initSystemLanguage;

// -----------------------------------------------------
// REALTIME NOTIFICATION & ALERTS SYSTEM (EXPERT CRADLE)
// -----------------------------------------------------
async function checkAndShowSystemNotifications() {
  try {
    if (typeof SupabaseDB === 'undefined') return;

    // Fetch collections
    const [quotations, invoices] = await Promise.all([
      SupabaseDB.getQuotations(),
      SupabaseDB.getInvoices()
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiringQuotations = [];
    const overdueInvoices = [];

    // 1. Analyze Quotations: Status must be Sent or Draft or Approved
    quotations.forEach(q => {
      if (q.status === 'Draft' || q.status === 'Sent' || q.status === 'Approved') {
        const qDate = new Date(q.quotation_date);
        const validity = parseInt(q.validity_days) || 30;
        const expiryDate = new Date(qDate.getTime() + validity * 24 * 60 * 60 * 1000);
        expiryDate.setHours(0, 0, 0, 0);
        
        const diffMs = expiryDate - today;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        // Nearing expiration within 7 days or already expired
        if (diffDays <= 7) {
          expiringQuotations.push({
            ...q,
            days_left: diffDays,
            expiry_date: expiryDate.toISOString().split('T')[0]
          });
        }
      }
    });

    // 2. Analyze Invoices: Unpaid or Overdue, and due_date has passed
    invoices.forEach(i => {
      if (i.status === 'Unpaid' || i.status === 'Overdue') {
        const dueDate = new Date(i.due_date);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate < today) {
          const diffMs = today - dueDate;
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          overdueInvoices.push({
            ...i,
            days_overdue: diffDays
          });
        }
      }
    });

    // Cache locally
    window.lastSystemNotifications = {
      expiringQuotations,
      overdueInvoices
    };

    // Toast Notification logic on entry (Scoped once per Session)
    const alreadyShown = sessionStorage.getItem('sys_notif_toast_shown');
    if (!alreadyShown) {
      if (expiringQuotations.length > 0 || overdueInvoices.length > 0) {
        let toastMsg = "";
        if (expiringQuotations.length > 0 && overdueInvoices.length > 0) {
          toastMsg = `⚠️ ตรวจพบใบเสนอราคาใกล้หมดอายุ ${expiringQuotations.length} รายการ และใบแจ้งหนี้ค้างชำระ ${overdueInvoices.length} รายการ เกินกำหนดชำระ!`;
        } else if (expiringQuotations.length > 0) {
          toastMsg = `⏳ ตรวจพบใบเสนอราคาใกล้หมดอายุหรือหมดอายุแล้ว ${expiringQuotations.length} รายการ กรุณาติดตามลูกค้า`;
        } else if (overdueInvoices.length > 0) {
          toastMsg = `🚨 ตรวจพบใบแจ้งหนี้ค้างเงินสะสมเกินกำหนดชำระ ${overdueInvoices.length} รายการ กรุณาดำเนินการทวงถามหนี้`;
        }
        showToastAlert(toastMsg, 'danger');
      } else {
        showToastAlert('ระบบพร้อมใช้งาน: ไม่พบใบค้างจ่ายหรือใบเสนอราคาหมดอายุในวันนี้', 'success');
      }
      sessionStorage.setItem('sys_notif_toast_shown', 'true');
    }

    // Render list in Dashboard if on Dashboard page
    const path = window.location.pathname;
    const isDashboard = path.endsWith('index.html') || path.endsWith('/') || path === '';
    if (isDashboard) {
      renderDashboardNotificationsList(expiringQuotations, overdueInvoices);
    }
  } catch (error) {
    console.error("Critical error auditing system notifications:", error);
  }
}

function renderDashboardNotificationsList(expiringQuotes, overdueInvoices) {
  const container = document.getElementById('dashboard-notifications-container');
  if (!container) return;

  if (expiringQuotes.length === 0 && overdueInvoices.length === 0) {
    container.className = "container-fluid mb-4 d-block animate__animated animate__fadeIn";
    container.innerHTML = `
      <div class="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div class="p-3 d-flex align-items-center justify-content-between" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 5px solid #22c55e;">
          <div class="d-flex align-items-center gap-3">
            <div class="bg-success text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm animate__animated animate__pulse" style="width: 36px; height: 36px;">
              <i class="fas fa-check-circle fs-5"></i>
            </div>
            <div>
              <h6 class="m-0 fw-bold text-success" style="font-size: 0.95rem;">ระบบตรวจสอบแจ้งเตือน (Smart Notification Core)</h6>
              <span class="text-xs text-muted-flat" style="font-size: 0.8rem; color: #15803d;">ยอดเยี่ยม! ไม่มีเรื่องค้างชำระหรือใบเสนอราคาใกล้หมดอายุที่ต้องดูแลเป็นพิเศษในระบบวันนี้</span>
            </div>
          </div>
        </div>
      </div>
    `;
    return;
  }

  container.className = "container-fluid mb-4 d-block animate__animated animate__fadeIn";

  let expiringHtml = '';
  if (expiringQuotes.length > 0) {
    expiringHtml = `
      <div class="col-12 col-md-6">
        <div class="p-3 bg-warning bg-opacity-10 rounded-4 h-100" style="border: 1px solid rgba(255, 193, 7, 0.44);">
          <div class="d-flex align-items-center gap-2 mb-3">
            <span class="badge bg-warning text-dark px-2 py-1"><i class="fa fa-clock text-dark me-1"></i> ใกล้หมดอายุ</span>
            <h6 class="m-0 fw-bold text-warning-emphasis" style="font-size: 0.9rem;">ใบเสนอราคาใกล้หมดอายุ (${expiringQuotes.length} รายการ)</h6>
          </div>
          <div class="d-flex flex-column gap-2 overflow-y-auto pr-1" style="max-height: 250px;">
            ${expiringQuotes.map(q => {
              const customerName = q.customer ? q.customer.customer_name : 'ไม่พบข้อมูลลูกค้า';
              const daysText = q.days_left < 0 
                ? `<span class="badge bg-danger rounded-pill px-2 py-0.5" style="font-size: 0.7rem;">หมดอายุมาแล้ว ${Math.abs(q.days_left)} วัน</span>` 
                : (q.days_left === 0 
                  ? `<span class="badge bg-danger rounded-pill px-2 py-0.5" style="font-size: 0.7rem;">หมดอายุวันนี้!</span>` 
                  : `<span class="badge bg-warning text-dark rounded-pill px-2 py-0.5" style="font-size: 0.7rem;">ด่วน! เหลืออีก ${q.days_left} วัน</span>`);
              return `
                <div class="d-flex justify-content-between align-items-center p-3 bg-white rounded-3 shadow-xs border-light border">
                  <div style="flex: 1; min-width: 0;" class="pe-2">
                    <div class="d-flex align-items-center gap-2 flex-wrap">
                      <span class="font-monospace fw-bold text-dark small" style="font-size: 0.82rem;">${q.quotation_no}</span>
                      <span class="badge bg-secondary-subtle text-secondary small" style="font-size:0.67rem; font-weight:500;">Status: ${q.status}</span>
                    </div>
                    <span class="d-block text-slate-800 text-truncate mt-1.5 fw-semibold" style="font-size: 0.82rem;" title="${q.title}">${q.title}</span>
                    <span class="text-xs text-muted d-block mt-0.5 text-truncate" style="font-size: 0.75rem;">ลูกค้า: ${customerName}</span>
                  </div>
                  <div class="text-end" style="flex-shrink: 0;">
                    <div class="mb-2 d-flex justify-content-end">${daysText}</div>
                    <a href="quotations.html?search=${q.quotation_no}" class="btn btn-xs btn-outline-warning py-1 px-2.5 rounded-pill text-warning border-warning border hover-bg-warning hover-text-white transition-all fw-medium" style="font-size:0.7rem; display:inline-flex; align-items:center; gap:3px;"><i class="fa fa-eye"></i> ตรวจสอบ</a>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  } else {
    expiringHtml = `
      <div class="col-12 col-md-6">
        <div class="p-4 bg-light rounded-4 h-100 d-flex flex-column align-items-center justify-content-center text-center py-5 border">
          <i class="fa-regular fa-clipboard text-muted mb-2" style="font-size: 2rem; opacity: 0.45;"></i>
          <h6 class="m-0 fw-bold text-secondary" style="font-size: 0.88rem;">ไม่มีใบเสนอราคาค้างคาที่ใกล้หมดอายุ</h6>
          <span class="text-xs text-muted mt-1" style="font-size: 0.75rem;">ใบเสนอราคาในระบบทั้งหมดมีอายุการใช้งานปกติ</span>
        </div>
      </div>
    `;
  }

  let overdueHtml = '';
  if (overdueInvoices.length > 0) {
    overdueHtml = `
      <div class="col-12 col-md-6">
        <div class="p-3 bg-danger bg-opacity-10 rounded-4 h-100" style="border: 1px solid rgba(220, 53, 69, 0.44);">
          <div class="d-flex align-items-center gap-2 mb-3">
            <span class="badge bg-danger px-2 py-1"><i class="fa fa-ban text-white me-1"></i> เกินกำหนดชำระ</span>
            <h6 class="m-0 fw-bold text-danger-emphasis" style="font-size: 0.9rem;">ใบแจ้งหนี้ค้างชำระเกินกำหนดชำระ (${overdueInvoices.length} รายการ)</h6>
          </div>
          <div class="d-flex flex-column gap-2 overflow-y-auto pr-1" style="max-height: 250px;">
            ${overdueInvoices.map(i => {
              const customerName = i.customer ? i.customer.customer_name : 'ไม่ระบุชื่อบริษัทลูกค้า';
              const invoiceTotal = parseFloat(i.grand_total || i.total_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });
              return `
                <div class="d-flex justify-content-between align-items-center p-3 bg-white rounded-3 shadow-xs border-light border">
                  <div style="flex: 1; min-width: 0;" class="pe-2">
                    <div class="d-flex align-items-center gap-2 flex-wrap">
                      <span class="font-monospace fw-bold text-dark small" style="font-size: 0.82rem;">${i.invoice_no}</span>
                      <span class="badge bg-danger-subtle text-danger small" style="font-size:0.67rem; font-weight:500;">Status: Overdue</span>
                    </div>
                    <span class="d-block text-slate-800 text-truncate mt-1.5 fw-semibold" style="font-size: 0.82rem;" title="${i.project_name}">${i.project_name}</span>
                    <span class="text-xs text-muted d-block mt-0.5 text-truncate" style="font-size: 0.75rem;">ลูกค้า: ${customerName}</span>
                    <span class="text-xs d-block font-sans fw-bold text-danger mt-1" style="font-size: 0.78rem;">ยอดค้างชำระ: ฿${invoiceTotal}</span>
                  </div>
                  <div class="text-end" style="flex-shrink: 0;">
                    <div class="mb-2"><span class="badge bg-danger rounded-pill px-2 py-0.5" style="font-size: 0.7rem;">เกินกำหนดมาแล้ว ${i.days_overdue} วัน</span></div>
                    <a href="invoices.html?search=${i.invoice_no}" class="btn btn-xs btn-outline-danger py-1 px-2.5 rounded-pill text-danger border-danger border hover-bg-danger hover-text-white transition-all fw-medium" style="font-size:0.7rem; display:inline-flex; align-items:center; gap:3px;"><i class="fa fa-file-invoice"></i> ตรวจสอบ</a>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  } else {
    overdueHtml = `
      <div class="col-12 col-md-6">
        <div class="p-4 bg-light rounded-4 h-100 d-flex flex-column align-items-center justify-content-center text-center py-5 border">
          <i class="fa-regular fa-file-invoice text-muted mb-2" style="font-size: 2rem; opacity: 0.45;"></i>
          <h6 class="m-0 fw-bold text-secondary" style="font-size: 0.88rem;">ไม่มีใบแจ้งหนี้ตกค้างเกินกำหนดชำระ</h6>
          <span class="text-xs text-muted mt-1" style="font-size: 0.75rem;">ใบแจ้งหนี้ทั้งหมดได้รับการชำระเสร็จสิ้นหรือยังไม่พ้นกำหนด</span>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="card border-0 shadow-sm rounded-4 bg-white overflow-hidden transition-all duration-300">
      <!-- Header -->
      <div class="px-4 py-3 bg-dark text-white d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-2.5">
          <div class="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center shadow-sm" style="width: 28px; height: 28px;">
            <i class="fa fa-bell text-dark" style="font-size: 0.85rem;"></i>
          </div>
          <div>
            <h6 class="m-0 fw-bold" style="font-size: 0.95rem; letter-spacing: -0.2px;">ระบบศูนย์กลางสัญญาณเตือนและแจ้งข่าวสาร (SMART CRM ALERTS HUB)</h6>
            <span class="text-xs text-light" style="font-size: 0.72rem; opacity: 0.75;">ตรวจสอบคัดกรองสัญญาณเตือนใบเสนอราคา และใบแจ้งหนี้ค้างชำระระดับผู้บริหาร</span>
          </div>
        </div>
        <span class="badge bg-danger rounded-pill px-3 py-1.5 fw-bold" style="font-size:0.72rem; letter-spacing:0.3px;"><i class="fa fa-circle-exclamation me-1"></i> ตรวจพบความเสี่ยง ${expiringQuotes.length + overdueInvoices.length} จุด</span>
      </div>
      <!-- List Blocks -->
      <div class="card-body p-4 bg-body-tertiary">
        <div class="row g-3">
          ${expiringHtml}
          ${overdueHtml}
        </div>
      </div>
    </div>
  `;
}

window.switchSystemLanguage = switchSystemLanguage;
window.applyLanguageTranslations = applyLanguageTranslations;
window.initSystemLanguage = initSystemLanguage;
window.checkAndShowSystemNotifications = checkAndShowSystemNotifications;
window.renderDashboardNotificationsList = renderDashboardNotificationsList;

window.handleGlobalSignOut = async function(e) {
  if (e) e.preventDefault();
  
  // Clear local storage session
  localStorage.removeItem('crm_user_role');
  localStorage.removeItem('crm_user_fullname');
  localStorage.removeItem('crm_user_email');
  localStorage.removeItem('crm_user_id');
  localStorage.removeItem('supabase_session_token');
  
  // Try Supabase Auth SignOut
  if (window.supabaseClient) {
    try {
      await window.supabaseClient.auth.signOut();
    } catch (err) {
      console.warn("Supabase SignOut error", err);
    }
  }
  
  // Redirect to login page
  window.location.href = 'login.html';
};
