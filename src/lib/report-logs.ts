import { AuditReportLog } from './types';

export const mockReportLogs: AuditReportLog[] = [
  {
    reportId: "AUD-RPT-001",
    companyName: "Innovate Solutions Pvt. Ltd.",
    companyType: "Private Ltd",
    auditDate: "2024-07-15T10:00:00Z",
    cost: 75000,
    status: "Completed",
    pdfUrl: "/reports/innovate-solutions-2024-q2.pdf"
  },
  {
    reportId: "AUD-RPT-002",
    companyName: "Global Tech Inc.",
    companyType: "Public Ltd",
    auditDate: "2024-06-28T14:30:00Z",
    cost: 250000,
    status: "Completed",
    pdfUrl: "/reports/global-tech-2024-h1.pdf"
  },
  {
    reportId: "AUD-RPT-003",
    companyName: "OneMan Ventures OPC",
    companyType: "OPC",
    auditDate: "2024-05-20T11:00:00Z",
    cost: 30000,
    status: "Completed",
    pdfUrl: "/reports/oneman-ventures-fy2023.pdf"
  },
  {
    reportId: "AUD-RPT-004",
    companyName: "Sunrise Traders",
    companyType: "Proprietorship",
    auditDate: "2024-04-10T09:00:00Z",
    cost: 25000,
    status: "Completed",
    pdfUrl: "/reports/sunrise-traders-fy2023.pdf"
  },
  {
    reportId: "AUD-RPT-005",
    companyName: "NextGen AI Corp.",
    companyType: "Private Ltd",
    auditDate: "2024-07-25T16:00:00Z",
    cost: 120000,
    status: "Draft",
    pdfUrl: "#"
  }
];
