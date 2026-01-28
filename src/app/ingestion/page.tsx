'use client';

import { useState, useRef } from 'react';
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
import { Upload, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Ingestion } from '@/lib/types';
import { DocumentDemandList } from '@/components/ingestion/document-demand-list';

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
  const [ingestions, setIngestions] = useState<Ingestion[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFormSubmit = (data: CompanyDetailsFormValues) => {
    setCompanyDetails(data);
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const newIngestion: Ingestion = {
      id: `ING-${(ingestions.length + 1).toString().padStart(3, '0')}`,
      source: file.name,
      type: 'File',
      fileName: file.name,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Processing',
      recordCount: 0,
      hash: 'calculating...',
    };

    setIngestions((prev) => [newIngestion, ...prev]);

    // Simulate processing
    setTimeout(() => {
      setIngestions((prev) =>
        prev.map((ing) =>
          ing.id === newIngestion.id
            ? {
                ...ing,
                status: 'Completed',
                recordCount: Math.floor(Math.random() * 5000) + 100,
                hash: `sha256-${crypto.randomUUID().substring(0, 8)}...`,
              }
            : ing
        )
      );
    }, 2500);
    
    // Reset file input to allow uploading the same file again
    if (event.target) {
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-8">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".csv,.xlsx,.xls,.pdf,.zip"
      />
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          Data Ingestion
        </h1>
        <p className="text-muted-foreground">
          Start by providing company details to configure the audit, then ingest
          your data.
        </p>
      </div>

      <CompanyDetailsForm onSubmit={handleFormSubmit} />

      {companyDetails && <DocumentDemandList companyDetails={companyDetails} />}

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Ingestion History</CardTitle>
            <CardDescription>
              A log of all data ingestion activities.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Connector
            </Button>
            <Button onClick={handleFileUploadClick}>
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingestions.length > 0 ? (
                ingestions.map((ingestion) => (
                  <TableRow key={ingestion.id}>
                    <TableCell className="font-medium">
                      {ingestion.source}
                    </TableCell>
                    <TableCell>{ingestion.type}</TableCell>
                    <TableCell>{ingestion.date}</TableCell>
                    <TableCell>
                      {ingestion.recordCount > 0 ? ingestion.recordCount.toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[ingestion.status]}>
                        {ingestion.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {ingestion.hash}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No ingestion history. Upload a file to begin.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
