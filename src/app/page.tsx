import { SummaryCards } from '@/components/dashboard/summary-cards';
import { RiskHeatmap } from '@/components/dashboard/risk-heatmap';
import { RecentAnomalies } from '@/components/dashboard/recent-anomalies';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          AuditAI Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back, here's your audit overview.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        }
      >
        <SummaryCards />
      </Suspense>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Suspense
            fallback={
              <Card>
                <CardHeader>
                  <CardTitle>Risk Heatmap</CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[350px] w-full" />
                </CardContent>
              </Card>
            }
          >
            <RiskHeatmap />
          </Suspense>
        </div>
        <div className="lg:col-span-2">
          <Suspense
            fallback={
              <Card>
                <CardHeader>
                  <CardTitle>Recent Anomalies</CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[350px] w-full" />
                </CardContent>
              </Card>
            }
          >
            <RecentAnomalies />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
