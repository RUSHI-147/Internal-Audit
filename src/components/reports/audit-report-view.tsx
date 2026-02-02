'use client';
import { useAudit } from '@/contexts/AuditContext';
import { Button } from '@/components/ui/button';
import { mockCurrentUser } from '@/lib/data';
import { Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';

export function AuditReportView() {
  const { findings, uploadedDocs } = useAudit();
  const confirmedFindings = findings.filter((f) => f.status === 'Confirmed');
  const dismissedFindings = findings.filter((f) => f.status === 'Dismissed');

  // This would come from context or a fetch call in a real app
  const companyDetails = {
    name: 'Example Corp Pvt. Ltd.',
    type: 'Private Limited Company',
    auditPeriod: 'FY 2023-2024',
  };

  const reportDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const totalFindings = findings.length;
  const keyRiskAreas = [...new Set(confirmedFindings.map((f) => f.type))];
  const overallRisk = confirmedFindings.some((f) => f.riskScore > 80)
    ? 'High'
    : confirmedFindings.some((f) => f.riskScore > 60)
    ? 'Moderate'
    : 'Low';

  return (
    <div className="bg-background">
      <div className="flex justify-between items-center mb-8 print-hide">
        <h1 className="text-2xl font-bold font-headline">
          Audit Report Preview
        </h1>
        <Button onClick={() => window.print()}>
          <Download className="mr-2 h-4 w-4" />
          Download as PDF
        </Button>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg print-container">
        {/* 1. Cover Page */}
        <div className="report-page text-center">
          <div className="flex flex-col justify-center items-center h-full">
            <h1 className="text-4xl font-bold font-headline text-gray-800">
              Internal Audit Report
            </h1>
            <p className="text-2xl font-semibold mt-6">{companyDetails.name}</p>
            <p className="text-lg text-gray-600">({companyDetails.type})</p>
            <div className="mt-24 space-y-3 text-lg">
              <p>
                <strong>Audit Period:</strong> {companyDetails.auditPeriod}
              </p>
              <p>
                <strong>Report Date:</strong> {reportDate}
              </p>
            </div>
            <div className="absolute bottom-12 text-sm text-gray-500">
              <p className="font-bold">CONFIDENTIAL</p>
              <p>
                This document is intended solely for the use of the management
                and board of {companyDetails.name}.
              </p>
            </div>
          </div>
        </div>

        {/* Report Body */}
        <div className="report-body space-y-12">
          {/* 2. Executive Summary */}
          <section className="report-page">
            <h2 className="report-section-header">1. Executive Summary</h2>
            <div className="report-section-content space-y-4">
              <p>
                An internal audit of {companyDetails.name} for the period{' '}
                {companyDetails.auditPeriod} was conducted in accordance with
                the agreed-upon scope and objectives. Our overall assessment of
                the internal control environment is{' '}
                <strong>{overallRisk} Risk</strong>.
              </p>
              <p>
                The audit identified a total of <strong>{totalFindings}</strong>{' '}
                potential anomalies using a combination of rule-based and
                AI-assisted testing. Following a detailed review and application
                of professional judgment by the audit team,{' '}
                <strong>{confirmedFindings.length}</strong> of these were
                confirmed as findings requiring management attention. Key risk
                areas identified include: {keyRiskAreas.join(', ') || 'None'}.
              </p>
              <p>
                Detailed observations and actionable recommendations are
                provided in the subsequent sections of this report to assist
                management in strengthening the control framework.
              </p>
            </div>
          </section>

          {/* 3. Audit Scope & Objectives */}
          <section>
            <h2 className="report-section-header">
              2. Audit Scope & Objectives
            </h2>
            <div className="report-section-content space-y-2">
              <p>
                <strong>Scope:</strong> The audit covered financial and
                operational transactions for the period{' '}
                {companyDetails.auditPeriod}. The areas reviewed included, but
                were not limited to, Procure-to-Pay, Treasury operations, and
                General Ledger postings.
              </p>
              <p>
                <strong>Objectives:</strong> The primary objectives were to
                assess the adequacy of internal controls, ensure compliance with
                company policies and regulatory requirements, and identify
                potential process inefficiencies or control gaps.
              </p>
              <p>
                <strong>Exclusions:</strong> This audit did not cover statutory tax
                filings or human resources compliance, which are addressed in
                separate reviews.
              </p>
            </div>
          </section>

          {/* 4. Audit Methodology */}
          <section>
            <h2 className="report-section-header">3. Audit Methodology</h2>
            <div className="report-section-content">
              <p>
                Our audit was conducted using a risk-based approach, leveraging
                the AuditAI platform. The methodology involved ingestion of
                source documents and transactional data, followed by automated analysis. An AI-assisted engine was used to perform rule-based checks and identify statistical anomalies. Crucially, every anomaly flagged by the system was subject to manual review, and final conclusions were drawn based on the auditor's professional judgment and verification against supporting evidence.
              </p>
            </div>
          </section>

          {/* 5. Summary of Key Findings */}
          <section className="report-page">
            <h2 className="report-section-header">
              4. Summary of Key Findings
            </h2>
            <div className="report-section-content">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Finding</TableHead>
                    <TableHead>Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {confirmedFindings.length > 0 ? (
                    confirmedFindings.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell>{f.id}</TableCell>
                        <TableCell>{f.type}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              f.riskScore > 80 ? 'destructive' : 'secondary'
                            }
                          >
                            {f.riskScore > 80 ? 'High' : f.riskScore > 60 ? 'Medium' : 'Low'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        No findings were confirmed during this audit.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </section>

          {/* 6. Detailed Audit Observations */}
          <section className="report-page">
            <h2 className="report-section-header">
              5. Detailed Audit Observations
            </h2>
            <div className="report-section-content space-y-6">
              {confirmedFindings.map((f, i) => (
                <div key={f.id} className="border-l-4 pl-4 break-inside-avoid">
                  <h3 className="font-bold text-base">
                    5.{i + 1} {f.type} (Risk: {f.riskScore})
                  </h3>
                  <p className="mt-1">
                    <strong>Observation:</strong> {f.description}
                  </p>
                  <p className="mt-1">
                    <strong>Impact:</strong> This indicates a potential control
                    weakness that could lead to financial misstatement or non-compliance.
                  </p>
                  <p className="mt-1 text-gray-600">
                    <strong>Auditor's Conclusion:</strong> {f.auditorComment}
                  </p>
                </div>
              ))}
               {confirmedFindings.length === 0 && <p className="text-gray-500">No reportable observations.</p>}
            </div>
          </section>

          {/* 7. Risk Rating & Impact Assessment */}
          <section>
            <h2 className="report-section-header">
              6. Risk Rating & Impact Assessment
            </h2>
             <div className="report-section-content space-y-2">
               <p>The overall audit risk is assessed as <strong>{overallRisk}</strong>. This assessment is based on the severity and frequency of the confirmed findings.</p>
               <p>The identified issues have potential impacts across financial reporting (risk of error), operational efficiency (process gaps), and compliance (regulatory breaches).</p>
             </div>
          </section>
          
          {/* 8. Management Action & Recommendations */}
          <section>
             <h2 className="report-section-header">7. Management Action & Recommendations</h2>
             <div className="report-section-content space-y-4">
              {confirmedFindings.map(f => (
                 <div key={f.id} className="break-inside-avoid">
                    <p><strong>For {f.type} ({f.id}):</strong></p>
                    <p className="pl-4">We recommend implementing a secondary check for [specific condition related to {f.type}] before processing. Responsibility should be assigned to the Finance Manager with a target completion of 30 days.</p>
                 </div>
              ))}
              {confirmedFindings.length === 0 && <p className="text-gray-500">No recommendations required as no findings were confirmed.</p>}
             </div>
          </section>

          {/* 9. Auditor Declaration */}
          <section>
            <h2 className="report-section-header">8. Auditor Declaration</h2>
            <div className="report-section-content bg-gray-50 p-4 rounded-md">
              <p className="italic text-sm">
                "This audit report has been prepared based on information and
                documents provided by the entity. AI tools were used to assist
                analysis. Final conclusions are based on auditor judgement."
              </p>
              <div className="mt-8 pt-8 border-t">
                <p className="font-semibold">{mockCurrentUser.name}</p>
                <p className="text-sm">Chartered Accountant</p>
                <p className="text-sm">Membership Number: [Placeholder M.No.]</p>
                <p className="text-sm">Date: {reportDate}</p>
              </div>
            </div>
          </section>

          {/* 10. Appendices */}
          <section className="report-page">
            <h2 className="report-section-header">Appendices</h2>
            <div className="report-section-content space-y-6">
              <div>
                <h3 className="font-bold mb-2">Appendix A: Dismissed Findings</h3>
                {dismissedFindings.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    {dismissedFindings.map((f) => (
                      <li key={f.id}>
                        <strong>
                          {f.id} ({f.type}):
                        </strong>{' '}
                        {f.auditorComment}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    No findings were dismissed during this audit.
                  </p>
                )}
              </div>

              <div className="pt-6 border-t">
                <h3 className="font-bold mb-2">Appendix B: Documents Reviewed</h3>
                {uploadedDocs.length > 0 ? (
                   <ul className="list-disc pl-5 space-y-1 text-sm">
                    {uploadedDocs.map(doc => <li key={doc.id}>{doc.name}</li>)}
                   </ul>
                ): (
                   <p className="text-sm text-gray-500">
                    No documents were recorded in the ingestion history.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
