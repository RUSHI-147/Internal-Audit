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
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Filter } from 'lucide-react';
import React, { Suspense } from 'react';
import { useAudit } from '@/contexts/AuditContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { AnomalyDetailView } from './anomaly-detail-view';
import { useSearchParams } from 'next/navigation';

const statusVariant: Record<
  AnomalyStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  'AI Flagged': 'secondary',
  Confirmed: 'destructive',
  Dismissed: 'default',
  'Needs More Info': 'outline',
};

const statusFilters: AnomalyStatus[] = [
  'AI Flagged',
  'Confirmed',
  'Dismissed',
  'Needs More Info',
];

function AnomalyListContent() {
  const { findings, auditStatus } = useAudit();
  const searchParams = useSearchParams();

  const [statusFilter, setStatusFilter] =
    React.useState<AnomalyStatus[]>(statusFilters);
  const [selectedAnomaly, setSelectedAnomaly] = React.useState<Anomaly | null>(
    null
  );

  React.useEffect(() => {
    const anomalyId = searchParams.get('id');
    if (anomalyId && findings.length > 0) {
      const anomalyToOpen = findings.find((f) => f.id === anomalyId);
      if (anomalyToOpen) {
        setSelectedAnomaly(anomalyToOpen);
      }
    }
  }, [searchParams, findings]);

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
    <>
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
              {statusFilters.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilter.includes(status)}
                  onCheckedChange={() => toggleStatusFilter(status)}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
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
                    <TableRow
                      key={anomaly.id}
                      onClick={() => setSelectedAnomaly(anomaly)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <span className="font-medium text-primary hover:underline">
                          {anomaly.id}
                        </span>
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
      <Dialog
        open={!!selectedAnomaly}
        onOpenChange={(isOpen) => !isOpen && setSelectedAnomaly(null)}
      >
        <DialogContent className="max-w-6xl h-[95vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Audit Finding Review – {selectedAnomaly?.id}</DialogTitle>
            <DialogDescription>
              {selectedAnomaly?.type}: {selectedAnomaly?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-6 -mr-6">
            {selectedAnomaly && (
              <AnomalyDetailView
                anomaly={selectedAnomaly}
                onDecisionSaved={() => setSelectedAnomaly(null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AnomalyListClient() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnomalyListContent />
    </Suspense>
  )
}
