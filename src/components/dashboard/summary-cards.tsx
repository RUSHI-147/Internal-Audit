'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAudit } from '@/contexts/AuditContext';
import {
  FileWarning,
  CheckCircle,
  ShieldAlert,
  BarChart,
  ClipboardX,
} from 'lucide-react';
import { useMemo } from 'react';

export function SummaryCards() {
  const { findings, auditStatus } = useAudit();

  const summaryData = useMemo(() => {
    if (auditStatus !== 'COMPLETED') {
      return [
        { title: 'AI Flagged', value: '0', icon: FileWarning },
        { title: 'Confirmed Findings', value: '0', icon: ShieldAlert },
        { title: 'Dismissed Findings', value: '0', icon: ClipboardX },
        { title: 'Avg. Confirmed Risk', value: '0', icon: BarChart },
      ];
    }

    const totalAnomalies = findings.length;
    const aiFlagged = findings.filter(
      (a) => a.status === 'AI Flagged'
    ).length;
    const confirmed = findings.filter((a) => a.status === 'Confirmed').length;
    const dismissed = findings.filter((a) => a.status === 'Dismissed').length;

    const confirmedFindings = findings.filter((a) => a.status === 'Confirmed');
    const avgRiskScore =
      confirmedFindings.length > 0
        ? confirmedFindings.reduce((sum, a) => sum + a.riskScore, 0) /
          confirmedFindings.length
        : 0;

    return [
      {
        title: 'AI Flagged',
        value: aiFlagged.toLocaleString(),
        icon: FileWarning,
        change: 'Awaiting auditor review',
      },
      {
        title: 'Confirmed Findings',
        value: confirmed.toLocaleString(),
        icon: ShieldAlert,
        change: 'Validated by auditor',
      },
      {
        title: 'Dismissed Findings',
        value: dismissed.toLocaleString(),
        icon: ClipboardX,
        change: 'Marked as false positives',
      },
      {
        title: 'Avg. Confirmed Risk',
        value: avgRiskScore.toFixed(0),
        icon: BarChart,
        change: 'For confirmed anomalies only',
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
