
'use client';

import { useAudit } from '@/contexts/AuditContext';
import { Button } from '@/components/ui/button';
import { mockCurrentUser } from '@/lib/data';
import { Download, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { internalAuditTemplateV1 } from '@/lib/audit_template';
import { accounting_standards } from '@/lib/accounting_standards';
import { Anomaly, UploadedDoc } from '@/lib/types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type AuditReportViewProps = {
  template: typeof internalAuditTemplateV1;
  standards: typeof accounting_standards;
};

type ReportSectionProps = {
  section: (typeof internalAuditTemplateV1)['sections'][number];
  confirmedFindings: Anomaly[];
  overallRisk: string;
  dismissedFindings: Anomaly[];
  uploadedDocs: UploadedDoc[];
  standards: typeof accounting_standards;
  reportDate: string;
};

const ReportSection = ({
  section,
  confirmedFindings,
  overallRisk,
  dismissedFindings,
  uploadedDocs,
  standards,
  reportDate,
}: ReportSectionProps) => {
  switch (section.id) {
    case '6':
      return <p className="report-section-content">{section.description}</p>;

    case '6.1':
    case '6.2':
    case '6.3':
    case '6.4':
    case '6.5':
    case '6.6':
    case '6.7':
    case '6.8':
      return (
        <div className="report-section-content space-y-6">
          <p>{section.description}</p>
          {confirmedFindings.length > 0 ? (
            confirmedFindings.map((f: Anomaly, i: number) => (
              <div key={f.id} className="border-l-4 pl-4 break-inside-avoid">
                <h3 className="font-bold text-base">
                  Observation {i + 1}: {f.type} (Risk: {f.riskScore})
                </h3>
                <p className="mt-1">
                  <strong>Observation:</strong> {f.description}
                </p>
                <p className="mt-1">
                  <strong>Impact:</strong> This indicates a potential control
                  weakness that could lead to financial misstatement or
                  non-compliance.
                </p>
                <p className="mt-1">
                  <strong>Auditor's Conclusion:</strong> {f.auditorComment}
                </p>
                <p className="mt-1">
                  <strong>Recommendation:</strong> We recommend implementing a
                  secondary check for this type of transaction before
                  processing. Responsibility should be assigned to the Finance
                  Manager with a target completion of 30 days.
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">
              No reportable observations for this section.
            </p>
          )}
        </div>
      );
    case '7':
      const riskSummary = {
        'Financial Reporting': 'Low',
        'Statutory Compliance': confirmedFindings.some((f: any) => f.riskScore > 60)
          ? 'Medium'
          : 'Low',
        'Operational Controls': confirmedFindings.some((f: any) => f.riskScore > 80)
          ? 'High'
          : 'Medium',
        'Related Party Transactions': 'Not Assessed',
      };
      return (
        <div className="report-section-content">
          <p className="mb-4">{section.description}</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Area</TableHead>
                <TableHead>Risk Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(riskSummary).map(([area, risk]) => (
                <TableRow key={area}>
                  <TableCell>{area}</TableCell>
                  <TableCell>{risk}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    case '8':
      return (
        <div className="report-section-content">
          <p>{section.description}</p>
          <p className="mt-4">
            We report that no fraud by the company or on the company by its
            officers or employees has been noticed or reported during the course
            of our audit that would be material to the financial statements.
          </p>
        </div>
      );
    case '9':
      return (
        <div className="report-section-content space-y-4">
          <p>
            Based on our internal audit procedures, and the information and
            explanations provided, our overall assessment of the internal
            control environment is that of{' '}
            <strong>{overallRisk} Risk</strong>.
          </p>
          <p>
            The audit identified a total of{' '}
            <strong>{confirmedFindings.length}</strong> confirmed findings
            requiring management attention. Key risk areas identified include:{' '}
            {[...new Set(confirmedFindings.map((f: any) => f.type))].join(
              ', '
            ) || 'None'}
            .
          </p>
          <p>{section.description}</p>
        </div>
      );
    case '10': // Annexures
      return (
        <div className="report-section-content space-y-8">
          <div>
            <h3 className="font-bold mb-2">
              Annexure A: List of Dismissed Findings
            </h3>
            {dismissedFindings.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2 text-sm">
                {dismissedFindings.map((f: Anomaly) => (
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
            <h3 className="font-bold mb-2">
              Annexure B: List of Documents Verified
            </h3>
            {uploadedDocs.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {uploadedDocs.map((doc: any) => (
                  <li key={doc.id}>{doc.name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                No documents were recorded in the ingestion history.
              </p>
            )}
          </div>
          <div className="pt-6 border-t">
            <h3 className="font-bold mb-2">
              Annexure C: Applicable Accounting Policies (as per{' '}
              {standards.version})
            </h3>
            {standards.accounting_policies.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy</TableHead>
                    <TableHead>Rule Summary</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standards.accounting_policies.map((policy: any) => (
                    <TableRow key={policy.policy_name}>
                      <TableCell className="font-medium">
                        {policy.policy_name}
                      </TableCell>
                      <TableCell>{policy.rule_summary}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {policy.compliance_reference}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-gray-500">
                No specific accounting policies were detailed.
              </p>
            )}
          </div>
        </div>
      );
    case 'SIGNATURE_BLOCK':
      return (
        <div className="report-section-content bg-gray-50 p-4 rounded-md">
          <p className="italic text-sm">"{section.description}"</p>
          <div className="mt-8 pt-8 border-t">
            <p className="font-semibold">For, [Audit Firm Name]</p>
            <p className="mt-16 font-semibold">{mockCurrentUser.name}</p>
            <p className="text-sm">Partner</p>
            <p className="text-sm">Membership Number: [Placeholder M.No.]</p>
            <p className="text-sm">
              Firm Registration Number: [Placeholder FRN]
            </p>
            <p className="text-sm">Place: Mumbai</p>
            <p className="text-sm">Date: {reportDate}</p>
          </div>
        </div>
      );
    default:
      if (section.type === 'list') {
        const listItems = section.description
          .split('. ')
          .filter((s: string) => s.trim() !== '');
        return (
          <ul className="report-section-content list-disc pl-5 space-y-2">
            {listItems.map((item: string, index: number) => (
              <li key={index}>{item.endsWith('.') ? item : item + '.'}</li>
            ))}
          </ul>
        );
      }
      return <p className="report-section-content">{section.description}</p>;
  }
};

export function AuditReportView({ template, standards }: AuditReportViewProps) {
  const { findings, uploadedDocs } = useAudit();
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const confirmedFindings = findings.filter((f) => f.status === 'Confirmed');
  const dismissedFindings = findings.filter((f) => f.status === 'Dismissed');

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

  const overallRisk = confirmedFindings.some((f) => f.riskScore > 80)
    ? 'High'
    : confirmedFindings.some((f) => f.riskScore > 60)
    ? 'Moderate'
    : 'Low';

  const handleDownload = async () => {
    setIsGenerating(true);
    toast({
      title: "Generating Report",
      description: "Preparing your audit report for download...",
    });

    try {
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('report-content');
      
      if (!element) {
        throw new Error("Report element not found");
      }

      const opt = {
        margin: [10, 10],
        filename: `Internal_Audit_Report_${companyDetails.name.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();
      
      toast({
        title: "Download Complete",
        description: "Your audit report has been saved successfully.",
      });
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "We couldn't generate the PDF. Please try again or use the browser print option (Ctrl+P).",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-background">
      <div className="flex justify-between items-center mb-8 print-hide">
        <h1 className="text-2xl font-bold font-headline">
          Internal Audit Report Preview
        </h1>
        <Button onClick={handleDownload} disabled={isGenerating}>
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isGenerating ? "Preparing PDF..." : "Download as PDF"}
        </Button>
      </div>

      <div id="report-content" className="bg-white p-8 md:p-12 rounded-lg shadow-lg print-container">
        {/* Cover Page */}
        <div className="report-page text-center">
          <div className="flex flex-col justify-center items-center h-full min-h-[800px]">
            <h1 className="text-4xl font-bold font-headline text-gray-800">
              {template.template_name}
            </h1>
            <p className="text-lg text-gray-500 mt-2">{template.version}</p>
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
            <div className="mt-auto pt-12 text-sm text-gray-500">
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
          {template.sections.map((section) => (
            <section key={section.id} className="report-page mt-8 pt-8 border-t first:border-t-0 first:mt-0 first:pt-0">
              <h2 className="report-section-header">{section.title}</h2>
              <ReportSection
                section={section}
                confirmedFindings={confirmedFindings}
                overallRisk={overallRisk}
                dismissedFindings={dismissedFindings}
                uploadedDocs={uploadedDocs}
                standards={standards}
                reportDate={reportDate}
              />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
