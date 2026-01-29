'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAudit } from '@/contexts/AuditContext';
import { FileWarning, CheckCircle, ShieldAlert, BarChart } from 'lucide-react';
import { useMemo } from 'react';

export function SummaryCards() {
  const { findings, auditStatus } = useAudit();

  const summaryData = useMemo(() => {
    if (auditStatus !== 'COMPLETED') {
      return [
        { title: 'Total Anomalies', value: '0', icon: ShieldAlert },
        { title: 'Pending Review', value: '0', icon: FileWarning },
        { title: 'Review Rate', value: '0.0%', icon: CheckCircle },
        { title: 'Avg. Risk Score', value: '0', icon: BarChart },
      ];
    }

    const totalAnomalies = findings.length;
    const pendingReview = findings.filter(
      (a) => a.status === 'Pending Review'
    ).length;
    const reviewRate =
      totalAnomalies > 0
        ? ((totalAnomalies - pendingReview) / totalAnomalies) * 100
        : 0;
    const avgRiskScore =
      totalAnomalies > 0
        ? findings.reduce((sum, a) => sum + a.riskScore, 0) / totalAnomalies
        : 0;

    return [
      {
        title: 'Total Anomalies',
        value: totalAnomalies.toLocaleString(),
        icon: ShieldAlert,
        change: 'from latest audit',
      },
      {
        title: 'Pending Review',
        value: pendingReview.toLocaleString(),
        icon: FileWarning,
        change: 'awaiting auditor action',
      },
      {
        title: 'Review Rate',
        value: `${reviewRate.toFixed(1)}%`,
        icon: CheckCircle,
        change: 'of identified anomalies',
      },
      {
        title: 'Avg. Risk Score',
        value: avgRiskScore.toFixed(0),
        icon: BarChart,
        change: 'across all anomalies',
      },
    ];
  }, [findings, auditStatus]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {summaryData.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground">{item.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
