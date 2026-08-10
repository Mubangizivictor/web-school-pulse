export const siteConfig = {
  brandName: 'School Pulse',
  companyName: 'Victorbee Technologies',
  websiteUrl: 'https://schoolpulse.victorbee.com',
  // Keep the public site on a working app target until the custom
  // app.schoolpulse.victorbee.com domain is attached to Firebase Hosting.
  appUrl: 'https://school-pulse-3d95b.web.app',
  phone: '+256 793 128 137',
  whatsappNumber: '256793128137',
  email: 'mubangizivic@gmail.com',
  tagline: 'Educate • Empower • Excel',
  payments: {
    provider: 'Yo! Payments',
    enabled: false,
  },
};

export const plans = [
  { name: 'Starter', price: 350000, cycle: 'Term', range: 'Up to 300 students', recommended: false },
  { name: 'Growth', price: 550000, cycle: 'Term', range: '301–800 students', recommended: true },
  { name: 'Pro', price: 800000, cycle: 'Term', range: '801–1,500 students', recommended: false },
  { name: 'Enterprise', price: null, cycle: 'Custom', range: '1,500+ students', recommended: false },
];

export const modules = [
  ['Student Management','Admissions, profiles, lifecycle and documents.'],
  ['Attendance','QR, manual and NFC-ready role-based attendance.'],
  ['Academics','Classes, subjects, assessments and academic workflows.'],
  ['Finance','Fees, collections, expenditure and financial oversight.'],
  ['Teachers','Class and subject teacher workspaces with permissions.'],
  ['Parents','Secure parent access to permitted student information.'],
  ['Report Cards','Structured report generation and academic reporting.'],
  ['Boarding','Dormitories, roll calls, welfare and leave workflows.'],
  ['Health','Clinic visits, medication, emergencies and health records.'],
  ['Library','Borrowing, returns, policies and inventory workflows.'],
  ['Security & Visitors','Simple gate, visitor and appointment workflows.'],
  ['Transport','Routes, buses, boarding verification and operations.'],
  ['Stores & Assets','Procurement, inventory, assets and maintenance.'],
  ['Catering','Meal planning, kitchen operations and stock coordination.'],
  ['Messaging','Role-aware operational communication across the school.'],
  ['Administration','Structure, staff, roles, configuration and audit visibility.'],
];
