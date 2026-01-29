'use client';

import { useState, useRef, useMemo } from 'react';
import {
  CompanyDetailsForm,
  CompanyDetailsFormValues,
} from '@/components/ingestion/company-details-form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Upload, PlusCircle, CheckCircle, Loader } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Ingestion, UploadedDoc } from '@/lib/types';
import { DocumentDemandList } from '@/components/ingestion/document-demand-list';
import { useAudit } from '@/contexts/AuditContext';
import { documentRequirements } from '@/lib/document-requirements';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const statusVariant: Record<
  Ingestion['status'],
  'default' | 'secondary' | 'destructive'
> = {
  Completed: 'default',
  Processing: 'secondary',
  Failed: 'destructive',
};

export default function IngestionPage() {
  const [companyDetails, setCompanyDetails] =
    useState<CompanyDetailsFormValues | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadedDocs, addUploadedDoc, startAudit, auditStatus } = useAudit();

  const handleFormSubmit = (data: CompanyDetailsFormValues) => {
    setCompanyDetails(data);
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const newDoc: UploadedDoc = {
      id: `DOC-${(uploadedDocs.length + 1).toString().padStart(3, '0')}`,
      name: file.name,
      type: 'File',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Completed',
    };

    addUploadedDoc(newDoc);

    // Reset file input to allow uploading the same file again
    if (event.target) {
      event.target.value = '';
    }
  };

  const mandatoryDocs = useMemo(() => {
    if (!companyDetails) return [];
    const docs = documentRequirements[companyDetails.companyType] || [];
    return docs.filter((d) => d.isMandatory);
  }, [companyDetails]);

  const allMandatoryDocsUploaded = useMemo(() => {
    if (!companyDetails || mandatoryDocs.length === 0) return false;
    return mandatoryDocs.every((mandatoryDoc) =>
      uploadedDocs.some(
        (uploadedDoc) =>
          // This is a simplistic check. A real app might check for specific file name patterns.
          uploadedDoc.name
            .toLowerCase()
            .includes(mandatoryDoc.name.toLowerCase().substring(0, 5)) ||
          mandatoryDoc.name
            .toLowerCase()
            .includes(uploadedDoc.name.toLowerCase().substring(0, 5))
      )
    );
  }, [uploadedDocs, mandatoryDocs, companyDetails]);

  return (
    <div className="space-y-8">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".csv,.xlsx,.xls,.pdf,.zip"
        disabled={!companyDetails}
      />
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          Data Ingestion
        </h1>
        <p className="text-muted-foreground">
          Start by providing company details, then ingest your data to begin the
          audit.
        </p>
      </div>

      <CompanyDetailsForm onSubmit={handleFormSubmit} />

      {companyDetails && (
        <>
          <DocumentDemandList companyDetails={companyDetails} />
          {allMandatoryDocsUploaded && auditStatus !== 'COMPLETED' && (
            <Alert className="border-green-500 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4 !text-green-600" />
              <AlertTitle>All Mandatory Documents Uploaded</AlertTitle>
              <AlertDescription>
                You have provided all required documents. You can now start the
                audit.
              </AlertDescription>
            </Alert>
          )}

          {auditStatus === 'COMPLETED' && (
             <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Audit Completed!</AlertTitle>
              <AlertDescription>
                The audit has finished. You can view the results on the Dashboard and Review Queue pages.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Ingestion History & Audit Control</CardTitle>
                <CardDescription>
                  Upload files and start the audit once all mandatory documents
                  are provided.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={!companyDetails}
                  onClick={handleFileUploadClick}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
                <Button
                  onClick={startAudit}
                  disabled={!allMandatoryDocsUploaded || auditStatus === 'RUNNING' || auditStatus === 'COMPLETED'}
                >
                  {auditStatus === 'RUNNING' && (
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {auditStatus === 'RUNNING'
                    ? 'Audit in Progress...'
                    : 'Start Audit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date Uploaded</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploadedDocs.length > 0 ? (
                    uploadedDocs.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.name}</TableCell>
                        <TableCell>{doc.type}</TableCell>
                        <TableCell>{doc.date}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[doc.status]}>
                            {doc.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No documents uploaded yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
