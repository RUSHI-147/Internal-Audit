'use client';

import { Anomaly, AnomalyStatus } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Filter } from 'lucide-react';
import React from 'react';
import { useAudit } from '@/contexts/AuditContext';

const statusVariant: Record<
  AnomalyStatus,
  'default' | 'secondary' | 'destructive'
> = {
  'Pending Review': 'secondary',
  Confirmed: 'destructive',
  Dismissed: 'default',
};

export function AnomalyListClient() {
  const { findings, auditStatus } = useAudit();
  
  const [statusFilter, setStatusFilter] = React.useState<AnomalyStatus[]>([
    'Pending Review',
    'Confirmed',
    'Dismissed',
  ]);

  const toggleStatusFilter = (status: AnomalyStatus) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const filteredAnomalies = findings.filter((a) =>
    statusFilter.includes(a.status)
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>All Anomalies</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={auditStatus !== 'COMPLETED'}>
              <Filter className="mr-2 h-4 w-4" />
              Filter Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {(['Pending Review', 'Confirmed', 'Dismissed'] as AnomalyStatus[]).map(
              (status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilter.includes(status)}
                  onCheckedChange={() => toggleStatusFilter(status)}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
         {auditStatus !== 'COMPLETED' ? (
          <div className="flex h-[300px] items-center justify-center text-center text-muted-foreground">
            <p>Run an audit from the Data Ingestion page to see findings.</p>
          </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAnomalies.length > 0 ? (
              filteredAnomalies.map((anomaly) => (
                <TableRow key={anomaly.id}>
                  <TableCell>
                    <Link
                      href={`/review/${anomaly.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {anomaly.id}
                    </Link>
                  </TableCell>
                  <TableCell>{anomaly.type}</TableCell>
                  <TableCell>{anomaly.description}</TableCell>
                  <TableCell>{anomaly.date}</TableCell>
                  <TableCell
                    className={
                      anomaly.riskScore > 80
                        ? 'text-destructive font-bold'
                        : anomaly.riskScore > 60
                        ? 'text-yellow-600 font-medium'
                        : ''
                    }
                  >
                    {anomaly.riskScore}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[anomaly.status]}>
                      {anomaly.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
               <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No anomalies found matching the current filters.
                  </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
  );
}
