<?php
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
      XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0,10)}.xlsx`);
    }

    // General export table to PDF helper
    function exportTableToPDF(tableId, titleText = 'CRM Data Report') {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'pt', 'a4');
      
      // Add Title
      doc.setFontSize(16);
      doc.text(titleText, 40, 40);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, 55);
      
      const table = document.getElementById(tableId);
      if (table) {
        doc.autoTable({ 
          html: `#${tableId}`,
          startY: 70,
          styles: { font: "Kanit", fontStyle: "normal" }
        });
      }
      doc.save(`${titleText.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`);
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
</html>
