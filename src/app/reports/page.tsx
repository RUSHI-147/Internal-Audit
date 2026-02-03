'use client';

import { useAudit } from '@/contexts/AuditContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState } from 'react';
import { AuditReportView } from '@/components/reports/audit-report-view';
import { AlertTriangle, CheckCircle, File } from 'lucide-react';

export default function ReportsPage() {
  const { auditStatus, findings } = useAudit();
  const [showReport, setShowReport] = useState(false);

  const pendingDecisions = findings.filter(
    (f) => f.status === 'AI Flagged' || f.status === 'Needs More Info'
  ).length;
  const isAuditComplete = auditStatus === 'COMPLETED';
  const canGenerateReport = isAuditComplete && pendingDecisions === 0;

  const handleGenerateReport = () => {
    setShowReport(true);
  };

  if (showReport) {
    return <AuditReportView />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          Audit Reports
        </h1>
        <p className="text-muted-foreground">
          Generate, view, and download the final internal audit report.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Final Audit Report</CardTitle>
          <CardDescription>
            Once all findings have been reviewed and decisions are locked, you
            can generate the final, regulator-ready audit report.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isAuditComplete ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Audit Not Completed</AlertTitle>
              <AlertDescription>
                Please run an audit from the Data Ingestion page and wait for it
                to complete before generating a report.
              </AlertDescription>
            </Alert>
          ) : !canGenerateReport ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Action Required</AlertTitle>
              <AlertDescription>
                You have {pendingDecisions} pending finding(s) that need
                auditor review. Please resolve all 'AI Flagged' and 'Needs More Info' items in the
                Audit Review Queue.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Ready to Generate Report</AlertTitle>
              <AlertDescription>
                All audit findings have been reviewed. You can now proceed with
                generating the final report.
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleGenerateReport}
            disabled={!canGenerateReport}
          >
            <File className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
