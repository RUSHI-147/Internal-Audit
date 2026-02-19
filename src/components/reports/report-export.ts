
'use client';

import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle 
} from 'docx';
import { saveAs } from 'file-saver';
import { Anomaly, UploadedDoc } from '@/lib/types';
import { internalAuditTemplateV1 } from '@/lib/audit_template';
import { accounting_standards } from '@/lib/accounting_standards';

/**
 * Exports the report as a PDF using html2pdf.js
 */
export async function exportAsPDF(elementId: string, filename: string) {
  // @ts-ignore - Dynamic import for client-side only library
  const html2pdfModule = await import('html2pdf.js');
  const html2pdf = html2pdfModule.default || html2pdfModule;
  
  const element = document.getElementById(elementId);
  if (!element) throw new Error("Report content element not found.");

  const opt = {
    margin: 10,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  await html2pdf().set(opt).from(element).save();
}

/**
 * Exports the report as a Word document (.docx) using the docx library
 */
export async function exportAsWord(data: {
  template: typeof internalAuditTemplateV1;
  standards: typeof accounting_standards;
  findings: Anomaly[];
  uploadedDocs: UploadedDoc[];
  companyDetails: {
    name: string;
    type: string;
    auditPeriod: string;
    auditorName: string;
  };
  reportDate: string;
  overallRisk: string;
  filename: string;
}) {
  const { template, standards, findings, uploadedDocs, companyDetails, reportDate, overallRisk, filename } = data;
  
  const confirmedFindings = findings.filter(f => f.status === 'Confirmed');
  const dismissedFindings = findings.filter(f => f.status === 'Dismissed');

  const children: any[] = [];

  // 1. Cover Page
  children.push(
    new Paragraph({
      text: template.template_name,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { before: 2000, after: 200 },
    }),
    new Paragraph({
      text: template.version,
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: companyDetails.name, bold: true, size: 36 }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: `(${companyDetails.type})`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 2000 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Audit Period: ", bold: true }),
        new TextRun(companyDetails.auditPeriod),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Report Date: ", bold: true }),
        new TextRun(reportDate),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 2000 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "CONFIDENTIAL", bold: true, size: 24, color: "FF0000" }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 1000 },
    }),
    new Paragraph({
      text: `This document is intended solely for the use of the management and board of ${companyDetails.name}.`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // 2. Sections
  for (const section of template.sections) {
    // Skip specific sections that are handled differently or at the end
    if (section.id === 'SIGNATURE_BLOCK') continue;

    children.push(
      new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        pageBreakBefore: section.id === '1' ? true : false
      })
    );

    // Static/List sections
    if (section.type === 'static' || section.type === 'list') {
      const items = section.description.split('. ').filter(s => s.trim() !== '');
      if (items.length > 1) {
        items.forEach(item => {
          children.push(new Paragraph({
            text: item.endsWith('.') ? item : item + '.',
            bullet: { level: 0 },
            spacing: { after: 120 }
          }));
        });
      } else {
        children.push(new Paragraph({ text: section.description, spacing: { after: 200 } }));
      }
    }

    // Dynamic Logic
    if (section.id === '6' || section.id.startsWith('6.')) {
        if (section.id.startsWith('6.')) {
            if (confirmedFindings.length > 0) {
                confirmedFindings.forEach((f, i) => {
                    children.push(
                        new Paragraph({
                            children: [new TextRun({ text: `Observation ${i + 1}: ${f.type} (Risk: ${f.riskScore})`, bold: true, size: 24 })],
                            spacing: { before: 300, after: 100 }
                        }),
                        new Paragraph({ 
                          children: [new TextRun({ text: "Observation: ", bold: true }), new TextRun(f.description)],
                          spacing: { after: 100 }
                        }),
                        new Paragraph({ 
                          children: [new TextRun({ text: "Auditor's Conclusion: ", bold: true }), new TextRun(f.auditorComment || "Analysis complete.")],
                          spacing: { after: 100 }
                        }),
                        new Paragraph({ 
                          children: [new TextRun({ text: "Recommendation: ", bold: true }), new TextRun("Implement enhanced controls and periodic review for this transaction type.")],
                          spacing: { after: 200 }
                        })
                    );
                });
            } else {
                children.push(new Paragraph({ text: "No reportable observations for this section.", italics: true }));
            }
        }
    } else if (section.id === '7') {
        const riskSummary = {
          'Financial Reporting': 'Low',
          'Statutory Compliance': confirmedFindings.some(f => f.riskScore > 60) ? 'Medium' : 'Low',
          'Operational Controls': confirmedFindings.some(f => f.riskScore > 80) ? 'High' : 'Medium',
        };
        
        const rows = [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: "Area", bold: true })], shading: { fill: "EEEEEE" } }),
              new TableCell({ children: [new Paragraph({ text: "Risk Level", bold: true })], shading: { fill: "EEEEEE" } }),
            ]
          }),
          ...Object.entries(riskSummary).map(([area, risk]) => new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(area)] }),
              new TableCell({ children: [new Paragraph(risk)] }),
            ]
          }))
        ];

        children.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows
        }));
    } else if (section.id === '9') {
        children.push(
            new Paragraph({ 
              children: [
                new TextRun({ text: "Overall Conclusion: ", bold: true }),
                new TextRun({ text: `${overallRisk} Risk Assessment`, bold: true, color: overallRisk === 'High' ? 'FF0000' : '000000' })
              ],
              spacing: { before: 200, after: 200 } 
            }),
            new Paragraph({ text: section.description })
        );
    } else if (section.id === '10') {
        // Annexures
        children.push(new Paragraph({ text: "Annexure A: List of Dismissed Findings", heading: HeadingLevel.HEADING_2, spacing: { before: 300 } }));
        if (dismissedFindings.length > 0) {
          dismissedFindings.forEach(f => {
            children.push(new Paragraph({ text: `${f.id} (${f.type}): ${f.auditorComment}`, bullet: { level: 0 } }));
          });
        } else {
          children.push(new Paragraph({ text: "No findings were dismissed.", italics: true }));
        }

        children.push(new Paragraph({ text: "Annexure B: List of Documents Verified", heading: HeadingLevel.HEADING_2, spacing: { before: 300 } }));
        uploadedDocs.forEach(doc => {
          children.push(new Paragraph({ text: doc.name, bullet: { level: 0 } }));
        });

        children.push(new Paragraph({ text: "Annexure C: Accounting Standards Compliance", heading: HeadingLevel.HEADING_2, spacing: { before: 300 } }));
        const policyRows = [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: "Policy", bold: true })], shading: { fill: "EEEEEE" } }),
              new TableCell({ children: [new Paragraph({ text: "Reference", bold: true })], shading: { fill: "EEEEEE" } }),
            ]
          }),
          ...standards.accounting_policies.map(p => new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(p.policy_name)] }),
              new TableCell({ children: [new Paragraph(p.compliance_reference)] }),
            ]
          }))
        ];
        children.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: policyRows
        }));
    }
  }

  // 3. Signature Block
  const sig = template.sections.find(s => s.id === 'SIGNATURE_BLOCK');
  if (sig) {
    children.push(
        new Paragraph({ text: "", spacing: { before: 800 } }),
        new Paragraph({ text: sig.description, italics: true, spacing: { after: 400 } }),
        new Paragraph({ text: "For, [Audit Firm Name]", bold: true }),
        new Paragraph({ text: companyDetails.auditorName, bold: true, spacing: { before: 600 } }),
        new Paragraph({ text: "Partner" }),
        new Paragraph({ text: "Membership Number: [M.No. Placeholder]" }),
        new Paragraph({ text: `Place: Mumbai` }),
        new Paragraph({ text: `Date: ${reportDate}` })
    );
  }

  const doc = new Document({
    sections: [{
        properties: {},
        children: children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
