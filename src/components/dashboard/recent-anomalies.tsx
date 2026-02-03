'use client';

import { AnomalyStatus } from '@/lib/types';
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
import Link from 'next/link';
import { Button } from '../ui/button';
import { useAudit } from '@/contexts/AuditContext';

const statusVariant: Record<
  AnomalyStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  'AI Flagged': 'secondary',
  Confirmed: 'destructive',
  Dismissed: 'default',
  'Needs More Info': 'outline',
};

export function RecentAnomalies() {
  const { findings, auditStatus } = useAudit();
  const anomalies = findings.slice(0, 5);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Recent Anomalies</CardTitle>
          <CardDescription>
            Top 5 most recent issues needing attention.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/review">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {auditStatus !== 'COMPLETED' ? (
           <div className="flex h-[200px] items-center justify-center text-center text-muted-foreground">
            <p>Run an audit to see recent anomalies.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Issue</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {anomalies.length > 0 ? (
                anomalies.map((anomaly) => (
                  <TableRow key={anomaly.id}>
                    <TableCell>
                      <Link
                        href={`/review?id=${anomaly.id}`}
                        className="font-medium hover:underline"
                      >
                        {anomaly.type}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {anomaly.entity}
                      </div>
                    </TableCell>
                    <TableCell>{anomaly.riskScore}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[anomaly.status]}>
                        {anomaly.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No anomalies found.
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
