// Supabase REST Client and Database Service
const SUPABASE_URL = 'https://vrmjdbwdilqitdttzrcq.supabase.co';
const SUPABASE_REST_URL = SUPABASE_URL + '/rest/v1';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZybWpkYndkaWxxaXRkdHR6cmNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NzkzOTUsImV4cCI6MjA5NzE1NTM5NX0.1XPYA4LAyQOBL1WCKC-oIbsSLYcw3s5W9znimDXqmL4';

// Dynamically load Supabase SDK for Realtime support
(function loadSupabaseSDK() {
  if (!document.getElementById('supabase-sdk')) {
    const script = document.createElement('script');
    script.id = 'supabase-sdk';
    script.src = 'https://unpkg.com/@supabase/supabase-js@2';
    script.onload = () => {
      window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      connectRealtimeDashboard();
    };
    document.head.appendChild(script);
  }
})();

function connectRealtimeDashboard() {
  if (!window.supabaseClient) return;
  // Listen to customer updates
  window.supabaseClient
    .channel('public:customers')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, payload => {
      console.log('Realtime change received: customers!', payload);
      if (typeof loadCustomerTable === 'function') loadCustomerTable();
      if (typeof loadDashboardData === 'function') loadDashboardData();
    })
    .subscribe();

  // Listen to opportunities updates
  window.supabaseClient
    .channel('public:opportunities')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'opportunities' }, payload => {
      console.log('Realtime change received: opportunities!', payload);
      if (typeof loadDashboardData === 'function') loadDashboardData();
    })
    .subscribe();
}

// Default initial data for simulation and seeding
const DEFAULT_CUSTOMERS = [
  {
    id: "c1ef4942-83b3-4f9e-bbb4-7a0df47a0001",
    customer_code: "CUS-260001",
    customer_name: "บริษัท ปตท. จำกัด (มหาชน)",
    tax_id: "0107544000108",
    industry_type: "Energy & Utilities",
    address: "555 ถนนวิภาวดีรังสิต แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900",
    phone: "02-537-2000",
    email: "info@pttplc.com",
    payment_term: 30,
    status: "Active",
    created_at: "2026-06-15T08:00:00.000Z"
  },
  {
    id: "c2ef4942-83b3-4f9e-bbb4-7a0df47a0002",
    customer_code: "CUS-260002",
    customer_name: "บริษัท ปูนซิเมนต์ไทย จำกัด (มหาชน) (SCG)",
    tax_id: "0107537000958",
    industry_type: "Manufacturing",
    address: "1 ถนนปูนซิเมนต์ไทย บางซื่อ กรุงเทพฯ 10800",
    phone: "02-586-3333",
    email: "contact@scg.com",
    payment_term: 45,
    status: "Active",
    created_at: "2026-06-15T08:10:00.000Z"
  },
  {
    id: "c3ef4942-83b3-4f9e-bbb4-7a0df47a0003",
    customer_code: "CUS-260003",
    customer_name: "บริษัท ซีพี ออลล์ จำกัด (มหาชน)",
    tax_id: "0107542000011",
    industry_type: "Retail",
    address: "313 อาคาร ซี.พี.ทาวเวอร์ ชั้น 24 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500",
    phone: "02-071-9000",
    email: "hr@cpall.co.th",
    payment_term: 60,
    status: "Active",
    created_at: "2026-06-15T08:20:00.000Z"
  },
  {
    id: "c4ef4942-83b3-4f9e-bbb4-7a0df47a0004",
    customer_code: "CUS-260004",
    customer_name: "บริษัท แอดวานซ์ อินโฟร์ เซอร์วิส จำกัด (มหาชน) (AIS)",
    tax_id: "0107535000265",
    industry_type: "Telecommunication",
    address: "414 อาคารชินวัตร 1 ถนนพหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400",
    phone: "02-029-5000",
    email: "contact@ais.co.th",
    payment_term: 30,
    status: "Inactive",
    created_at: "2026-06-15T08:30:00.000Z"
  },
  {
    id: "c5ef4942-83b3-4f9e-bbb4-7a0df47a0005",
    customer_code: "CUS-260005",
    customer_name: "บริษัท ไทยเบฟเวอเรจ จำกัด (มหาชน)",
    tax_id: "0107546000342",
    industry_type: "Food & Beverage",
    address: "14 ถนนวิภาวดีรังสิต แขวงจอมพล เขตจตุจักร กรุงเทพฯ 10900",
    phone: "02-785-5555",
    email: "info@thaibev.com",
    payment_term: 30,
    status: "Active",
    created_at: "2026-06-15T08:40:00.000Z"
  }
];

const DEFAULT_CONTACTS = [
  {
    id: "con1ef49-83b3-4f9e-bbb4-7a0df47a0001",
    customer_id: "c1ef4942-83b3-4f9e-bbb4-7a0df47a0001",
    contact_name: "สมชาย รักดี",
    position: "Procurement Specialist",
    phone: "081-234-5678",
    email: "somchai.r@pttplc.com"
  },
  {
    id: "con2ef49-83b3-4f9e-bbb4-7a0df47a0002",
    customer_id: "c1ef4942-83b3-4f9e-bbb4-7a0df47a0001",
    contact_name: "วิภา พรหมศิริ",
    position: "Maintenance Manager",
    phone: "089-876-5432",
    email: "wipa.p@pttplc.com"
  },
  {
    id: "con3ef49-83b3-4f9e-bbb4-7a0df47a0003",
    customer_id: "c2ef4942-83b3-4f9e-bbb4-7a0df47a0002",
    contact_name: "อภิชาต วรวิทย์",
    position: "Engineering Team Lead",
    phone: "083-456-7890",
    email: "apichat@scg.com"
  },
  {
    id: "con4ef49-83b3-4f9e-bbb4-7a0df47a0004",
    customer_id: "c3ef4942-83b3-4f9e-bbb4-7a0df47a0003",
    contact_name: "ดนัย นนทรี",
    position: "Facility Manager",
    phone: "086-111-2222",
    email: "danai@cpall.co.th"
  },
  {
    id: "con5ef49-83b3-4f9e-bbb4-7a0df47a0005",
    customer_id: "c5ef4942-83b3-4f9e-bbb4-7a0df47a0005",
    contact_name: "นเรศ อนันตศิลป์",
    position: "Warehouse Director",
    phone: "084-555-1234",
    email: "nares@thaibev.com"
  }
];

const DEFAULT_OPPORTUNITIES = [
  {
    id: "o1ef4942-83b3-4f9e-bbb4-7a0df4700001",
    opportunity_no: "OPP-260001",
    customer_id: "c1ef4942-83b3-4f9e-bbb4-7a0df47a0001",
    project_name: "Tank Storage Inspection Project",
    service_type: "Testing Service",
    lead_source: "Tender",
    estimated_value: 1250000.00,
    success_probability: 70,
    expected_close_date: "2026-08-30",
    sales_person_id: "ธนพล คำดี (S03)",
    status: "Lead",
    remarks: "ขั้นตอนรวบรวมขอบเขตงานและความต้องการเบื้องต้นของ ปตท.",
    created_at: "2026-06-16T10:00:00.000Z"
  },
  {
    id: "o2ef4942-83b3-4f9e-bbb4-7a0df4700002",
    opportunity_no: "OPP-260002",
    customer_id: "c1ef4942-83b3-4f9e-bbb4-7a0df47a0001",
    project_name: "Boiler Maintenance Equipment Rental",
    service_type: "Equipment Rental",
    lead_source: "Referral",
    estimated_value: 380000.00,
    success_probability: 90,
    expected_close_date: "2026-07-15",
    sales_person_id: "เอกชัย วงศ์ดี (S01)",
    status: "Proposal",
    remarks: "ยื่นใบเสนอราคาค่าเช่าอุปกรณ์ซ่อมบำรุงเรียบร้อยแล้ว มีปุ่มสร้างใบเสนอราคา",
    created_at: "2026-06-16T10:15:00.000Z"
  },
  {
    id: "o3ef4942-83b3-4f9e-bbb4-7a0df4700003",
    opportunity_no: "OPP-260003",
    customer_id: "c2ef4942-83b3-4f9e-bbb4-7a0df47a0002",
    project_name: "SCG Plant Welding Support Service",
    service_type: "Manpower Supply",
    lead_source: "Existing Customer",
    estimated_value: 850000.00,
    success_probability: 80,
    expected_close_date: "2026-09-10",
    sales_person_id: "สุชาดา เลิศวิริยะ (S02)",
    status: "Negotiation",
    remarks: "อยู่ระหว่างเจรจาขอบเขตทักษะช่างเชื่อมและการรับประกันผลงาน",
    created_at: "2026-06-16T10:30:00.000Z"
  },
  {
    id: "o4ef4942-83b3-4f9e-bbb4-7a0df4700004",
    opportunity_no: "OPP-260004",
    customer_id: "c2ef4942-83b3-4f9e-bbb4-7a0df47a0002",
    project_name: "SCG Structural Piping Design",
    service_type: "Engineering Service",
    lead_source: "Call In",
    estimated_value: 1500000.00,
    success_probability: 100,
    expected_close_date: "2026-06-25",
    sales_person_id: "สุชาดา เลิศวิริยะ (S02)",
    status: "Won",
    remarks: "ชนะการประมูล ได้รับใบสั่งสั่งซื้อเรียบร้อยแล้ว",
    created_at: "2026-06-16T10:45:00.000Z"
  },
  {
    id: "o5ef4942-83b3-4f9e-bbb4-7a0df4700005",
    opportunity_no: "OPP-260005",
    customer_id: "c3ef4942-83b3-4f9e-bbb4-7a0df47a0003",
    project_name: "CP All Logistics Center Inspection",
    service_type: "Testing Service",
    lead_source: "Connection",
    estimated_value: 450000.00,
    success_probability: 50,
    expected_close_date: "2026-10-15",
    sales_person_id: "ธนพล คำดี (S03)",
    status: "Qualified",
    remarks: "ยืนยันความพร้อมหน้างานเตรียมยื่นสัญญาทดสอบรอบสุดท้าย",
    created_at: "2026-06-16T11:00:00.000Z"
  },
  {
    id: "o6ef4942-83b3-4f9e-bbb4-7a0df4700006",
    opportunity_no: "OPP-260006",
    customer_id: "c4ef4942-83b3-4f9e-bbb4-7a0df47a0004",
    project_name: "AIS Server Room Cold Cutting Service",
    service_type: "Engineering Service",
    lead_source: "Walk In",
    estimated_value: 300000.00,
    success_probability: 0,
    expected_close_date: "2026-06-20",
    sales_person_id: "เอกชัย วงศ์ดี (S01)",
    status: "Lost",
    remarks: "ยกเลิกเนื่องจากราคากลางสูงเกินกว่างบประมาณไอทีของทางเอไอเอส",
    created_at: "2026-06-16T11:15:00.000Z"
  },
  {
    id: "o7ef4942-83b3-4f9e-bbb4-7a0df4700007",
    opportunity_no: "OPP-260007",
    customer_id: "c5ef4942-83b3-4f9e-bbb4-7a0df47a0005",
    project_name: "ThaiBev Machinery Hydrostatic Testing",
    service_type: "Testing Service",
    lead_source: "Website",
    estimated_value: 620000.00,
    success_probability: 0,
    expected_close_date: "2026-07-31",
    sales_person_id: "ธนพล คำดี (S03)",
    status: "Cancelled",
    remarks: "ลูกค้าชะลอแผนการปรับปรุงเพื่อจัดกลุ่มโครงงานไปปีงบหน้า",
    created_at: "2026-06-16T11:30:00.000Z"
  },
  {
    id: "o8ef4942-83b3-4f9e-bbb4-7a0df4700008",
    opportunity_no: "OPP-260008",
    customer_id: "c3ef4942-83b3-4f9e-bbb4-7a0df47a0003",
    project_name: "CP All Cooling Tower Manpower supply",
    service_type: "Manpower Supply",
    lead_source: "Connection",
    estimated_value: 500000.00,
    success_probability: 40,
    expected_close_date: "2026-11-30",
    sales_person_id: "สุชาดา เลิศวิริยะ (S02)",
    status: "Lead",
    remarks: "ส่งร่างโปรไฟล์ช่างเทคนิคเบื้องต้นให้ฝ่ายจัดหาสถานที่พิจารณา",
    created_at: "2026-06-16T11:45:00.000Z"
  },
  {
    id: "o9ef4942-83b3-4f9e-bbb4-7a0df4700009",
    opportunity_no: "OPP-260009",
    customer_id: "c1ef4942-83b3-4f9e-bbb4-7a0df47a0001",
    project_name: "PTT Gas Pipe Maintenance Support",
    service_type: "Engineering Service",
    lead_source: "Tender",
    estimated_value: 2350000.00,
    success_probability: 60,
    expected_close_date: "2026-09-30",
    sales_person_id: "เอกชัย วงศ์ดี (S01)",
    status: "Qualified",
    remarks: "ผู้ตรวจสอบผ่านคุณสมบัติ คาดเตรียมสรุปราคากองทุนปลายเดือน",
    created_at: "2026-06-16T12:00:00.000Z"
  },
  {
    id: "o10f4942-83b3-4f9e-bbb4-7a0df4700010",
    opportunity_no: "OPP-260010",
    customer_id: "c5ef4942-83b3-4f9e-bbb4-7a0df47a0005",
    project_name: "ThaiBev Brewery Flange Facing Service",
    service_type: "Engineering Service",
    lead_source: "Existing Customer",
    estimated_value: 190000.00,
    success_probability: 95,
    expected_close_date: "2026-07-10",
    sales_person_id: "ธนพล คำดี (S03)",
    status: "Negotiation",
    remarks: "สรุปอัตราค่าซ่อมและการถ่วงเวลาทำงานฉุกเฉินเรียบร้อย รอจดสัญญาสัปดาห์หน้า",
    created_at: "2026-06-16T12:15:00.000Z"
  }
];

const DEFAULT_QUOTATIONS = [
  {
    id: "q1ef4942-83b3-4f9e-bbb4-7a0df47ab001",
    quotation_no: "QT-0001-26",
    customer_id: "c1ef4942-83b3-4f9e-bbb4-7a0df47a0001",
    opportunity_id: "o2ef4942-83b3-4f9e-bbb4-7a0df4700002",
    title: "Boiler Maintenance Equipment Rental",
    quotation_date: "2026-06-16",
    validity_days: 30,
    payment_term: "30 Days",
    status: "Approved",
    sales_person: "เอกชัย วงศ์ดี (S01)",
    items: [
      {
        item_no: 1,
        qty: 1,
        unit: "Set",
        description: "Provision of HP Hot Boiler Wash Tooling Set",
        duration: 10,
        unit_rate: 30000.00,
        total_price: 300000.00
      },
      {
        item_no: 2,
        qty: 2,
        unit: "Team",
        description: "Onsite Support Technicians for Maintenance Tasks",
        duration: 10,
        unit_rate: 4000.00,
        total_price: 80000.00
      }
    ],
    total_value: 380000.00,
    tax_rate: 7,
    grand_total: 406600.00,
    terms_conditions: "1. Deliver within 7 days after PO receipt.\n2. Invoices generated upon dynamic phase completion.\n3. Standard rental service warranty applies.",
    created_at: "2026-06-16T10:15:00.000Z"
  },
  {
    id: "q2ef4942-83b3-4f9e-bbb4-7a0df47ab002",
    quotation_no: "QT-0002-26",
    customer_id: "c1ef4942-83b3-4f9e-bbb4-7a0df47a0001",
    opportunity_id: "o1ef4942-83b3-4f9e-bbb4-7a0df4700001",
    title: "Tank Storage Inspection Project",
    quotation_date: "2026-06-16",
    validity_days: 30,
    payment_term: "30 Days",
    status: "Sent",
    sales_person: "ธนพล คำดี (S03)",
    items: [
      {
        item_no: 1,
        qty: 1,
        unit: "Set",
        description: "Provision of HP Water Jet Pump 15,000 PSI",
        duration: 12,
        unit_rate: 12000.00,
        total_price: 144000.00
      },
      {
        item_no: 2,
        qty: 1,
        unit: "Set",
        description: "Ultrasonics Thickness Gauge Rental UT5000",
        duration: 12,
        unit_rate: 2500.00,
        total_price: 30000.00
      },
      {
        item_no: 3,
        qty: 2,
        unit: "Person",
        description: "Senior ASNT Level II Thickness Survey Inspectors",
        duration: 12,
        unit_rate: 5000.00,
        total_price: 120000.00
      }
    ],
    total_value: 294000.00,
    tax_rate: 7,
    grand_total: 314580.00,
    terms_conditions: "1. Price includes routine mobilization but excludes high altitude lift rigs.\n2. Report issued within 5 working days post-inspection.\n3. Standard credit terms apply.",
    created_at: "2026-06-16T11:20:00.000Z"
  },
  {
    id: "q3ef4942-83b3-4f9e-bbb4-7a0df47ab003",
    quotation_no: "QT-0003-26",
    customer_id: "c2ef4942-83b3-4f9e-bbb4-7a0df47a0002",
    opportunity_id: "o3ef4942-83b3-4f9e-bbb4-7a0df4700003",
    title: "Equipment Rental & Calibration Service",
    quotation_date: "2026-05-18",
    validity_days: 30,
    payment_term: "30 Days",
    status: "Sent",
    sales_person: "สุชาดา เลิศวิริยะ (S02)",
    items: [
      {
        item_no: 1,
        qty: 1,
        unit: "Set",
        description: "Calibration of Hydrotest Pump with Chart Recorder - Model HP-30K",
        duration: 1,
        unit_rate: 45000.00,
        total_price: 45000.00
      }
    ],
    total_value: 45000.00,
    tax_rate: 7,
    grand_total: 48150.00,
    terms_conditions: "1. Calibration certificate valid for 1 year.\n2. Payment terms 30 days.",
    created_at: "2026-05-18T10:00:00.000Z"
  },
  {
    id: "q4ef4942-83b3-4f9e-bbb4-7a0df47ab004",
    quotation_no: "QT-0004-26",
    customer_id: "c3ef4942-83b3-4f9e-bbb4-7a0df47a0003",
    opportunity_id: "o1ef4942-83b3-4f9e-bbb4-7a0df4700001",
    title: "High Pressure Testing Supplies",
    quotation_date: "2026-05-10",
    validity_days: 30,
    payment_term: "30 Days",
    status: "Sent",
    sales_person: "ธนพล คำดี (S03)",
    items: [
      {
        item_no: 1,
        qty: 10,
        unit: "Pcs",
        description: "Stainless Steel High Pressure Fittings 1/2 inch",
        duration: 1,
        unit_rate: 2500.00,
        total_price: 25000.00
      }
    ],
    total_value: 25000.00,
    tax_rate: 7,
    grand_total: 26750.00,
    terms_conditions: "1. Deliveries ex-stock Bangkok.\n2. Offer subject to prior sales.",
    created_at: "2026-05-10T14:20:00.000Z"
  }
];

const DEFAULT_INVOICES = [
  {
    id: "i1ef4942-83b3-4f9e-bbb4-7a0df47ac001",
    invoice_no: "INV-0001-26",
    quotation_no: "QT-0001-26",
    customer_id: "c1ef4942-83b3-4f9e-bbb4-7a0df47a0001",
    po_reference: "PTT-PO-26008892",
    project_name: "Provision of Rental Equipment and Manpower Services for PTT ESP Plant",
    invoice_date: "2026-06-17",
    due_date: "2026-07-17",
    status: "Paid",
    sales_person: "เอกชัย วงศ์ดี (S01)",
    items: [
      {
        item_no: 1,
        description: "Provision of HP Hot Boiler Wash Tooling Set Set",
        qty: 1,
        unit: "Set",
        unit_rate: 30000.00,
        duration: 5,
        total_price: 150000.00
      },
      {
        item_no: 2,
        description: "Onsite Support Technicians for Maintenance - Level I",
        qty: 1,
        unit: "Team",
        unit_rate: 4000.00,
        duration: 10,
        total_price: 40000.00
      }
    ],
    total_value: 190000.00,
    tax_rate: 7,
    grand_total: 203300.00,
    remarks: "Paid via bank transfer Ref #KBank-9908123. Thank you for your business.",
    created_at: "2026-06-17T09:00:00.000Z"
  },
  {
    id: "i2ef4942-83b3-4f9e-bbb4-7a0df47ac002",
    invoice_no: "INV-0002-26",
    quotation_no: "QT-0003-26",
    customer_id: "c2ef4942-83b3-4f9e-bbb4-7a0df47a0002",
    po_reference: "SCG-PO-260211",
    project_name: "Calibration and Test Loop Audit - SCG Rayong Plant",
    invoice_date: "2026-05-10",
    due_date: "2026-06-10",
    status: "Unpaid",
    sales_person: "สุชาดา เลิศวิริยะ (S02)",
    items: [
      {
        item_no: 1,
        description: "Calibration of Hydrotest Pump with Chart Recorder - Model HP-30K",
        qty: 1,
        unit: "Set",
        unit_rate: 45000.00,
        duration: 1,
        total_price: 45000.00
      }
    ],
    total_value: 45000.00,
    tax_rate: 7,
    grand_total: 48150.00,
    remarks: "Overdue payment warning issued on 2026-06-12.",
    created_at: "2026-05-10T10:00:00.000Z"
  },
  {
    id: "i3ef4942-83b3-4f9e-bbb4-7a0df47ac003",
    invoice_no: "INV-0003-26",
    quotation_no: "QT-0004-26",
    customer_id: "c3ef4942-83b3-4f9e-bbb4-7a0df47a0003",
    po_reference: "CPALL-PO-9912",
    project_name: "Emergency Boiler Inspection and Tooling Support",
    invoice_date: "2026-04-25",
    due_date: "2026-05-25",
    status: "Overdue",
    sales_person: "ธนพล คำดี (S03)",
    items: [
      {
        item_no: 1,
        description: "Boiler Safety Valve Repair and Fast Response Inspection",
        qty: 1,
        unit: "Set",
        unit_rate: 120000.00,
        duration: 1,
        total_price: 120000.00
      }
    ],
    total_value: 120000.00,
    tax_rate: 7,
    grand_total: 128400.00,
    remarks: "Finance department awaiting final payment approval loop.",
    created_at: "2026-04-25T11:00:00.000Z"
  }
];

// Helper to check and retrieve connection settings
function getConnectivityMode() {
  const mode = localStorage.getItem('crm_use_cloud');
  return mode === null ? true : JSON.parse(mode);
}

// REST helper
async function restRequest(endpoint, options = {}) {
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${SUPABASE_REST_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase Error (${response.status}): ${text}`);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Initialization of Local Backup
function initLocalData() {
  if (!localStorage.getItem('crm_customers')) {
    localStorage.setItem('crm_customers', JSON.stringify(DEFAULT_CUSTOMERS));
  }
  if (!localStorage.getItem('crm_contacts')) {
    localStorage.setItem('crm_contacts', JSON.stringify(DEFAULT_CONTACTS));
  }
  if (!localStorage.getItem('crm_opportunities')) {
    localStorage.setItem('crm_opportunities', JSON.stringify(DEFAULT_OPPORTUNITIES));
  }
  if (!localStorage.getItem('crm_quotations')) {
    localStorage.setItem('crm_quotations', JSON.stringify(DEFAULT_QUOTATIONS));
  } else {
    try {
      const qList = JSON.parse(localStorage.getItem('crm_quotations')) || [];
      if (!qList.some(q => q.quotation_no === 'QT-0003-26')) {
        qList.push(...DEFAULT_QUOTATIONS.filter(q => q.quotation_no === 'QT-0003-26' || q.quotation_no === 'QT-0004-26'));
        localStorage.setItem('crm_quotations', JSON.stringify(qList));
      }
    } catch (e) {
      console.warn("Failed to check and heal quotations", e);
    }
  }
  if (!localStorage.getItem('crm_invoices')) {
    localStorage.setItem('crm_invoices', JSON.stringify(DEFAULT_INVOICES));
  } else {
    try {
      const iList = JSON.parse(localStorage.getItem('crm_invoices')) || [];
      if (!iList.some(i => i.invoice_no === 'INV-0002-26')) {
        iList.push(...DEFAULT_INVOICES.filter(i => i.invoice_no === 'INV-0002-26' || i.invoice_no === 'INV-0003-26'));
        localStorage.setItem('crm_invoices', JSON.stringify(iList));
      }
    } catch (e) {
      console.warn("Failed to check and heal invoices", e);
    }
  }
  if (!localStorage.getItem('crm_activities')) {
    localStorage.setItem('crm_activities', JSON.stringify([]));
  }
}

initLocalData();

const SupabaseDB = {
  // Test connection to cloud database
  async testConnection() {
    if (!getConnectivityMode()) return false;
    try {
      await restRequest('/customers?select=id&limit=1', { method: 'GET' });
      return true;
    } catch (e) {
      console.warn("REST endpoint offline or schema not present. Falling back to LocalStorage.", e);
      return false;
    }
  },

  // -----------------------
  // CUSTOMER & CONTACTS CRUD
  // -----------------------
  async getCustomers() {
    const isCloud = await this.testConnection();
    if (isCloud) {
      try {
        const rawCusts = await restRequest('/customers?order=customer_code.asc');
        let rawContacts = [];
        try {
          rawContacts = await restRequest('/customer_contacts') || [];
        } catch (err) {
          console.warn("customer_contacts endpoint missing, using empty default", err);
        }

        // Group contacts and attach
        const map = rawCusts.map(cust => {
          return {
            ...cust,
            contacts: rawContacts.filter(c => c.customer_id === cust.id)
          };
        });

        localStorage.setItem('crm_customers', JSON.stringify(map));
        return map;
      } catch (e) {
        console.warn("Fetch Cloud Customers failed. fallback to local", e);
        return JSON.parse(localStorage.getItem('crm_customers')) || [];
      }
    } else {
      const custs = JSON.parse(localStorage.getItem('crm_customers')) || [];
      const conts = JSON.parse(localStorage.getItem('crm_contacts')) || [];
      return custs.map(cust => ({
        ...cust,
        contacts: conts.filter(c => c.customer_id === cust.id)
      }));
    }
  },

  async addCustomer(customerData) {
    const customers = JSON.parse(localStorage.getItem('crm_customers')) || [];
    
    // Auto customer code
    const yr = '26';
    const thisYr = customers.filter(c => c.customer_code.startsWith(`CUS-${yr}`));
    let seq = 1;
    if (thisYr.length > 0) {
      const seqs = thisYr.map(c => parseInt(c.customer_code.replace(`CUS-${yr}`, ''), 10));
      seq = Math.max(...seqs) + 1;
    }
    const nextCode = `CUS-${yr}${String(seq).padStart(4, '0')}`;
    const newId = crypto.randomUUID();

    const newCustomer = {
      ...customerData,
      id: newId,
      customer_code: nextCode,
      created_at: new Date().toISOString()
    };

    // Split contacts from payload
    const contacts = customerData.contacts || [];
    delete newCustomer.contacts;

    // Save locally
    const savedCusts = [...customers, { ...newCustomer, contacts }];
    localStorage.setItem('crm_customers', JSON.stringify(savedCusts));

    const completeLocalContacts = JSON.parse(localStorage.getItem('crm_contacts')) || [];
    const formattedContacts = contacts.map(c => ({
      id: crypto.randomUUID(),
      customer_id: newId,
      ...c
    }));
    localStorage.setItem('crm_contacts', JSON.stringify([...completeLocalContacts, ...formattedContacts]));

    const isCloud = await this.testConnection();
    if (isCloud) {
      try {
        const response = await restRequest('/customers', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify(newCustomer)
        });
        
        // Save contacts to cloud if table exists
        if (formattedContacts.length > 0) {
          for (const con of formattedContacts) {
            try {
              await restRequest('/customer_contacts', {
                method: 'POST',
                body: JSON.stringify(con)
              });
            } catch (err) {
              console.warn("Could not insert contact on cloud", err);
            }
          }
        }
        return response ? response[0] : newCustomer;
      } catch (err) {
        console.warn("Cloud insert failed, saved locally", err);
      }
    }
    return { ...newCustomer, contacts: formattedContacts };
  },

  async updateCustomer(id, updates) {
    // Save locally
    const customers = JSON.parse(localStorage.getItem('crm_customers')) || [];
    const idx = customers.findIndex(c => c.id === id);
    if (idx !== -1) {
      const contacts = updates.contacts || customers[idx].contacts || [];
      const updatedCust = { ...customers[idx], ...updates };
      delete updatedCust.contacts;

      customers[idx] = { ...updatedCust, contacts };
      localStorage.setItem('crm_customers', JSON.stringify(customers));

      // Update contacts locally
      if (updates.contacts) {
        let allContacts = JSON.parse(localStorage.getItem('crm_contacts')) || [];
        allContacts = allContacts.filter(c => c.customer_id !== id);
        const formatted = contacts.map(c => ({
          id: c.id || crypto.randomUUID(),
          customer_id: id,
          ...c
        }));
        localStorage.setItem('crm_contacts', JSON.stringify([...allContacts, ...formatted]));
      }

      const isCloud = await this.testConnection();
      if (isCloud) {
        try {
          const body = { ...updates };
          delete body.contacts;
          await restRequest(`/customers?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body)
          });

          if (updates.contacts) {
            try {
              await restRequest(`/customer_contacts?customer_id=eq.${id}`, { method: 'DELETE' });
              for (const con of contacts) {
                const conBody = {
                  customer_id: id,
                  contact_name: con.contact_name,
                  position: con.position,
                  phone: con.phone,
                  email: con.email
                };
                await restRequest('/customer_contacts', {
                  method: 'POST',
                  body: JSON.stringify(conBody)
                });
              }
            } catch (conErr) {
              console.warn("Failed to update contacts table on cloud", conErr);
            }
          }
        } catch (e) {
          console.warn("Cloud update failed, saved locally", e);
        }
      }
      return customers[idx];
    }
    throw new Error("Customer not found");
  },

  async deleteCustomer(id) {
    if (!this.isAdmin()) {
      throw new Error("คุณไม่มีสิทธิ์ลบข้อมูลลูกค้า เฉพาะ Admin เท่านั้น (Admin permission required)");
    }
    // Delete locally
    const customers = JSON.parse(localStorage.getItem('crm_customers')) || [];
    const filtered = customers.filter(c => c.id !== id);
    localStorage.setItem('crm_customers', JSON.stringify(filtered));

    let allContacts = JSON.parse(localStorage.getItem('crm_contacts')) || [];
    allContacts = allContacts.filter(c => c.customer_id !== id);
    localStorage.setItem('crm_contacts', JSON.stringify(allContacts));

    // Also delete tied opportunities
    const opportunities = JSON.parse(localStorage.getItem('crm_opportunities')) || [];
    localStorage.setItem('crm_opportunities', JSON.stringify(opportunities.filter(o => o.customer_id !== id)));

    const isCloud = await this.testConnection();
    if (isCloud) {
      try {
        try {
          await restRequest(`/customer_contacts?customer_id=eq.${id}`, { method: 'DELETE' });
        } catch (err) {}
        try {
          await restRequest(`/opportunities?customer_id=eq.${id}`, { method: 'DELETE' });
        } catch (err) {}
        await restRequest(`/customers?id=eq.${id}`, { method: 'DELETE' });
      } catch (e) {
        console.warn("Cloud delete failed, completed locally", e);
      }
    }
    return true;
  },

  // -----------------------
  // OPPORTUNITIES CRUD
  // -----------------------
  async getOpportunities() {
    const isCloud = await this.testConnection();
    const localCusts = await this.getCustomers();
    const custMap = new Map(localCusts.map(c => [c.id, c]));

    if (isCloud) {
      try {
        const rawOpps = await restRequest('/opportunities?order=opportunity_no.desc');
        const hydrated = rawOpps.map(opp => ({
          ...opp,
          customer: custMap.get(opp.customer_id)
        }));
        localStorage.setItem('crm_opportunities', JSON.stringify(hydrated));
        return hydrated;
      } catch (err) {
        console.warn("Fetch Cloud Opportunities failed. fallback to local", err);
        return JSON.parse(localStorage.getItem('crm_opportunities')) || [];
      }
    } else {
      const opps = JSON.parse(localStorage.getItem('crm_opportunities')) || [];
      return opps.map(opp => ({
        ...opp,
        customer: custMap.get(opp.customer_id)
      })).sort((a,b) => b.opportunity_no.localeCompare(a.opportunity_no));
    }
  },

  async addOpportunity(oppData) {
    const opportunities = JSON.parse(localStorage.getItem('crm_opportunities')) || [];
    
    // Auto Generate Code
    const yr = '26';
    const thisYr = opportunities.filter(o => o.opportunity_no.startsWith(`OPP-${yr}`));
    let seq = 1;
    if (thisYr.length > 0) {
      const seqs = thisYr.map(o => parseInt(o.opportunity_no.replace(`OPP-${yr}`, ''), 10));
      seq = Math.max(...seqs) + 1;
    }
    const nextCode = `OPP-${yr}${String(seq).padStart(4, '0')}`;
    const newId = crypto.randomUUID();

    const currentUser = this.getCurrentUser();
    const newOpp = {
      ...oppData,
      id: newId,
      opportunity_no: nextCode,
      estimated_value: parseFloat(oppData.estimated_value) || 0,
      success_probability: parseInt(oppData.success_probability) || 0,
      created_by: currentUser.id,
      updated_by: currentUser.id,
      created_at: new Date().toISOString()
    };

    // Save locally
    const localCustomers = JSON.parse(localStorage.getItem('crm_customers')) || [];
    newOpp.customer = localCustomers.find(c => c.id === oppData.customer_id);

    const savedOpps = [...opportunities, newOpp];
    localStorage.setItem('crm_opportunities', JSON.stringify(savedOpps));

    // Cloud insert
    const isCloud = await this.testConnection();
    if (isCloud) {
      try {
        const cloudPayload = { ...newOpp };
        delete cloudPayload.customer; // Strip circular relation database
        const response = await restRequest('/opportunities', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify(cloudPayload)
        });
        return response ? response[0] : newOpp;
      } catch (err) {
        console.warn("Cloud insert failed, completed locally", err);
      }
    }
    return newOpp;
  },

  async updateOpportunity(id, updates) {
    const opportunities = JSON.parse(localStorage.getItem('crm_opportunities')) || [];
    const idx = opportunities.findIndex(o => o.id === id);
    if (idx !== -1) {
      const currentUser = this.getCurrentUser();
      const updatedOpp = { ...opportunities[idx], ...updates, updated_by: currentUser.id };
      
      // sync customer
      const localCustomers = JSON.parse(localStorage.getItem('crm_customers')) || [];
      updatedOpp.customer = localCustomers.find(c => c.id === updatedOpp.customer_id);

      opportunities[idx] = updatedOpp;
      localStorage.setItem('crm_opportunities', JSON.stringify(opportunities));

      const isCloud = await this.testConnection();
      if (isCloud) {
        try {
          const cloudPayload = { ...updatedOpp };
          delete cloudPayload.customer; // Strip circular database info
          await restRequest(`/opportunities?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify(cloudPayload)
          });
        } catch (e) {
          console.warn("Cloud PATCH failed, synced locally", e);
        }
      }
      return updatedOpp;
    }
    throw new Error("Opportunity not found");
  },

  async deleteOpportunity(id) {
    if (!this.isAdmin()) {
      throw new Error("คุณไม่มีสิทธิ์ลบข้อมูลโอกาสขาย เฉพาะ Admin เท่านั้น (Admin permission required)");
    }
    const opportunities = JSON.parse(localStorage.getItem('crm_opportunities')) || [];
    const filtered = opportunities.filter(o => o.id !== id);
    localStorage.setItem('crm_opportunities', JSON.stringify(filtered));

    const isCloud = await this.testConnection();
    if (isCloud) {
      try {
        await restRequest(`/opportunities?id=eq.${id}`, { method: 'DELETE' });
      } catch (e) {
        console.warn("Cloud delete failed, completed locally", e);
      }
    }
    return true;
  },

  // -----------------------
  // QUOTATIONS CRUD
  // -----------------------
  async getQuotations() {
    const isCloud = await this.testConnection();
    const localCusts = await this.getCustomers();
    const custMap = new Map(localCusts.map(c => [c.id, c]));
    const localOpps = await this.getOpportunities();
    const oppMap = new Map(localOpps.map(o => [o.id, o]));

    if (isCloud) {
      try {
        const rawQuotes = await restRequest('/quotations?order=quotation_no.desc') || [];
        const hydrated = rawQuotes.map(q => ({
          ...q,
          customer: custMap.get(q.customer_id),
          opportunity: oppMap.get(q.opportunity_id)
        }));
        localStorage.setItem('crm_quotations', JSON.stringify(hydrated));
        return hydrated;
      } catch (err) {
        console.warn("Fetch Cloud Quotations failed, using local fallback", err);
      }
    }
    const quotes = JSON.parse(localStorage.getItem('crm_quotations')) || [];
    return quotes.map(q => ({
      ...q,
      customer: custMap.get(q.customer_id),
      opportunity: oppMap.get(q.opportunity_id)
    })).sort((a, b) => b.quotation_no.localeCompare(a.quotation_no));
  },

  async getQuotationById(id) {
    const quotes = await this.getQuotations();
    return quotes.find(q => q.id === id);
  },

  async addQuotation(quoteData) {
    const quotes = JSON.parse(localStorage.getItem('crm_quotations')) || [];
    
    // Auto Generate Code based on the year of quotation_date
    const qDate = quoteData.quotation_date || new Date().toISOString().slice(0, 10);
    const yr = qDate.split('-')[0].slice(-2); // e.g. "26"

    let seq = 1;
    if (quotes.length > 0) {
      const seqs = quotes.map(q => {
        const match = q.quotation_no.match(/^QT-(\d{4})-\d{2}/);
        return match ? parseInt(match[1], 10) : 0;
      });
      seq = Math.max(...seqs, 0) + 1;
    }
    const nextCode = `QT-${String(seq).padStart(4, '0')}-${yr}`;
    const newId = crypto.randomUUID();

    const currentUser = this.getCurrentUser();
    const newQuote = {
      ...quoteData,
      id: newId,
      quotation_no: nextCode,
      total_value: parseFloat(quoteData.total_value) || 0,
      tax_rate: parseFloat(quoteData.tax_rate) || 7,
      grand_total: parseFloat(quoteData.grand_total) || 0,
      created_by: currentUser.id,
      updated_by: currentUser.id,
      created_at: new Date().toISOString()
    };

    const savedQuotes = [...quotes, newQuote];
    localStorage.setItem('crm_quotations', JSON.stringify(savedQuotes));

    const isCloud = await this.testConnection();
    if (isCloud) {
       try {
         const dbPayload = { ...newQuote };
         delete dbPayload.customer;
         delete dbPayload.customer_name;
         await restRequest('/quotations', {
           method: 'POST',
           body: JSON.stringify(dbPayload)
         });
       } catch (err) {
         console.warn("Cloud addQuotation failed, completed locally", err);
       }
    }
    return newQuote;
  },

  async updateQuotation(id, updates, isEditMode = false) {
    const quotes = JSON.parse(localStorage.getItem('crm_quotations')) || [];
    const idx = quotes.findIndex(q => q.id === id);
    if (idx !== -1) {
      let currentNo = quotes[idx].quotation_no;
      
      // Revision handling: "หากมีการแก้ไขก็จะ QT-0001-26-R1"
      if (isEditMode) {
        // Find base quote number e.g. "QT-0001-26"
        const rx = /^(QT-\d{4}-\d{2})(-R(\d+))?$/;
        const match = currentNo.match(rx);
        if (match) {
          const base = match[1];
          const rev = match[3] ? parseInt(match[3], 10) + 1 : 1;
          currentNo = `${base}-R${rev}`;
        } else {
          currentNo = `${currentNo}-R1`;
        }
      }

      const currentUser = this.getCurrentUser();
      const updatedQuote = { 
        ...quotes[idx], 
        ...updates, 
        quotation_no: currentNo,
        total_value: parseFloat(updates.total_value !== undefined ? updates.total_value : quotes[idx].total_value) || 0,
        grand_total: parseFloat(updates.grand_total !== undefined ? updates.grand_total : quotes[idx].grand_total) || 0,
        updated_by: currentUser.id
      };

      quotes[idx] = updatedQuote;
      localStorage.setItem('crm_quotations', JSON.stringify(quotes));

      const isCloud = await this.testConnection();
      if (isCloud) {
        try {
          const dbPayload = { ...updatedQuote };
          delete dbPayload.customer;
          delete dbPayload.customer_name;
          await restRequest(`/quotations?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dbPayload)
          });
        } catch (e) {
          console.warn("Cloud updateQuotation failed, completed locally", e);
        }
      }
      return updatedQuote;
    }
    throw new Error("Quotation not found");
  },

  async deleteQuotation(id) {
    if (!this.isAdmin()) {
      throw new Error("คุณไม่มีสิทธิ์ลบข้อมูลใบเสนอราคา เฉพาะ Admin เท่านั้น (Admin permission required)");
    }
    const quotes = JSON.parse(localStorage.getItem('crm_quotations')) || [];
    const filtered = quotes.filter(q => q.id !== id);
    localStorage.setItem('crm_quotations', JSON.stringify(filtered));

    const isCloud = await this.testConnection();
    if (isCloud) {
      try {
        await restRequest(`/quotations?id=eq.${id}`, { method: 'DELETE' });
      } catch (e) {
        console.warn("Cloud deleteQuotation failed, completed locally", e);
      }
    }
    return true;
  },

  // -----------------------
  // INVOICES CRUD
  // -----------------------
  async getInvoices() {
    const isCloud = await this.testConnection();
    const localCusts = await this.getCustomers();
    const custMap = new Map(localCusts.map(c => [c.id, c]));

    if (isCloud) {
      try {
        const rawInvoices = await restRequest('/invoices?order=invoice_no.desc') || [];
        const hydrated = rawInvoices.map(inv => ({
          ...inv,
          customer: custMap.get(inv.customer_id)
        }));
        localStorage.setItem('crm_invoices', JSON.stringify(hydrated));
        return hydrated;
      } catch (err) {
        console.warn("Fetch Cloud Invoices failed, using local fallback", err);
      }
    }
    const invoices = JSON.parse(localStorage.getItem('crm_invoices')) || [];
    return invoices.map(inv => ({
      ...inv,
      customer: custMap.get(inv.customer_id)
    })).sort((a, b) => b.invoice_no.localeCompare(a.invoice_no));
  },

  async getInvoiceById(id) {
    const invoices = await this.getInvoices();
    return invoices.find(inv => inv.id === id);
  },

  async addInvoice(invData) {
    const invoices = JSON.parse(localStorage.getItem('crm_invoices')) || [];
    
    // Auto Generate Code based on invoice_date
    const iDate = invData.invoice_date || new Date().toISOString().slice(0, 10);
    const yr = iDate.split('-')[0].slice(-2); // e.g. "26"

    const thisYearInvs = invoices.filter(inv => inv.invoice_no.startsWith(`INV-${yr}`));

    let seq = 1;
    if (thisYearInvs.length > 0) {
      const seqs = thisYearInvs.map(inv => {
        const seqPart = inv.invoice_no.replace(`INV-${yr}`, '');
        const num = parseInt(seqPart, 10);
        return isNaN(num) ? 0 : num;
      });
      seq = Math.max(...seqs, 0) + 1;
    }
    const nextCode = `INV-${yr}${String(seq).padStart(4, '0')}`;
    const newId = crypto.randomUUID();

    const currentUser = this.getCurrentUser();
    const newInv = {
      ...invData,
      id: newId,
      invoice_no: nextCode,
      total_value: parseFloat(invData.total_value) || 0,
      tax_rate: parseFloat(invData.tax_rate) || 7,
      grand_total: parseFloat(invData.grand_total) || 0,
      created_by: currentUser.id,
      updated_by: currentUser.id,
      created_at: new Date().toISOString()
    };

    const savedInvoices = [...invoices, newInv];
    localStorage.setItem('crm_invoices', JSON.stringify(savedInvoices));

    const isCloud = await this.testConnection();
    if (isCloud) {
       try {
         await restRequest('/invoices', {
           method: 'POST',
           body: JSON.stringify(newInv)
         });
       } catch (err) {
         console.warn("Cloud addInvoice failed, completed locally", err);
       }
    }
    return newInv;
  },

  async updateInvoice(id, updates) {
    const invoices = JSON.parse(localStorage.getItem('crm_invoices')) || [];
    const idx = invoices.findIndex(inv => inv.id === id);
    if (idx !== -1) {
      const currentUser = this.getCurrentUser();
      const updatedInv = { 
        ...invoices[idx], 
        ...updates,
        total_value: parseFloat(updates.total_value !== undefined ? updates.total_value : invoices[idx].total_value) || 0,
        grand_total: parseFloat(updates.grand_total !== undefined ? updates.grand_total : invoices[idx].grand_total) || 0,
        updated_by: currentUser.id
      };
      
      invoices[idx] = updatedInv;
      localStorage.setItem('crm_invoices', JSON.stringify(invoices));

      const isCloud = await this.testConnection();
      if (isCloud) {
        try {
          await restRequest(`/invoices?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updatedInv)
          });
        } catch (e) {
          console.warn("Cloud updateInvoice failed, completed locally", e);
        }
      }
      return updatedInv;
    }
    throw new Error("Invoice not found");
  },

  async deleteInvoice(id) {
    if (!this.isAdmin()) {
      throw new Error("คุณไม่มีสิทธิ์ลบข้อมูลใบแจ้งหนี้ เฉพาะ Admin เท่านั้น (Admin permission required)");
    }
    const invoices = JSON.parse(localStorage.getItem('crm_invoices')) || [];
    const filtered = invoices.filter(inv => inv.id !== id);
    localStorage.setItem('crm_invoices', JSON.stringify(filtered));

    const isCloud = await this.testConnection();
    if (isCloud) {
      try {
        await restRequest(`/invoices?id=eq.${id}`, { method: 'DELETE' });
      } catch (e) {
        console.warn("Cloud deleteInvoice failed, completed locally", e);
      }
    }
    return true;
  },

  // -----------------------
  // USERS DB SYSTEM (SUPABASE SYNC)
  // -----------------------
  async getUsers() {
    const isCloud = await this.testConnection();
    if (isCloud) {
      try {
        const rawUsers = await restRequest('/users');
        if (rawUsers && rawUsers.length > 0) {
          localStorage.setItem('crm_users_list', JSON.stringify(rawUsers));
          return rawUsers;
        }
      } catch (err) {
        console.warn("Fetch Cloud Users failed, falling back to local storage", err);
      }
    }
    const local = localStorage.getItem('crm_users_list');
    if (local) {
      return JSON.parse(local);
    }
    const defaultUsersList = [
      { id: "d1ef4942-83b3-4f9e-bbb4-7a0df47ab001", username: "apiyut", fullname: "Apiyut (Admin)", email: "Apiyut.noeikhiaw@th.ikm.com", role: "Admin", status: "Active", password: "crm123456" },
      { id: "d2ef4942-83b3-4f9e-bbb4-7a0df47ab002", username: "pimjai", fullname: "พิมพ์ใจ กิตติคุณ", email: "pimjai.k@ikm-testing.co.th", role: "Sales Manager", status: "Active", password: "crm123456" },
      { id: "d3ef4942-83b3-4f9e-bbb4-7a0df47ab003", username: "wiriya", fullname: "วิริยะ สว่างงาม", email: "wiriya.s@ikm-testing.co.th", role: "Sales Rep", status: "Active", password: "crm123456" },
      { id: "d4ef4942-83b3-4f9e-bbb4-7a0df47ab004", username: "somsri", fullname: "สมศรี จิตรประสงค์", email: "somsri.j@ikm-testing.co.th", role: "Auditor", status: "Active", password: "crm123456" }
    ];
    localStorage.setItem('crm_users_list', JSON.stringify(defaultUsersList));
    return defaultUsersList;
  },

  async addUser(userData) {
    const users = await this.getUsers();
    const newId = userData.id || crypto.randomUUID();
    const newUser = {
      ...userData,
      id: newId,
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('crm_users_list', JSON.stringify(users));

    const isCloud = await this.testConnection();
    if (isCloud) {
      try {
        const response = await restRequest('/users', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify(newUser)
        });
        return response ? response[0] : newUser;
      } catch (err) {
        console.warn("Cloud addUser failed, completed locally", err);
      }
    }
    return newUser;
  },

  async updateUser(id, updates) {
    const users = await this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      const updatedUser = { 
        ...users[idx], 
        ...updates, 
        updated_at: new Date().toISOString()
      };
      users[idx] = updatedUser;
      localStorage.setItem('crm_users_list', JSON.stringify(users));

      const isCloud = await this.testConnection();
      if (isCloud) {
        try {
          await restRequest(`/users?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates)
          });
        } catch (err) {
          console.warn("Cloud updateUser failed, completed locally", err);
        }
      }
      return updatedUser;
    }
    return null;
  },

  async deleteUser(id) {
    if (!this.isAdmin()) {
      throw new Error("คุณไม่มีสิทธิ์ลบข้อมูลผู้ใช้งาน เฉพาะ Admin เท่านั้น (Admin permission required)");
    }
    const users = await this.getUsers();
    const filtered = users.filter(u => u.id !== id);
    localStorage.setItem('crm_users_list', JSON.stringify(filtered));

    const isCloud = await this.testConnection();
    if (isCloud) {
      try {
        await restRequest(`/users?id=eq.${id}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.warn("Cloud deleteUser failed, completed locally", err);
      }
    }
    return true;
  },

  // -----------------------
  // ACTIVITIES AUDIT TRAIL LOGGING
  // -----------------------
  async getActivities() {
    return JSON.parse(localStorage.getItem('crm_activities')) || [];
  },

  async addActivity(action, targetType, targetId, details) {
    const activities = JSON.parse(localStorage.getItem('crm_activities')) || [];
    const currentUser = this.getCurrentUser();
    const newAct = {
      id: crypto.randomUUID(),
      action: action,
      target_type: targetType,
      target_id: targetId,
      details: details,
      created_by: currentUser ? currentUser.id : null,
      created_by_name: currentUser ? currentUser.fullname : null,
      created_at: new Date().toISOString()
    };
    activities.unshift(newAct); // standard unshift for immediate timeline display
    if (activities.length > 50) activities.pop(); // cap at 50 logs of history
    localStorage.setItem('crm_activities', JSON.stringify(activities));
    return newAct;
  },

  isAdmin() {
    const user = this.getCurrentUser();
    const role = (user && user.role) ? user.role.toLowerCase() : '';
    return role === 'admin' || role === 'system administrator';
  },

  getCurrentUser() {
    const storedUsers = localStorage.getItem('crm_users_list');
    const systemUsers = storedUsers ? JSON.parse(storedUsers) : [
      { id: "d1ef4942-83b3-4f9e-bbb4-7a0df47ab001", username: "apiyut", fullname: "Apiyut (Admin)", role: "Admin", email: "Apiyut.noeikhiaw@th.ikm.com" },
      { id: "d2ef4942-83b3-4f9e-bbb4-7a0df47ab002", username: "pimjai", fullname: "พิมพ์ใจ กิตติคุณ", role: "Sales Manager", email: "pimjai.k@ikm-testing.co.th" },
      { id: "d3ef4942-83b3-4f9e-bbb4-7a0df47ab003", username: "wiriya", fullname: "วิริยะ สว่างงาม", role: "Sales Rep", email: "wiriya.s@ikm-testing.co.th" },
      { id: "d4ef4942-83b3-4f9e-bbb4-7a0df47ab004", username: "somsri", fullname: "สมศรี จิตรประสงค์", role: "Auditor", email: "somsri.j@ikm-testing.co.th" },
      { id: "657229df-fb36-4978-bf94-4a52e04f7ae0", username: "art", fullname: "ART KIT", role: "Admin", email: "artkummool@gmail.com" }
    ];

    const currentUserId = localStorage.getItem('crm_user_id') || localStorage.getItem('crm_active_user_id');
    const currentFullname = localStorage.getItem('crm_user_fullname');
    const currentRole = localStorage.getItem('crm_user_role') || 'Admin';

    // 1. Try to find in systemUsers by id first
    if (currentUserId) {
      const foundById = systemUsers.find(u => u.id === currentUserId);
      if (foundById) return foundById;
    }

    // 2. Try to find in crm_sim_users by id
    const cachedSimUsers = localStorage.getItem('crm_sim_users');
    if (cachedSimUsers && currentUserId) {
      try {
        const simUsersList = JSON.parse(cachedSimUsers);
        const foundInSim = simUsersList.find(u => u.id === currentUserId);
        if (foundInSim) {
          return {
            id: foundInSim.id,
            username: foundInSim.username || foundInSim.name?.toLowerCase().replace(/\s+/g, '') || 'user',
            fullname: foundInSim.name || foundInSim.fullname,
            role: foundInSim.role || currentRole
          };
        }
      } catch (e) {
        console.error(e);
      }
    }

    // 3. Try to construct if currentFullname is present
    if (currentUserId && currentFullname) {
      return {
        id: currentUserId,
        username: currentFullname.toLowerCase().replace(/\s+/g, ''),
        fullname: currentFullname,
        role: currentRole
      };
    }

    // 4. Fallback: if we have user info in localStorage, use it. Otherwise, fallback to role match.
    if (currentUserId) {
        return {
            id: currentUserId,
            username: currentFullname?.toLowerCase().replace(/\s+/g, '') || 'user',
            fullname: currentFullname || 'Unknown User',
            role: currentRole
        };
    }
    const found = systemUsers.find(u => u.role === currentRole) || systemUsers[0];
    return found;
  },

  getUsernameOrDisplayName(userIdOrRawString, useFullname = false) {
    if (!userIdOrRawString) return 'system';
    const storedUsers = localStorage.getItem('crm_users_list');
    const systemUsers = storedUsers ? JSON.parse(storedUsers) : [
      { id: "d1ef4942-83b3-4f9e-bbb4-7a0df47ab001", username: "apiyut", fullname: "Apiyut (Admin)", role: "Admin", email: "Apiyut.noeikhiaw@th.ikm.com" },
      { id: "d2ef4942-83b3-4f9e-bbb4-7a0df47ab002", username: "pimjai", fullname: "พิมพ์ใจ กิตติคุณ", role: "Sales Manager", email: "pimjai.k@ikm-testing.co.th" },
      { id: "d3ef4942-83b3-4f9e-bbb4-7a0df47ab003", username: "wiriya", fullname: "วิริยะ สว่างงาม", role: "Sales Rep", email: "wiriya.s@ikm-testing.co.th" },
      { id: "d4ef4942-83b3-4f9e-bbb4-7a0df47ab004", username: "somsri", fullname: "สมศรี จิตรประสงค์", role: "Auditor", email: "somsri.j@ikm-testing.co.th" },
      { id: "657229df-fb36-4978-bf94-4a52e04f7ae0", username: "art", fullname: "ART KIT", role: "Admin", email: "artkummool@gmail.com" }
    ];

    // Combine with simulated users list if available
    const cachedSimUsers = localStorage.getItem('crm_sim_users');
    if (cachedSimUsers) {
      try {
        const parsedSim = JSON.parse(cachedSimUsers);
        if (Array.isArray(parsedSim)) {
          parsedSim.forEach(u => {
            const normalizedUser = {
              id: u.id,
              username: u.username || u.name?.toLowerCase().replace(/\s+/g, '') || 'user',
              fullname: u.name || u.fullname,
              role: u.role
            };
            if (!systemUsers.some(su => su.id === normalizedUser.id)) {
              systemUsers.push(normalizedUser);
            }
          });
        }
      } catch (e) {
        console.error(e);
      }
    }

    const cleanVal = String(userIdOrRawString).trim().toLowerCase();

    // 1. Try to match by id
    let found = systemUsers.find(u => u.id && u.id.toLowerCase() === cleanVal);
    // 2. Try to match by username
    if (!found) {
      found = systemUsers.find(u => u.username && u.username.toLowerCase() === cleanVal);
    }
    // 3. Try to match by substring of fullname
    if (!found) {
      found = systemUsers.find(u => {
        if (!u.fullname) return false;
        const fn = u.fullname.toLowerCase();
        return fn.includes(cleanVal) || cleanVal.includes(fn);
      });
    }
    // 4. Try mapping S01, S02, S03 codes
    if (!found) {
      if (cleanVal.includes("เอกชัย") || cleanVal.includes("s01") || cleanVal.includes("s1")) {
        found = systemUsers.find(u => u.username === "wiriya");
      } else if (cleanVal.includes("สุชาดา") || cleanVal.includes("s02") || cleanVal.includes("s2")) {
        found = systemUsers.find(u => u.username === "pimjai");
      } else if (cleanVal.includes("ธนพล") || cleanVal.includes("s03") || cleanVal.includes("s3")) {
        found = systemUsers.find(u => u.username === "apiyut");
      }
    }

    if (found) {
      return useFullname ? found.fullname : `@${found.username}`;
    }

    return userIdOrRawString.startsWith('u') ? `@${userIdOrRawString}` : userIdOrRawString;
  }
};

// Export to window/global space for easier consumption by scripts
window.SupabaseDB = SupabaseDB;
window.getConnectivityMode = getConnectivityMode;
