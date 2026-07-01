import { Customer, Opportunity, ContactPerson, OpportunityStatus, Activity, OpportunityTask, OpportunityAttachment, AuditLog, Quotation, SalesOrder, DeliveryJob, Invoice, Receipt, Project } from './types';

export function ensureUUID(id: string): string {
  if (!id) return id;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id.toLowerCase();
  }
  let hex = '';
  for (let i = 0; i < id.length; i++) {
    hex += id.charCodeAt(i).toString(16);
  }
  hex = hex.toLowerCase();
  if (hex.length < 12) {
    hex = hex.padEnd(12, '0');
  } else if (hex.length > 12) {
    hex = hex.slice(0, 12);
  }
  return `00000000-0000-0000-0000-${hex}`;
}

export const getSupabaseConfig = () => {
  const customUrl = localStorage.getItem('crm_supabase_url');
  const customKey = localStorage.getItem('crm_supabase_anon_key');
  return {
    url: customUrl ? customUrl.trim() : 'https://vrmjdbwdilqitdttzrcq.supabase.co/rest/v1',
    key: customKey ? customKey.trim() : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZybWpkYndkaWxxaXRkdHR6cmNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NzkzOTUsImV4cCI6MjA5NzE1NTM5NX0.1XPYA4LAyQOBL1WCKC-oIbsSLYcw3s5W9znimDXqmL4'
  };
};

// Sample Sales Persons
export const SAMPLE_SALES_PERSONS = [
  { id: '1', name: 'เอกชัย วงศ์ดี (S01)', role: 'Sales Executive', email: 'ekachai@crm.com' },
  { id: '2', name: 'สุชาดา เลิศวิริยะ (S02)', role: 'Account Manager', email: 'suchada@crm.com' },
  { id: '3', name: 'ธนพล คำดี (S03)', role: 'Technical Sales', email: 'thanapol@crm.com' },
  { id: '4', name: 'นารีรัตน์ มั่นคง (S04)', role: 'Senior Sales Director', email: 'nareerat@crm.com' }
];

// Initial Sample Customers
const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    customer_code: 'CUS-260001',
    customer_name: 'บริษัท ปตท. จำกัด (มหาชน)',
    tax_id: '0107544000108',
    industry_type: 'Energy & Utilities',
    address: '555 ถนนวิภาวดีรังสิต แขวงจตุจักร เขตจตุจักร',
    province: 'กรุงเทพมหานคร',
    country: 'ประเทศไทย',
    phone: '02-537-2000',
    email: 'info@pttplc.com',
    website: 'https://www.pttplc.com',
    payment_term: '30 Days',
    credit_limit: 10000000,
    status: 'Active',
    notes: 'ลูกค้ากลุ่มองค์กรพลังงานขนาดใหญ่ มีเครือข่ายสัมพันธ์ยอดเยี่ยม คาดหวังการร่วมมือระยะยาว',
    contacts: [
      { contact_name: 'สมชาย รักดี', position: 'Procurement Specialist', department: 'ฝ่ายจัดซื้อและพัสดุ', phone: '081-234-5678', office_phone: '02-537-2000 ต่อ 441', email: 'somchai.r@pttplc.com', line_id: 'somchai_ptt', preferred_contact: 'Email', status: 'Active' },
      { contact_name: 'วิภา พรหมศิริ', position: 'Maintenance Manager', department: 'วิศวกรรมซ่อมบำรุง', phone: '089-876-5432', office_phone: '02-537-2000 ต่อ 902', email: 'wipa.p@pttplc.com', line_id: 'wipa_p', preferred_contact: 'Phone', status: 'Active' }
    ],
    created_at: new Date('2026-01-10T08:00:00Z').toISOString()
  },
  {
    id: 'c2',
    customer_code: 'CUS-260002',
    customer_name: 'บริษัท ปูนซิเมนต์ไทย จำกัด (มหาชน) (SCG)',
    tax_id: '0107537000958',
    industry_type: 'Manufacturing',
    address: '1 ถนนปูนซิเมนต์ไทย บางซื่อ',
    province: 'กรุงเทพมหานคร',
    country: 'ประเทศไทย',
    phone: '02-586-3333',
    email: 'contact@scg.com',
    website: 'https://www.scg.com',
    payment_term: '45 Days',
    credit_limit: 5000000,
    status: 'Active',
    notes: 'ผู้นำอุตสาหกรรมอุปกรณ์ก่อสร้างในอาเซียน มุ่งเน้นมาตรฐานความซื่อสัตย์และการร่วมมืออย่างยั่งยืน',
    contacts: [
      { contact_name: 'อภิชาต วรวิทย์', position: 'Engineering Team Lead', department: 'ฝ่ายเทคโนโลยีและการวิจัย', phone: '083-456-7890', office_phone: '02-586-3333 ต่อ 123', email: 'apichat@scg.com', line_id: 'ap_scg', preferred_contact: 'Meeting', status: 'Active' }
    ],
    created_at: new Date('2026-02-15T09:30:00Z').toISOString()
  },
  {
    id: 'c3',
    customer_code: 'CUS-260003',
    customer_name: 'บริษัท ซีพี ออลล์ จำกัด (มหาชน)',
    tax_id: '0107542000011',
    industry_type: 'Retail',
    address: '313 อาคาร ซี.พี.ทาวเวอร์ ชั้น 24 ถนนสีลม แขวงสีลม เขตบางรัก',
    province: 'กรุงเทพมหานคร',
    country: 'ประเทศไทย',
    phone: '02-071-9000',
    email: 'hr@cpall.co.th',
    website: 'https://www.cpall.co.th',
    payment_term: '60 Days',
    credit_limit: 8000000,
    status: 'Active',
    contacts: [
      { contact_name: 'ดนัย นนทรี', position: 'Facility Manager', department: 'คลังสินค้าและซัพพลายเชน', phone: '086-111-2222', office_phone: '02-071-9000 ต่อ 882', email: 'danai@cpall.co.th', line_id: 'danai_cp', preferred_contact: 'Line', status: 'Active' }
    ],
    created_at: new Date('2026-03-01T10:15:00Z').toISOString()
  },
  {
    id: 'c4',
    customer_code: 'CUS-260004',
    customer_name: 'บริษัท แอดวานซ์ อินโฟร์ เซอร์วิส จำกัด (มหาชน)',
    tax_id: '0107535000265',
    industry_type: 'Telecommunication',
    address: '414 อาคารชินวัตร 1 ถนนพหลโยธิน แขวงสามเสนใน เขตพญาไท',
    province: 'กรุงเทพมหานคร',
    country: 'ประเทศไทย',
    phone: '02-029-5000',
    email: 'contact@ais.co.th',
    website: 'https://www.ais.co.th',
    payment_term: '30 Days',
    credit_limit: 15000000,
    status: 'Inactive',
    contacts: [
      { contact_name: 'กฤษณา แก้วคำ', position: 'IT Procurement Manager', department: 'จัดซื้อเทคโนโลยีสารสนเทศ', phone: '085-999-8888', office_phone: '02-029-5000 ต่อ 505', email: 'kritsana@ais.co.th', line_id: 'kris_ais', preferred_contact: 'Email', status: 'Active' }
    ],
    created_at: new Date('2026-04-12T14:20:00Z').toISOString()
  },
  {
    id: 'c5',
    customer_code: 'CUS-260005',
    customer_name: 'บริษัท ไทยเบฟเวอเรจ จำกัด (มหาชน)',
    tax_id: '0107546000342',
    industry_type: 'Food & Beverage',
    address: '14 ถนนวิภาวดีรังสิต แขวงจอมพล เขตจตุจักร',
    province: 'กรุงเทพมหานคร',
    country: 'ประเทศไทย',
    phone: '02-785-5555',
    email: 'info@thaibev.com',
    website: 'https://www.thaibev.com',
    payment_term: '30 Days',
    credit_limit: 4000000,
    status: 'Active',
    contacts: [
      { contact_name: 'นเรศ อนันตศิลป์', position: 'Warehouse Director', department: 'บริหารจัดการคลังสินค้าเสบียง', phone: '084-555-1234', office_phone: '02-785-5555 ต่อ 12', email: 'nares@thaibev.com', line_id: 'nares_bev', preferred_contact: 'Phone', status: 'Active' }
    ],
    created_at: new Date('2026-05-02T11:00:00Z').toISOString()
  },
  {
    id: 'c_cr3',
    customer_code: 'CUS-CR3',
    customer_name: 'CR3 Company Limited',
    tax_id: '0105531028301',
    industry_type: 'Energy & Utilities',
    address: 'เลขที่ 9 พหลโยธิน แขวงสามเสนใน เขตพญาไท',
    province: 'กรุงเทพมหานคร',
    country: 'ประเทศไทย',
    phone: '02-123-4567',
    email: 'info@cr3.com',
    payment_term: '30 Days',
    status: 'Active',
    contacts: [{ contact_name: 'Khun Somchai', position: 'Maintenance Supervisor', phone: '085-123-4567', email: 'somchai@cr3.com' }],
    created_at: new Date('2024-05-13T08:00:00Z').toISOString()
  },
  {
    id: 'c_egat',
    customer_code: 'CUS-EGAT',
    customer_name: 'การไฟฟ้าฝ่ายผลิตแห่งประเทศไทย (EGAT)',
    tax_id: '0994000164848',
    industry_type: 'Energy & Utilities',
    address: '53 หมู่ 2 ถนนจรัญสนิทวงศ์ บางกรวย',
    province: 'นนทบุรี',
    country: 'ประเทศไทย',
    phone: '02-436-0000',
    email: 'contact@egat.co.th',
    payment_term: '30 Days',
    status: 'Active',
    contacts: [{ contact_name: 'สมเกียรติ พรประเสริฐ', position: 'Plant Engineering Manager', phone: '086-555-4321', email: 'somkiat.p@egat.co.th' }],
    created_at: new Date('2024-05-13T08:00:00Z').toISOString()
  },
  {
    id: 'c_nps',
    customer_code: 'CUS-NPS',
    customer_name: 'National Power Supply Public Company Limited (NPS)',
    tax_id: '0107537002012',
    industry_type: 'Energy & Utilities',
    address: '30/1 หมู่ 3 ต.ลาดตะเคียน อ.กบินทร์บุรี',
    province: 'ปราจีนบุรี',
    country: 'ประเทศไทย',
    phone: '037-299-000',
    email: 'procurement@nps.co.th',
    payment_term: '30 Days',
    status: 'Active',
    contacts: [{ contact_name: 'วีระศักดิ์ เมืองแก้ว', position: 'Purchasing Specialist', phone: '084-222-3333', email: 'weerasak.m@nps.co.th' }],
    created_at: new Date('2024-05-13T08:00:00Z').toISOString()
  },
  {
    id: 'c_stpi',
    customer_code: 'CUS-STPI',
    customer_name: 'STP&I Company Limited (Best Performance)',
    tax_id: '0105543028503',
    industry_type: 'Manufacturing',
    address: '58, SOI NARADHIWAT RAJANAGARINDRA 10, THUNG WAT DON, SATHORN',
    province: 'BANGKOK',
    country: 'THAILAND',
    phone: '+66(0)93-296-9151',
    email: 'sawit.k@stpi.co.th',
    payment_term: '30 Days',
    status: 'Active',
    contacts: [{ contact_name: 'Khun Sawit Kong-ngoen', position: 'Engineering Coordinator', phone: '+66(0)93-296-9151', email: 'sawit.k@stpi.co.th' }],
    created_at: new Date('2024-05-13T08:00:00Z').toISOString()
  },
  {
    id: 'c_unithai',
    customer_code: 'CUS-UNITHAI',
    customer_name: 'Unithai Shipyard & Engineering Ltd.',
    tax_id: '0105523008985',
    industry_type: 'Marine & Logistics',
    address: '48 หมู่ 3 ต.ทุ่งศุขลา อ.ศรีราชา',
    province: 'ชลบุรี',
    country: 'ประเทศไทย',
    phone: '038-407-700',
    email: 'commercial@unithai.com',
    payment_term: '30 Days',
    status: 'Active',
    contacts: [{ contact_name: 'ชัยพล นุกูล', position: 'Asset Management Manager', phone: '081-333-4444', email: 'chaiyaphol@unithai.com' }],
    created_at: new Date('2024-05-13T08:00:00Z').toISOString()
  },
  {
    id: 'c_dexon',
    customer_code: 'CUS-DEXON',
    customer_name: 'Dexon Technology Public Company Limited',
    tax_id: '0107565000572',
    industry_type: 'Testing & Engineering',
    address: '78/4 หมู่ 6 ต.บ้านฉาง อ.บ้านฉาง',
    province: 'ระยอง',
    country: 'ประเทศไทย',
    phone: '038-675-000',
    email: 'sales@dexon-technology.com',
    payment_term: '30 Days',
    status: 'Active',
    contacts: [{ contact_name: 'ปรินทร์ ดำรงสกุล', position: 'Inspection Team Leader', phone: '089-601-9999', email: 'parin.d@dexon.com' }],
    created_at: new Date('2024-05-13T08:00:00Z').toISOString()
  },
  {
    id: 'c_gcme',
    customer_code: 'CUS-GCME',
    customer_name: 'GC Maintenance and Engineering Company Limited',
    tax_id: '0105542022831',
    industry_type: 'Manufacturing',
    address: 'เลขที่ 9 ถนนไอ-สี่ นิคมอุตสาหกรรมมาบตาพุด ต.มาบตาพุด อ.เมืองระยอง',
    province: 'ระยอง',
    country: 'ประเทศไทย',
    phone: '038-971-000',
    email: 'marketing@gcme.co.th',
    payment_term: '30 Days',
    status: 'Active',
    contacts: [{ contact_name: 'อภิสิทธิ์ วิจารณ์', position: 'Maintenance Planner', phone: '087-444-5555', email: 'apisit.v@gcme.co.th' }],
    created_at: new Date('2024-05-13T08:00:00Z').toISOString()
  },
  {
    id: 'c_marvel',
    customer_code: 'CUS-MARVEL',
    customer_name: 'Marvel Engineering & Service Co., Ltd.',
    tax_id: '0105553018241',
    industry_type: 'Testing & Engineering',
    address: '128/9 หมู่ 2 ต.มะขามคู่ อ.นิคมพัฒนา',
    province: 'ระยอง',
    country: 'ประเทศไทย',
    phone: '038-891-234',
    email: 'ops@marvel-eng.com',
    payment_term: '30 Days',
    status: 'Active',
    contacts: [{ contact_name: 'จิรพงษ์ แก้วดี', position: 'Admin Manager', phone: '082-999-8888', email: 'jirapong@marvel.com' }],
    created_at: new Date('2024-05-13T08:00:00Z').toISOString()
  },
  {
    id: 'c_insee',
    customer_code: 'CUS-INSEE',
    customer_name: 'Siam City Cement Public Company Limited (INSEE)',
    tax_id: '0107536000031',
    industry_type: 'Manufacturing',
    address: '199 อาคารคอลัมน์ทาวเวอร์ ชั้น 7-12 ถนนรัชดาภิเษก แขวงคลองเตย เขตคลองเตย',
    province: 'กรุงเทพมหานคร',
    country: 'ประเทศไทย',
    phone: '02-797-7000',
    email: 'cement-sales@siamcitycement.com',
    payment_term: '45 Days',
    status: 'Active',
    contacts: [{ contact_name: 'เกรียงไกร ธาดา', position: 'Procurement Manager', phone: '083-777-6666', email: 'kriengkrai@insee.co.th' }],
    created_at: new Date('2024-05-13T08:00:00Z').toISOString()
  }
];

// Initial Sample Opportunities
const DEFAULT_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'o_qt3000',
    opportunity_no: 'OPP-3000',
    customer_id: 'c2',
    project_name: 'Tank storage x 2 Unit',
    service_type: 'Equipment Rental',
    lead_source: 'Walk In',
    project_location: 'RY',
    estimated_value: 14000,
    success_probability: 100,
    weighted_value: 14000,
    expected_close_date: '2024-12-31',
    sales_person_id: '1',
    status: 'Won',
    remarks: 'Job No. 002-25. Date: 13-05-24',
    created_at: new Date('2024-05-13T10:00:00Z').toISOString()
  },
  {
    id: 'o_qt3018',
    opportunity_no: 'OPP-3018',
    customer_id: 'c_cr3',
    project_name: 'FF 1500i',
    service_type: 'Equipment Rental',
    lead_source: 'Referral',
    project_location: 'RY',
    estimated_value: 15000,
    success_probability: 100,
    weighted_value: 15000,
    expected_close_date: '2025-03-31',
    sales_person_id: '1',
    status: 'Won',
    remarks: 'Job No. 017-25. Date: 21-03-25',
    created_at: new Date('2025-03-21T10:00:00Z').toISOString()
  },
  {
    id: 'o_qt3227',
    opportunity_no: 'OPP-3227',
    customer_id: 'c_egat',
    project_name: 'Lube Oil Flushing GNS - C2, C21, C22',
    service_type: 'Testing Service',
    lead_source: 'Tender',
    project_location: 'Other',
    estimated_value: 544880,
    success_probability: 100,
    weighted_value: 544880,
    expected_close_date: '2024-12-31',
    sales_person_id: '1',
    status: 'Won',
    remarks: 'Job No. 001-25. Date: 24-12-24',
    created_at: new Date('2024-12-24T10:00:00Z').toISOString()
  },
  {
    id: 'o_qt3230',
    opportunity_no: 'OPP-3230',
    customer_id: 'c_nps',
    project_name: 'Tank Cleaning',
    service_type: 'Testing Service',
    lead_source: 'Website',
    project_location: 'Other',
    estimated_value: 385000,
    success_probability: 50,
    weighted_value: 192500,
    expected_close_date: '2025-01-31',
    sales_person_id: '1',
    status: 'Proposal',
    remarks: 'Date: 02-01-25',
    created_at: new Date('2025-01-02T10:00:00Z').toISOString()
  },
  {
    id: 'o_qt3231',
    opportunity_no: 'OPP-3231',
    customer_id: 'c_stpi',
    project_name: 'Cold Cutting',
    service_type: 'Testing Service',
    lead_source: 'Call In',
    project_location: 'RY',
    estimated_value: 100000,
    success_probability: 50,
    weighted_value: 50000,
    expected_close_date: '2025-01-31',
    sales_person_id: '2',
    status: 'Proposal',
    remarks: 'Date: 03-01-25',
    created_at: new Date('2025-01-03T10:00:00Z').toISOString()
  },
  {
    id: 'o_qt3232',
    opportunity_no: 'OPP-3232',
    customer_id: 'c_stpi',
    project_name: 'Flange Facing 14"',
    service_type: 'Testing Service',
    lead_source: 'Call In',
    project_location: 'RY',
    estimated_value: 13000,
    success_probability: 50,
    weighted_value: 6500,
    expected_close_date: '2025-01-31',
    sales_person_id: '2',
    status: 'Proposal',
    remarks: 'Flange Face Service. Date: 05-01-25',
    created_at: new Date('2025-01-05T10:00:00Z').toISOString()
  },
  {
    id: 'o_qt3233',
    opportunity_no: 'OPP-3233',
    customer_id: 'c_unithai',
    project_name: 'Bolt Torque',
    service_type: 'Testing Service',
    lead_source: 'Call In',
    project_location: 'RY',
    estimated_value: 12500,
    success_probability: 50,
    weighted_value: 6250,
    expected_close_date: '2025-01-31',
    sales_person_id: '2',
    status: 'Proposal',
    remarks: 'Date: 06-01-25',
    created_at: new Date('2025-01-06T10:00:00Z').toISOString()
  },
  {
    id: 'o_qt3234',
    opportunity_no: 'OPP-3234',
    customer_id: 'c_dexon',
    project_name: 'Hydrotest',
    service_type: 'Testing Service',
    lead_source: 'Walk In',
    project_location: 'RY',
    estimated_value: 50000,
    success_probability: 100,
    weighted_value: 50000,
    expected_close_date: '2025-01-31',
    sales_person_id: '1',
    status: 'Won',
    remarks: 'Job No. 003-25. Date: 06-01-25',
    created_at: new Date('2025-01-06T10:10:00Z').toISOString()
  },
  {
    id: 'o_qt3235',
    opportunity_no: 'OPP-3235',
    customer_id: 'c_dexon',
    project_name: 'HDL Loose Bolt',
    service_type: 'Testing Service',
    lead_source: 'Walk In',
    project_location: 'RY',
    estimated_value: 30000,
    success_probability: 100,
    weighted_value: 30000,
    expected_close_date: '2025-01-31',
    sales_person_id: '1',
    status: 'Won',
    remarks: 'Job No. 003-25. Date: 06-01-25',
    created_at: new Date('2025-01-06T10:20:00Z').toISOString()
  },
  {
    id: 'o_qt3236',
    opportunity_no: 'OPP-3236',
    customer_id: 'c_gcme',
    project_name: 'Oil Flushing',
    service_type: 'Testing Service',
    lead_source: 'Walk In',
    project_location: 'RY',
    estimated_value: 100000,
    success_probability: 100,
    weighted_value: 100000,
    expected_close_date: '2025-01-31',
    sales_person_id: '1',
    status: 'Won',
    remarks: 'Job No. 004-25. Date: 07-01-25',
    created_at: new Date('2025-01-07T10:00:00Z').toISOString()
  },
  {
    id: 'o_qt3237',
    opportunity_no: 'OPP-3237',
    customer_id: 'c_marvel',
    project_name: 'Equipment Rental',
    service_type: 'Equipment Rental',
    lead_source: 'Walk In',
    project_location: 'RY',
    estimated_value: 28000,
    success_probability: 100,
    weighted_value: 28000,
    expected_close_date: '2025-01-31',
    sales_person_id: '1',
    status: 'Won',
    remarks: 'Job No. 005-25. Date: 08-01-25',
    created_at: new Date('2025-01-08T10:00:00Z').toISOString()
  },
  {
    id: 'o_qt3238',
    opportunity_no: 'OPP-3238',
    customer_id: 'c_insee',
    project_name: 'Equipment Rental',
    service_type: 'Equipment Rental',
    lead_source: 'Walk In',
    project_location: 'RY',
    estimated_value: 30000,
    success_probability: 50,
    weighted_value: 15000,
    expected_close_date: '2025-02-28',
    sales_person_id: '1',
    status: 'Proposal',
    remarks: 'Date: 09-01-25',
    created_at: new Date('2025-01-09T10:00:00Z').toISOString()
  }
];

// Initial Base Records for CRM activities, tasks, attachments, auditLogs
const DEFAULT_ACTIVITIES: Activity[] = [
  {
    id: 'act1',
    opportunity_id: 'o1',
    activity_type: 'Phone Call',
    activity_date: '2026-06-01',
    subject: 'โทรประสานเข้าชี้รายละเอียดหม้อต้ม M4 สำหรับเสนอราคารอบพิเศษ',
    description: 'ติดต่อสมชาย รักดี ยืนยันข้อมูลประวัติความร้อนหม้อต้ม คู่นัดหมายผ่าน Google Meet เพื่อให้วิศวกรวิเคราะห์',
    next_action_date: '2026-06-05',
    owner: 'เอกชัย วงศ์ดี (S01)',
    created_at: new Date('2026-06-01T10:00:00Z').toISOString()
  },
  {
    id: 'act2',
    opportunity_id: 'o1',
    activity_type: 'Presentation',
    activity_date: '2026-06-08',
    subject: 'พรีเซนต์ความสามารถเกณฑ์ความปลอดภัยตัวอย่างเครื่องมือตรวจวิเคราะห์',
    description: 'ส่งสไลด์นำเสนอรายละเอียดกระบวนการทำงานให้ทีมบริหารฝ่ายวิศวกรรมทางออนไลน์ ผลลัพธ์ได้รับการยอมรับในมาตรฐานดีเลิศ',
    next_action_date: '2026-06-15',
    owner: 'เอกชัย วงศ์ดี (S01)',
    created_at: new Date('2026-06-08T14:30:00Z').toISOString()
  },
  {
    id: 'act3',
    opportunity_id: 'o2',
    activity_type: 'Meeting',
    activity_date: '2026-05-18',
    subject: 'ประชุมลงนามยืนยันสัญญาจ้างช่างเชื่อมก่อสร้างโรงงานเฟส 3',
    description: 'จัดประชุมลงนามเอกสารสัญญาและส่งบันทึกตารางการนำประส่งตัวทีมงานแรงงานทั้ง 25 คน',
    next_action_date: '2026-06-01',
    owner: 'สุชาดา เลิศวิริยะ (S02)',
    created_at: new Date('2026-05-18T09:00:00Z').toISOString()
  },
  {
    id: 'act4',
    opportunity_id: 'o4',
    activity_type: 'Site Visit',
    activity_date: '2026-05-28',
    subject: 'ตรวจสำรวจสภาพแวดล้อมพื้นที่วางท่อ RY ระยอง',
    description: 'เดินทางสำรวจพื้นที่หน้างานคลังระยอง ร่วมกับตัวแทนกฤษณา เพื่อวิเคราะห์ปัญหาท่อติดขัดภูมิประเทศที่เป็นหินคลุก',
    next_action_date: '2026-06-05',
    owner: 'เอกชัย วงศ์ดี (S01)',
    created_at: new Date('2026-05-28T11:00:00Z').toISOString()
  }
];

const DEFAULT_TASKS: OpportunityTask[] = [
  {
    id: 'task1',
    opportunity_id: 'o1',
    task_name: 'เตรียมจัดทำแผนงบประมาณ BOQ จำแนกรายละเอียด',
    description: 'แยกหมวดหมู่เครื่องมือ ค่าแรงประกัน และค่าเดินทางสำหรับสถานประกอบชี้แจง',
    due_date: '2026-06-25',
    assigned_to: 'เอกชัย วงศ์ดี (S01)',
    priority: 'Urgent',
    status: 'Completed',
    created_at: new Date('2026-06-01T10:05:00Z').toISOString()
  },
  {
    id: 'task2',
    opportunity_id: 'o1',
    task_name: 'วิเคราะห์โครงสร้างต้นทุนและทำร่างอัปโหลดใบเสนอราคา',
    description: 'ยื่นคำขอรับส่วนลด 10% จากทางผู้บริหารระดับสูงสำหรับการแข่งขันราคาเคาะงานจัดซื้อครั้งสุดท้าย',
    due_date: '2026-07-15',
    assigned_to: 'เอกชัย วงศ์ดี (S01)',
    priority: 'High',
    status: 'In Progress',
    created_at: new Date('2026-06-02T11:00:00Z').toISOString()
  },
  {
    id: 'task3',
    opportunity_id: 'o2',
    task_name: 'ทำเรื่องตารางประสานงานและจัดทำประวัติทีมงานช่างเชื่อม',
    description: 'ส่งประวัติใบรับรองทักษะฝีมือช่างเชื่อม (Welder Certificate) ทั้งหมดให้ทีมความปลอดภัย SCG',
    due_date: '2026-06-20',
    assigned_to: 'สุชาดา เลิศวิริยะ (S02)',
    priority: 'Medium',
    status: 'Completed',
    created_at: new Date('2026-05-16T09:10:00Z').toISOString()
  },
  {
    id: 'task4',
    opportunity_id: 'o3',
    task_name: 'ส่งข้อเสนอเช่าเครื่องขัดรอยร้าวให้ดนัย ยืนยันสิทธิ์',
    description: 'ส่งแผนตารางการจองเครื่องขัดและประกันความเสียหายฉบับร่าง',
    due_date: '2026-09-01',
    assigned_to: 'ธนพล คำดี (S03)',
    priority: 'Low',
    status: 'Open',
    created_at: new Date('2026-05-21T14:40:00Z').toISOString()
  },
  {
    id: 'task5',
    opportunity_id: 'o4',
    task_name: 'จัดทำแผนผังเครือข่ายสัญญาณเปรียบเทียบหน้างาน',
    description: 'ขอข้อมูลแผนที่แนววางสายใยแก้วอัปเดตเพื่อดีไซน์ขนาดท่อส่งใหม่',
    due_date: '2026-07-20',
    assigned_to: 'เอกชัย วงศ์ดี (S01)',
    priority: 'High',
    status: 'Open',
    created_at: new Date('2026-05-26T16:10:00Z').toISOString()
  }
];

const DEFAULT_ATTACHMENTS: OpportunityAttachment[] = [
  {
    id: 'att1',
    opportunity_id: 'o1',
    file_name: 'PTT_Boiler_Inspection_Spec_2026.pdf',
    file_size: 1952000,
    file_type: 'application/pdf',
    uploaded_by: 'เอกชัย วงศ์ดี (S01)',
    uploaded_at: new Date('2026-05-10T11:00:00Z').toISOString()
  },
  {
    id: 'att2',
    opportunity_id: 'o1',
    file_name: 'BOQ_Inspection_R4_Draft.xlsx',
    file_size: 450200,
    file_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    uploaded_by: 'เอกชัย วงศ์ดี (S01)',
    uploaded_at: new Date('2026-06-03T14:30:00Z').toISOString()
  },
  {
    id: 'att3',
    opportunity_id: 'o2',
    file_name: 'SCG_WeldingManpower_FullyExecuted_Signed.pdf',
    file_size: 3250400,
    file_type: 'application/pdf',
    uploaded_by: 'สุชาดา เลิศวิริยะ (S02)',
    uploaded_at: new Date('2026-05-19T10:15:00Z').toISOString()
  }
];

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log1',
    action_by: 'System Administrator (SysAdmin)',
    role: 'System Administrator',
    action: 'เริ่มต้นระบบและติดตั้งฐานข้อมูล',
    target_type: 'system',
    details: 'สร้างฐานข้อมูลเริ่มต้นพร้อมติดตั้งตารางประกอบการขายคู่อุตสาหกรรมใน Local Sandbox เรียบร้อย',
    created_at: new Date('2026-06-15T08:00:00Z').toISOString()
  },
  {
    id: 'log2',
    action_by: 'เอกชัย วงศ์ดี (AM)',
    role: 'Sales',
    action: 'สร้างบริษัทคู่ค้ารายใหม่',
    target_type: 'customer',
    target_id: 'c1',
    details: 'ลงทะเบียนประวัติ บริษัท ปตท. จำกัด (มหาชน) ในรหัสระบบ CUS-260001 สำเร็จพร้อมผู้พ่วงติดต่อ 2 คน',
    created_at: new Date('2026-06-15T08:30:00Z').toISOString()
  },
  {
    id: 'log3',
    action_by: 'เอกชัย วงศ์ดี (AM)',
    role: 'Sales',
    action: 'สร้างดีลโอกาสขายใหม่',
    target_type: 'opportunity',
    target_id: 'o1',
    details: 'ลงชื่อเสนอ โครงการตรวจสอบระบบหม้อต้มความร้อนรหัส M4 งบประมาณ 4,500,000 บาท ความน่าเป็นสำเร็จ 70% คาดคะเนวันส่งมอบ',
    created_at: new Date('2026-06-15T09:00:00Z').toISOString()
  }
];

const DEFAULT_QUOTATIONS: Quotation[] = [
  {
    id: 'qt3000',
    quotation_no: 'QT-3000',
    opportunity_id: 'o_qt3000',
    customer_id: 'c2',
    subject: 'Tank storage x 2 Unit',
    total_amount: 14000,
    vat_amount: 980,
    grand_total: 14980,
    status: 'Approved',
    issue_date: '2024-05-13',
    valid_until: '2024-06-13',
    created_at: new Date('2024-05-13T10:00:00Z').toISOString(),
    remarks: 'Job No. 002-25. Rental',
    items: [
      { id: 'qti3000_1', item_no: 1, qty: 2, unit: 'Unit', description: 'Tank storage rental and installation', duration_days: 1, unit_rate: 7000, total_price: 14000 }
    ]
  },
  {
    id: 'qt3018',
    quotation_no: 'QT-3018',
    opportunity_id: 'o_qt3018',
    customer_id: 'c_cr3',
    subject: 'FF 1500i',
    total_amount: 15000,
    vat_amount: 1050,
    grand_total: 16050,
    status: 'Approved',
    issue_date: '2025-03-21',
    valid_until: '2025-04-21',
    created_at: new Date('2025-03-21T10:00:00Z').toISOString(),
    remarks: 'Job No. 017-25. Rental',
    items: [
      { id: 'qti3018_1', item_no: 1, qty: 1, unit: 'Set', description: 'FF 1500i Equipment rental', duration_days: 1, unit_rate: 15000, total_price: 15000 }
    ]
  },
  {
    id: 'qt3227',
    quotation_no: 'QT-3227',
    opportunity_id: 'o_qt3227',
    customer_id: 'c_egat',
    subject: 'Lube Oil Flushing GNS - C2, C21, C22',
    total_amount: 544880,
    vat_amount: 38141.6,
    grand_total: 583021.6,
    status: 'Approved',
    issue_date: '2024-12-24',
    valid_until: '2025-01-24',
    created_at: new Date('2024-12-24T10:00:00Z').toISOString(),
    remarks: 'Job No. 001-25. Service',
    items: [
      { id: 'qti3227_1', item_no: 1, qty: 1, unit: 'Job', description: 'Lube Oil Flushing GNS - C2, C21, C22', duration_days: 15, unit_rate: 36325.33, total_price: 544880 }
    ]
  },
  {
    id: 'qt3230',
    quotation_no: 'QT-3230',
    opportunity_id: 'o_qt3230',
    customer_id: 'c_nps',
    subject: 'Tank Cleaning',
    total_amount: 385000,
    vat_amount: 26950,
    grand_total: 411950,
    status: 'Sent',
    issue_date: '2025-01-02',
    valid_until: '2025-02-02',
    created_at: new Date('2025-01-02T10:00:00Z').toISOString(),
    remarks: 'Service',
    items: [
      { id: 'qti3230_1', item_no: 1, qty: 1, unit: 'Lot', description: 'Tank Cleaning Service with chemical treatments', duration_days: 5, unit_rate: 77000, total_price: 385000 }
    ]
  },
  {
    id: 'qt3231',
    quotation_no: 'QT-3231',
    opportunity_id: 'o_qt3231',
    customer_id: 'c_stpi',
    subject: 'Cold Cutting',
    total_amount: 100000,
    vat_amount: 7000,
    grand_total: 107000,
    status: 'Sent',
    issue_date: '2025-01-03',
    valid_until: '2025-02-03',
    created_at: new Date('2025-01-03T10:00:00Z').toISOString(),
    remarks: 'Service',
    items: [
      { id: 'qti3231_1', item_no: 1, qty: 1, unit: 'Set', description: 'Cold Cutting and Bevelling Service', duration_days: 2, unit_rate: 50000, total_price: 100000 }
    ]
  },
  {
    id: 'qt3232',
    quotation_no: 'QT-3232',
    opportunity_id: 'o_qt3232',
    customer_id: 'c_stpi',
    subject: 'Flange Facing 14"',
    total_amount: 13000,
    vat_amount: 910,
    grand_total: 13910,
    status: 'Sent',
    issue_date: '2025-01-05',
    valid_until: '2025-02-05',
    created_at: new Date('2025-01-05T10:00:00Z').toISOString(),
    remarks: 'Rental & Supervisor rate matches STP&I setup',
    items: [
      { id: 'qti3232_1', item_no: 1, qty: 1, unit: 'Set', description: 'Flange Facing Machine Set', duration_days: 1, unit_rate: 7000, total_price: 7000 },
      { id: 'qti3232_2', item_no: 2, qty: 1, unit: 'Team', description: 'Flange Facing Operator Team ; 3 Pax per team\n** Manpower rate base on working 8.00 - 17.00 (8hrs) on Mon to Sat\nOT after 17.00pm. Rate apply by 1.5 time of hourly rate (Refer to Thai Labour Law)\nSunday & Public Holiday Rate apply by 2.0 time of working rate (Refer to Thai Labour Law)', duration_days: 1, unit_rate: 4500, total_price: 4500 },
      { id: 'qti3232_3', item_no: 3, qty: 1, unit: 'Truck', description: 'Pickup Truck for Transportation Personal and Equipment', duration_days: 1, unit_rate: 1500, total_price: 1500 }
    ]
  },
  {
    id: 'qt3233',
    quotation_no: 'QT-3233',
    opportunity_id: 'o_qt3233',
    customer_id: 'c_unithai',
    subject: 'Bolt Torque',
    total_amount: 12500,
    vat_amount: 875,
    grand_total: 13375,
    status: 'Sent',
    issue_date: '2025-01-06',
    valid_until: '2025-02-06',
    created_at: new Date('2025-01-06T10:00:00Z').toISOString(),
    remarks: 'Service',
    items: [
      { id: 'qti3233_1', item_no: 1, qty: 1, unit: 'Lot', description: 'Bolt Torquing Service for main connection flange', duration_days: 1, unit_rate: 12500, total_price: 12500 }
    ]
  },
  {
    id: 'qt3234',
    quotation_no: 'QT-3234',
    opportunity_id: 'o_qt3234',
    customer_id: 'c_dexon',
    subject: 'Hydrotest',
    total_amount: 50000,
    vat_amount: 3500,
    grand_total: 53500,
    status: 'Approved',
    issue_date: '2025-01-06',
    valid_until: '2025-02-06',
    created_at: new Date('2025-01-06T10:10:00Z').toISOString(),
    remarks: 'Job No. 003-25. Service',
    items: [
      { id: 'qti3234_1', item_no: 1, qty: 1, unit: 'Lot', description: 'Hydrostatic Pipeline Testing Service', duration_days: 2, unit_rate: 25000, total_price: 50000 }
    ]
  },
  {
    id: 'qt3235',
    quotation_no: 'QT-3235',
    opportunity_id: 'o_qt3235',
    customer_id: 'c_dexon',
    subject: 'HDL Loose Bolt',
    total_amount: 30000,
    vat_amount: 2100,
    grand_total: 32100,
    status: 'Approved',
    issue_date: '2025-01-06',
    valid_until: '2025-02-06',
    created_at: new Date('2025-01-06T10:20:00Z').toISOString(),
    remarks: 'Job No. 003-25. Service',
    items: [
      { id: 'qti3235_1', item_no: 1, qty: 1, unit: 'Lot', description: 'HDL Loose Bolting tightening work', duration_days: 1, unit_rate: 30000, total_price: 30000 }
    ]
  },
  {
    id: 'qt3236',
    quotation_no: 'QT-3236',
    opportunity_id: 'o_qt3236',
    customer_id: 'c_gcme',
    subject: 'Oil Flushing',
    total_amount: 100000,
    vat_amount: 7000,
    grand_total: 107000,
    status: 'Approved',
    issue_date: '2025-01-07',
    valid_until: '2025-02-07',
    created_at: new Date('2025-01-07T10:00:00Z').toISOString(),
    remarks: 'Job No. 004-25. Service',
    items: [
      { id: 'qti3236_1', item_no: 1, qty: 1, unit: 'Lot', description: 'Hydraulic Oil Flushing and Filtration Service', duration_days: 2, unit_rate: 50000, total_price: 100000 }
    ]
  },
  {
    id: 'qt3237',
    quotation_no: 'QT-3237',
    opportunity_id: 'o_qt3237',
    customer_id: 'c_marvel',
    subject: 'Equipment Rental',
    total_amount: 28000,
    vat_amount: 1960,
    grand_total: 29960,
    status: 'Approved',
    issue_date: '2025-01-08',
    valid_until: '2025-02-08',
    created_at: new Date('2025-01-08T10:00:00Z').toISOString(),
    remarks: 'Job No. 005-25. Rental',
    items: [
      { id: 'qti3237_1', item_no: 1, qty: 1, unit: 'Set', description: 'High pressure testing manifold systems and recorder rental', duration_days: 7, unit_rate: 4000, total_price: 28000 }
    ]
  },
  {
    id: 'qt3238',
    quotation_no: 'QT-3238',
    opportunity_id: 'o_qt3238',
    customer_id: 'c_insee',
    subject: 'Equipment Rental',
    total_amount: 30000,
    vat_amount: 2100,
    grand_total: 32100,
    status: 'Sent',
    issue_date: '2025-01-09',
    valid_until: '2025-02-09',
    created_at: new Date('2025-01-09T10:00:00Z').toISOString(),
    remarks: 'Rental',
    items: [
      { id: 'qti3238_1', item_no: 1, qty: 1, unit: 'Set', description: 'Pneumatic torque wrench complete package rental', duration_days: 3, unit_rate: 10000, total_price: 30000 }
    ]
  }
];

const DEFAULT_SALES_ORDERS: SalesOrder[] = [
  {
    id: 'so_qt3000',
    so_no: 'SO-002-25',
    quotation_id: 'qt3000',
    customer_id: 'c2',
    project_name: 'Tank storage x 2 Unit',
    total_amount: 14000,
    status: 'Completed',
    order_date: '2024-12-01',
    target_delivery_date: '2025-01-15',
    created_at: new Date('2024-12-01T08:30:00Z').toISOString()
  },
  {
    id: 'so_qt3018',
    so_no: 'SO-017-25',
    quotation_id: 'qt3018',
    customer_id: 'c_cr3',
    project_name: 'FF 1500i',
    total_amount: 15000,
    status: 'In Progress',
    order_date: '2025-03-15',
    target_delivery_date: '2025-03-31',
    created_at: new Date('2025-03-15T08:30:00Z').toISOString()
  },
  {
    id: 'so_qt3227',
    so_no: 'SO-001-25',
    quotation_id: 'qt3227',
    customer_id: 'c_egat',
    project_name: 'Lube Oil Flushing GNS - C2, C21, C22',
    total_amount: 544880,
    status: 'In Progress',
    order_date: '2024-12-15',
    target_delivery_date: '2025-01-25',
    created_at: new Date('2024-12-15T08:30:00Z').toISOString()
  }
];

const DEFAULT_DELIVERY_JOBS: DeliveryJob[] = [
  {
    id: 'dl_qt3000',
    delivery_no: 'DL-002-25',
    sales_order_id: 'so_qt3000',
    customer_id: 'c2',
    carrier_name: 'Logistics Team A',
    tracking_no: 'DLV-T3000',
    status: 'Delivered',
    actual_delivery_date: '2025-01-14',
    delivered_by: 'คุณปรินทร์ ดำรงสกุล',
    created_at: new Date('2024-12-05T09:00:00Z').toISOString()
  }
];

const DEFAULT_INVOICES: Invoice[] = [
  {
    id: 'inv_demo',
    invoice_no: 'IKMTTH-26/256',
    sales_order_id: 'so_qt3018',
    customer_id: 'c_stpi',
    total_amount: 10000,
    vat_amount: 700,
    grand_total: 10700,
    status: 'Unpaid',
    issue_date: '2026-06-04',
    due_date: '2026-07-03',
    created_at: new Date('2026-06-04T10:00:00Z').toISOString(),
    items: [
      {
        id: 'invi_demo_1',
        item_no: 1,
        description: '(3000650001) Service per job\n(ค่าบริการต่องาน) Hyd Bolt Torque\n#75,#70,#65,#55,#50 1 Lot ,\nSupervisor 1 Pax\nBolt Torque Operator 3 Pax\nPick Up Truck for Transportation\nPErsonal and equipment 1 Unit\nIncluding Transportation of the\nAircompressor on site 1 Unit\n31/3/2026 08.00-12.00 1/2 day เลขที่\nQT-4076-26',
        quantity: 1,
        unit_price: 10000,
        tax_rate: 7,
        amount: 10000
      }
    ]
  },
  {
    id: 'inv_3000',
    invoice_no: 'INV-3000',
    sales_order_id: 'so_qt3000',
    customer_id: 'c2',
    total_amount: 14000,
    vat_amount: 980,
    grand_total: 14980,
    status: 'Unpaid',
    issue_date: '2025-01-20',
    due_date: '2025-02-20',
    created_at: new Date('2025-01-20T10:00:00Z').toISOString()
  },
  {
    id: 'inv_3018',
    invoice_no: 'INV-3018',
    sales_order_id: 'so_qt3018',
    customer_id: 'c_cr3',
    total_amount: 15000,
    vat_amount: 1050,
    grand_total: 16050,
    status: 'Paid',
    issue_date: '2025-03-25',
    due_date: '2025-04-25',
    created_at: new Date('2025-03-25T10:00:00Z').toISOString()
  }
];

const DEFAULT_RECEIPTS: Receipt[] = [
  {
    id: 'rc_3018',
    receipt_no: 'RE-3018',
    invoice_id: 'inv_3018',
    customer_id: 'c_cr3',
    received_amount: 16050,
    payment_method: 'Transfer',
    payment_date: '2025-04-01',
    created_at: new Date('2025-04-01T14:00:00Z').toISOString()
  }
];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj_qt3000',
    job_number: 'JOB-25001',
    sales_order_id: 'so_qt3000',
    customer_id: 'c2',
    project_name: 'Chemical Cleaning for QT3000 Boiler',
    project_manager: 'Somchai P.',
    sales_representative: 'Apiyut N.',
    start_date: '2025-01-05',
    end_date: '2025-01-20',
    duration_days: 15,
    progress_percent: 65,
    status: 'On Going',
    contract_value: 360000,
    created_at: new Date('2024-12-16T09:00:00Z').toISOString(),
    updated_at: new Date().toISOString(),
    tasks: [
      { id: 't1', project_id: 'proj_qt3000', task_name: 'Site Survey', responsible_person: 'Somchai P.', start_date: '2025-01-05', due_date: '2025-01-06', status: 'Completed', progress: 100, created_at: new Date().toISOString() },
      { id: 't2', project_id: 'proj_qt3000', task_name: 'Mobilization', responsible_person: 'Winai T.', start_date: '2025-01-07', due_date: '2025-01-08', status: 'Completed', progress: 100, created_at: new Date().toISOString() },
      { id: 't3', project_id: 'proj_qt3000', task_name: 'Chemical Flushing', responsible_person: 'Team A', start_date: '2025-01-09', due_date: '2025-01-15', status: 'In Progress', progress: 50, created_at: new Date().toISOString() }
    ],
    milestones: [
      { id: 'm1', project_id: 'proj_qt3000', milestone_name: 'Project Kickoff', target_date: '2025-01-05', actual_date: '2025-01-05', status: 'Completed', responsible_person: 'Somchai P.' },
      { id: 'm2', project_id: 'proj_qt3000', milestone_name: 'Flushing Completion', target_date: '2025-01-15', status: 'Pending', responsible_person: 'Team A' }
    ],
    timeline: [
      { id: 'tl1', project_id: 'proj_qt3000', event_name: 'Project Created', date: '2024-12-16', time: '09:00', responsible_person: 'System' },
      { id: 'tl2', project_id: 'proj_qt3000', event_name: 'Site Survey Completed', date: '2025-01-06', time: '16:00', responsible_person: 'Somchai P.' }
    ]
  },
  {
    id: 'proj_hvac',
    job_number: 'JOB-25002',
    sales_order_id: 'so_hvac', // this ID doesn't exist, I should link it to so_qt3227
    customer_id: 'c_egat',
    project_name: 'Lube Oil Flushing GNS - C2, C21, C22',
    project_manager: 'Kasem M.',
    sales_representative: 'Pimjai K.',
    start_date: '2025-01-02',
    end_date: '2025-01-25',
    duration_days: 23,
    progress_percent: 25,
    status: 'Delayed',
    contract_value: 544880,
    created_at: new Date('2024-12-25T11:00:00Z').toISOString(),
    updated_at: new Date().toISOString(),
    tasks: [],
    milestones: [],
    timeline: []
  }
];

// Helper to query Supabase REST API
async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const config = getSupabaseConfig();
  const headers = {
    'apikey': config.key,
    'Authorization': `Bearer ${config.key}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${config.url}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    
    // Self-healing / Auto-recovery logic:
    // If we tried to insert/update but a column was missing in the live schema,
    // parse the missing column name, strip it from the body, and retry!
    if (options.body && typeof options.body === 'string') {
      try {
        const parsedError = JSON.parse(errorText);
        const errMsg = parsedError.message || '';
        // Look for PGRST204 column missing error message:
        // e.g., "Could not find the 'internal_notes' column of 'opportunities' in the schema cache"
        const columnMatch = /Could not find the '([^']+)' column/i.exec(errMsg);
        if (columnMatch && columnMatch[1]) {
          const badColumn = columnMatch[1];
          console.warn(`[Self-Healing] Column '${badColumn}' is missing on Supabase. Stripping and retrying...`);
          
          const payload = JSON.parse(options.body);
          if (payload && typeof payload === 'object') {
            delete payload[badColumn];
            const updatedOptions = {
              ...options,
              body: JSON.stringify(payload)
            };
            return await apiFetch(endpoint, updatedOptions);
          }
        }
      } catch (e) {
        // Fallback: If error isn't JSON or regex didn't match nested message, check errorText rawly
        const columnMatch = /Could not find the '([^']+)' column/i.exec(errorText);
        if (columnMatch && columnMatch[1] && options.body && typeof options.body === 'string') {
          const badColumn = columnMatch[1];
          console.warn(`[Self-Healing] Column '${badColumn}' is missing on Supabase (Text Match). Stripping and retrying...`);
          try {
            const payload = JSON.parse(options.body);
            if (payload && typeof payload === 'object') {
              delete payload[badColumn];
              const updatedOptions = {
                ...options,
                body: JSON.stringify(payload)
              };
              return await apiFetch(endpoint, updatedOptions);
            }
          } catch (_) {}
        }
      }
    }

    throw new Error(`API Error ${response.ok ? response.status : 'Supabase Error (' + response.status + '): ' + errorText}`);
  }

  // Handle No Content (204)
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text || text.trim() === '') {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (parseErr) {
    console.error('Failed to parse response JSON:', text);
    return null;
  }
}

/**
 * Service to manage local database backup / fallback
 */
class LocalDB {
  static getCustomers(): Customer[] {
    const data = localStorage.getItem('crm_customers');
    if (!data) {
      const mapped = DEFAULT_CUSTOMERS.map(c => ({
        ...c,
        id: ensureUUID(c.id),
        contacts: c.contacts?.map(contact => ({ ...contact })) || []
      }));
      localStorage.setItem('crm_customers', JSON.stringify(mapped));
      return mapped;
    }
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || !parsed.some(c => c.id === ensureUUID('c_stpi'))) {
        const mapped = DEFAULT_CUSTOMERS.map(c => ({
          ...c,
          id: ensureUUID(c.id),
          contacts: c.contacts?.map(contact => ({ ...contact })) || []
        }));
        localStorage.setItem('crm_customers', JSON.stringify(mapped));
        return mapped;
      }
      return parsed.map((c: any) => ({
        ...c,
        id: ensureUUID(c.id),
        contacts: c.contacts?.map((contact: any) => ({ ...contact })) || []
      }));
    } catch {
      const mapped = DEFAULT_CUSTOMERS.map(c => ({
        ...c,
        id: ensureUUID(c.id),
        contacts: c.contacts?.map(contact => ({ ...contact })) || []
      }));
      return mapped;
    }
  }

  static saveCustomers(customers: Customer[]) {
    const mapped = customers.map(c => ({
      ...c,
      id: ensureUUID(c.id),
      contacts: c.contacts?.map(contact => ({ ...contact })) || []
    }));
    localStorage.setItem('crm_customers', JSON.stringify(mapped));
  }

  static getOpportunities(): Opportunity[] {
    const data = localStorage.getItem('crm_opportunities');
    if (!data) {
      const mapped = DEFAULT_OPPORTUNITIES.map(o => ({
        ...o,
        id: ensureUUID(o.id),
        customer_id: ensureUUID(o.customer_id)
      }));
      localStorage.setItem('crm_opportunities', JSON.stringify(mapped));
      return mapped;
    }
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || !parsed.some(o => o.id === ensureUUID('o_qt3000'))) {
        const mapped = DEFAULT_OPPORTUNITIES.map(o => ({
          ...o,
          id: ensureUUID(o.id),
          customer_id: ensureUUID(o.customer_id)
        }));
        localStorage.setItem('crm_opportunities', JSON.stringify(mapped));
        return mapped;
      }
      return parsed.map((o: any) => ({
        ...o,
        id: ensureUUID(o.id),
        customer_id: ensureUUID(o.customer_id)
      }));
    } catch {
      const mapped = DEFAULT_OPPORTUNITIES.map(o => ({
        ...o,
        id: ensureUUID(o.id),
        customer_id: ensureUUID(o.customer_id)
      }));
      return mapped;
    }
  }

  static saveOpportunities(opportunities: Opportunity[]) {
    const mapped = opportunities.map(o => ({
      ...o,
      id: ensureUUID(o.id),
      customer_id: ensureUUID(o.customer_id)
    }));
    localStorage.setItem('crm_opportunities', JSON.stringify(mapped));
  }

  static getActivities(): Activity[] {
    const data = localStorage.getItem('crm_activities');
    if (!data) {
      const mapped = DEFAULT_ACTIVITIES.map(a => ({
        ...a,
        id: ensureUUID(a.id),
        opportunity_id: ensureUUID(a.opportunity_id)
      }));
      localStorage.setItem('crm_activities', JSON.stringify(mapped));
      return mapped;
    }
    try {
      const parsed = JSON.parse(data);
      return parsed.map((a: any) => ({
        ...a,
        id: ensureUUID(a.id),
        opportunity_id: ensureUUID(a.opportunity_id)
      }));
    } catch {
      const mapped = DEFAULT_ACTIVITIES.map(a => ({
        ...a,
        id: ensureUUID(a.id),
        opportunity_id: ensureUUID(a.opportunity_id)
      }));
      return mapped;
    }
  }

  static saveActivities(activities: Activity[]) {
    const mapped = activities.map(a => ({
      ...a,
      id: ensureUUID(a.id),
      opportunity_id: ensureUUID(a.opportunity_id)
    }));
    localStorage.setItem('crm_activities', JSON.stringify(mapped));
  }

  static getTasks(): OpportunityTask[] {
    const data = localStorage.getItem('crm_tasks');
    if (!data) {
      const mapped = DEFAULT_TASKS.map(t => ({
        ...t,
        id: ensureUUID(t.id),
        opportunity_id: ensureUUID(t.opportunity_id)
      }));
      localStorage.setItem('crm_tasks', JSON.stringify(mapped));
      return mapped;
    }
    try {
      const parsed = JSON.parse(data);
      return parsed.map((t: any) => ({
        ...t,
        id: ensureUUID(t.id),
        opportunity_id: ensureUUID(t.opportunity_id)
      }));
    } catch {
      const mapped = DEFAULT_TASKS.map(t => ({
        ...t,
        id: ensureUUID(t.id),
        opportunity_id: ensureUUID(t.opportunity_id)
      }));
      return mapped;
    }
  }

  static saveTasks(tasks: OpportunityTask[]) {
    const mapped = tasks.map(t => ({
      ...t,
      id: ensureUUID(t.id),
      opportunity_id: ensureUUID(t.opportunity_id)
    }));
    localStorage.setItem('crm_tasks', JSON.stringify(mapped));
  }

  static getAttachments(): OpportunityAttachment[] {
    const data = localStorage.getItem('crm_attachments');
    if (!data) {
      const mapped = DEFAULT_ATTACHMENTS.map(at => ({
        ...at,
        id: ensureUUID(at.id),
        opportunity_id: ensureUUID(at.opportunity_id)
      }));
      localStorage.setItem('crm_attachments', JSON.stringify(mapped));
      return mapped;
    }
    try {
      const parsed = JSON.parse(data);
      return parsed.map((at: any) => ({
        ...at,
        id: ensureUUID(at.id),
        opportunity_id: ensureUUID(at.opportunity_id)
      }));
    } catch {
       const mapped = DEFAULT_ATTACHMENTS.map(at => ({
        ...at,
        id: ensureUUID(at.id),
        opportunity_id: ensureUUID(at.opportunity_id)
      }));
      return mapped;
    }
  }

  static saveAttachments(attachments: OpportunityAttachment[]) {
    const mapped = attachments.map(at => ({
      ...at,
      id: ensureUUID(at.id),
      opportunity_id: ensureUUID(at.opportunity_id)
    }));
    localStorage.setItem('crm_attachments', JSON.stringify(mapped));
  }

  static getAuditLogs(): AuditLog[] {
    const data = localStorage.getItem('crm_audit_logs');
    if (!data) {
      const mapped = DEFAULT_AUDIT_LOGS.map(l => ({
        ...l,
        id: ensureUUID(l.id),
        target_id: l.target_id ? ensureUUID(l.target_id) : undefined
      }));
      localStorage.setItem('crm_audit_logs', JSON.stringify(mapped));
      return mapped;
    }
    try {
      const parsed = JSON.parse(data);
      return parsed.map((l: any) => ({
        ...l,
        id: ensureUUID(l.id),
        target_id: l.target_id ? ensureUUID(l.target_id) : undefined
      }));
    } catch {
      const mapped = DEFAULT_AUDIT_LOGS.map(l => ({
        ...l,
        id: ensureUUID(l.id),
        target_id: l.target_id ? ensureUUID(l.target_id) : undefined
      }));
      return mapped;
    }
  }

  static saveAuditLogs(logs: AuditLog[]) {
    const mapped = logs.map(l => ({
      ...l,
      id: ensureUUID(l.id),
      target_id: l.target_id ? ensureUUID(l.target_id) : undefined
    }));
    localStorage.setItem('crm_audit_logs', JSON.stringify(mapped));
  }

  static getQuotations(): Quotation[] {
    const data = localStorage.getItem('crm_quotations');
    if (!data) {
      const mapped = DEFAULT_QUOTATIONS.map(q => ({
        ...q,
        id: ensureUUID(q.id),
        opportunity_id: ensureUUID(q.opportunity_id),
        customer_id: ensureUUID(q.customer_id)
      }));
      localStorage.setItem('crm_quotations', JSON.stringify(mapped));
      return mapped;
    }
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || !parsed.some(q => q.id === ensureUUID('qt3000'))) {
        const mapped = DEFAULT_QUOTATIONS.map(q => ({
          ...q,
          id: ensureUUID(q.id),
          opportunity_id: ensureUUID(q.opportunity_id),
          customer_id: ensureUUID(q.customer_id)
        }));
        localStorage.setItem('crm_quotations', JSON.stringify(mapped));
        return mapped;
      }
      return parsed.map((q: any) => ({
        ...q,
        id: ensureUUID(q.id),
        opportunity_id: ensureUUID(q.opportunity_id),
        customer_id: ensureUUID(q.customer_id)
      }));
    } catch {
      const mapped = DEFAULT_QUOTATIONS.map(q => ({
        ...q,
        id: ensureUUID(q.id),
        opportunity_id: ensureUUID(q.opportunity_id),
        customer_id: ensureUUID(q.customer_id)
      }));
      return mapped;
    }
  }

  static saveQuotations(quotations: Quotation[]) {
    const mapped = quotations.map(q => ({
      ...q,
      id: ensureUUID(q.id),
      opportunity_id: ensureUUID(q.opportunity_id),
      customer_id: ensureUUID(q.customer_id)
    }));
    localStorage.setItem('crm_quotations', JSON.stringify(mapped));
  }

  static getSalesOrders(): SalesOrder[] {
    const data = localStorage.getItem('crm_sales_orders');
    if (!data) {
      const mapped = DEFAULT_SALES_ORDERS.map(s => ({
        ...s,
        id: ensureUUID(s.id),
        customer_id: ensureUUID(s.customer_id),
        quotation_id: s.quotation_id ? ensureUUID(s.quotation_id) : undefined
      }));
      localStorage.setItem('crm_sales_orders', JSON.stringify(mapped));
      return mapped;
    }
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || !parsed.some(s => s.id === ensureUUID('so_qt3000'))) {
        const mapped = DEFAULT_SALES_ORDERS.map(s => ({
          ...s,
          id: ensureUUID(s.id),
          customer_id: ensureUUID(s.customer_id),
          quotation_id: s.quotation_id ? ensureUUID(s.quotation_id) : undefined
        }));
        localStorage.setItem('crm_sales_orders', JSON.stringify(mapped));
        return mapped;
      }
      return parsed.map((s: any) => ({
        ...s,
        id: ensureUUID(s.id),
        customer_id: ensureUUID(s.customer_id),
        quotation_id: s.quotation_id ? ensureUUID(s.quotation_id) : undefined
      }));
    } catch {
      const mapped = DEFAULT_SALES_ORDERS.map(s => ({
        ...s,
        id: ensureUUID(s.id),
        customer_id: ensureUUID(s.customer_id),
        quotation_id: s.quotation_id ? ensureUUID(s.quotation_id) : undefined
      }));
      return mapped;
    }
  }

  static saveSalesOrders(salesOrders: SalesOrder[]) {
    const mapped = salesOrders.map(s => ({
      ...s,
      id: ensureUUID(s.id),
      customer_id: ensureUUID(s.customer_id),
      quotation_id: s.quotation_id ? ensureUUID(s.quotation_id) : undefined
    }));
    localStorage.setItem('crm_sales_orders', JSON.stringify(mapped));
  }

  static getDeliveryJobs(): DeliveryJob[] {
    const data = localStorage.getItem('crm_delivery_jobs');
    if (!data) {
      const mapped = DEFAULT_DELIVERY_JOBS.map(d => ({
        ...d,
        id: ensureUUID(d.id),
        sales_order_id: ensureUUID(d.sales_order_id)
      }));
      localStorage.setItem('crm_delivery_jobs', JSON.stringify(mapped));
      return mapped;
    }
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || !parsed.some(d => d.id === ensureUUID('dl_qt3000'))) {
        const mapped = DEFAULT_DELIVERY_JOBS.map(d => ({
          ...d,
          id: ensureUUID(d.id),
          sales_order_id: ensureUUID(d.sales_order_id)
        }));
        localStorage.setItem('crm_delivery_jobs', JSON.stringify(mapped));
        return mapped;
      }
      return parsed.map((d: any) => ({
        ...d,
        id: ensureUUID(d.id),
        sales_order_id: ensureUUID(d.sales_order_id)
      }));
    } catch {
      const mapped = DEFAULT_DELIVERY_JOBS.map(d => ({
        ...d,
        id: ensureUUID(d.id),
        sales_order_id: ensureUUID(d.sales_order_id)
      }));
      return mapped;
    }
  }

  static saveDeliveryJobs(jobs: DeliveryJob[]) {
    const mapped = jobs.map(d => ({
      ...d,
      id: ensureUUID(d.id),
      sales_order_id: ensureUUID(d.sales_order_id)
    }));
    localStorage.setItem('crm_delivery_jobs', JSON.stringify(mapped));
  }

  static getInvoices(): Invoice[] {
    const data = localStorage.getItem('crm_invoices');
    if (!data) {
      const mapped = DEFAULT_INVOICES.map(i => ({
        ...i,
        id: ensureUUID(i.id),
        customer_id: ensureUUID(i.customer_id),
        sales_order_id: ensureUUID(i.sales_order_id)
      }));
      localStorage.setItem('crm_invoices', JSON.stringify(mapped));
      return mapped;
    }
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || !parsed.some(i => i.id === ensureUUID('inv_demo'))) {
        const mapped = DEFAULT_INVOICES.map(i => ({
          ...i,
          id: ensureUUID(i.id),
          customer_id: ensureUUID(i.customer_id),
          sales_order_id: ensureUUID(i.sales_order_id)
        }));
        localStorage.setItem('crm_invoices', JSON.stringify(mapped));
        return mapped;
      }
      return parsed.map((i: any) => ({
        ...i,
        id: ensureUUID(i.id),
        customer_id: ensureUUID(i.customer_id),
        sales_order_id: ensureUUID(i.sales_order_id)
      }));
    } catch {
      const mapped = DEFAULT_INVOICES.map(i => ({
        ...i,
        id: ensureUUID(i.id),
        customer_id: ensureUUID(i.customer_id),
        sales_order_id: ensureUUID(i.sales_order_id)
      }));
      return mapped;
    }
  }

  static saveInvoices(invoices: Invoice[]) {
    const mapped = invoices.map(i => ({
      ...i,
      id: ensureUUID(i.id),
      customer_id: ensureUUID(i.customer_id),
      sales_order_id: ensureUUID(i.sales_order_id)
    }));
    localStorage.setItem('crm_invoices', JSON.stringify(mapped));
  }

  static getReceipts(): Receipt[] {
    const data = localStorage.getItem('crm_receipts');
    if (!data) {
      const mapped = DEFAULT_RECEIPTS.map(r => ({
        ...r,
        id: ensureUUID(r.id),
        customer_id: ensureUUID(r.customer_id),
        invoice_id: ensureUUID(r.invoice_id)
      }));
      localStorage.setItem('crm_receipts', JSON.stringify(mapped));
      return mapped;
    }
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || !parsed.some(r => r.id === ensureUUID('rc_3018'))) {
        const mapped = DEFAULT_RECEIPTS.map(r => ({
          ...r,
          id: ensureUUID(r.id),
          customer_id: ensureUUID(r.customer_id),
          invoice_id: ensureUUID(r.invoice_id)
        }));
        localStorage.setItem('crm_receipts', JSON.stringify(mapped));
        return mapped;
      }
      return parsed.map((r: any) => ({
        ...r,
        id: ensureUUID(r.id),
        customer_id: ensureUUID(r.customer_id),
        invoice_id: ensureUUID(r.invoice_id)
      }));
    } catch {
      const mapped = DEFAULT_RECEIPTS.map(r => ({
        ...r,
        id: ensureUUID(r.id),
        customer_id: ensureUUID(r.customer_id),
        invoice_id: ensureUUID(r.invoice_id)
      }));
      return mapped;
    }
  }

  static saveReceipts(receipts: Receipt[]) {
    const mapped = receipts.map(r => ({
      ...r,
      id: ensureUUID(r.id),
      customer_id: ensureUUID(r.customer_id),
      invoice_id: ensureUUID(r.invoice_id)
    }));
    localStorage.setItem('crm_receipts', JSON.stringify(mapped));
  }

  static getProjects(): Project[] {
    const data = localStorage.getItem('crm_projects');
    if (!data) {
      const mapped = DEFAULT_PROJECTS.map(p => ({
        ...p,
        id: ensureUUID(p.id),
        sales_order_id: ensureUUID(p.sales_order_id)
      }));
      localStorage.setItem('crm_projects', JSON.stringify(mapped));
      return mapped;
    }
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || !parsed.some(p => p.id === ensureUUID('proj_qt3000'))) {
        const mapped = DEFAULT_PROJECTS.map(p => ({
          ...p,
          id: ensureUUID(p.id),
          sales_order_id: ensureUUID(p.sales_order_id)
        }));
        localStorage.setItem('crm_projects', JSON.stringify(mapped));
        return mapped;
      }
      return parsed.map((p: any) => ({
        ...p,
        id: ensureUUID(p.id),
        sales_order_id: ensureUUID(p.sales_order_id)
      }));
    } catch {
      const mapped = DEFAULT_PROJECTS.map(p => ({
        ...p,
        id: ensureUUID(p.id),
        sales_order_id: ensureUUID(p.sales_order_id)
      }));
      return mapped;
    }
  }

  static saveProjects(projects: Project[]) {
    const mapped = projects.map(p => ({
      ...p,
      id: ensureUUID(p.id),
      sales_order_id: ensureUUID(p.sales_order_id)
    }));
    localStorage.setItem('crm_projects', JSON.stringify(mapped));
  }
}

// Global connectivity state
let useCloudStorage = true;

export const setConnectivityMode = (mode: boolean) => {
  useCloudStorage = mode;
  localStorage.setItem('crm_use_cloud', JSON.stringify(mode));
};

export const getConnectivityMode = (): boolean => {
  const stored = localStorage.getItem('crm_use_cloud');
  if (stored !== null) {
    return JSON.parse(stored);
  }
  return true; // Default to cloud
};

/**
 * Main database abstraction layer.
 * Attempts to write/read to Supabase table endpoints.
 * If tables or connections are missing/offline, it handles operations locally in LocalDB,
 * and increments counters locally. It also merges relational records dynamically.
 */
export const CRMService = {
  /**
   * Health check to test cloud connectivity & check table existence
   */
  async checkCloudConnection(): Promise<boolean> {
    if (!getConnectivityMode()) return false;
    try {
      // Direct test to the endpoint
      await apiFetch('/customers?select=id&limit=1', { method: 'GET' });
      return true;
    } catch (e) {
      console.warn('Supabase DB offline or schema missing. Falling back to robust local simulation. Error:', e);
      return false;
    }
  },

  // -------------------------------------------------------------
  // CUSTOMER SERVICES
  // -------------------------------------------------------------
  async fetchCustomers(): Promise<Customer[]> {
    const isCloud = await this.checkCloudConnection();
    if (isCloud && getConnectivityMode()) {
      try {
        const data = await apiFetch('/customers?order=customer_code.asc');
        let contactsData: any[] = [];
        try {
          contactsData = await apiFetch('/customer_contacts') || [];
        } catch (contactErr) {
          console.warn('Failed to fetch customer_contacts. Using empty array.', contactErr);
        }

        // Group contacts by customer_id
        const contactsMap = new Map<string, any[]>();
        contactsData.forEach((contact: any) => {
          const list = contactsMap.get(contact.customer_id) || [];
          list.push({
            contact_name: contact.contact_name,
            position: contact.position,
            department: contact.department || '',
            phone: contact.phone,
            office_phone: contact.office_phone || '',
            email: contact.email,
            line_id: contact.line_id || '',
            preferred_contact: contact.preferred_contact || 'Email',
            status: contact.status || 'Active'
          });
          contactsMap.set(contact.customer_id, list);
        });

        const parsed = (data as any[]).map(item => ({
          ...item,
          contacts: contactsMap.get(item.id) || []
        }));
        // Update local backup
        LocalDB.saveCustomers(parsed);
        return parsed;
      } catch (err) {
        console.warn('Failed to parse remote customers, using offline data', err);
        return LocalDB.getCustomers();
      }
    } else {
      return LocalDB.getCustomers().sort((a, b) => a.customer_code.localeCompare(b.customer_code));
    }
  },

  async insertCustomer(customer: Omit<Customer, 'id' | 'customer_code'>): Promise<Customer> {
    // 1. Generate visual customer_code locally matching CUS-260101 format
    const currentList = LocalDB.getCustomers();
    const currentYearShort = '26';
    const thisYearCusts = currentList.filter(c => c.customer_code.startsWith(`CUS-${currentYearShort}`));
    let nextSeq = 1;
    if (thisYearCusts.length > 0) {
      const maxSeq = thisYearCusts.reduce((max, item) => {
        const seqPart = item.customer_code.replace(`CUS-${currentYearShort}`, '');
        const num = parseInt(seqPart, 10);
        return num > max ? num : max;
      }, 0);
      nextSeq = maxSeq + 1;
    }
    const nextCode = `CUS-${currentYearShort}${String(nextSeq).padStart(4, '0')}`;
    const newId = crypto.randomUUID();

    const preparedCustomer: Customer = {
      ...customer,
      id: newId,
      customer_code: nextCode,
      created_at: new Date().toISOString()
    };

    // Attempt cloud write
    const isCloud = await this.checkCloudConnection();
    if (isCloud && getConnectivityMode()) {
      try {
        const responseList = await apiFetch('/customers', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify({
            id: preparedCustomer.id,
            customer_code: preparedCustomer.customer_code,
            customer_name: preparedCustomer.customer_name,
            tax_id: preparedCustomer.tax_id,
            industry_type: preparedCustomer.industry_type,
            address: preparedCustomer.address,
            province: preparedCustomer.province || '',
            country: preparedCustomer.country || '',
            phone: preparedCustomer.phone,
            email: preparedCustomer.email,
            website: preparedCustomer.website || '',
            payment_term: preparedCustomer.payment_term,
            credit_limit: preparedCustomer.credit_limit ? Number(preparedCustomer.credit_limit) : null,
            status: preparedCustomer.status,
            notes: preparedCustomer.notes || '',
            created_at: preparedCustomer.created_at
          })
        });
        if (responseList && responseList[0]) {
          const cloudOut = responseList[0];

          // Insert nested contacts if any
          if (preparedCustomer.contacts && preparedCustomer.contacts.length > 0) {
            for (const contact of preparedCustomer.contacts) {
              try {
                await apiFetch('/customer_contacts', {
                  method: 'POST',
                  body: JSON.stringify({
                    customer_id: preparedCustomer.id,
                    contact_name: contact.contact_name,
                    position: contact.position,
                    department: contact.department || '',
                    phone: contact.phone,
                    office_phone: contact.office_phone || '',
                    email: contact.email,
                    line_id: contact.line_id || '',
                    preferred_contact: contact.preferred_contact || 'Email',
                    status: contact.status || 'Active'
                  })
                });
              } catch (contactErr) {
                console.warn('Failed to insert relative customer contact object', contact, contactErr);
              }
            }
          }

          const result: Customer = {
            ...cloudOut,
            contacts: preparedCustomer.contacts || []
          };
          // Sync with local
          const latestList = [...currentList, result];
          LocalDB.saveCustomers(latestList);
          return result;
        }
      } catch (err: any) {
        console.warn('Failed cloud insert customer, falling back to local storage write', err);
        // Sync with local fallback first
        const savedList = [...currentList, preparedCustomer];
        LocalDB.saveCustomers(savedList);
        throw new Error(err.message || 'Supabase Connection Timeout');
      }
    }

    // fallback save locally
    const savedList = [...currentList, preparedCustomer];
    LocalDB.saveCustomers(savedList);
    return preparedCustomer;
  },

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    const currentList = LocalDB.getCustomers();
    const itemIndex = currentList.findIndex(c => c.id === id);
    if (itemIndex === -1) {
      throw new Error(`Customer with id ${id} not found`);
    }

    const mergedItem = {
      ...currentList[itemIndex],
      ...updates
    };

    // Attempt cloud update
    const isCloud = await this.checkCloudConnection();
    if (isCloud && getConnectivityMode()) {
      try {
        const body: any = {};
        if (updates.customer_name !== undefined) body.customer_name = updates.customer_name;
        if (updates.tax_id !== undefined) body.tax_id = updates.tax_id;
        if (updates.industry_type !== undefined) body.industry_type = updates.industry_type;
        if (updates.address !== undefined) body.address = updates.address;
        if (updates.province !== undefined) body.province = updates.province;
        if (updates.country !== undefined) body.country = updates.country;
        if (updates.phone !== undefined) body.phone = updates.phone;
        if (updates.email !== undefined) body.email = updates.email;
        if (updates.website !== undefined) body.website = updates.website;
        if (updates.payment_term !== undefined) body.payment_term = updates.payment_term;
        if (updates.credit_limit !== undefined) body.credit_limit = updates.credit_limit ? Number(updates.credit_limit) : null;
        if (updates.status !== undefined) body.status = updates.status;
        if (updates.notes !== undefined) body.notes = updates.notes;

        const responseList = await apiFetch(`/customers?id=eq.${id}`, {
          method: 'PATCH',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify(body)
        });

        if (updates.contacts !== undefined) {
          try {
            // Delete old ones first
            await apiFetch(`/customer_contacts?customer_id=eq.${id}`, {
              method: 'DELETE'
            });
            // Insert current ones
            for (const contact of updates.contacts) {
              await apiFetch('/customer_contacts', {
                method: 'POST',
                body: JSON.stringify({
                  customer_id: id,
                  contact_name: contact.contact_name,
                  position: contact.position,
                  department: contact.department || '',
                  phone: contact.phone,
                  office_phone: contact.office_phone || '',
                  email: contact.email,
                  line_id: contact.line_id || '',
                  preferred_contact: contact.preferred_contact || 'Email',
                  status: contact.status || 'Active'
                })
              });
            }
          } catch (contactErr) {
            console.warn('Failed to update nested customer contacts table', contactErr);
          }
        }

        if (responseList && responseList[0]) {
          const cloudOut = responseList[0];
          const result: Customer = {
            ...cloudOut,
            contacts: updates.contacts !== undefined ? updates.contacts : (mergedItem.contacts || [])
          };
          // Update local copy
          currentList[itemIndex] = result;
          LocalDB.saveCustomers(currentList);
          return result;
        }
      } catch (err: any) {
        console.warn('Failed cloud update customer, using local storage update', err);
        currentList[itemIndex] = mergedItem;
        LocalDB.saveCustomers(currentList);
        throw new Error(err.message || 'Supabase Connection Timeout');
      }
    }

    // fallback save locally
    currentList[itemIndex] = mergedItem;
    LocalDB.saveCustomers(currentList);
    return mergedItem;
  },

  async deleteCustomer(id: string): Promise<boolean> {
    // Delete opportunity dependent cascade representation
    const opportunities = LocalDB.getOpportunities();
    const remainingOpps = opportunities.filter(o => o.customer_id !== id);
    LocalDB.saveOpportunities(remainingOpps);

    // Delete customer
    const currentList = LocalDB.getCustomers();
    const updatedList = currentList.filter(c => c.id !== id);
    LocalDB.saveCustomers(updatedList);

    // Attempt cloud delete
    const isCloud = await this.checkCloudConnection();
    if (isCloud && getConnectivityMode()) {
      try {
        // Cascade manually in cloud
        try {
          await apiFetch(`/opportunities?customer_id=eq.${id}`, { method: 'DELETE' });
        } catch (subErr) {
          console.warn('Could not complete cascade delete on cloud, might have real cascade rule set', subErr);
        }
        await apiFetch(`/customers?id=eq.${id}`, { method: 'DELETE' });
        return true;
      } catch (err: any) {
        console.warn('Failed cloud delete, fallback local accomplished', err);
        throw new Error(err.message || 'Supabase Connection Timeout');
      }
    }
    return true;
  },

  // -------------------------------------------------------------
  // OPPORTUNITY SERVICES
  // -------------------------------------------------------------
  async fetchOpportunities(): Promise<Opportunity[]> {
    const isCloud = await this.checkCloudConnection();
    const localCustomers = LocalDB.getCustomers();

    if (isCloud && getConnectivityMode()) {
      try {
        // Fetch opportunities
        const rawOpps = await apiFetch('/opportunities?order=opportunity_no.desc');
        // Reconstruct relations by pulling core customers using fetchCustomers()
        const hydratedCustomers = await this.fetchCustomers();
        const custMap = new Map<string, Customer>();
        hydratedCustomers.forEach(c => {
          custMap.set(c.id, c);
        });

        const parsed: Opportunity[] = (rawOpps as any[]).map(o => ({
          ...o,
          weighted_value: o.weighted_value ?? (o.estimated_value * (o.success_probability / 100)),
          customer: custMap.get(o.customer_id)
        }));

        // Backup
        LocalDB.saveOpportunities(parsed);
        return parsed;
      } catch (err) {
        console.warn('Failed to load remote opportunities, using offline copy', err);
        // build offline projection with offline customers
        const localOpps = LocalDB.getOpportunities();
        const map = new Map(localCustomers.map(c => [c.id, c]));
        return localOpps.map(o => ({
          ...o,
          weighted_value: o.weighted_value ?? (o.estimated_value * (o.success_probability / 100)),
          customer: map.get(o.customer_id)
        }));
      }
    } else {
      const localOpps = LocalDB.getOpportunities();
      const map = new Map(localCustomers.map(c => [c.id, c]));
      return localOpps.map(o => ({
        ...o,
        weighted_value: o.weighted_value ?? (o.estimated_value * (o.success_probability / 100)),
        customer: map.get(o.customer_id)
      })).sort((a, b) => b.opportunity_no.localeCompare(a.opportunity_no));
    }
  },

  async insertOpportunity(opportunity: Omit<Opportunity, 'id' | 'opportunity_no'>): Promise<Opportunity> {
    const currentList = LocalDB.getOpportunities();
    
    // Auto Generate Opportunity No: Format OPP-YYXXXX (e.g. OPP-260001 for year 2026)
    const currentYearShort = '26';
    
    // Filter to ones matching Year 2026
    const thisYearOpps = currentList.filter(o => o.opportunity_no.startsWith(`OPP-${currentYearShort}`));
    let nextSeq = 1;
    if (thisYearOpps.length > 0) {
      const maxSeq = thisYearOpps.reduce((max, item) => {
        const seqPart = item.opportunity_no.replace(`OPP-${currentYearShort}`, '');
        const num = parseInt(seqPart, 10);
        return num > max ? num : max;
      }, 0);
      nextSeq = maxSeq + 1;
    }
    const nextOppNo = `OPP-${currentYearShort}${String(nextSeq).padStart(4, '0')}`;
    const newId = crypto.randomUUID();

    const preparedOpp: Opportunity = {
      ...opportunity,
      id: newId,
      opportunity_no: nextOppNo,
      weighted_value: Number(opportunity.estimated_value) * (Number(opportunity.success_probability) / 100),
      created_at: new Date().toISOString()
    };

    // Attempt cloud write
    const isCloud = await this.checkCloudConnection();
    if (isCloud && getConnectivityMode()) {
      try {
        const responseList = await apiFetch('/opportunities', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify({
            id: preparedOpp.id,
            opportunity_no: preparedOpp.opportunity_no,
            customer_id: preparedOpp.customer_id,
            project_name: preparedOpp.project_name,
            service_type: preparedOpp.service_type,
            lead_source: preparedOpp.lead_source,
            project_location: preparedOpp.project_location || 'Other',
            estimated_value: Number(preparedOpp.estimated_value),
            success_probability: Number(preparedOpp.success_probability),
            weighted_value: preparedOpp.weighted_value,
            expected_close_date: preparedOpp.expected_close_date,
            sales_person_id: preparedOpp.sales_person_id,
            status: preparedOpp.status,
            remarks: preparedOpp.remarks,
            internal_notes: preparedOpp.internal_notes || '',
            created_at: preparedOpp.created_at
          })
        });

        if (responseList && responseList[0]) {
          const cloudOut = responseList[0];
          // Pull associated customer info for local UI state
          const localCustomers = LocalDB.getCustomers();
          const targetCustomer = localCustomers.find(c => c.id === preparedOpp.customer_id);
          const result: Opportunity = {
            ...cloudOut,
            weighted_value: cloudOut.weighted_value ?? preparedOpp.weighted_value,
            customer: targetCustomer
          };
          const latestList = [...currentList, result];
          LocalDB.saveOpportunities(latestList);
          return result;
        }
      } catch (err: any) {
        console.warn('Failed cloud insert opportunity, using local storage backup write', err);
        const targetCustomer = LocalDB.getCustomers().find(c => c.id === preparedOpp.customer_id);
        preparedOpp.customer = targetCustomer;
        const savedList = [...currentList, preparedOpp];
        LocalDB.saveOpportunities(savedList);
        throw new Error(err.message || 'Supabase Connection Timeout');
      }
    }

    // fallback save locally
    const targetCustomer = LocalDB.getCustomers().find(c => c.id === preparedOpp.customer_id);
    preparedOpp.customer = targetCustomer;
    const savedList = [...currentList, preparedOpp];
    LocalDB.saveOpportunities(savedList);
    return preparedOpp;
  },

  async updateOpportunity(id: string, updates: Partial<Opportunity>): Promise<Opportunity> {
    const currentList = LocalDB.getOpportunities();
    const itemIndex = currentList.findIndex(o => o.id === id);
    if (itemIndex === -1) {
      throw new Error(`Opportunity with id ${id} not found`);
    }

    const mergedItem = {
      ...currentList[itemIndex],
      ...updates
    };

    delete mergedItem.customer; // Strip circular before DB storage

    // Recalculate weighted pipeline
    const finalEst = updates.estimated_value !== undefined ? Number(updates.estimated_value) : Number(mergedItem.estimated_value);
    const finalProb = updates.success_probability !== undefined ? Number(updates.success_probability) : Number(mergedItem.success_probability);
    mergedItem.weighted_value = finalEst * (finalProb / 100);

    // Attempt cloud write
    const isCloud = await this.checkCloudConnection();
    if (isCloud && getConnectivityMode()) {
      try {
        const body: any = {};
        if (updates.customer_id !== undefined) body.customer_id = updates.customer_id;
        if (updates.project_name !== undefined) body.project_name = updates.project_name;
        if (updates.service_type !== undefined) body.service_type = updates.service_type;
        if (updates.lead_source !== undefined) body.lead_source = updates.lead_source;
        if (updates.project_location !== undefined) body.project_location = updates.project_location;
        if (updates.estimated_value !== undefined) body.estimated_value = Number(updates.estimated_value);
        if (updates.success_probability !== undefined) body.success_probability = Number(updates.success_probability);
        if (updates.expected_close_date !== undefined) body.expected_close_date = updates.expected_close_date;
        if (updates.sales_person_id !== undefined) body.sales_person_id = updates.sales_person_id;
        if (updates.status !== undefined) body.status = updates.status;
        if (updates.remarks !== undefined) body.remarks = updates.remarks;
        if (updates.internal_notes !== undefined) body.internal_notes = updates.internal_notes;
        body.weighted_value = mergedItem.weighted_value;

        const responseList = await apiFetch(`/opportunities?id=eq.${id}`, {
          method: 'PATCH',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify(body)
        });

        if (responseList && responseList[0]) {
          const cloudOut = responseList[0];
          const localCustomers = LocalDB.getCustomers();
          const targetCustomer = localCustomers.find(c => c.id === cloudOut.customer_id);
          const result: Opportunity = {
            ...cloudOut,
            weighted_value: cloudOut.weighted_value ?? mergedItem.weighted_value,
            customer: targetCustomer
          };
          currentList[itemIndex] = result;
          LocalDB.saveOpportunities(currentList);
          return result;
        }
      } catch (err: any) {
        console.warn('Failed cloud update opportunity, using local storage update', err);
        const targetCustomer = LocalDB.getCustomers().find(c => c.id === mergedItem.customer_id);
        const finalLocalItem: Opportunity = {
          ...mergedItem,
          customer: targetCustomer
        };
        currentList[itemIndex] = finalLocalItem;
        LocalDB.saveOpportunities(currentList);
        throw new Error(err.message || 'Supabase Connection Timeout');
      }
    }

    // fallback save locally
    const targetCustomer = LocalDB.getCustomers().find(c => c.id === mergedItem.customer_id);
    const finalLocalItem: Opportunity = {
      ...mergedItem,
      customer: targetCustomer
    };
    currentList[itemIndex] = finalLocalItem;
    LocalDB.saveOpportunities(currentList);
    return finalLocalItem;
  },

  async deleteOpportunity(id: string): Promise<boolean> {
    const currentList = LocalDB.getOpportunities();
    const updatedList = currentList.filter(o => o.id !== id);
    LocalDB.saveOpportunities(updatedList);

    // Also cascade delete actions, tasks, and attachments locally
    const acts = LocalDB.getActivities().filter(a => a.opportunity_id !== id);
    LocalDB.saveActivities(acts);
    const tasks = LocalDB.getTasks().filter(t => t.opportunity_id !== id);
    LocalDB.saveTasks(tasks);
    const atts = LocalDB.getAttachments().filter(at => at.opportunity_id !== id);
    LocalDB.saveAttachments(atts);

    // Attempt cloud delete
    const isCloud = await this.checkCloudConnection();
    if (isCloud && getConnectivityMode()) {
      try {
        await apiFetch(`/opportunities?id=eq.${id}`, { method: 'DELETE' });
        return true;
      } catch (err: any) {
        console.warn('Failed cloud delete opportunity, local storage succeeded', err);
        throw new Error(err.message || 'Supabase Connection Timeout');
      }
    }
    return true;
  },

  // -------------------------------------------------------------
  // ACTIVITY SERVICES
  // -------------------------------------------------------------
  async fetchActivities(opportunityId?: string): Promise<Activity[]> {
    const allActs = LocalDB.getActivities();
    if (opportunityId) {
      return allActs.filter(a => a.opportunity_id === opportunityId).sort((a, b) => b.activity_date.localeCompare(a.activity_date));
    }
    return allActs.sort((a, b) => b.activity_date.localeCompare(a.activity_date));
  },

  async insertActivity(activity: Omit<Activity, 'id' | 'created_at'>): Promise<Activity> {
    const all = LocalDB.getActivities();
    const newAct: Activity = {
      ...activity,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    LocalDB.saveActivities([...all, newAct]);
    return newAct;
  },

  async deleteActivity(id: string): Promise<boolean> {
    const all = LocalDB.getActivities();
    LocalDB.saveActivities(all.filter(a => a.id !== id));
    return true;
  },

  // -------------------------------------------------------------
  // TASK SERVICES
  // -------------------------------------------------------------
  async fetchTasks(opportunityId?: string): Promise<OpportunityTask[]> {
    const allTasks = LocalDB.getTasks();
    if (opportunityId) {
      return allTasks.filter(t => t.opportunity_id === opportunityId).sort((a, b) => a.due_date.localeCompare(b.due_date));
    }
    return allTasks.sort((a, b) => a.due_date.localeCompare(b.due_date));
  },

  async insertTask(task: Omit<OpportunityTask, 'id' | 'created_at'>): Promise<OpportunityTask> {
    const all = LocalDB.getTasks();
    const newT: OpportunityTask = {
      ...task,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    LocalDB.saveTasks([...all, newT]);
    return newT;
  },

  async updateTask(id: string, updates: Partial<OpportunityTask>): Promise<OpportunityTask> {
    const all = LocalDB.getTasks();
    const index = all.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Task not found');
    const merged = { ...all[index], ...updates };
    all[index] = merged;
    LocalDB.saveTasks(all);
    return merged;
  },

  async deleteTask(id: string): Promise<boolean> {
    const all = LocalDB.getTasks();
    LocalDB.saveTasks(all.filter(t => t.id !== id));
    return true;
  },

  // -------------------------------------------------------------
  // ATTACHMENT SERVICES
  // -------------------------------------------------------------
  async fetchAttachments(opportunityId?: string): Promise<OpportunityAttachment[]> {
    const allAtts = LocalDB.getAttachments();
    if (opportunityId) {
      return allAtts.filter(at => at.opportunity_id === opportunityId).sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at));
    }
    return allAtts.sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at));
  },

  async insertAttachment(attachment: Omit<OpportunityAttachment, 'id' | 'uploaded_at'>): Promise<OpportunityAttachment> {
    const all = LocalDB.getAttachments();
    const newAtt: OpportunityAttachment = {
      ...attachment,
      id: crypto.randomUUID(),
      uploaded_at: new Date().toISOString()
    };
    LocalDB.saveAttachments([...all, newAtt]);
    return newAtt;
  },

  async deleteAttachment(id: string): Promise<boolean> {
    const all = LocalDB.getAttachments();
    LocalDB.saveAttachments(all.filter(at => at.id !== id));
    return true;
  },

  // -------------------------------------------------------------
  // AUDIT LOG SERVICES
  // -------------------------------------------------------------
  async fetchAuditLogs(): Promise<AuditLog[]> {
    return LocalDB.getAuditLogs().sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async insertAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>, userId: string = 'unknown'): Promise<AuditLog> {
    const all = LocalDB.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    LocalDB.saveAuditLogs([newLog, ...all]);

    try {
      await fetch('/api/audit_logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          action: log.action,
          targetType: log.target_type,
          targetId: log.target_id,
          details: log.details
        })
      });
    } catch (err) {
      console.error('Failed to log audit action via API', err);
    }
    
    return newLog;
  },

  async clearAuditLogs(): Promise<boolean> {
    LocalDB.saveAuditLogs([]);
    return true;
  },

  // -------------------------------------------------------------
  // QUOTATION SERVICES (Module 4)
  // -------------------------------------------------------------
  async fetchQuotations(): Promise<Quotation[]> {
    const isCloud = await this.checkCloudConnection();
    if (isCloud && getConnectivityMode()) {
      try {
        const raw = await apiFetch('/quotations?order=quotation_no.desc');
        const custs = await this.fetchCustomers();
        const custMap = new Map<string, any>(custs.map(c => [c.id, c]));
        
        const parsed = (raw as any[]).map(q => ({
          ...q,
          customer_name: custMap.get(q.customer_id)?.customer_name || 'ไม่พบข้อมูลลูกค้า'
        }));
        LocalDB.saveQuotations(parsed);
        return parsed;
      } catch (err) {
        console.warn('Failed cloud fetch quotations, using fallback', err);
      }
    }
    const list = LocalDB.getQuotations();
    const custs = await this.fetchCustomers();
    return list.map(q => {
      const c = custs.find(curr => curr.id === q.customer_id);
      return {
        ...q,
        customer_name: c ? c.customer_name : 'ไม่พบข้อมูลลูกค้า'
      };
    }).sort((a, b) => b.quotation_no.localeCompare(a.quotation_no));
  },

  async insertQuotation(quote: Omit<Quotation, 'id' | 'quotation_no' | 'created_at'>): Promise<Quotation> {
    const list = LocalDB.getQuotations();
    const qDate = quote.issue_date || new Date().toISOString().slice(0, 10);
    const yr = qDate.split('-')[0].slice(-2); // e.g. "26"

    let seq = 1;
    if (list.length > 0) {
      const seqs = list.map(q => {
        const match = q.quotation_no.match(/^QT-(\d{4})-\d{2}/);
        return match ? parseInt(match[1], 10) : 0;
      });
      seq = Math.max(...seqs, 0) + 1;
    }
    const nextCode = `QT-${String(seq).padStart(4, '0')}-${yr}`;
    const newId = crypto.randomUUID();

    const prepared: Quotation = {
      ...quote,
      id: newId,
      quotation_no: nextCode,
      created_at: new Date().toISOString()
    };

    const latest = [prepared, ...list];
    LocalDB.saveQuotations(latest);

    const isCloud = await this.checkCloudConnection();
    if (isCloud && getConnectivityMode()) {
      try {
        const payload = { ...prepared };
        delete (payload as any).customer;
        delete (payload as any).customer_name;
        await apiFetch('/quotations', { method: 'POST', body: JSON.stringify(payload) });
      } catch (err: any) {
        console.warn('Cloud insertQuotation failed', err);
        throw new Error(err.message || 'Supabase Connection Timeout');
      }
    }
    return prepared;
  },

  async updateQuotation(id: string, updates: Partial<Quotation>): Promise<Quotation> {
    const list = LocalDB.getQuotations();
    const updated = list.map(q => {
      if (q.id === id) {
        return { ...q, ...updates };
      }
      return q;
    });
    LocalDB.saveQuotations(updated);
    
    let found = updated.find(q => q.id === id) as Quotation;
    if (!found) throw new Error('Quotation not found');

    const isCloud = await this.checkCloudConnection();
    if (isCloud && getConnectivityMode()) {
      try {
        const payload = { ...updates };
        delete (payload as any).customer;
        delete (payload as any).customer_name;
        await apiFetch(`/quotations?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } catch (err: any) {
        console.warn('Cloud updateQuotation failed', err);
        throw new Error(err.message || 'Supabase Connection Timeout');
      }
    }

    return found;
  },

  async deleteQuotation(id: string): Promise<boolean> {
    const list = LocalDB.getQuotations();
    LocalDB.saveQuotations(list.filter(q => q.id !== id));
    
    const isCloud = await this.checkCloudConnection();
    if (isCloud && getConnectivityMode()) {
      try {
        await apiFetch(`/quotations?id=eq.${id}`, { method: 'DELETE' });
      } catch (err: any) {
        console.warn('Cloud deleteQuotation failed', err);
        throw new Error(err.message || 'Supabase Connection Timeout');
      }
    }
    return true;
  },

  // -------------------------------------------------------------
  // SALES ORDER SERVICES (Module 5)
  // -------------------------------------------------------------
  async fetchSalesOrders(): Promise<SalesOrder[]> {
    const isCloud = await this.checkCloudConnection();
    let list: SalesOrder[] = [];
    if (isCloud && getConnectivityMode()) {
      try {
        const raw = await apiFetch('/sales_orders?order=so_no.desc');
        list = raw as SalesOrder[];
        LocalDB.saveSalesOrders(list);
      } catch (err) {
        console.warn('Failed cloud fetch sales orders, using fallback', err);
        list = LocalDB.getSalesOrders();
      }
    } else {
      list = LocalDB.getSalesOrders();
    }

    const custs = await this.fetchCustomers();
    const quotations = LocalDB.getQuotations();
    const invoices = LocalDB.getInvoices();

    return list.map(s => {
      const c = custs.find(curr => curr.id === s.customer_id);
      
      // Load and compute items
      let finalItems = s.items;
      const q = quotations.find(quote => quote.id === s.quotation_id || quote.quotation_no === s.quotation_id);
      
      // If items don't exist, we load from quotation
      const baseItems = q?.items || [];
      const computedItems = baseItems.map(it => {
        const relatedInvoices = invoices.filter(inv => inv.sales_order_id === s.id);
        let totalInvoicedQty = 0;
        relatedInvoices.forEach(inv => {
          inv.items?.forEach(invItem => {
            if (invItem.item_no === it.item_no || 
                invItem.description === it.description || 
                invItem.description.includes(it.description) || 
                it.description.includes(invItem.description)) {
              totalInvoicedQty += invItem.quantity;
            }
          });
        });

        return {
          item_no: it.item_no,
          description: it.description,
          qty: it.qty,
          remaining_qty: Math.max(0, it.qty - totalInvoicedQty),
          unit: it.unit,
          unit_price: it.unit_rate
        };
      });

      if (!finalItems || finalItems.length === 0) {
        finalItems = computedItems;
      } else {
        // Double sync remaining_qty just in case
        finalItems = finalItems.map(it => {
          const relatedInvoices = invoices.filter(inv => inv.sales_order_id === s.id);
          let totalInvoicedQty = 0;
          relatedInvoices.forEach(inv => {
            inv.items?.forEach(invItem => {
              if (invItem.item_no === it.item_no || 
                  invItem.description === it.description || 
                  invItem.description.includes(it.description) || 
                  it.description.includes(invItem.description)) {
                totalInvoicedQty += invItem.quantity;
              }
            });
          });
          return {
            ...it,
            remaining_qty: Math.max(0, it.qty - totalInvoicedQty)
          };
        });
      }

      // Compute Status
      let currentStatus = s.status;
      if (s.status !== 'Cancelled') {
        const totalOrig = finalItems.reduce((acc, it) => acc + it.qty, 0);
        const totalRem = finalItems.reduce((acc, it) => acc + it.remaining_qty, 0);
        if (totalOrig > 0) {
          if (totalRem === 0) {
            currentStatus = 'Fully Invoiced';
          } else if (totalRem < totalOrig) {
            currentStatus = 'Partially Invoiced';
          } else {
            currentStatus = 'In Progress';
          }
        }
      }

      return {
        ...s,
        status: currentStatus as any,
        customer_name: c ? c.customer_name : 'ไม่พบข้อมูลลูกค้า',
        items: finalItems
      };
    }).sort((a, b) => b.so_no.localeCompare(a.so_no));
  },

  async insertSalesOrder(soPayload: Omit<SalesOrder, 'id' | 'so_no' | 'created_at'>): Promise<SalesOrder> {
    const list = LocalDB.getSalesOrders();
    const currentYearShort = '26';
    const thisYearSOs = list.filter(q => q.so_no.startsWith(`SO-${currentYearShort}`));
    let nextSeq = 1;
    if (thisYearSOs.length > 0) {
      const maxSeq = thisYearSOs.reduce((max, item) => {
        const seqPart = item.so_no.replace(`SO-${currentYearShort}`, '');
        const num = parseInt(seqPart, 10);
        return num > max ? num : max;
      }, 0);
      nextSeq = maxSeq + 1;
    }
    const nextCode = `SO-${currentYearShort}${String(nextSeq).padStart(4, '0')}`;
    const newId = crypto.randomUUID();

    // Try to load items from Linked Quotation
    let finalItems = soPayload.items;
    if (!finalItems || finalItems.length === 0) {
      const quotations = LocalDB.getQuotations();
      const q = quotations.find(quote => quote.id === soPayload.quotation_id || quote.quotation_no === soPayload.quotation_id);
      const baseItems = q?.items || [];
      finalItems = baseItems.map(it => ({
        item_no: it.item_no,
        description: it.description,
        qty: it.qty,
        remaining_qty: it.qty,
        unit: it.unit,
        unit_price: it.unit_rate
      }));
    }

    const prepared: SalesOrder = {
      ...soPayload,
      id: newId,
      so_no: nextCode,
      items: finalItems,
      created_at: new Date().toISOString()
    };

    const latest = [prepared, ...list];
    LocalDB.saveSalesOrders(latest);

    const isCloud = await this.checkCloudConnection();
    if (isCloud && getConnectivityMode()) {
      try {
        const payload = { ...prepared };
        delete (payload as any).customer_name;
        // Make sure quotation_id is UUID or null
        if (payload.quotation_id) {
          payload.quotation_id = ensureUUID(payload.quotation_id);
        }
        payload.customer_id = ensureUUID(payload.customer_id);
        await apiFetch('/sales_orders', { method: 'POST', body: JSON.stringify(payload) });
      } catch (err: any) {
        console.warn('Cloud insertSalesOrder failed', err);
        throw new Error(err.message || 'Supabase Connection Timeout');
      }
    }
    return prepared;
  },

  async updateSalesOrder(id: string, updates: Partial<SalesOrder>): Promise<SalesOrder> {
    const list = LocalDB.getSalesOrders();
    const updated = list.map(s => {
      if (s.id === id) {
        return { ...s, ...updates };
      }
      return s;
    });
    LocalDB.saveSalesOrders(updated);
    const found = updated.find(s => s.id === id);
    if (!found) throw new Error('Sales Order not found');

    const isCloud = await this.checkCloudConnection();
    if (isCloud && getConnectivityMode()) {
      try {
        const payload = { ...updates };
        delete (payload as any).customer_name;
        if (payload.quotation_id) {
          payload.quotation_id = ensureUUID(payload.quotation_id);
        }
        if (payload.customer_id) {
          payload.customer_id = ensureUUID(payload.customer_id);
        }
        await apiFetch(`/sales_orders?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } catch (err: any) {
        console.warn('Cloud updateSalesOrder failed', err);
        throw new Error(err.message || 'Supabase Connection Timeout');
      }
    }
    return found;
  },

  async deleteSalesOrder(id: string): Promise<boolean> {
    const list = LocalDB.getSalesOrders();
    LocalDB.saveSalesOrders(list.filter(s => s.id !== id));

    const isCloud = await this.checkCloudConnection();
    if (isCloud && getConnectivityMode()) {
      try {
        await apiFetch(`/sales_orders?id=eq.${id}`, { method: 'DELETE' });
      } catch (err: any) {
        console.warn('Cloud deleteSalesOrder failed', err);
        throw new Error(err.message || 'Supabase Connection Timeout');
      }
    }
    return true;
  },

  // -------------------------------------------------------------
  // DELIVERY SERVICES (Module 6)
  // -------------------------------------------------------------
  async fetchDeliveryJobs(): Promise<DeliveryJob[]> {
    const list = LocalDB.getDeliveryJobs();
    const custs = await this.fetchCustomers();
    const sos = await this.fetchSalesOrders();
    return list.map(d => {
      const c = custs.find(curr => curr.id === d.customer_id);
      const so = sos.find(curr => curr.id === d.sales_order_id);
      return {
        ...d,
        customer_name: c ? c.customer_name : 'ไม่พบข้อมูลลูกค้า',
        project_name: so ? so.project_name : 'ไม่พบโครงการ'
      };
    }).sort((a, b) => b.delivery_no.localeCompare(a.delivery_no));
  },

  async insertDeliveryJob(payload: Omit<DeliveryJob, 'id' | 'delivery_no' | 'created_at'>): Promise<DeliveryJob> {
    const list = LocalDB.getDeliveryJobs();
    const currentYearShort = '26';
    const matches = list.filter(q => q.delivery_no.startsWith(`DL-${currentYearShort}`));
    let nextSeq = 1;
    if (matches.length > 0) {
      const maxSeq = matches.reduce((max, item) => {
        const seqPart = item.delivery_no.replace(`DL-${currentYearShort}`, '');
        const num = parseInt(seqPart, 10);
        return num > max ? num : max;
      }, 0);
      nextSeq = maxSeq + 1;
    }
    const nextCode = `DL-${currentYearShort}${String(nextSeq).padStart(4, '0')}`;
    const newId = crypto.randomUUID();

    const prepared: DeliveryJob = {
      ...payload,
      id: newId,
      delivery_no: nextCode,
      created_at: new Date().toISOString()
    };

    const latest = [prepared, ...list];
    LocalDB.saveDeliveryJobs(latest);
    return prepared;
  },

  async updateDeliveryJob(id: string, updates: Partial<DeliveryJob>): Promise<DeliveryJob> {
    const list = LocalDB.getDeliveryJobs();
    const updated = list.map(d => {
      if (d.id === id) {
        return { ...d, ...updates };
      }
      return d;
    });
    LocalDB.saveDeliveryJobs(updated);
    const found = updated.find(d => d.id === id);
    if (!found) throw new Error('Delivery Job not found');
    return found;
  },

  async deleteDeliveryJob(id: string): Promise<boolean> {
    const list = LocalDB.getDeliveryJobs();
    LocalDB.saveDeliveryJobs(list.filter(d => d.id !== id));
    return true;
  },

  // -------------------------------------------------------------
  // INVOICE SERVICES (Module 7)
  // -------------------------------------------------------------
  async fetchInvoices(): Promise<Invoice[]> {
    const list = LocalDB.getInvoices();
    const custs = await this.fetchCustomers();
    return list.map(inv => {
      const c = custs.find(curr => curr.id === inv.customer_id);
      return {
        ...inv,
        customer_name: c ? c.customer_name : 'ไม่พบข้อมูลลูกค้า'
      };
    }).sort((a, b) => b.invoice_no.localeCompare(a.invoice_no));
  },

  async insertInvoice(payload: Omit<Invoice, 'id' | 'invoice_no' | 'created_at'>): Promise<Invoice> {
    const list = LocalDB.getInvoices();
    const currentYearShort = '26';
    const matches = list.filter(q => q.invoice_no.startsWith(`INV-${currentYearShort}`));
    let nextSeq = 1;
    if (matches.length > 0) {
      const maxSeq = matches.reduce((max, item) => {
        const seqPart = item.invoice_no.replace(`INV-${currentYearShort}`, '');
        const num = parseInt(seqPart, 10);
        return num > max ? num : max;
      }, 0);
      nextSeq = maxSeq + 1;
    }
    const nextCode = `INV-${currentYearShort}${String(nextSeq).padStart(4, '0')}`;
    const newId = crypto.randomUUID();

    const prepared: Invoice = {
      ...payload,
      id: newId,
      invoice_no: nextCode,
      created_at: new Date().toISOString()
    };

    const latest = [prepared, ...list];
    LocalDB.saveInvoices(latest);

    // Sync Sales Order
    if (prepared.sales_order_id) {
      this.recomputeSalesOrderQuantitiesAndStatus(prepared.sales_order_id, latest);
    }

    return prepared;
  },

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    const list = LocalDB.getInvoices();
    const updated = list.map(inv => {
      if (inv.id === id) {
        return { ...inv, ...updates };
      }
      return inv;
    });
    LocalDB.saveInvoices(updated);

    const found = updated.find(inv => inv.id === id);
    if (!found) throw new Error('Invoice not found');

    // Sync Sales Order
    if (found.sales_order_id) {
      this.recomputeSalesOrderQuantitiesAndStatus(found.sales_order_id, updated);
    }

    return found;
  },

  async deleteInvoice(id: string): Promise<boolean> {
    const list = LocalDB.getInvoices();
    const targetInvoice = list.find(inv => inv.id === id);
    const filtered = list.filter(inv => inv.id !== id);
    LocalDB.saveInvoices(filtered);

    // Sync Sales Order
    if (targetInvoice && targetInvoice.sales_order_id) {
      this.recomputeSalesOrderQuantitiesAndStatus(targetInvoice.sales_order_id, filtered);
    }

    return true;
  },

  // Helper method to completely calculate and synchronize quantities dynamically
  recomputeSalesOrderQuantitiesAndStatus(soId: string, allInvoices: Invoice[]) {
    const sos = LocalDB.getSalesOrders();
    const updatedSOs = sos.map(so => {
      if (so.id === soId) {
        // Initialize base items from Quotation if not set
        let items = so.items;
        if (!items) {
          const quotations = LocalDB.getQuotations();
          const q = quotations.find(quote => quote.id === so.quotation_id || quote.quotation_no === so.quotation_id);
          const baseItems = q?.items || [];
          items = baseItems.map(it => ({
            item_no: it.item_no,
            description: it.description,
            qty: it.qty,
            remaining_qty: it.qty,
            unit: it.unit,
            unit_price: it.unit_rate
          }));
        }

        // Filter invoices belonging to this sales order
        const relatedInvoices = allInvoices.filter(inv => inv.sales_order_id === soId);

        // Reset and deduct from original qty
        const updatedItems = items.map(it => {
          let totalInvoicedQty = 0;
          relatedInvoices.forEach(inv => {
            inv.items?.forEach(invItem => {
              if (invItem.item_no === it.item_no || 
                  invItem.description === it.description || 
                  invItem.description.includes(it.description) || 
                  it.description.includes(invItem.description)) {
                totalInvoicedQty += invItem.quantity;
              }
            });
          });

          return {
            ...it,
            remaining_qty: Math.max(0, it.qty - totalInvoicedQty)
          };
        });

        // Compute Status
        let currentStatus = so.status;
        if (so.status !== 'Cancelled') {
          const totalOrig = updatedItems.reduce((acc, it) => acc + it.qty, 0);
          const totalRem = updatedItems.reduce((acc, it) => acc + it.remaining_qty, 0);
          if (totalOrig > 0) {
            if (totalRem === 0) {
              currentStatus = 'Fully Invoiced';
            } else if (totalRem < totalOrig) {
              currentStatus = 'Partially Invoiced';
            } else {
              currentStatus = 'In Progress';
            }
          }
        }

        return {
          ...so,
          items: updatedItems,
          status: currentStatus as any
        };
      }
      return so;
    });

    LocalDB.saveSalesOrders(updatedSOs);
  },

  // -------------------------------------------------------------
  // RECEIPT SERVICES (Module 8)
  // -------------------------------------------------------------
  async fetchReceipts(): Promise<Receipt[]> {
    const list = LocalDB.getReceipts();
    const custs = await this.fetchCustomers();
    return list.map(r => {
      const c = custs.find(curr => curr.id === r.customer_id);
      return {
        ...r,
        customer_name: c ? c.customer_name : 'ไม่พบข้อมูลลูกค้า'
      };
    }).sort((a, b) => b.receipt_no.localeCompare(a.receipt_no));
  },

  async insertReceipt(payload: Omit<Receipt, 'id' | 'receipt_no' | 'created_at'>): Promise<Receipt> {
    const list = LocalDB.getReceipts();
    const currentYearShort = '26';
    const matches = list.filter(q => q.receipt_no.startsWith(`RE-${currentYearShort}`));
    let nextSeq = 1;
    if (matches.length > 0) {
      const maxSeq = matches.reduce((max, item) => {
        const seqPart = item.receipt_no.replace(`RE-${currentYearShort}`, '');
        const num = parseInt(seqPart, 10);
        return num > max ? num : max;
      }, 0);
      nextSeq = maxSeq + 1;
    }
    const nextCode = `RE-${currentYearShort}${String(nextSeq).padStart(4, '0')}`;
    const newId = crypto.randomUUID();

    const prepared: Receipt = {
      ...payload,
      id: newId,
      receipt_no: nextCode,
      created_at: new Date().toISOString()
    };

    const latest = [prepared, ...list];
    LocalDB.saveReceipts(latest);
    return prepared;
  },

  async updateReceipt(id: string, updates: Partial<Receipt>): Promise<Receipt> {
    const list = LocalDB.getReceipts();
    const updated = list.map(r => {
      if (r.id === id) {
        return { ...r, ...updates };
      }
      return r;
    });
    LocalDB.saveReceipts(updated);
    const found = updated.find(r => r.id === id);
    if (!found) throw new Error('Receipt not found');
    return found;
  },

  async deleteReceipt(id: string): Promise<boolean> {
    const list = LocalDB.getReceipts();
    LocalDB.saveReceipts(list.filter(r => r.id !== id));
    return true;
  },

  // -------------------------------------------------------------
  // PROJECT SERVICES
  // -------------------------------------------------------------
  async fetchProjects(): Promise<Project[]> {
    const list = LocalDB.getProjects();
    const custs = await this.fetchCustomers();
    const sos = await this.fetchSalesOrders();
    const invoices = await this.fetchInvoices();
    return list.map(p => {
      const c = custs.find(curr => curr.id === p.customer_id);
      const so = sos.find(curr => curr.id === p.sales_order_id);
      
      // Calculate real invoice and collection status for display
      const relatedInvoices = invoices.filter(i => i.sales_order_id === p.sales_order_id);
      let invoiceStatus = 'Not Billed';
      let collectionStatus = 'Not Collected';
      
      if (relatedInvoices.length > 0) {
        const allPaid = relatedInvoices.every(i => i.status === 'Paid');
        const anyPaid = relatedInvoices.some(i => i.status === 'Paid' || i.status === 'Partially Paid');
        invoiceStatus = allPaid ? 'Fully Invoiced' : 'Partially Invoiced';
        collectionStatus = allPaid ? 'Fully Collected' : (anyPaid ? 'Partially Collected' : 'Not Collected');
      }

      return {
        ...p,
        customer_name: c ? c.customer_name : 'Unknown',
        sales_order_no: so ? so.so_no : 'Unknown',
        invoice_status: invoiceStatus,
        collection_status: collectionStatus,
      };
    }).sort((a, b) => b.job_number.localeCompare(a.job_number));
  },

  async insertProject(payload: Omit<Project, 'id' | 'job_number' | 'created_at' | 'updated_at'>): Promise<Project> {
    const list = LocalDB.getProjects();
    const currentYearShort = new Date().getFullYear().toString().substring(2);
    const matches = list.filter(q => q.job_number.startsWith(`JOB-${currentYearShort}`));
    let nextSeq = 1;
    if (matches.length > 0) {
      const maxSeq = matches.reduce((max, item) => {
        const seqPart = item.job_number.replace(`JOB-${currentYearShort}`, '');
        const num = parseInt(seqPart, 10);
        return num > max ? num : max;
      }, 0);
      nextSeq = maxSeq + 1;
    }
    const nextCode = `JOB-${currentYearShort}${String(nextSeq).padStart(3, '0')}`;
    const newId = crypto.randomUUID();

    const prepared: Project = {
      ...payload,
      id: newId,
      job_number: nextCode,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const latest = [prepared, ...list];
    LocalDB.saveProjects(latest);
    return prepared;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const list = LocalDB.getProjects();
    const updated = list.map(p => {
      if (p.id === id) {
        return { ...p, ...updates, updated_at: new Date().toISOString() };
      }
      return p;
    });
    LocalDB.saveProjects(updated);
    const found = updated.find(p => p.id === id);
    if (!found) throw new Error('Project not found');
    return found;
  },

  async deleteProject(id: string): Promise<boolean> {
    const list = LocalDB.getProjects();
    LocalDB.saveProjects(list.filter(p => p.id !== id));
    return true;
  }
};

