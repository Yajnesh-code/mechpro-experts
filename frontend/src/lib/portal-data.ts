export type PortalRole = "admin" | "sales" | "service" | "customer";

export type RoleOption = {
  value: PortalRole;
  label: string;
  description: string;
  route: string;
};

export type DashboardMetric = {
  title: string;
  value: string;
  trend: string;
};

export type DashboardRow = {
  id: string;
  primary: string;
  secondary: string;
  status: "pending" | "in-progress" | "completed" | "active";
  amount?: string;
};

export const roleOptions: RoleOption[] = [
  { value: "admin", label: "Admin", description: "Platform operations and reports", route: "/dashboard/admin" },
  { value: "sales", label: "Sales Partner", description: "Lead creation and tracking", route: "/dashboard/sales" },
  { value: "service", label: "Service Partner", description: "Assigned jobs and quotes", route: "/dashboard/service" },
  { value: "customer", label: "Customer", description: "Live service status", route: "/dashboard/customer" },
];

export const salesPartnerTypes = [
  { value: "BR", label: "Broker (BR)" },
  { value: "CR", label: "Corporate (CR)" },
  { value: "FT", label: "Fleet (FT)" },
  { value: "AG", label: "Agency (AG)" },
  { value: "IN", label: "Insurance (IN)" },
  { value: "IS", label: "Internal Sales (IS)" },
];

export const servicePartnerCategories = [
  "Workshop",
  "Towing",
  "Part Vendor",
  "Battery",
  "Tyre",
  "Alpha Go",
];

export const cityOptions = ["Mumbai", "Thane", "Navi Mumbai", "Panvel", "Pune", "Nashik"];

export const adminSidebarItems = ["Dashboard", "Leads", "Documents", "Users", "Partners", "Reports", "Billing", "Settings"];

export const adminMetrics: DashboardMetric[] = [
  { title: "Total Leads", value: "12,840", trend: "+12.4%" },
  { title: "Pending", value: "1,284", trend: "+4.2%" },
  { title: "Completed", value: "10,932", trend: "+8.9%" },
  { title: "Revenue", value: "INR 2.4Cr", trend: "+16.1%" },
  { title: "Active Partners", value: "546", trend: "+22" },
];

export const adminChartData = [
  { label: "Jan", value: 22 },
  { label: "Feb", value: 35 },
  { label: "Mar", value: 30 },
  { label: "Apr", value: 48 },
  { label: "May", value: 52 },
  { label: "Jun", value: 46 },
];

export const adminRecentActivity: DashboardRow[] = [
  { id: "LD-1092", primary: "Claim assigned to AutoSpark Workshop", secondary: "Mumbai • 14 min ago", status: "in-progress" },
  { id: "LD-1091", primary: "Corporate lead approved by admin", secondary: "Thane • 34 min ago", status: "completed" },
  { id: "LD-1088", primary: "New partner registration submitted", secondary: "Navi Mumbai • 1 hr ago", status: "pending" },
  { id: "LD-1083", primary: "Invoice settled for Fleet account", secondary: "Panvel • 2 hr ago", status: "active", amount: "INR 42,000" },
];

export const salesMetrics: DashboardMetric[] = [
  { title: "Leads Created", value: "124", trend: "+11 this week" },
  { title: "Pending", value: "32", trend: "Needs follow-up" },
  { title: "Assigned", value: "68", trend: "56% conversion" },
  { title: "Completed", value: "24", trend: "Closed this month" },
];

export const salesLeads: DashboardRow[] = [
  { id: "SL-340", primary: "Honda City • Claim support", secondary: "Customer: Aman Verma", status: "pending" },
  { id: "SL-336", primary: "Hyundai Creta • Repair estimate", secondary: "Assigned: Prime Auto Care", status: "in-progress" },
  { id: "SL-329", primary: "Maruti Baleno • Insurance docs", secondary: "Assigned: AutoFix Hub", status: "active" },
  { id: "SL-321", primary: "Toyota Innova • Breakdown", secondary: "Closed with payout", status: "completed", amount: "INR 38,500" },
];

export const serviceMetrics: DashboardMetric[] = [
  { title: "Assigned Jobs", value: "41", trend: "+5 today" },
  { title: "In Progress", value: "19", trend: "3 urgent" },
  { title: "Completed", value: "22", trend: "This month" },
];

export const serviceJobs: DashboardRow[] = [
  { id: "SV-902", primary: "Front bumper replacement", secondary: "Vehicle: MH-04-AB-8941", status: "in-progress" },
  { id: "SV-897", primary: "Engine diagnostics", secondary: "Vehicle: MH-02-JK-2146", status: "pending" },
  { id: "SV-894", primary: "Door repaint + polish", secondary: "Vehicle: MH-48-RT-6788", status: "active" },
  { id: "SV-883", primary: "Battery replacement completed", secondary: "Vehicle: MH-04-PL-5590", status: "completed", amount: "INR 9,800" },
];

export const customerMetrics: DashboardMetric[] = [
  { title: "Current Service Status", value: "In Progress", trend: "Technician assigned" },
  { title: "Payment Status", value: "Pending", trend: "Quote approved" },
  { title: "Assigned Partner", value: "Prime Auto Care", trend: "Navi Mumbai" },
];

export const customerTimeline = [
  { title: "Lead Created", date: "May 22, 2026", complete: true },
  { title: "Quote Shared", date: "May 23, 2026", complete: true },
  { title: "Work In Progress", date: "May 26, 2026", complete: true },
  { title: "Completed", date: "Expected May 29, 2026", complete: false },
];

export const trustLabels = ["Secure", "Reliable", "Transparent"];
