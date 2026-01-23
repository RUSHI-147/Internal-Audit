import { mockAnomalies } from '@/lib/data';
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

const statusVariant: Record<
  AnomalyStatus,
  'default' | 'secondary' | 'destructive'
> = {
  'Pending Review': 'secondary',
  Confirmed: 'destructive',
  Dismissed: 'default',
};

export async function RecentAnomalies() {
  const anomalies = mockAnomalies.slice(0, 5);

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Issue</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {anomalies.map((anomaly) => (
              <TableRow key={anomaly.id}>
                <TableCell>
                  <Link
                    href={`/review/${anomaly.id}`}
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
