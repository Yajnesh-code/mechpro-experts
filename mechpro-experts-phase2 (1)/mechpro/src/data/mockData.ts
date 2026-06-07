import { Lead, SalesPartner, ServicePartner, User, LeadStatus } from '../types';

export const ALL_STATUSES: LeadStatus[] = [
  'Lead Created', 'Assigned', 'Car Received', 'Inspection Started',
  'Inspection Completed', 'Quote Shared', 'Quote Approved',
  'Work Started', 'Work Completed', 'Bill Generated', 'Payment Done', 'Vehicle Delivered'
];

export const mockSalesPartners: SalesPartner[] = [
  { id: 'sp1', code: 'BR', sequenceNo: '01', name: 'Rahul Sharma', company: 'AutoBridge Brokers', email: 'rahul@autobridge.in', mobile: '9876543210', type: 'BR', typeName: 'Broker', region: 'Mumbai', status: 'Active', joinedAt: '2024-01-15', totalLeads: 234 },
  { id: 'sp2', code: 'CR', sequenceNo: '02', name: 'Priya Mehta', company: 'TechCorp Solutions', email: 'priya@techcorp.in', mobile: '9876543211', type: 'CR', typeName: 'Corporate', region: 'Bangalore', status: 'Active', joinedAt: '2024-02-10', totalLeads: 189 },
  { id: 'sp3', code: 'FT', sequenceNo: '03', name: 'Amit Kumar', company: 'FleetPro India', email: 'amit@fleetpro.in', mobile: '9876543212', type: 'FT', typeName: 'Fleet', region: 'Delhi', status: 'Active', joinedAt: '2024-01-20', totalLeads: 312 },
  { id: 'sp4', code: 'AG', sequenceNo: '04', name: 'Sneha Patel', company: 'AgencyFirst', email: 'sneha@agencyfirst.in', mobile: '9876543213', type: 'AG', typeName: 'Agency', region: 'Pune', status: 'Active', joinedAt: '2024-03-05', totalLeads: 98 },
  { id: 'sp5', code: 'IN', sequenceNo: '05', name: 'Vikram Rao', company: 'InsureMax', email: 'vikram@insuremax.in', mobile: '9876543214', type: 'IN', typeName: 'Insurance', region: 'Hyderabad', status: 'Active', joinedAt: '2024-02-28', totalLeads: 445 },
];

export const mockServicePartners: ServicePartner[] = [
  { id: 'sv1', name: 'AutoSpark Workshop', type: 'Workshop', email: 'info@autospark.in', mobile: '9988776655', location: 'Andheri, Mumbai', rating: 4.8, status: 'Active', specializations: ['Accident Repair', 'Inspection', 'General Service'], joinedAt: '2023-06-15', totalJobsCompleted: 1243 },
  { id: 'sv2', name: 'QuickFix Garage', type: 'Workshop', email: 'info@quickfix.in', mobile: '9988776656', location: 'Whitefield, Bangalore', rating: 4.6, status: 'Active', specializations: ['Accident Repair', 'Body Work', 'Painting'], joinedAt: '2023-08-20', totalJobsCompleted: 876 },
  { id: 'sv3', name: 'SpeedTow Services', type: 'Towing', email: 'ops@speedtow.in', mobile: '9988776657', location: 'Central Mumbai', rating: 4.9, status: 'Active', specializations: ['Towing', 'Breakdown Assistance'], joinedAt: '2023-05-10', totalJobsCompleted: 2341 },
  { id: 'sv4', name: 'PartsMart India', type: 'PartVendor', email: 'sales@partsmart.in', mobile: '9988776658', location: 'Pune', rating: 4.5, status: 'Active', specializations: ['OEM Parts', 'Aftermarket Parts'], joinedAt: '2023-09-01', totalJobsCompleted: 567 },
  { id: 'sv5', name: 'Alpha Go Response Team', type: 'AlphaGo', email: 'dispatch@alphago.in', mobile: '9988776659', location: 'Pan India', rating: 4.7, status: 'Active', specializations: ['Emergency Response', 'Alpha Go', 'Survey'], joinedAt: '2023-04-15', totalJobsCompleted: 3210 },
  { id: 'sv6', name: 'BatteryKing', type: 'Battery', email: 'service@batteryking.in', mobile: '9988776660', location: 'Delhi NCR', rating: 4.4, status: 'Active', specializations: ['Battery Replacement', 'EV Battery'], joinedAt: '2023-11-01', totalJobsCompleted: 892 },
  { id: 'sv7', name: 'TyreWorld Express', type: 'Tyre', email: 'info@tyreworld.in', mobile: '9988776661', location: 'Hyderabad', rating: 4.6, status: 'Active', specializations: ['Tyre Replacement', 'Wheel Alignment', 'Balancing'], joinedAt: '2023-07-15', totalJobsCompleted: 1567 },
];

const buildTimeline = (currentStatus: LeadStatus) => {
  const idx = ALL_STATUSES.indexOf(currentStatus);
  return ALL_STATUSES.map((s, i) => ({
    status: s,
    timestamp: i < idx ? `2025-05-${String(i + 1).padStart(2, '0')}T10:00:00Z` : i === idx ? new Date().toISOString() : null,
    performedBy: i <= idx ? (i % 2 === 0 ? 'Admin Rajesh' : 'Service Partner') : null,
    isCompleted: i < idx,
    isCurrent: i === idx,
  }));
};

export const mockLeads: Lead[] = [
  {
    id: 'l1', leadId: 'ME0001BR01',
    customer: { id: 'c1', name: 'Arjun Kapoor', mobile: '9123456789', email: 'arjun.kapoor@gmail.com', address: '14, Palm Grove, Bandra West, Mumbai - 400050' },
    vehicle: { number: 'MH02AB1234', brand: 'Maruti Suzuki', model: 'Swift', fuelType: 'Petrol', insuranceCompany: 'HDFC ERGO', year: 2022, color: 'Red' },
    serviceType: 'Accident Repair', services: ['Accident Repair', 'Inspection'],
    priority: 'High', status: 'Work Started',
    location: 'Bandra West, Mumbai', notes: 'Front bumper and hood damaged. Customer needs urgent repair.',
    salesPartner: mockSalesPartners[0],
    assignedServicePartner: mockServicePartners[0],
    documents: [
      { id: 'd1', name: 'RC_Copy.pdf', type: 'RC Copy', url: '#', uploadedAt: '2025-05-01T09:30:00Z', uploadedBy: 'Arjun Kapoor', size: '245 KB' },
      { id: 'd2', name: 'Vehicle_Front.jpg', type: 'Vehicle Image', url: '#', uploadedAt: '2025-05-01T09:31:00Z', uploadedBy: 'Arjun Kapoor', size: '1.2 MB' },
      { id: 'd3', name: 'Insurance_Policy.pdf', type: 'Insurance', url: '#', uploadedAt: '2025-05-01T09:32:00Z', uploadedBy: 'Arjun Kapoor', size: '890 KB' },
    ],
    activityLog: [
      { id: 'a1', action: 'Lead created by Sales Partner', performedBy: 'Rahul Sharma', role: 'Sales Partner', timestamp: '2025-05-01T09:00:00Z' },
      { id: 'a2', action: 'Lead reviewed and approved', performedBy: 'Admin Rajesh', role: 'Admin', timestamp: '2025-05-01T11:00:00Z' },
      { id: 'a3', action: 'Assigned to AutoSpark Workshop', performedBy: 'Admin Rajesh', role: 'Admin', timestamp: '2025-05-01T12:00:00Z', notes: 'Nearest available workshop with accident repair specialization' },
      { id: 'a4', action: 'Car received at workshop', performedBy: 'AutoSpark Workshop', role: 'Service Partner', timestamp: '2025-05-02T10:00:00Z' },
      { id: 'a5', action: 'Inspection started', performedBy: 'AutoSpark Workshop', role: 'Service Partner', timestamp: '2025-05-02T11:00:00Z' },
      { id: 'a6', action: 'Inspection completed', performedBy: 'AutoSpark Workshop', role: 'Service Partner', timestamp: '2025-05-02T15:00:00Z' },
      { id: 'a7', action: 'Quote shared with customer', performedBy: 'AutoSpark Workshop', role: 'Service Partner', timestamp: '2025-05-03T10:00:00Z' },
      { id: 'a8', action: 'Quote approved by customer', performedBy: 'Arjun Kapoor', role: 'Customer', timestamp: '2025-05-03T14:00:00Z' },
      { id: 'a9', action: 'Work started', performedBy: 'AutoSpark Workshop', role: 'Service Partner', timestamp: '2025-05-04T09:00:00Z' },
    ],
    timeline: buildTimeline('Work Started'),
    quote: { id: 'q1', amount: 38500, items: [{ description: 'Front Bumper Replacement', amount: 15000 }, { description: 'Hood Repair & Painting', amount: 18000 }, { description: 'Labor Charges', amount: 5500 }], createdAt: '2025-05-03T10:00:00Z', approvedAt: '2025-05-03T14:00:00Z', status: 'Approved' },
    createdAt: '2025-05-01T09:00:00Z', updatedAt: '2025-05-04T09:00:00Z', estimatedCompletion: '2025-05-10',
  },
  {
    id: 'l2', leadId: 'ME0002CR02',
    customer: { id: 'c2', name: 'Nisha Verma', mobile: '9234567890', email: 'nisha.verma@techcorp.in', address: '22, Koramangala 5th Block, Bangalore - 560095' },
    vehicle: { number: 'KA01CD5678', brand: 'Honda', model: 'City', fuelType: 'Petrol', insuranceCompany: 'Bajaj Allianz', year: 2023, color: 'White' },
    serviceType: 'Inspection', services: ['Inspection', 'Survey'],
    priority: 'Medium', status: 'Inspection Started',
    location: 'Koramangala, Bangalore', notes: 'Annual inspection required for corporate fleet.',
    salesPartner: mockSalesPartners[1],
    assignedServicePartner: mockServicePartners[1],
    documents: [
      { id: 'd4', name: 'RC_Copy.pdf', type: 'RC Copy', url: '#', uploadedAt: '2025-05-10T10:00:00Z', uploadedBy: 'Nisha Verma', size: '320 KB' },
    ],
    activityLog: [
      { id: 'a10', action: 'Lead created by Sales Partner', performedBy: 'Priya Mehta', role: 'Sales Partner', timestamp: '2025-05-10T09:00:00Z' },
      { id: 'a11', action: 'Lead approved and assigned', performedBy: 'Admin Rajesh', role: 'Admin', timestamp: '2025-05-10T10:30:00Z' },
      { id: 'a12', action: 'Car received at workshop', performedBy: 'QuickFix Garage', role: 'Service Partner', timestamp: '2025-05-11T09:00:00Z' },
      { id: 'a13', action: 'Inspection started', performedBy: 'QuickFix Garage', role: 'Service Partner', timestamp: '2025-05-11T10:00:00Z' },
    ],
    timeline: buildTimeline('Inspection Started'),
    createdAt: '2025-05-10T09:00:00Z', updatedAt: '2025-05-11T10:00:00Z',
  },
  {
    id: 'l3', leadId: 'ME0003FT03',
    customer: { id: 'c3', name: 'Deepak Singh', mobile: '9345678901', email: 'deepak.singh@fleetpro.in', address: '8, Sector 18, Noida - 201301' },
    vehicle: { number: 'UP16EF9012', brand: 'Hyundai', model: 'Creta', fuelType: 'Diesel', insuranceCompany: 'ICICI Lombard', year: 2021, color: 'Blue' },
    serviceType: 'Towing', services: ['Towing', 'Breakdown Assistance'],
    priority: 'Urgent', status: 'Assigned',
    location: 'Sector 18, Noida', notes: 'Vehicle broke down on highway. Immediate towing required.',
    salesPartner: mockSalesPartners[2],
    assignedServicePartner: mockServicePartners[2],
    documents: [],
    activityLog: [
      { id: 'a14', action: 'Emergency lead created', performedBy: 'Amit Kumar', role: 'Sales Partner', timestamp: '2025-05-15T14:00:00Z' },
      { id: 'a15', action: 'Emergency assigned to SpeedTow', performedBy: 'Admin Rajesh', role: 'Admin', timestamp: '2025-05-15T14:15:00Z', notes: 'Urgent - highway breakdown' },
    ],
    timeline: buildTimeline('Assigned'),
    createdAt: '2025-05-15T14:00:00Z', updatedAt: '2025-05-15T14:15:00Z',
  },
  {
    id: 'l4', leadId: 'ME0004IN05',
    customer: { id: 'c4', name: 'Sunita Reddy', mobile: '9456789012', email: 'sunita.reddy@gmail.com', address: '45, Jubilee Hills, Hyderabad - 500033' },
    vehicle: { number: 'TS09GH3456', brand: 'Toyota', model: 'Fortuner', fuelType: 'Diesel', insuranceCompany: 'New India Assurance', year: 2020, color: 'Silver' },
    serviceType: 'Survey', services: ['Survey', 'Inspection'],
    priority: 'High', status: 'Quote Shared',
    location: 'Jubilee Hills, Hyderabad', notes: 'Insurance survey required post accident.',
    salesPartner: mockSalesPartners[4],
    assignedServicePartner: mockServicePartners[4],
    documents: [
      { id: 'd5', name: 'Damage_Photos.zip', type: 'Vehicle Image', url: '#', uploadedAt: '2025-05-08T09:00:00Z', uploadedBy: 'Sunita Reddy', size: '8.5 MB' },
      { id: 'd6', name: 'Quote_AlphaGo.pdf', type: 'Quote', url: '#', uploadedAt: '2025-05-12T15:00:00Z', uploadedBy: 'Alpha Go Team', size: '156 KB' },
    ],
    activityLog: [
      { id: 'a16', action: 'Lead created', performedBy: 'Vikram Rao', role: 'Sales Partner', timestamp: '2025-05-08T08:00:00Z' },
      { id: 'a17', action: 'Lead approved', performedBy: 'Admin Priya', role: 'Admin', timestamp: '2025-05-08T10:00:00Z' },
      { id: 'a18', action: 'Assigned to Alpha Go Response Team', performedBy: 'Admin Priya', role: 'Admin', timestamp: '2025-05-08T10:30:00Z' },
      { id: 'a19', action: 'Survey team dispatched', performedBy: 'Alpha Go Team', role: 'Service Partner', timestamp: '2025-05-09T09:00:00Z' },
      { id: 'a20', action: 'Inspection completed', performedBy: 'Alpha Go Team', role: 'Service Partner', timestamp: '2025-05-10T14:00:00Z' },
      { id: 'a21', action: 'Quote of ₹72,000 shared', performedBy: 'Alpha Go Team', role: 'Service Partner', timestamp: '2025-05-12T15:00:00Z' },
    ],
    timeline: buildTimeline('Quote Shared'),
    quote: { id: 'q2', amount: 72000, items: [{ description: 'Rear Bumper & Boot Repair', amount: 28000 }, { description: 'Right Door Replacement', amount: 35000 }, { description: 'Labor & Misc', amount: 9000 }], createdAt: '2025-05-12T15:00:00Z', status: 'Pending' },
    createdAt: '2025-05-08T08:00:00Z', updatedAt: '2025-05-12T15:00:00Z',
  },
  {
    id: 'l5', leadId: 'ME0005BR01',
    customer: { id: 'c5', name: 'Rohan Malhotra', mobile: '9567890123', email: 'rohan.malhotra@gmail.com', address: '3, Model Town, Delhi - 110009' },
    vehicle: { number: 'DL8CAB7890', brand: 'BMW', model: '3 Series', fuelType: 'Petrol', insuranceCompany: 'Royal Sundaram', year: 2023, color: 'Black' },
    serviceType: 'Accident Repair', services: ['Accident Repair'],
    priority: 'High', status: 'Vehicle Delivered',
    location: 'Model Town, Delhi', notes: 'Premium vehicle - handle with care.',
    salesPartner: mockSalesPartners[0],
    assignedServicePartner: mockServicePartners[0],
    documents: [
      { id: 'd7', name: 'Final_Bill.pdf', type: 'Bill', url: '#', uploadedAt: '2025-04-20T10:00:00Z', uploadedBy: 'AutoSpark Workshop', size: '234 KB' },
    ],
    activityLog: [
      { id: 'a22', action: 'Lead created', performedBy: 'Rahul Sharma', role: 'Sales Partner', timestamp: '2025-04-10T09:00:00Z' },
      { id: 'a23', action: 'Vehicle delivered to customer', performedBy: 'AutoSpark Workshop', role: 'Service Partner', timestamp: '2025-04-22T17:00:00Z' },
    ],
    timeline: buildTimeline('Vehicle Delivered'),
    quote: { id: 'q3', amount: 145000, items: [{ description: 'Front End Reconstruction', amount: 95000 }, { description: 'Airbag Replacement', amount: 35000 }, { description: 'Labor', amount: 15000 }], createdAt: '2025-04-14T10:00:00Z', approvedAt: '2025-04-15T10:00:00Z', status: 'Approved' },
    bill: { id: 'b1', amount: 145000, items: [{ description: 'Front End Reconstruction', amount: 95000 }, { description: 'Airbag Replacement', amount: 35000 }, { description: 'Labor', amount: 15000 }], gst: 26100, total: 171100, createdAt: '2025-04-20T10:00:00Z', paidAt: '2025-04-21T10:00:00Z', status: 'Paid' },
    createdAt: '2025-04-10T09:00:00Z', updatedAt: '2025-04-22T17:00:00Z',
  },
  {
    id: 'l6', leadId: 'ME0006AG04',
    customer: { id: 'c6', name: 'Kavya Iyer', mobile: '9678901234', email: 'kavya.iyer@gmail.com', address: '67, Viman Nagar, Pune - 411014' },
    vehicle: { number: 'MH12PQ2345', brand: 'Tata', model: 'Nexon EV', fuelType: 'Electric', insuranceCompany: 'Tata AIG', year: 2024, color: 'White' },
    serviceType: 'Breakdown Assistance', services: ['Breakdown Assistance', 'Part Procurement'],
    priority: 'Urgent', status: 'Lead Created',
    location: 'Viman Nagar, Pune', notes: 'EV charging port malfunction. Needs specialized EV service.',
    salesPartner: mockSalesPartners[3],
    documents: [],
    activityLog: [
      { id: 'a24', action: 'Lead created - awaiting admin review', performedBy: 'Sneha Patel', role: 'Sales Partner', timestamp: '2025-05-20T16:00:00Z' },
    ],
    timeline: buildTimeline('Lead Created'),
    createdAt: '2025-05-20T16:00:00Z', updatedAt: '2025-05-20T16:00:00Z',
  },
  {
    id: 'l7', leadId: 'ME0007IN05',
    customer: { id: 'c7', name: 'Suresh Nair', mobile: '9789012345', email: 'suresh.nair@gmail.com', address: '12, Kaloor, Kochi - 682017' },
    vehicle: { number: 'KL07RS4567', brand: 'Kia', model: 'Seltos', fuelType: 'Diesel', insuranceCompany: 'Oriental Insurance', year: 2022, color: 'Grey' },
    serviceType: 'Inspection', services: ['Inspection'],
    priority: 'Low', status: 'Payment Done',
    location: 'Kaloor, Kochi', notes: 'Pre-insurance renewal inspection.',
    salesPartner: mockSalesPartners[4],
    assignedServicePartner: mockServicePartners[1],
    documents: [
      { id: 'd8', name: 'Inspection_Report.pdf', type: 'Other', url: '#', uploadedAt: '2025-05-05T11:00:00Z', uploadedBy: 'QuickFix Garage', size: '1.8 MB' },
      { id: 'd9', name: 'Bill_Final.pdf', type: 'Bill', url: '#', uploadedAt: '2025-05-06T09:00:00Z', uploadedBy: 'QuickFix Garage', size: '145 KB' },
    ],
    activityLog: [
      { id: 'a25', action: 'Lead created', performedBy: 'Vikram Rao', role: 'Sales Partner', timestamp: '2025-05-01T08:00:00Z' },
      { id: 'a26', action: 'Payment received', performedBy: 'QuickFix Garage', role: 'Service Partner', timestamp: '2025-05-07T10:00:00Z' },
    ],
    timeline: buildTimeline('Payment Done'),
    quote: { id: 'q4', amount: 3500, items: [{ description: 'Inspection Fee', amount: 2500 }, { description: 'Report Generation', amount: 1000 }], createdAt: '2025-05-04T10:00:00Z', approvedAt: '2025-05-04T15:00:00Z', status: 'Approved' },
    bill: { id: 'b2', amount: 3500, items: [{ description: 'Inspection Fee', amount: 2500 }, { description: 'Report Generation', amount: 1000 }], gst: 630, total: 4130, createdAt: '2025-05-06T09:00:00Z', paidAt: '2025-05-07T10:00:00Z', status: 'Paid' },
    createdAt: '2025-05-01T08:00:00Z', updatedAt: '2025-05-07T10:00:00Z',
  },
  {
    id: 'l8', leadId: 'ME0008CR02',
    customer: { id: 'c8', name: 'Meena Sharma', mobile: '9890123456', email: 'meena.sharma@techcorp.in', address: '55, Banjara Hills, Hyderabad - 500034' },
    vehicle: { number: 'TS07UV6789', brand: 'Mahindra', model: 'XUV700', fuelType: 'Diesel', insuranceCompany: 'United India Insurance', year: 2023, color: 'Deep Forest' },
    serviceType: 'Accident Repair', services: ['Accident Repair', 'Survey', 'Towing'],
    priority: 'High', status: 'Car Received',
    location: 'Banjara Hills, Hyderabad', notes: 'Side collision damage. Corporate fleet vehicle.',
    salesPartner: mockSalesPartners[1],
    assignedServicePartner: mockServicePartners[0],
    documents: [
      { id: 'd10', name: 'RC_Copy.pdf', type: 'RC Copy', url: '#', uploadedAt: '2025-05-18T09:00:00Z', uploadedBy: 'Meena Sharma', size: '287 KB' },
    ],
    activityLog: [
      { id: 'a27', action: 'Lead created', performedBy: 'Priya Mehta', role: 'Sales Partner', timestamp: '2025-05-18T08:30:00Z' },
      { id: 'a28', action: 'Approved and assigned', performedBy: 'Admin Rajesh', role: 'Admin', timestamp: '2025-05-18T10:00:00Z' },
      { id: 'a29', action: 'Vehicle towed to workshop', performedBy: 'SpeedTow Services', role: 'Service Partner', timestamp: '2025-05-18T14:00:00Z' },
      { id: 'a30', action: 'Car received at AutoSpark', performedBy: 'AutoSpark Workshop', role: 'Service Partner', timestamp: '2025-05-18T16:00:00Z' },
    ],
    timeline: buildTimeline('Car Received'),
    createdAt: '2025-05-18T08:30:00Z', updatedAt: '2025-05-18T16:00:00Z',
  },
];

export const mockCurrentUser: User = {
  id: 'u1',
  name: 'Admin Rajesh',
  email: 'rajesh@mechpro.in',
  role: 'admin',
};

export const mockSalesUser: User = {
  id: 'u2',
  name: 'Rahul Sharma',
  email: 'rahul@autobridge.in',
  role: 'sales',
  partnerId: 'sp1',
};

export const mockServiceUser: User = {
  id: 'u3',
  name: 'AutoSpark Workshop',
  email: 'info@autospark.in',
  role: 'service',
  partnerId: 'sv1',
};

export const mockCustomerUser: User = {
  id: 'u4',
  name: 'Arjun Kapoor',
  email: 'arjun.kapoor@gmail.com',
  role: 'customer',
  partnerId: 'c1',
};

export const generateLeadId = (salesPartnerType: string, salesPartnerSeq: string, leadCount: number): string => {
  const seq = String(leadCount).padStart(4, '0');
  return `ME${seq}${salesPartnerType}${salesPartnerSeq}`;
};
