'use client';

import { useState } from 'react';
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
import { mockIngestions } from '@/lib/data';
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

  const handleFormSubmit = (data: CompanyDetailsFormValues) => {
    setCompanyDetails(data);
  };

  return (
    <div className="space-y-8">
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
            <Button>
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
              {mockIngestions.map((ingestion) => (
                <TableRow key={ingestion.id}>
                  <TableCell className="font-medium">
                    {ingestion.source}
                  </TableCell>
                  <TableCell>{ingestion.type}</TableCell>
                  <TableCell>{ingestion.date}</TableCell>
                  <TableCell>
                    {ingestion.recordCount.toLocaleString()}
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
