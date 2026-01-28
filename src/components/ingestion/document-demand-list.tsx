'use client';

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
import { Badge } from '@/components/ui/badge';
import { documentRequirements } from '@/lib/document-requirements';
import { CompanyDetailsFormValues } from './company-details-form';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function DocumentDemandList({
  companyDetails,
}: {
  companyDetails: CompanyDetailsFormValues;
}) {
  const { companyType, gstRegistered } = companyDetails;
  let docs = documentRequirements[companyType] || [];

  // Filter GST documents based on registration status
  if (!gstRegistered) {
    docs = docs.filter(doc => !doc.name.startsWith('GST'));
  }

  if (!docs || docs.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Demand List for: {companyType}</CardTitle>
        <CardDescription>
          Based on the company details provided, please prepare the following
          documents for ingestion.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document Name</TableHead>
              <TableHead>Why it's required</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Requirement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {docs.map((doc) => (
              <TableRow key={doc.name}>
                <TableCell className="font-medium">{doc.name}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{doc.description}</TableCell>
                <TableCell>
                  <Badge variant="outline">{doc.format}</Badge>
                </TableCell>
                <TableCell>
                  {doc.isMandatory ? (
                    <Badge variant="destructive" className='flex items-center gap-1 w-fit'>
                      <AlertCircle className="h-3 w-3" /> Mandatory
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className='flex items-center gap-1 w-fit'>
                      <CheckCircle className="h-3 w-3" /> Optional
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
